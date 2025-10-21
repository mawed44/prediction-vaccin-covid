// On combine les imports des deux fichiers
import React, { useEffect, useState } from "react";
import MapView from "./components/MapView";
import InfoPanel from "./components/InfoPanel";
import RegionStatsModal from "./components/RegionStatsModal";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";

// --- AJOUTS DEPUIS LE FICHIER D'ANIMATION ---
import Accueil from './accueil.jsx';
import './App.css'; // Assurez-vous d'avoir un style de base si nécessaire

// Le titre nécessaire pour l'animation
const TITLE = "Panneau Ministère de la Santé";
// -----------------------------------------

export default function App() {
  // --- ÉTATS COMBINÉS DES DEUX FICHIERS ---
  // États pour l'application de carte
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDeptCode, setSelectedDeptCode] = useState(null);
  const [vaccinData, setVaccinData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // États pour l'animation d'accueil
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoExiting, setIsLogoExiting] = useState(false);
  const [visibleLetterCount, setVisibleLetterCount] = useState(0);
  // -----------------------------------------


  // --- LOGIQUE COMBINÉE DES DEUX FICHIERS ---

  // Effet n°1 : La logique complète de l'animation
  const TOTAL_SPLASH_TIME = 6000;
  const LETTER_EXIT_START_TIME = 4500;
  const LETTER_INTERVAL = 50;

  useEffect(() => {
    // On enlève le typage ": number" car nous sommes en JavaScript
    let entryIntervalId;
    let exitIntervalId;

    entryIntervalId = setInterval(() => {
      setVisibleLetterCount(prevCount => {
        if (prevCount < TITLE.length) {
          return prevCount + 1;
        }
        clearInterval(entryIntervalId);
        return prevCount;
      });
    }, LETTER_INTERVAL);

    const logoExitTimer = setTimeout(() => {
      setIsLogoExiting(true);
    }, LETTER_EXIT_START_TIME - 300);

    const textExitTimer = setTimeout(() => {
      exitIntervalId = setInterval(() => {
        setVisibleLetterCount(prevCount => {
          if (prevCount > 0) {
            return prevCount - 1;
          }
          clearInterval(exitIntervalId);
          return 0;
        });
      }, LETTER_INTERVAL);
    }, LETTER_EXIT_START_TIME);

    const unmountTimer = setTimeout(() => {
      setIsLoading(false);
    }, TOTAL_SPLASH_TIME);

    return () => {
      clearInterval(entryIntervalId);
      clearInterval(exitIntervalId);
      clearTimeout(logoExitTimer);
      clearTimeout(textExitTimer);
      clearTimeout(unmountTimer);
    };
  }, []); // Ce tableau vide est crucial, il assure que l'animation ne se lance qu'une fois.

  // Effet n°2 : La logique pour charger les données CSV
  useEffect(() => {
    Papa.parse(
      "/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-region.csv",
      {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setVaccinData(results.data);
        },
      }
    );
  }, []); // Ce useEffect se lance aussi une seule fois pour charger les données.
  
  // ----------------------------------------------------


  // --- LE RENDU CONDITIONNEL ---

  // Si l'animation est en cours (isLoading est true), on affiche le composant Accueil
  if (isLoading) {
    return <Accueil isLogoExiting={isLogoExiting} visibleLetterCount={visibleLetterCount} />;
  }

  // Sinon (animation terminée), on affiche l'application de carte
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <InfoPanel
        selectedRegion={selectedRegion}
        selectedDeptCode={selectedDeptCode}
        setSelectedRegion={setSelectedRegion}
        setSelectedDeptCode={setSelectedDeptCode}
        onShowStats={() => setShowModal(true)}
      />

      <MapView
        selectedRegion={selectedRegion}
        selectedDeptCode={selectedDeptCode}
        setSelectedRegion={setSelectedRegion}
        setSelectedDeptCode={setSelectedDeptCode}
      />

      {showModal && (
        <RegionStatsModal
          region={selectedRegion}
          data={vaccinData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}