import React, { useState, useCallback } from "react";
import "./App.css";

/**
 * Clinician Unchained Dashboard
 * A comprehensive prescription analysis tool that interfaces with
 * backend AI services to evaluate medication prescriptions.
 * 
 * @component
 * @description Main application component for prescription analysis
 */
function App() {
  // Form state management
  const [medicationName, setMedicationName] = useState("");
  const [prescriptionStatus, setPrescriptionStatus] = useState("Pending");
  
  // UI state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  
  // API endpoint configuration
  const API_ENDPOINT = "http://localhost:5000/analyze";

  /**
   * Analyzes a prescription by sending data to the backend AI service
   * @async
   * @function analyzePrescription
   * @returns {Promise<void>} Updates result state with API response
   */
  const analyzePrescription = useCallback(async () => {
    // Validation checks
    if (!medicationName.trim()) {
      setError("Please enter a medication name before analysis.");
      return;
    }

    // Reset states for new request
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          medication_name: medicationName.trim(),
          status: prescriptionStatus
        })
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Add to prescription history
      setPrescriptionHistory(prev => [
        {
          id: Date.now(),
          medication: medicationName,
          status: prescriptionStatus,
          result: data,
          timestamp: new Date().toLocaleString()
        },
        ...prev.slice(0, 9) // Keep only last 10 entries
      ]);

    } catch (err) {
      setError(err.message || "An unexpected error occurred during analysis.");
      console.error("Prescription analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [medicationName, prescriptionStatus]);

  /**
   * Clears all form data and results
   * @function clearForm
   */
  const clearForm = useCallback(() => {
    setMedicationName("");
    setPrescriptionStatus("Pending");
    setResult(null);
    setError(null);
  }, []);

  /**
   * Loads a previous prescription from history
   * @function loadFromHistory
   * @param {Object} historyItem - The history item to load
   */
  const loadFromHistory = useCallback((historyItem) => {
    setMedicationName(historyItem.medication);
    setPrescriptionStatus(historyItem.status);
    setResult(historyItem.result);
    setError(null);
  }, []);

  /**
   * Removes a specific item from history
   * @function removeFromHistory
   * @param {number} id - The ID of the history item to remove
   */
  const removeFromHistory = useCallback((id) => {
    setPrescriptionHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">⚕️</span>
            Clinician Unchained
          </h1>
          <p className="dashboard-subtitle">AI-Powered Prescription Analysis Dashboard</p>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="input-section">
          <div className="card input-card">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              New Prescription Analysis
            </h2>

            <div className="form-group">
              <label htmlFor="medication-input" className="form-label">
                Medication Name
              </label>
              <input
                id="medication-input"
                type="text"
                className="form-input"
                placeholder="Enter medication name (e.g., Atorvastatin)"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status-select" className="form-label">
                Prescription Status
              </label>
              <select
                id="status-select"
                className="form-select"
                value={prescriptionStatus}
                onChange={(e) => setPrescriptionStatus(e.target.value)}
                disabled={isLoading}
              >
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Modified">Modified</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={analyzePrescription}
                disabled={isLoading || !medicationName.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔍</span>
                    Analyze Prescription
                  </>
                )}
              </button>

              <button
                className="btn btn-secondary"
                onClick={clearForm}
                disabled={isLoading}
              >
                <span className="btn-icon">🗑️</span>
                Clear Form
              </button>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
                <button 
                  className="alert-close"
                  onClick={() => setError(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </section>

        {result && (
          <section className="result-section">
            <div className="card result-card">
              <h2 className="section-title">
                <span className="section-icon">📊</span>
                AI Analysis Results
              </h2>

              <div className="result-content">
                <div className="result-header">
                  <span className={`status-badge status-${result.final_status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {result.final_status || "Unknown"}
                  </span>
                  <span className="medication-display">
                    {medicationName}
                  </span>
                </div>

                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Issue Identified</span>
                    <span className="result-value">{result.reason || "No issues detected"}</span>
                  </div>

                  <div className="result-item">
                    <span className="result-label">Recommended Action</span>
                    <span className="result-value">{result.action || "No specific action required"}</span>
                  </div>

                  <div className="result-item">
                    <span className="result-label">Final Decision</span>
                    <span className="result-value highlight">{result.final_status || "Pending"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {prescriptionHistory.length > 0 && (
          <section className="history-section">
            <div className="card history-card">
              <h2 className="section-title">
                <span className="section-icon">📜</span>
                Recent Analyses
                <span className="history-count">{prescriptionHistory.length}</span>
              </h2>

              <div className="history-list">
                {prescriptionHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-main">
                      <button
                        className="history-item-button"
                        onClick={() => loadFromHistory(item)}
                      >
                        <span className="history-medication">{item.medication}</span>
                        <span className={`history-status status-${item.result?.final_status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.result?.final_status || "Unknown"}
                        </span>
                      </button>
                      <span className="history-timestamp">{item.timestamp}</span>
                    </div>
                    <button
                      className="history-remove"
                      onClick={() => removeFromHistory(item.id)}
                      title="Remove from history"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>Clinician Unchained Dashboard v2.0 • AI-Powered Prescription Analysis</p>
      </footer>
    </div>
  );
}

export default App;