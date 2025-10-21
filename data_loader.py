import streamlit as st
import pandas as pd
import json

@st.cache_data
def load_main_data():
    """Charge le jeu de données principal et le nettoie."""
    try:
        df = pd.read_csv("merged_vacc_flu_dataset_clean.csv", low_memory=False)
        df['annee_iso'] = pd.to_numeric(df['annee_iso'], errors='coerce')
        df['week_iso'] = pd.to_numeric(df['week_iso'], errors='coerce')
        return df
    except FileNotFoundError:
        st.error("Fichier `merged_vacc_flu_dataset_clean.csv` non trouvé.")
        return None

@st.cache_data
def load_geojson():
    """Charge le fichier GeoJSON et s'assure que les codes sont des chaînes de caractères."""
    try:
        with open("departements.geojson", "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
        for feature in geojson_data['features']:
            feature['properties']['code'] = str(feature['properties']['code']).zfill(2)
        return geojson_data
    except FileNotFoundError:
        st.error("Fichier `departements.geojson` non trouvé.")
        return None
