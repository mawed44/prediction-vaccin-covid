import streamlit as st
import pandas as pd

# Importer les fonctions depuis nos modules personnalisés
from data_loader import load_main_data, load_geojson
from prediction_pipeline import run_prediction_pipeline
from display import display_kpis, display_intuitive_map, display_department_analysis

#  CONFIGURATION DE LA PAGE 
st.set_page_config(layout="wide", page_title="Hackathon | EPITECH")

st.title("Tableau de Bord Prédictif de l'Activité Grippale en France")
st.markdown("Cette application entraîne un modèle de Machine Learning pour prédire l'évolution de différents indicateurs de la grippe en France. Les prédictions représentent le **taux de cas pour 100 000 habitants**.")

#  BARRE LATÉRALE 
st.sidebar.title(" Paramètres de la Prédiction")
df_full_data = load_main_data()
geojson_data = load_geojson()

if df_full_data is not None:
    metric_options = {'sos_rate': "SOS Médecins", 'er_rate': "Urgences", 'er_hosp_rate': "Hospitalisations"}
    metric_descriptions = {
        'sos_rate': "Taux hebdomadaire de consultations pour syndrome grippal via SOS Médecins.",
        'er_rate': "Taux hebdomadaire de passages aux urgences pour syndrome grippal.",
        'er_hosp_rate': "Taux hebdomadaire d'hospitalisations suite à un passage aux urgences pour syndrome grippal."
    }
    
    selected_metric = st.sidebar.selectbox("1. Choisissez l'indicateur :", options=list(metric_options.keys()), format_func=lambda x: metric_options[x])
    st.sidebar.info(metric_descriptions[selected_metric])

    weeks_to_predict = st.sidebar.slider("2. Choisissez l'horizon (semaines) :", 1, 8, 4)

    if st.sidebar.button(" Lancer la prédiction", type="primary"):
        with st.spinner(f"Entraînement du modèle et calcul des prédictions..."):
            df_predictions, df_history = run_prediction_pipeline(df_full_data, selected_metric, weeks_to_predict)
            st.session_state.df_predictions = df_predictions
            st.session_state.df_history = df_history
            st.session_state.metric_name = metric_options[selected_metric]
            st.success("Prédictions terminées !")
            st.balloons()

#  AFFICHAGE PRINCIPAL 
if 'df_predictions' in st.session_state:
    df_predictions = st.session_state.df_predictions
    df_history = st.session_state.df_history
    metric_name = st.session_state.metric_name
    
    unique_dates = sorted(df_predictions['date'].unique())
    selected_date_str = st.select_slider("Faites glisser pour choisir la semaine à visualiser :", options=[d.strftime('%Y-%m-%d') for d in unique_dates])
    selected_date = pd.to_datetime(selected_date_str)

    df_pred_selected_week = df_predictions[df_predictions['date'] == selected_date]
    
    st.subheader(f"Indicateurs Clés pour la semaine du {selected_date_str}")
    st.caption("Ces indicateurs résument la situation nationale prédite et la comparent à la dernière semaine de données réelles.")
    display_kpis(df_pred_selected_week, df_history)
    st.markdown("")
    
    tab1, tab2 = st.tabs(["Vue Nationale & Top 5", ""])
    with tab1:
        st.subheader("Carte des Niveaux de Risque par Département")
        display_intuitive_map(df_pred_selected_week, geojson_data)
        
        st.subheader("Top 5 des départements à risque pour cette semaine")
        top_5_df = df_pred_selected_week[['dep', 'code_dep', 'prediction']].sort_values('prediction', ascending=False).head(5).copy()
        
        top_5_df.rename(columns={'prediction': f"Taux Prédit ({metric_name})"}, inplace=True)
        st.dataframe(top_5_df, use_container_width=True)
        st.caption("Le taux représente le nombre de cas prédits pour 100 000 habitants.")

    with tab2:
        display_department_analysis(df_history, df_predictions)

