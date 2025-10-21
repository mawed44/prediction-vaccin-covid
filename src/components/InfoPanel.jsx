import React from "react";

export default function InfoPanel({
  selectedRegion,
  selectedDeptCode,
  setSelectedRegion,
  setSelectedDeptCode,
  onShowStats
}) {
  const backToFrance = () => {
    setSelectedRegion(null);
    setSelectedDeptCode(null);
  };

  const backToRegion = () => {
    setSelectedDeptCode(null);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "#fff",
        padding: 12,
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        zIndex: 1000,
        width: 280,
      }}
    >
      {!selectedRegion && (
        <>
          <h2>Carte des vaccinations</h2>
          <p>Cliquez sur une région pour voir ses départements.</p>
        </>
      )}

      {selectedRegion && !selectedDeptCode && (
        <>
          <button onClick={backToFrance}>← Retour</button>
          <h2>{selectedRegion}</h2>
          <p>Affichage des départements de la région.</p>
          <button
            onClick={onShowStats}
            style={{
              marginTop: 10,
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "6px 10px",
              borderRadius: 5,
              cursor: "pointer"
            }}
          >
            Voir les statistiques 📊
          </button>
        </>
      )}

      {selectedDeptCode && (
        <>
          <button onClick={backToRegion}>← Retour Région</button>
          <h2>Département {selectedDeptCode}</h2>
          <p><em>Ici, tu pourras afficher les données vaccinales.</em></p>
        </>
      )}
    </div>
  );
}
