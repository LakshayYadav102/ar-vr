import React, { useState } from "react";
import "../styles/EcoNavbar.css";

function EcoNavbar({ activeTab, setActiveTab }) {
  console.log("EcoNavbar rendered"); // Debug log
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle("light-theme", !isDarkTheme);
  };

  return (
    <nav className={`eco-navbar ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
      <div className="eco-logo">🌿 GreenVerse AR/VR Hub</div>
      <div className="eco-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </div>
      <ul className={`eco-nav-links ${isMobileMenuOpen ? "open" : ""}`}>
        <li>
          <button
            onClick={() => {
              setActiveTab("home");
              setIsMobileMenuOpen(false);
            }}
            className={activeTab === "home" ? "active" : ""}
          >
            Home
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab("live-camera");
              setIsMobileMenuOpen(false);
            }}
            className={activeTab === "live-camera" ? "active" : ""}
          >
            Live Camera
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab("analytics");
              setIsMobileMenuOpen(false);
            }}
            className={activeTab === "analytics" ? "active" : ""}
          >
            Analytics
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveTab("about");
              setIsMobileMenuOpen(false);
            }}
            className={activeTab === "about" ? "active" : ""}
          >
            About
          </button>
        </li>
        <li className="eco-dropdown">
          <span>More ▼</span>
          <ul className="eco-dropdown-content">
            <li>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsMobileMenuOpen(false);
                }}
                className={activeTab === "settings" ? "active" : ""}
              >
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("help");
                  setIsMobileMenuOpen(false);
                }}
                className={activeTab === "help" ? "active" : ""}
              >
                Help
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <div className="eco-nav-actions">
        <button className="eco-theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? "🌞 Light" : "🌙 Dark"}
        </button>
        <div className="eco-profile">👤</div>
      </div>
    </nav>
  );
}

export default EcoNavbar;