import { useState, useEffect, useRef } from "react";

const MODES = {
  focus: { label: "Focus", duration: 25 * 60, color: "#ff6b6b" },
  short: { label: "Short Break", duration: 5 * 60, color: "#51cf66" },
  long: { label: "Long Break", duration: 15 * 60, color: "#74c0fc" },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const progress = 1 - timeLeft / current.duration;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") setSessions((s) => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(current.duration);
    setRunning(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f13", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", color: "#e8e8e8",
    }}>
      <h1 style={{ letterSpacing: "0.4em", fontSize: "0.85rem", textTransform: "uppercase",
        color: "#888", marginBottom: "2rem", fontFamily: "monospace" }}>
        ● Pomodoro
      </h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)} style={{
            padding: "0.4rem 1rem", borderRadius: "999px", border: "1px solid",
            borderColor: mode === key ? val.color : "#333",
            background: mode === key ? val.color + "22" : "transparent",
            color: mode === key ? val.color : "#666",
            cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}>{val.label}</button>
        ))}
      </div>

      <div style={{ position: "relative", width: 240, height: 240, marginBottom: "2rem" }}>
        <svg width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="120" cy="120" r={radius} fill="none" stroke="#1e1e26" strokeWidth="10" />
          <circle cx="120" cy="120" r={radius} fill="none" stroke={current.color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "3.2rem", fontVariantNumeric: "tabular-nums",
            color: "#f0f0f0", letterSpacing: "-0.02em" }}>
            {mins}:{secs}
          </span>
          <span style={{ fontSize: "0.7rem", color: "#555", letterSpacing: "0.2em",
            textTransform: "uppercase", marginTop: "0.3rem" }}>
            {running ? "in progress" : timeLeft === 0 ? "done" : "paused"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => setRunning((r) => !r)} style={{
          padding: "0.75rem 2.5rem", borderRadius: "999px", border: "none",
          background: current.color, color: "#fff", fontSize: "0.9rem",
          cursor: "pointer", letterSpacing: "0.1em", fontWeight: "bold",
          boxShadow: `0 0 24px ${current.color}55`, transition: "all 0.2s",
        }}>{running ? "Pause" : "Start"}</button>
        <button onClick={reset} style={{
          padding: "0.75rem 1.5rem", borderRadius: "999px",
          border: "1px solid #333", background: "transparent",
          color: "#666", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
        }}>Reset</button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: i < sessions % 4 ? current.color : "#2a2a35",
            transition: "background 0.3s",
          }} />
        ))}
        <span style={{ color: "#555", fontSize: "0.75rem", marginLeft: "0.5rem",
          fontFamily: "monospace" }}>
          {sessions} session{sessions !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}