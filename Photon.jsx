import React, { useState } from "react";
import "./Photon.css";

const Photon = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const handleClick = () => {
    if (input.trim() === "") {
      setMessage("Please enter something ⚠️");
    } else {
      setMessage(`Photon Activated: ${input} ⚡`);
      setInput("");
    }
  };

  return (
    <div className="photon-container">
      {/* Glow Effect */}
      <div className="photon-glow"></div>

      {/* Title */}
      <h1 className="photon-title">Photon Interface</h1>

      {/* Card */}
      <div className="photon-card">
        <input
          type="text"
          className="photon-input"
          placeholder="Enter energy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button className="photon-btn" onClick={handleClick}>
          Activate
        </button>

        {message && (
          <p style={{ marginTop: "12px", color: "#38bdf8" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Photon;