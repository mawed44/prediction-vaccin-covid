import { useState, useEffect } from 'react';
import Accueil from './accueil.jsx';
import './App.css';

// Le titre de votre splash screen
const TITLE = "Panneau Ministère de la Santé";

function App() {
  // Gère l'affichage global : splash screen ou page principale
  const [isLoading, setIsLoading] = useState(true);
  
  // Gère l'animation de sortie du logo
  const [isLogoExiting, setIsLogoExiting] = useState(false);
  
  // Compte le nombre de lettres à afficher pour le titre
  const [visibleLetterCount, setVisibleLetterCount] = useState(0);

  // --- RÉGLAGES DU TIMING ---
  const TOTAL_SPLASH_TIME = 6000;      // Durée totale en millisecondes (6s)
  const LETTER_EXIT_START_TIME = 4500; // Début de la disparition du texte (à 4.5s)
  const LETTER_INTERVAL = 50;          // Vitesse d'animation des lettres (50ms/lettre)

  useEffect(() => {
    // On déclare les IDs ici pour pouvoir les "nettoyer" à la fin
    let entryIntervalId: number;
    let exitIntervalId: number;

    // --- ANIMATION 1 : ENTRÉE DU TEXTE ---
    // Fait apparaître le titre, lettre par lettre
    entryIntervalId = setInterval(() => {
      setVisibleLetterCount(prevCount => {
        if (prevCount < TITLE.length) {
          return prevCount + 1; // Ajoute une lettre
        }
        clearInterval(entryIntervalId); // Arrête quand le titre est complet
        return prevCount;
      });
    }, LETTER_INTERVAL);


    // --- ANIMATION 2 : SORTIE DES ÉLÉMENTS ---
    // Le logo commence à partir 300ms avant le texte
    const logoExitTimer = setTimeout(() => {
      setIsLogoExiting(true);
    }, LETTER_EXIT_START_TIME - 300);

    // Le texte commence à disparaître, lettre par lettre
    const textExitTimer = setTimeout(() => {
      exitIntervalId = setInterval(() => {
        setVisibleLetterCount(prevCount => {
          if (prevCount > 0) {
            return prevCount - 1; // Enlève une lettre
          }
          clearInterval(exitIntervalId); // Arrête quand le titre a disparu
          return 0;
        });
      }, LETTER_INTERVAL);
    }, LETTER_EXIT_START_TIME);


    // --- FIN GLOBALE ---
    // Le minuteur qui retire le composant Accueil pour de bon
    const unmountTimer = setTimeout(() => {
      setIsLoading(false);
    }, TOTAL_SPLASH_TIME);


    // --- NETTOYAGE ---
    // Essentiel pour éviter les bugs si le composant est retiré prématurément
    return () => {
      clearInterval(entryIntervalId);
      clearInterval(exitIntervalId);
      clearTimeout(logoExitTimer);
      clearTimeout(textExitTimer);
      clearTimeout(unmountTimer);
    };
  }, []); // Le tableau vide [] assure que tout ceci ne se lance qu'une seule fois.

  
  // Affiche le splash screen tant que isLoading est vrai
  if (isLoading) {
    return <Accueil isLogoExiting={isLogoExiting} visibleLetterCount={visibleLetterCount} />;
  }

  // Affiche la page principale une fois le chargement terminé
  return (
    <div className="App">
      <header>
        <h1>Mon Application est Prête !</h1>
        <p>Le contenu principal de la page s'affiche ici.</p>
      </header>
    </div>
  );
}

export default App;