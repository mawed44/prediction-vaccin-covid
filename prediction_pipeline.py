import pandas as pd
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
import streamlit as st

@st.cache_data
def run_prediction_pipeline(_df_full, metric_to_predict, weeks_to_predict):
    """Exécute tout le pipeline : nettoyage, feature engineering, entraînement et prédiction."""
    df_metric = _df_full[_df_full['metric'] == metric_to_predict].copy()
    df_metric = df_metric.dropna(subset=['annee_iso', 'week_iso'])
    
    def from_iso_week_to_date(row):
        try:
            return pd.to_datetime(f"{int(row['annee_iso'])}-W{int(row['week_iso'])}-1", format='%Y-W%W-%w')
        except (ValueError, TypeError):
            return pd.NaT
            
    df_metric['date'] = df_metric.apply(from_iso_week_to_date, axis=1)
    df_metric = df_metric.dropna(subset=['date'])

    cols_to_keep = ['date', 'value', 'geo_level', 'reg', 'dep', 'code_reg', 'code_dep']
    df_clean = df_metric[cols_to_keep].copy()
    df_clean['code_dep'] = df_clean['code_dep'].astype(str).str.zfill(2)

    df_featured = df_clean.copy()
    df_featured['semaine_annee'] = df_featured['date'].dt.isocalendar().week.astype(int)
    df_featured['mois'] = df_featured['date'].dt.month
    df_featured['annee'] = df_featured['date'].dt.year
    df_featured = df_featured.sort_values(by=['geo_level', 'code_reg', 'code_dep', 'date'])
    df_featured['lag_1_semaine'] = df_featured.groupby(['code_dep'])['value'].shift(1)
    df_featured['lag_4_semaines'] = df_featured.groupby(['code_dep'])['value'].shift(4)
    df_featured['rolling_mean_4_semaines'] = df_featured.groupby(['code_dep'])['value'].shift(1).rolling(window=4, min_periods=1).mean()
    df_featured = df_featured.dropna()

    features = ['semaine_annee', 'mois', 'annee', 'lag_1_semaine', 'lag_4_semaines', 'rolling_mean_4_semaines', 'code_dep']
    target = 'value'
    
    df_model = df_featured[df_featured['geo_level'] == 'dep'][features + [target, 'date']].copy()
    df_model_ready = pd.get_dummies(df_model, columns=['code_dep'])
    
    X_train = df_model_ready.drop(columns=[target, 'date'])
    y_train = df_model_ready[target]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42, min_samples_leaf=5, n_jobs=-1)
    model.fit(X_train, y_train)

    df_dep = df_featured[df_featured['geo_level'] == 'dep'].copy()
    latest_data_per_dep = df_dep.sort_values('date').groupby('code_dep').last().reset_index()

    all_predictions = []
    future_features = latest_data_per_dep.copy()

    for _ in range(weeks_to_predict):
        features_for_prediction = future_features.copy()
        features_for_prediction['date'] += timedelta(weeks=1)
        features_for_prediction['semaine_annee'] = features_for_prediction['date'].dt.isocalendar().week
        features_for_prediction['mois'] = features_for_prediction['date'].dt.month
        features_for_prediction['annee'] = features_for_prediction['date'].dt.year
        
        features_dummified = pd.get_dummies(features_for_prediction, columns=['code_dep'])
        features_final = features_dummified.reindex(columns=X_train.columns, fill_value=0)
        
        predictions = model.predict(features_final)
        predictions[predictions < 0] = 0
        features_for_prediction['prediction'] = predictions
        
        all_predictions.append(features_for_prediction[['date', 'prediction', 'dep', 'code_dep']])
        
        future_features['lag_4_semaines'] = future_features['lag_1_semaine']
        future_features['lag_1_semaine'] = future_features['value']
        future_features['value'] = predictions
        future_features['date'] = features_for_prediction['date']

    return pd.concat(all_predictions), df_dep
