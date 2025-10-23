import React from "react";
import "../styles/EcoFooter.css";

function EcoFooter() {
  console.log("EcoFooter rendered"); // Debug log
  return (
    <footer className="eco-footer">
      <p>© {new Date().getFullYear()} GreenVerse AR/VR Hub — Empowering Sustainability</p>
      <p>Made with 💚 for the planet</p>
    </footer>
  );
}

export default EcoFooter;