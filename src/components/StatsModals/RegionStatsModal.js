import React, { useEffect, useMemo, useState } from "react";
import { Line, Pie, Bar, generateChartOptions } from "./ChartConfig";
import ChartControls from "./ChartControls"; 

import { 
    COLORS, 
    modalStyle, 
    contentStyle, 
    btnStyle, 
} from './StatsModalStyles';

const REGION_EQUIV = {
// ... (le reste de REGION_EQUIV est inchangé)
  "auvergne et rhône-alpes": "auvergne-rhône-alpes",
  "bourgogne et franche-comté": "bourgogne-franche-comté",
  "bourgogne et franche comté": "bourgogne-franche-comté",
  "réunion": "la réunion",
  "la reunion": "la réunion",
  "guadeloupe": "guadeloupe",
  "martinique": "martinique",
  "guyane": "guyane",
  "corse": "corse",
  "bretagne": "bretagne",
  "centre-val de loire": "centre-val de loire",
  "centre val de loire": "centre-val de loire",
  "grand est": "grand est",
  "hauts-de-france": "hauts-de-france",
  "hauts de france": "hauts-de-france",
  "ile-de-france": "île-de-france",
  "ile de france": "île-de-france",
  "normandie": "normandie",
  "nouvelle aquitaine": "nouvelle-aquitaine",
  "pays de la loire": "pays de la loire",
  "provence-alpes-côte d'azur": "provence-alpes-côte d'azur",
  "provence alpes cote d azur": "provence-alpes-côte d'azur",
  "occitanie": "occitanie",
};

function normalizeRegionName(name) {
  if (!name) return "";
  const clean = name.toLowerCase().trim().replaceAll("’", "'").replaceAll("ô", "o");
  return REGION_EQUIV[clean] || clean;
}

export default function RegionStatsModal({ region, data, onClose }) {
  const [selectedVaccins, setSelectedVaccins] = useState([]);
  const [didInitSelection, setDidInitSelection] = useState(false);
  const [chartType, setChartType] = useState("line");

  const hasData = region && Array.isArray(data) && data.length > 0;
  const regionField = "Région";

  const regionData = useMemo(() => {
    if (!hasData) return [];
    const target = normalizeRegionName(region);
    return data.filter((row) => {
      const r = normalizeRegionName(row[regionField]);
      return r === target; 
    });
  }, [region, data, hasData]);

  const vaccinFields =
    regionData.length > 0
      ? Object.keys(regionData[0]).filter(
          (k) => !["Année", "Région", "Région Code"].includes(k)
        )
      : [];

  useEffect(() => {
    if (!didInitSelection && vaccinFields.length) {
      setSelectedVaccins(vaccinFields);
      setDidInitSelection(true);
    }
  }, [vaccinFields, didInitSelection]);

  if (!hasData || regionData.length === 0) {
    return (
      <div style={modalStyle}>
        <div style={contentStyle}>
          <button onClick={onClose} style={btnStyle}>✖</button>
          <h2>{region}</h2>
          <p>Aucune donnée disponible.</p>
        </div>
      </div>
    );
  }

  const chartLabels = [...new Set(regionData.map((r) => String(r["Année"])))].sort();

  const datasets = vaccinFields.map((vaccin, i) => ({
    label: vaccin,
    data: chartLabels.map((year) => {
      const row = regionData.find((r) => String(r["Année"]) === year);
      const val = row ? parseFloat(row[vaccin]) : NaN;
      return Number.isFinite(val) ? val : null;
    }),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: COLORS[i % COLORS.length] + "55",
    tension: 0.3,
    pointRadius: 3,
    borderWidth: 2,
    pointHoverRadius: 7, 
    pointHoverBorderWidth: 3, 
    pointHoverBackgroundColor: '#fff',
    hidden: !selectedVaccins.includes(vaccin),
    spanGaps: true,
  }));

  const chartData = { labels: chartLabels, datasets };

  const barData = {
    labels: chartLabels,
    datasets: vaccinFields.map((vaccin, i) => ({
      label: vaccin,
      data: chartLabels.map((year) => {
        const row = regionData.find((r) => String(r["Année"]) === year);
        const val = row ? parseFloat(row[vaccin]) : NaN;
        return Number.isFinite(val) ? val : 0;
      }),
      backgroundColor: COLORS[i % COLORS.length] + "AA",
      hidden: !selectedVaccins.includes(vaccin),
    })),
  };

  // NOUVEAU: Fonction de clic unique pour la légende
  const handleLegendClick = (e, legendItem, chart) => {
    const label = legendItem.text;
    setSelectedVaccins((prev) =>
        prev.includes(label)
            ? prev.filter((v) => v !== label)
            : [...prev, label]
    );
  };

  // Utilisation de la fonction générique pour les options (pour Line et Bar)
  const chartOptions = generateChartOptions({
      chartType,
      titleText: `Évolution des couvertures vaccinales (${region})`,
      onLegendClick: handleLegendClick,
  });

  // NOUVEAU: Options spécifiques pour le graphique en PIE
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 16,
          font: { size: 13 },
          padding: 18,
          usePointStyle: true,
          generateLabels: () =>
            vaccinFields.map((label, i) => ({
              text: label,
              fillStyle: COLORS[i % COLORS.length],
              hidden: !selectedVaccins.includes(label),
              fontColor: selectedVaccins.includes(label)
                ? "#000"
                : "rgba(0,0,0,0.4)",
              textDecoration: selectedVaccins.includes(label)
                ? "none"
                : "line-through",
            })),
        },
        onClick: (_, legendItem) => handleLegendClick(null, legendItem, null),
      },
      title: {
        display: true,
        text: `Moyenne des couvertures vaccinales (${region})`,
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label || ctx.dataset.label}: ${
              ctx.raw != null ? ctx.raw.toFixed(1) : "—"
            }%`,
        },
      },
    },
  };

  const pieData = {
    labels: vaccinFields.filter((v) => selectedVaccins.includes(v)),
    datasets: [
      {
        label: "Taux moyen (%)",
        data: vaccinFields
          .filter((v) => selectedVaccins.includes(v))
          .map((v) => {
            const vals = regionData
              .map((r) => parseFloat(r[v]))
              .filter((x) => !isNaN(x));
            return vals.length
              ? vals.reduce((a, b) => a + b, 0) / vals.length
              : 0;
          }),
        backgroundColor: vaccinFields
          .filter((v) => selectedVaccins.includes(v))
          .map(
            (v) =>
              COLORS[vaccinFields.indexOf(v) % COLORS.length]
          ),
        borderColor: "#fff",
        borderWidth: 1.5,
      },
    ],
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button onClick={onClose} style={btnStyle}>✖</button>
        <h2>{region}</h2>

        <div
          style={{
            height: 420,
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {chartType === "line" && <Line data={chartData} options={chartOptions} />}

          {/* Le camembert utilise ses options spécifiques : pieOptions */}
          {chartType === "pie" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div style={{ width: "80%", maxWidth: 700, height: 400 }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          )}

          {chartType === "bar" && <Bar data={barData} options={chartOptions} />}
        </div>

        <ChartControls
            vaccinFields={vaccinFields}
            setSelectedVaccins={setSelectedVaccins}
            chartType={chartType}
            setChartType={setChartType}
        />
        
      </div>
    </div>
  );
}