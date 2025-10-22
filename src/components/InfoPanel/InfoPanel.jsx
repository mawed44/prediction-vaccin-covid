// src/components/InfoPanel/InfoPanel.jsx
import React, { useMemo, useState } from "react";
import './infoPanel.css'; 

const DEPT_NAMES = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube",
  "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal",
  "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud",
  "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
  "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
  "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault",
  "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
  "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
  "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
  "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle",
  "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
  "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
  "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône",
  "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
  "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres",
  "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse",
  "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
  "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne", "95": "Val-d'Oise", "971": "Guadeloupe", "972": "Martinique",
  "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
};

export default function InfoPanel({
  selectedRegion,
  selectedDeptCode,
  selectedDeptName,
  setSelectedRegion,
  setSelectedDeptCode,
  setSelectedDeptName,
  onShowRegionStats,
  onShowDeptStats,
  onShowFranceStats,
}) {
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);

  const card = {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1000,
    
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(10px) saturate(180%)", 
    border: "2px solid rgba(255, 255, 255, 0.49)", 
    
    padding: "16px 18px",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,.18)",
    maxWidth: 360,
    lineHeight: 1.35,
  };
  const btn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#1677ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s, transform 0.2s, box-shadow 0.2s", // AJOUT
  };
  
  const btnHover = {
    background: "#0056b3", 
    transform: "translateY(-1px)", 
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)", 
  };

  const back = {
    background: "#f2f2f2",
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    marginBottom: 8,
    transition: "background 0.2s, transform 0.2s",
  };
  
  const backHover = {
    background: "#e0e0e0", 
    transform: "translateY(-0.5px)",
  };
  const deptName = useMemo(() => {
    if (selectedDeptName) return selectedDeptName;
    if (!selectedDeptCode) return null;
    return DEPT_NAMES[selectedDeptCode] || "Département inconnu";
  }, [selectedDeptCode, selectedDeptName]);

  // France entière
  if (!selectedRegion && !selectedDeptCode) {
    return (
      <div style={card}>
        <h2 style={{ margin: "0 0 6px" }}>France entière</h2>
        <p style={{ margin: "0 0 12px" }}>
          Cliquez sur une région pour explorer ses départements, ou consultez directement les statistiques nationales.
        </p>
        <button 
          onClick={onShowFranceStats}
          style={{...btn, ...(isBtnHovered ? btnHover : {})}}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
        >
          Voir les statistiques 🇫🇷
        </button>
      </div>
    );
  }

  // Région
  if (selectedRegion && !selectedDeptCode) {
    return (
      <div style={card}>
        <button 
            style={{...back, ...(isBackHovered ? backHover : {})}} 
            onClick={() => setSelectedRegion(null)}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
        >
          ← Retour
        </button>
        <h2 style={{ margin: "6px 0 8px" }}>{selectedRegion}</h2>
        <p style={{ margin: "0 0 12px" }}>Affichage des départements de la région.</p>
        <button 
          onClick={onShowRegionStats}
          style={{...btn, ...(isBtnHovered ? btnHover : {})}}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
        >
          Voir les statistiques 📊
        </button>
      </div>
    );
  }

  // Département
  return (
    <div style={card}>
      <button
        style={{...back, ...(isBackHovered ? backHover : {})}}
        onClick={() => {
          setSelectedDeptCode(null);
          setSelectedDeptName(null);
        }}
        onMouseEnter={() => setIsBackHovered(true)}
        onMouseLeave={() => setIsBackHovered(false)}
      >
        ← Retour
      </button>
      <h2 style={{ margin: "6px 0 8px" }}>
        {deptName} ({selectedDeptCode})
      </h2>
      <p style={{ margin: "0 0 12px" }}>Affichage des données du département.</p>
      <button 
        onClick={onShowDeptStats}
        style={{...btn, ...(isBtnHovered ? btnHover : {})}}
        onMouseEnter={() => setIsBtnHovered(true)}
        onMouseLeave={() => setIsBtnHovered(false)}
      >
        Voir les statistiques 🧾
      </button>
    </div>
  );
}