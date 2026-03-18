import React, { useState, useEffect, useRef } from "react";

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Start / Stop timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Format time (mm:ss)
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handlers
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.time}>{formatTime(seconds)}</h1>

      <div style={styles.buttons}>
        {!isRunning ? (
          <button onClick={handleStart} style={styles.start}>
            Start
          </button>
        ) : (
          <button onClick={handlePause} style={styles.pause}>
            Pause
          </button>
        )}

        <button onClick={handleReset} style={styles.reset}>
          Reset
        </button>
      </div>
    </div>
  );
};

// Simple inline styles
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial",
  },
  time: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  start: {
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  pause: {
    padding: "10px 20px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  reset: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Timer;