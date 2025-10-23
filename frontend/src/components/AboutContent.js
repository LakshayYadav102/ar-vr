import React from "react";

const AboutContent = () => {
  return (
    <div className="about-content">
      <h1>About GreenVerse AR/VR Hub</h1>
      <p>GreenVerse is an innovative AR/VR platform dedicated to promoting sustainability. By leveraging advanced AI and computer vision, we help users identify objects, assess their environmental impact, and discover eco-friendly alternatives.</p>
      <h2>Our Mission</h2>
      <p>To empower individuals and businesses to make sustainable choices through technology, reducing carbon footprints and fostering a greener planet.</p>
      <h2>Key Features</h2>
      <ul>
        <li>Real-time object detection with YOLOv8</li>
        <li>Eco information from OpenRouter API</li>
        <li>AR overlays for immersive experiences</li>
        <li>Scan history and analytics</li>
      </ul>
      <p>Developed in 2025, GreenVerse is built with React, Framer Motion, and more. Contact us for collaboration!</p>
    </div>
  );
};

export default AboutContent;