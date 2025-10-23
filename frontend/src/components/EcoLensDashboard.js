import React, { useState } from "react";
import { motion } from "framer-motion";
import EcoNavbar from "./EcoNavbar";
import EcoFooter from "./EcoFooter";
import LiveCamera from "./LiveCamera";
import EcoInfoSidebar from "./EcoInfoSidebar";
import HomeContent from "./HomeContent"; // New component for Home view
import AnalyticsContent from "./AnalyticsContent"; // New component for Analytics view
import AboutContent from "./AboutContent"; // New component for About view
import "../styles/EcoLensDashboard.css";

const EcoLensDashboard = () => {
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("live-camera"); // Manage tab state

  // When user selects object → update selectedObject and scan history
  const handleSelectObject = (obj) => {
    setSelectedObject(obj);
    setScanHistory((prev) => [obj, ...prev.slice(0, 9)]); // keep last 10 scans
  };

  // Compute basic analytics
  const mostScanned =
    scanHistory.length > 0
      ? scanHistory
          .map((s) => s.name)
          .sort(
            (a, b) =>
              scanHistory.filter((s) => s.name === b).length -
              scanHistory.filter((s) => s.name === a).length
          )[0]
      : "—";

  const avgRecyclability =
    scanHistory.length > 0
      ? (
          scanHistory.filter((s) => s.recyclable === "Yes").length /
          scanHistory.length
        ).toFixed(2)
      : "—";

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeContent />;
      case "live-camera":
        return (
          <>
            <div className="ev-camera-wrap">
              <LiveCamera
                setDetectedObjects={setDetectedObjects}
                onSelectObject={handleSelectObject}
                detectedObjects={detectedObjects}
              />
            </div>
            <div className="eco-insights">
              <motion.div
                className="eco-insight-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h4>Recycling Stats</h4>
                <p>Global recycling rate: 20%</p>
                <p>Our goal: Increase to 50% by 2030</p>
              </motion.div>
              <motion.div
                className="eco-insight-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <h4>Carbon Reduction Tips</h4>
                <p>Reduce waste: Save 2 kg CO2/day</p>
                <p>Use reusable bags: Cut 1.5 kg CO2/week</p>
              </motion.div>
            </div>
          </>
        );
      case "analytics":
        return <AnalyticsContent scanHistory={scanHistory} />;
      case "about":
        return <AboutContent />;
      default:
        return null;
    }
  };

  return (
    <div className="eco-dashboard">
      <EcoNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="ev-main">
        <motion.section
          className="ev-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ev-left-inner">{renderContent()}</div>
        </motion.section>

        {activeTab === "live-camera" && (
          <motion.aside
            className="ev-right-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <EcoInfoSidebar
              detectedObjects={detectedObjects}
              selectedObject={selectedObject}
              onSelectObject={handleSelectObject}
            />

            <div className="ev-section">
              <h4>Recent Scans</h4>
              <ul className="eco-scan-history">
                {scanHistory.length === 0 && <li>No scans yet</li>}
                {scanHistory.map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
              </ul>
            </div>

            <div className="ev-section">
              <h4>Analytics</h4>
              <div className="ev-small">
                <div>
                  <b>Most scanned:</b> {mostScanned}
                </div>
                <div>
                  <b>Avg recyclability:</b> {avgRecyclability}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </main>
      <EcoFooter />
    </div>
  );
};

export default EcoLensDashboard;