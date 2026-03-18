import React, { useState, useEffect } from "react";

const Storage = () => {
  const [value, setValue] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("myData");
    if (saved) {
      setValue(saved);
    }
  }, []);

  // Save data to localStorage
  const handleSave = () => {
    localStorage.setItem("myData", value);
    alert("Data saved!");
  };

  // Clear data
  const handleClear = () => {
    localStorage.removeItem("myData");
    setValue("");
  };

  return (
    <div style={styles.container}>
      <h2>Local Storage Demo</h2>

      <input
        type="text"
        placeholder="Enter something..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={styles.input}
      />

      <div style={styles.buttons}>
        <button onClick={handleSave} style={styles.save}>
          Save
        </button>
        <button onClick={handleClear} style={styles.clear}>
          Clear
        </button>
      </div>

      <p>
        <strong>Stored Value:</strong> {value || "Nothing saved"}
      </p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial",
  },
  input: {
    padding: "10px",
    width: "250px",
    marginBottom: "10px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  save: {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  clear: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Storage;