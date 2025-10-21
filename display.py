import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import plotly.express as px

def display_kpis(df_pred, df_hist):
    """Affiche les indicateurs de performance clés avec des couleurs."""
    avg_pred = df_pred['prediction'].mean()
    max_pred_row = df_pred.loc[df_pred['prediction'].idxmax()]
    last_known_avg = df_hist[df_hist['date'] == df_hist['date'].max()]['value'].mean()
    delta = avg_pred - last_known_avg
    
    delta_color = "normal" if delta < 0 else "inverse"

    col1, col2, col3 = st.columns(3)
    col1.metric(" Taux National Moyen Prédit", f"{avg_pred:.1f}", f"{delta:.1f} vs dernière semaine", delta_color=delta_color)
    col2.metric(" Pic d'Incidence Prédit", f"{max_pred_row['prediction']:.1f}", f"Dépt. {max_pred_row['dep']} ({max_pred_row['code_dep']})")
    col3.metric(" Semaine de Prédiction", df_pred['date'].iloc[0].strftime('%Y-%m-%d'))

def display_intuitive_map(df_map_data, geojson):
    """Affiche une carte avec des niveaux de risque clairs."""
    df_map_data['code_dep'] = df_map_data['code_dep'].astype(str).str.zfill(2)
    
    try:
        df_map_data['Niveau de Risque'], bins = pd.qcut(
            df_map_data['prediction'], q=4,
            labels=["Faible", "Modéré", "Élevé", "Très Élevé"],
            retbins=True, duplicates='drop'
        )
    except ValueError:
        df_map_data['Niveau de Risque'] = "Indéterminé"
    
    data_dict = df_map_data.set_index('code_dep').to_dict('index')

    m = folium.Map(location=[46.2, 2.2], zoom_start=5.5, tiles="cartodbpositron")
    
    color_map = {"Faible": "#2ECC71", "Modéré": "#F1C40F", "Élevé": "#E67E22", "Très Élevé": "#E74C3C", "Indéterminé": "#BDC3C7"}

    for feature in geojson['features']:
        code = feature['properties']['code']
        dep_data = data_dict.get(code)
        
        if dep_data:
            niveau = dep_data.get('Niveau de Risque', 'Indéterminé')
            prediction = dep_data.get('prediction', 0)
            color = color_map.get(niveau, "#BDC3C7")
            
            folium.GeoJson(
                feature,
                style_function=lambda x, color=color: {'fillColor': color, 'color': 'black', 'weight': 0.5, 'fillOpacity': 0.7},
                tooltip=f"<b>{feature['properties']['nom']} ({code})</b><br>Prédiction: {prediction:.2f}<br>Niveau: {niveau}",
            ).add_to(m)

    st_folium(m, width=1200, height=500, returned_objects=[])

    st.markdown("""
    <style>.legend-color {width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;}</style>
    <b>Légende des Niveaux de Risque</b><br>
    <div>
        <div style="display:flex; align-items:center;"><div class="legend-color" style="background-color: #2ECC71;"></div> Faible</div>
        <div style="display:flex; align-items:center;"><div class="legend-color" style="background-color: #F1C40F;"></div> Modéré</div>
        <div style="display:flex; align-items:center;"><div class="legend-color" style="background-color: #E67E22;"></div> Élevé</div>
        <div style="display:flex; align-items:center;"><div class="legend-color" style="background-color: #E74C3C;"></div> Très Élevé</div>
    </div>
    """, unsafe_allow_html=True)

def display_department_analysis(df_history, df_predictions):
    """Affiche l'analyse détaillée pour un département sélectionné."""
    st.subheader("Évolution par Département")
    dep_list = sorted(df_history['dep'].unique())
    selected_dep = st.selectbox("Choisissez un département :", dep_list)
    
    if selected_dep:
        hist_dep = df_history[df_history['dep'] == selected_dep][['date', 'value']]
        hist_dep['Type'] = 'Historique'
        pred_dep = df_predictions[df_predictions['dep'] == selected_dep][['date', 'prediction']].rename(columns={'prediction': 'value'})
        pred_dep['Type'] = 'Prédiction'
        plot_df = pd.concat([hist_dep, pred_dep])

        fig = px.line(plot_df, x='date', y='value', color='Type', title=f"Évolution de l'incidence pour : {selected_dep}", labels={'value': "Taux d'incidence", 'date': 'Date'}, template="plotly_white")
        if not hist_dep.empty:
            start_prediction_date = hist_dep['date'].max()
            fig.add_vline(x=start_prediction_date.to_pydatetime(), line_width=2, line_dash="dash", line_color="grey", annotation_text="Début prédiction")
        st.plotly_chart(fig, use_container_width=True)
