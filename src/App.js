import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import MapView from "./components/MapView/MapView.jsx";
import InfoPanel from "./components/InfoPanel/InfoPanel.jsx";
import RegionStatsModal from "./components/StatsModals/RegionStatsModal.js";
import DeptStatsModal from "./components/StatsModals/DeptStatsModal.js";
import FranceStatsModal from "./components/StatsModals/FranceStatsModal.js";
import Accueil from "./components/Accueil/accueil.jsx";
import "leaflet/dist/leaflet.css";
import "./App.css";

const TITLE = "Panneau Ministère de la Santé";

export default function App() {
  //  ÉTATS DE L'APPLICATION 
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDeptCode, setSelectedDeptCode] = useState(null);
  const [selectedDeptName, setSelectedDeptName] = useState(null);

  const [regionData, setRegionData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [franceData, setFranceData] = useState([]);

  const [whichModal, setWhichModal] = useState(null);

  //  ÉTATS DU SPLASH SCREEN 
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoExiting, setIsLogoExiting] = useState(false);
  const [visibleLetterCount, setVisibleLetterCount] = useState(0);

  const TOTAL_SPLASH_TIME =4000;
  const LETTER_EXIT_START_TIME = 3000;
  const LETTER_INTERVAL = 30;

  useEffect(() => {
    let entryIntervalId;
    let exitIntervalId;

    // Apparition du titre lettre par lettre
    entryIntervalId = setInterval(() => {
      setVisibleLetterCount((prev) => {
        if (prev < TITLE.length) return prev + 1;
        clearInterval(entryIntervalId);
        return prev;
      });
    }, LETTER_INTERVAL);

    // Disparition du logo
    const logoExitTimer = setTimeout(() => setIsLogoExiting(true), LETTER_EXIT_START_TIME - 300);

    // Disparition du texte lettre par lettre
    const textExitTimer = setTimeout(() => {
      exitIntervalId = setInterval(() => {
        setVisibleLetterCount((prev) => {
          if (prev > 0) return prev - 1;
          clearInterval(exitIntervalId);
          return 0;
        });
      }, LETTER_INTERVAL);
    }, LETTER_EXIT_START_TIME);

    // Fin du splash screen → affichage de la carte
    const unmountTimer = setTimeout(() => setIsLoading(false), TOTAL_SPLASH_TIME);

    return () => {
      clearInterval(entryIntervalId);
      clearInterval(exitIntervalId);
      clearTimeout(logoExitTimer);
      clearTimeout(textExitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  //  CHARGEMENT DES DONNÉES CSV 
  useEffect(() => {
    const csvFilePath1 = `${process.env.PUBLIC_URL}/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-region.csv`;
    Papa.parse(csvFilePath1, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => setRegionData(res.data),
    });

    const csvFilePath2 = `${process.env.PUBLIC_URL}/data/couvertures-vaccinales-des-adolescents-et-adultes-departement.csv`;
    Papa.parse(csvFilePath2, {
      download: true,
      header: true,
      dynamicTyping: false,
      complete: (res) => setDeptData(res.data),
    });

    const csvFilePath3 = `${process.env.PUBLIC_URL}/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-france.csv`;
    Papa.parse(csvFilePath3, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => setFranceData(res.data),
    });
  }, []);

  //  AFFICHAGE PRINCIPAL
  if (isLoading) {
    return (
      <Accueil
        isLogoExiting={isLogoExiting}
        visibleLetterCount={visibleLetterCount}
        title={TITLE}
      />
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <InfoPanel
        selectedRegion={selectedRegion}
        selectedDeptCode={selectedDeptCode}
        selectedDeptName={selectedDeptName}
        setSelectedRegion={(r) => {
          setSelectedRegion(r);
          setSelectedDeptCode(null);
          setSelectedDeptName(null);
        }}
        setSelectedDeptCode={setSelectedDeptCode}
        setSelectedDeptName={setSelectedDeptName}
        onShowRegionStats={() => setWhichModal("region")}
        onShowDeptStats={() => setWhichModal("dept")}
        onShowFranceStats={() => setWhichModal("france")}
      />

      <MapView
        selectedRegion={selectedRegion}
        selectedDeptCode={selectedDeptCode}
        setSelectedRegion={(r) => {
          setSelectedRegion(r);
          setSelectedDeptCode(null);
          setSelectedDeptName(null);
        }}
        setSelectedDeptCode={setSelectedDeptCode}
        setSelectedDeptName={setSelectedDeptName}
      />

      {whichModal === "region" && selectedRegion && (
        <RegionStatsModal region={selectedRegion} data={regionData} onClose={() => setWhichModal(null)} />
      )}

      {whichModal === "dept" && selectedDeptCode && (
        <DeptStatsModal departmentCode={selectedDeptCode} data={deptData} onClose={() => setWhichModal(null)} />
      )}

      {whichModal === "france" && (
        <FranceStatsModal data={franceData} onClose={() => setWhichModal(null)} />
      )}
    </div>
  );
}