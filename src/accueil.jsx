import { useState, useEffect } from 'react';
import './accueil.css'; 
import monLogo from '../src/assets/ministeredelasante2.png'

// --- RÉGLAGES DES FICHIERS ---
const LOGO_URL = monLogo; // Utilisation de l'importation du logo
const TITLE = "Panneau Ministère de la Santé";

function Accueil({ isLogoExiting, visibleLetterCount }) {
  // État interne pour gérer l'animation d'ENTRÉE du logo
  const [logoVisible, setLogoVisible] = useState(false); 
  
  // Ce useEffect gère uniquement l'apparition du logo
  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoVisible(true), 1200); // Le logo apparaît à 1.2s
    return () => clearTimeout(logoTimer);
  }, []);

  // Détermine la classe CSS du logo en fonction des ordres reçus
  const logoClassName = isLogoExiting
    ? 'logo-slide-up' // Ordre de sortie
    : (logoVisible ? 'logo-slide-down' : 'logo-hidden'); // Logique d'entrée

  return (
    <div className="splash-container">
      <h1 className="splash-title">
        {/* Découpe le titre en un tableau de lettres et crée un <span> pour chacune */}
        {TITLE.split('').map((letter, index) => (
          <span
            key={index}
            className={`letter ${
              // La lettre est visible si son index est inférieur au compteur reçu de App.tsx
              index < visibleLetterCount ? 'letter-visible' : 'letter-hidden'
            }`}
          >
            {/* Remplace les espaces par des espaces insécables pour qu'ils s'affichent */}
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </h1>
      <img
        src={LOGO_URL}
        alt="Logo du ministère"
        className={`splash-logo ${logoClassName}`}
      />
    </div>
  );
}

export default Accueil;