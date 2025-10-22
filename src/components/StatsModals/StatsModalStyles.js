export const COLORS = [
  "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1",
  "#17a2b8", "#ff5733", "#9b59b6", "#2ecc71", "#3498db",
];

export const modalStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)", 
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  overflowY: "auto",
};

export const contentStyle = {
  background: "rgba(255, 255, 255, 0.7)", 
  backdropFilter: "blur(12px) saturate(180%)",
  WebkitBackdropFilter: "blur(12px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  padding: 30,
  borderRadius: 12,
  width: "90%",
  maxWidth: 1100,
  boxShadow: "0 0 30px rgba(0,0,0,0.2)",
  position: "relative",
};

export const btnStyle = {
  position: "absolute",
  top: 10,
  right: 20,
  background: "transparent",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
};

export const buttonStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #007bff", 
  background: "#f0f8ff",
  cursor: "pointer",
  fontSize: 13,
  transition: "background 0.2s, transform 0.2s", 
};

export const legendButtonsContainer = {
  display: "flex",
  justifyContent: "center",
  gap: 15,
  marginTop: 10,
};

export const chartNavContainer = {
  marginTop: 25,
  paddingTop: 15,
  borderTop: "2px solid #ccc",
  textAlign: "center",
};

export const chartNavButtons = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  marginTop: 10,
};

export const navButton = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: "bold",
  transition: "background 0.3s, box-shadow 0.2s, transform 0.1s", 
};