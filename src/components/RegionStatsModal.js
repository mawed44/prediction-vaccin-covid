import React, { useEffect, useMemo, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RegionStatsModal({ region, data, onClose }) {
  const [selectedVaccins, setSelectedVaccins] = useState([]);
  const [didInitSelection, setDidInitSelection] = useState(false);
  const [chartType, setChartType] = useState("line");

  const hasData = region && Array.isArray(data) && data.length > 0;
  const regionField = "Région";

  // Filtrage par région
  const regionData = useMemo(() => {
    if (!hasData) return [];
    const target = region.toLowerCase().trim();
    return data.filter((row) => {
      const r = (row[regionField] || "").toLowerCase().trim();
      return r.includes(target) || target.includes(r);
    });
  }, [region, data, hasData]);

  // Colonnes vaccinales
  const vaccinFields =
    regionData.length > 0
      ? Object.keys(regionData[0]).filter(
          (k) => !["Année", "Région", "Région Code"].includes(k)
        )
      : [];

  // Sélection initiale
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

  // Données principales
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
    hidden: !selectedVaccins.includes(vaccin),
    spanGaps: true,
  }));

  const chartData = { labels: chartLabels, datasets };

  // Données histogramme
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

  // Options générales
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: chartType === "pie" ? "bottom" : "bottom",
        labels: {
          boxWidth: 16,
          font: { size: 13 },
          padding: 18,
          usePointStyle: true,
          generateLabels: (chart) => {
            const items = chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              hidden: dataset.hidden,
              datasetIndex: i,
            }));
            return items.map((item) => ({
              ...item,
              fontColor: item.hidden ? "rgba(0,0,0,0.4)" : "#000",
              textDecoration: item.hidden ? "line-through" : "none",
            }));
          },
        },
        onClick: (e, legendItem, chart) => {
          const label = legendItem.text;
          setSelectedVaccins((prev) =>
            prev.includes(label)
              ? prev.filter((v) => v !== label)
              : [...prev, label]
          );
        },
      },
      title: {
        display: true,
        text: `Évolution des couvertures vaccinales (${region})`,
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
    layout: { padding: 10 },
    scales:
      chartType === "pie"
        ? {}
        : {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: "Taux de couverture (%)" },
            },
            x: { title: { display: true, text: "Année" } },
          },
  };

  // Rendu principal
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button onClick={onClose} style={btnStyle}>✖</button>
        <h2>{region}</h2>

        {/* Graphique */}
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

          {/* Camembert avec légende interactive =*/}
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
                <Pie
                  data={{
                    labels: vaccinFields.filter((v) =>
                      selectedVaccins.includes(v)
                    ),
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
                  }}
                  options={{
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
                        onClick: (_, legendItem) => {
                          const label = legendItem.text;
                          setSelectedVaccins((prev) =>
                            prev.includes(label)
                              ? prev.filter((v) => v !== label)
                              : [...prev, label]
                          );
                        },
                      },
                      title: {
                        display: true,
                        text: `Évolution des couvertures vaccinales (${region})`,
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
                  }}
                />
              </div>
            </div>
          )}

          {chartType === "bar" && <Bar data={barData} options={chartOptions} />}
        </div>

        {/* Boutons légende */}
        <div style={legendButtonsContainer}>
          <button onClick={() => setSelectedVaccins(vaccinFields)} style={buttonStyle}>
            Tout sélectionner
          </button>
          <button onClick={() => setSelectedVaccins([])} style={buttonStyle}>
            Tout désélectionner
          </button>
        </div>

        {/* Navigation */}
        <div style={chartNavContainer}>
          <p style={{ fontWeight: "bold" }}>Changer de type de graphique :</p>
          <div style={chartNavButtons}>
            {["line", "pie", "bar"].map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                style={{
                  ...navButton,
                  background: chartType === t ? "#007bff" : "#ddd",
                  color: chartType === t ? "#fff" : "#000",
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
      </div>
    </div>
  );
}

// --- Styles ---
const COLORS = [
  "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1",
  "#17a2b8", "#ff5733", "#9b59b6", "#2ecc71", "#3498db",
];

const modalStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  overflowY: "auto",
};

const contentStyle = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  width: "90%",
  maxWidth: 1100,
  boxShadow: "0 0 30px rgba(0,0,0,0.4)",
  position: "relative",
};

const btnStyle = {
  position: "absolute",
  top: 10,
  right: 20,
  background: "transparent",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
};

const buttonStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#eee",
  cursor: "pointer",
  fontSize: 13,
};

const legendButtonsContainer = {
  display: "flex",
  justifyContent: "center",
  gap: 15,
  marginTop: 10,
};

const chartNavContainer = {
  marginTop: 25,
  paddingTop: 15,
  borderTop: "1px solid #ccc",
  textAlign: "center",
};

const chartNavButtons = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  marginTop: 10,
};

const navButton = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: "bold",
  transition: "background 0.3s",
};
