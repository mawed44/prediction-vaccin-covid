import { useState, useEffect } from 'react';
import './accueil.css'; 

const LOGO_URL = `${process.env.PUBLIC_URL}/ministeredelasante2.png`;
const TITLE = "Panneau Ministère de la Santé";

function Accueil({ isLogoExiting, visibleLetterCount }) {
  const [logoVisible, setLogoVisible] = useState(false); 
  
  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoVisible(true), 1200);
    return () => clearTimeout(logoTimer);
  }, []);

  const logoClassName = isLogoExiting
    ? 'logo-slide-up'
    : (logoVisible ? 'logo-slide-down' : 'logo-hidden');

  return (
    <div className="splash-container">
      <h1 className="splash-title">
        {TITLE.split('').map((letter, index) => (
          <span
            key={index}
            className={`letter ${
              index < visibleLetterCount ? 'letter-visible' : 'letter-hidden'
            }`}
          >
            {/* Utiliser un espace insécable pour les espaces vides */}
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