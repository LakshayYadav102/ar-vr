import React from "react";

const AnalyticsContent = ({ scanHistory }) => {
  const totalScans = scanHistory.length;
  const recyclableCount = scanHistory.filter((s) => s.recyclable === "Yes").length;
  const avgRecyclability = totalScans > 0 ? (recyclableCount / totalScans * 100).toFixed(2) + "%" : "—";
  const totalCarbon = scanHistory.reduce((sum, s) => sum + (parseFloat(s.carbon) || 0), 0).toFixed(2) + " kg CO2";

  // Fix for mostScanned calculation
  const mostScanned = totalScans > 0
    ? Object.entries(
        scanHistory.reduce((acc, s) => {
          acc[s.name] = (acc[s.name] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([, aCount], [, bCount]) => bCount - aCount)[0][0]
    : "—";

  return (
    <div className="analytics-content">
      <h1>Analytics Dashboard</h1>
      <p>Overview of your scans and environmental impact.</p>
      <div className="analytics-stats">
        <div className="stat-card">
          <h3>Total Scans</h3>
          <p>{totalScans}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Recyclability</h3>
          <p>{avgRecyclability}</p>
        </div>
        <div className="stat-card">
          <h3>Total Carbon Impact</h3>
          <p>{totalCarbon}</p>
        </div>
        <div className="stat-card">
          <h3>Most Scanned Item</h3>
          <p>{mostScanned}</p>
        </div>
      </div>
      <h2>Scan History</h2>
      <ul className="scan-history-list">
        {scanHistory.length === 0 ? <li>No scans yet</li> : scanHistory.map((s, i) => (
          <li key={i}>
            <strong>{s.name}</strong> - Recyclable: {s.recyclable}, Carbon: {s.carbon} kg CO2
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnalyticsContent;