import React, { useEffect, useMemo, useState } from "react";
import { Line, Pie, Bar, generateChartOptions } from "./ChartConfig";
import ChartControls from "./ChartControls"; 

import { 
    COLORS, 
    modalStyle, 
    contentStyle, 
    btnStyle, 
} from './StatsModalStyles';

const DEPT_EQUIV = {
// ... (le reste de DEPT_EQUIV est inchangé)
  "alpes de haute provence": "alpes-de-haute-provence",
  "alpes maritimes": "alpes-maritimes",
  "bouches du rhone": "bouches-du-rhône",
  "cote d or": "côte-d'or",
  "cotes d armor": "côtes-d'armor",
  "haute corse": "haute-corse",
  "corse du sud": "corse-du-sud",
  "ille et vilaine": "ille-et-vilaine",
  "loire atlantique": "loire-atlantique",
  "maine et loire": "maine-et-loire",
  "meurthe et moselle": "meurthe-et-moselle",
  "pyrenees atlantiques": "pyrénées-atlantiques",
  "pyrenees orientales": "pyrénées-orientales",
  "haut rhin": "haut-rhin",
  "bas rhin": "bas-rhin",
  "haute garonne": "haute-garonne",
  "haute saone": "haute-saône",
  "haute savoie": "haute-savoie",
  "haute vienne": "haute-vienne",
  "haute loire": "haute-loire",
  "hautes alpes": "hautes-alpes",
  "hautes pyrenees": "hautes-pyrénées",
  "saone et loire": "saône-et-loire",
  "seine et marne": "seine-et-marne",
  "seine maritime": "seine-maritime",
  "seine saint denis": "seine-saint-denis",
  "val d oise": "val-d'oise",
  "val de marne": "val-de-marne",
  "territoire de belfort": "territoire de belfort",
  "loir et cher": "loir-et-cher",
  "eure et loir": "eure-et-loir",
  "lot et garonne": "lot-et-garonne",
  "pas de calais": "pas-de-calais",
  "vaucluse": "vaucluse",
  "hauts de seine": "hauts-de-seine",
  "yonne": "yonne",
  "guadeloupe": "guadeloupe",
  "martinique": "martinique",
  "guyane": "guyane",
  "reunion": "réunion",
  "la reunion": "réunion",
  "mayotte": "mayotte",
};

function normalizeDeptName(name) {
  if (!name) return "";
  const clean = name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'")
    .replace(/[\s]+/g, " ");
  return DEPT_EQUIV[clean] || clean;
}

// Renommage de 'departmentCode' pour clarifier la prop
export default function DeptStatsModal({ departmentCode, data, onClose }) { 
  const [selectedVaccins, setSelectedVaccins] = useState([]);
  const [didInitSelection, setDidInitSelection] = useState(false);
  const [chartType, setChartType] = useState("line");

  const hasData = Array.isArray(data) && data.length > 0;

  const deptData = useMemo(() => {
    if (!hasData || !departmentCode) return [];

    const filteredByCode = data.filter(
      (row) =>
        String(row["Département Code"]).trim() ===
        String(departmentCode).trim()
    );

    if (filteredByCode.length > 0) return filteredByCode;

    const selectedRow = data.find(
      (row) =>
        normalizeDeptName(row["Département"]) ===
        normalizeDeptName(departmentCode)
    );

    return selectedRow ? [selectedRow] : [];
  }, [departmentCode, data, hasData]);

  const vaccinFields =
    deptData.length > 0
      ? Object.keys(deptData[0]).filter(
          (k) =>
            ![
              "Année",
              "Région",
              "Région Code",
              "Département",
              "Département Code",
            ].includes(k)
        )
      : [];

  useEffect(() => {
    if (!didInitSelection && vaccinFields.length) {
      setSelectedVaccins(vaccinFields);
      setDidInitSelection(true);
    }
  }, [vaccinFields, didInitSelection]);

  if (!hasData || deptData.length === 0) {
    return (
      <div style={modalStyle}>
        <div style={contentStyle}>
          <button onClick={onClose} style={btnStyle}>✖</button>
          <h2>Département {departmentCode}</h2>
          <p>Aucune donnée disponible pour ce département.</p>
        </div>
      </div>
    );
  }

  const chartLabels = [...new Set(deptData.map((r) => String(r["Année"])))].sort();

  const datasets = vaccinFields.map((vaccin, i) => ({
    label: vaccin,
    data: chartLabels.map((year) => {
      const row = deptData.find((r) => String(r["Année"]) === year);
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
        const row = deptData.find((r) => String(r["Année"]) === year);
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
      titleText: `Évolution des couvertures vaccinales (${deptData[0]["Département"]})`,
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
        text: `Moyenne des couvertures vaccinales (${deptData[0]["Département"]})`,
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
            const vals = deptData
              .map((r) => parseFloat(r[v]))
              .filter((x) => !isNaN(x));
            return vals.length
              ? vals.reduce((a, b) => a + b, 0) / vals.length
              : 0;
          }),
        backgroundColor: vaccinFields
          .filter((v) => selectedVaccins.includes(v))
          .map(
            (v) => COLORS[vaccinFields.indexOf(v) % COLORS.length]
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
        <h2>
          {deptData[0]["Département"]} ({deptData[0]["Département Code"]})
        </h2>

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