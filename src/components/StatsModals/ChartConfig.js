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

export { Line, Pie, Bar } from "react-chartjs-2";


// Filtre les colonnes totalement vides
export function filterEmptyColumns(data) {
  if (!Array.isArray(data) || data.length === 0) return [];

  const allCols = Object.keys(data[0]).filter(
    (k) =>
      ![
        "Année",
        "Région",
        "Région Code",
        "Département",
        "Département Code",
        "Territoire",
      ].includes(k) && k.trim() !== ""
  );

  // On garde uniquement les colonnes ayant AU MOINS une valeur valide
  return allCols.filter((col) =>
    data.some((row) => {
      const val = parseFloat(row[col]);
      return !isNaN(val) && val !== null && val !== "" && val > 0;
    })
  );
}

// Fonction de génération d’options de graphique
export function generateChartOptions({ chartType, titleText, onLegendClick }) {
  const commonLegendConfig = {
    position: "bottom",
    labels: {
      boxWidth: 14,
      font: { size: 12 },
      padding: 14,
      usePointStyle: true,
      generateLabels: (chart) => {
        const datasets = chart.data.datasets;

        // Gestion spéciale du camembert
        if (chartType === "pie" && datasets[0]) {
          const d = datasets[0];
          // Filtrage des cellules nulles
          return d.data
            .map((val, i) => ({
              text: `${d.labels[i]} (${val.toFixed(1)}%)`,
              fillStyle: d.backgroundColor[i],
              hidden: val <= 0 || isNaN(val),
            }))
            .filter((item) => !item.hidden);
        }

        return datasets
          .filter((ds) => ds.data.some((v) => v > 0))
          .map((dataset, i) => ({
            text: dataset.label,
            fillStyle: dataset.backgroundColor,
            strokeStyle: dataset.borderColor,
            hidden: dataset.hidden,
            datasetIndex: i,
            fontColor: dataset.hidden ? "rgba(0,0,0,0.4)" : "#000",
            textDecoration: dataset.hidden ? "line-through" : "none",
          }));
      },
    },
    onClick: (e, legendItem, chart) => {
      if (onLegendClick) {
        onLegendClick(e, legendItem, chart);
      }
    },
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: commonLegendConfig,
      title: {
        display: true,
        text: titleText,
        font: { size: 18 },
        padding: { top: 10, bottom: 20 },
        color: "rgba(0,0,0,0.85)",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || ctx.dataset.label;
            const val = ctx.raw != null ? ctx.raw.toFixed(1) : "—";
            return `${label}: ${val}%`;
          },
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
}
