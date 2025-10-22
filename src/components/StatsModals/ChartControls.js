// ChartControls.js

import React from 'react';
import { 
    buttonStyle, 
    legendButtonsContainer, 
    chartNavContainer, 
    chartNavButtons, 
    navButton 
} from './StatsModalStyles';

// Composant pour les boutons de sélection (Tout sélectionner/désélectionner)
function SelectionButtons({ vaccinFields, setSelectedVaccins }) {
    
    // Style commun pour les boutons, y compris l'effet au survol
    const hoverStyleProps = {
        onMouseEnter: (e) => {
            e.currentTarget.style.background = '#e0e0e0';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        },
        onMouseLeave: (e) => {
            e.currentTarget.style.background = '#eee';
            e.currentTarget.style.boxShadow = 'none';
        }
    };

    return (
        <div style={legendButtonsContainer}>
            <button 
                onClick={() => setSelectedVaccins(vaccinFields)} 
                style={buttonStyle}
                {...hoverStyleProps}
            >
                Tout sélectionner
            </button>
            <button 
                onClick={() => setSelectedVaccins([])} 
                style={buttonStyle}
                {...hoverStyleProps}
            >
                Tout désélectionner
            </button>
        </div>
    );
}

// Composant pour la navigation entre les types de graphique (Courbes, Camembert, Histogrammes)
function NavigationButtons({ chartType, setChartType }) {
    
    // Styles pour les boutons de navigation
    const navHoverStyles = (t, chartType) => ({
        onMouseEnter: (e) => {
            if (chartType !== t) {
                e.currentTarget.style.background = '#ccc'; 
            }
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        },
        onMouseLeave: (e) => {
            if (chartType !== t) {
                e.currentTarget.style.background = '#ddd'; 
            }
            e.currentTarget.style.boxShadow = 'none';
        }
    });

    return (
        <div style={chartNavContainer}>
            <p style={{ fontWeight: "bold" }}>Changer de type de graphique :</p>
            <div style={chartNavButtons}>
                {["line", "pie", "bar"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setChartType(t)}
                        {...navHoverStyles(t, chartType)}
                        style={{
                            ...navButton,
                            background: chartType === t ? "#007bff" : "#ddd", 
                            color: chartType === t ? "#fff" : "#000",
                            boxShadow: chartType === t ? '0 4px 8px rgba(0, 123, 255, 0.4)' : 'none', 
                        }}
                    >
                        {t === "line"
                            ? "Courbes"
                            : t === "pie"
                            ? "Camembert"
                            : "Histogrammes"}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Composant principal qui regroupe les deux ensembles de contrôles
export default function ChartControls({ 
    vaccinFields, 
    setSelectedVaccins, 
    chartType, 
    setChartType 
}) {
    return (
        <>
            <SelectionButtons 
                vaccinFields={vaccinFields} 
                setSelectedVaccins={setSelectedVaccins} 
            />
            <NavigationButtons 
                chartType={chartType} 
                setChartType={setChartType} 
            />
        </>
    );
}