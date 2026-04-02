import React from "react";

const AttractiveCard = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>✨ Welcome Rishabh</h1>
        <p style={styles.text}>
          This is a random attractive JSX component with gradients, hover glow,
          and smooth UI. You can reuse it anywhere.
        </p>

        <button
          style={styles.button}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          Click Me 🚀
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    transition: "0.3s",
  },
  title: {
    marginBottom: "10px",
    fontSize: "28px",
  },
  text: {
    marginBottom: "20px",
    opacity: 0.9,
  },
  button: {
    padding: "12px 25px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "white",
    color: "#764ba2",
    transition: "0.3s",
  },
};

export default AttractiveCard;