import React, { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const REGIONS_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson";
const DEPTS_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson";

const DEPT_TO_REGION = {
  "01":"Auvergne-Rhône-Alpes","03":"Auvergne-Rhône-Alpes","07":"Auvergne-Rhône-Alpes","15":"Auvergne-Rhône-Alpes","26":"Auvergne-Rhône-Alpes","38":"Auvergne-Rhône-Alpes","42":"Auvergne-Rhône-Alpes","43":"Auvergne-Rhône-Alpes","63":"Auvergne-Rhône-Alpes","69":"Auvergne-Rhône-Alpes","73":"Auvergne-Rhône-Alpes","74":"Auvergne-Rhône-Alpes",
  "21":"Bourgogne-Franche-Comté","25":"Bourgogne-Franche-Comté","39":"Bourgogne-Franche-Comté","58":"Bourgogne-Franche-Comté","70":"Bourgogne-Franche-Comté","71":"Bourgogne-Franche-Comté","89":"Bourgogne-Franche-Comté","90":"Bourgogne-Franche-Comté",
  "22":"Bretagne","29":"Bretagne","35":"Bretagne","56":"Bretagne",
  "18":"Centre-Val de Loire","28":"Centre-Val de Loire","36":"Centre-Val de Loire","37":"Centre-Val de Loire","41":"Centre-Val de Loire","45":"Centre-Val de Loire",
  "08":"Grand Est","10":"Grand Est","51":"Grand Est","52":"Grand Est","54":"Grand Est","55":"Grand Est","57":"Grand Est","67":"Grand Est","68":"Grand Est","88":"Grand Est",
  "02":"Hauts-de-France","59":"Hauts-de-France","60":"Hauts-de-France","62":"Hauts-de-France","80":"Hauts-de-France",
  "75":"Île-de-France","77":"Île-de-France","78":"Île-de-France","91":"Île-de-France","92":"Île-de-France","93":"Île-de-France","94":"Île-de-France","95":"Île-de-France",
  "14":"Normandie","27":"Normandie","50":"Normandie","61":"Normandie","76":"Normandie",
  "16":"Nouvelle-Aquitaine","17":"Nouvelle-Aquitaine","19":"Nouvelle-Aquitaine","23":"Nouvelle-Aquitaine","24":"Nouvelle-Aquitaine","33":"Nouvelle-Aquitaine","40":"Nouvelle-Aquitaine","47":"Nouvelle-Aquitaine","64":"Nouvelle-Aquitaine","79":"Nouvelle-Aquitaine","86":"Nouvelle-Aquitaine","87":"Nouvelle-Aquitaine",
  "09":"Occitanie","11":"Occitanie","12":"Occitanie","30":"Occitanie","31":"Occitanie","32":"Occitanie","34":"Occitanie","46":"Occitanie","48":"Occitanie","65":"Occitanie","66":"Occitanie","81":"Occitanie","82":"Occitanie",
  "04":"Provence-Alpes-Côte d’Azur","05":"Provence-Alpes-Côte d’Azur","06":"Provence-Alpes-Côte d’Azur","13":"Provence-Alpes-Côte d’Azur","83":"Provence-Alpes-Côte d’Azur","84":"Provence-Alpes-Côte d’Azur",
  "44":"Pays de la Loire","49":"Pays de la Loire","53":"Pays de la Loire","72":"Pays de la Loire","85":"Pays de la Loire",
  "2A":"Corse","2B":"Corse",
  "971":"Guadeloupe","972":"Martinique","973":"Guyane","974":"La Réunion","976":"Mayotte"
};

function RegionsLayer({ data, onPickRegion }) {
  const map = useMap();
  const baseStyle = useMemo(
    () => ({
      color: "#fff",
      weight: 1,
      fillColor: "#70a1ff",
      fillOpacity: 0.6,
    }),
    []
  );

  const onEach = (feature, layer) => {
    layer.bindTooltip(feature.properties.nom);
    layer.on("click", () => {
      onPickRegion(feature.properties.nom);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    });
    layer.on("mouseover", (e) => {
      const l = e.target;
      l.setStyle({
        color: "white",
        weight: 3,
        fillOpacity: 0.85,
      });
      l.bringToFront();
    });
    layer.on("mouseout", (e) => {
      e.target.setStyle(baseStyle);
    });
  };

  return <GeoJSON data={data} style={baseStyle} onEachFeature={onEach} />;
}

function DeptsLayer({ data, selectedDeptCode, setSelectedDeptCode }) {
  const map = useMap();

  const style = (feat) => {
    const active = feat.properties.code === selectedDeptCode;
    return {
      color: active ? "#000" : "#333",
      weight: active ? 2 : 1,
      fillColor: active ? "#0047ab" : "#1e90ff",
      fillOpacity: active ? 0.8 : 0.6,
    };
  };

  const onEach = (feature, layer) => {
    layer.bindTooltip(feature.properties.nom);
    layer.on("click", () => {
      setSelectedDeptCode(feature.properties.code);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    });
    layer.on("mouseover", (e) => {
      const l = e.target;
      l.setStyle({
        color: "white",
        weight: 3,
        fillOpacity: 0.85,
      });
      l.bringToFront();
    });
    layer.on("mouseout", (e) => {
      e.target.setStyle(style(feature));
    });
  };

  return (
    <GeoJSON
      key={selectedDeptCode || "none"}
      data={data}
      style={style}
      onEachFeature={onEach}
    />
  );
}

export default function MapView({
  selectedRegion,
  selectedDeptCode,
  setSelectedRegion,
  setSelectedDeptCode,
}) {
  const [regions, setRegions] = useState(null);
  const [depts, setDepts] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    fetch(REGIONS_URL).then((r) => r.json()).then(setRegions);
    fetch(DEPTS_URL).then((r) => r.json()).then(setDepts);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && !selectedRegion) {
      map.setView([46.6, 2.5], 6.3, { animate: true });
    }
  }, [selectedRegion]);

  const filteredDepts = useMemo(() => {
    if (!selectedRegion || !depts) return null;
    return {
      type: "FeatureCollection",
      features: depts.features.filter(
        (f) => DEPT_TO_REGION[f.properties.code] === selectedRegion
      ),
    };
  }, [selectedRegion, depts]);

  return (
    <MapContainer
      center={[46.6, 2.5]}
      zoom={6.3}
      minZoom={6.3}
      maxZoom={9}
      zoomControl={false}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      maxBounds={[
        [41, -5.5],
        [51.5, 9.8],
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap France"
      />

      {!selectedRegion && regions && (
        <RegionsLayer data={regions} onPickRegion={setSelectedRegion} />
      )}

      {selectedRegion && filteredDepts && (
        <DeptsLayer
          data={filteredDepts}
          selectedDeptCode={selectedDeptCode}
          setSelectedDeptCode={setSelectedDeptCode}
        />
      )}
    </MapContainer>
  );
}