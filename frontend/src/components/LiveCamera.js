import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import EcoInfoSidebar from "./EcoInfoSidebar";
import { fetchEcoInfo } from "../ecoAI";

const LiveCamera = ({ setDetectedObjects, onSelectObject, detectedObjects }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [pulseRadius, setPulseRadius] = useState(0); // For animation effect

  const detectObjects = async () => {
    if (!webcamRef.current || webcamRef.current.video.readyState !== 4) return;

    const video = webcamRef.current.video;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        try {
          const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const res = await axios.post(`${API_URL}/detect`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});


          const predictions = res.data.predictions || [];
          if (setDetectedObjects) setDetectedObjects(predictions); // Sync with parent

          const drawCtx = canvasRef.current.getContext("2d");
          drawCtx.clearRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height);

          predictions.forEach((p) => {
            drawCtx.strokeStyle = "lime";
            drawCtx.lineWidth = 2;
            drawCtx.strokeRect(
              p.bbox[0],
              p.bbox[1],
              p.bbox[2] - p.bbox[0],
              p.bbox[3] - p.bbox[1]
            );
            drawCtx.fillStyle = "black";
            drawCtx.font = "14px Arial";
            drawCtx.fillText(
              `${p.class} (${Math.round(p.confidence * 100)}%)`,
              p.bbox[0],
              p.bbox[1] > 10 ? p.bbox[1] - 5 : 10
            );

            // Advanced futuristic AR marker
            const xCenter = p.bbox[0] + (p.bbox[2] - p.bbox[0]) / 2;
            const yTop = p.bbox[1] - 10; // Position above the box
            const baseRadius = 6;
            const minY = 10;

            // Glowing core with gradient
            const gradient = drawCtx.createRadialGradient(
              xCenter,
              yTop > minY ? yTop : minY,
              0,
              xCenter,
              yTop > minY ? yTop : minY,
              baseRadius
            );
            gradient.addColorStop(0, "rgba(50, 255, 50, 1)"); // Bright lime core
            gradient.addColorStop(1, "rgba(0, 255, 0, 0.3)"); // Fade to transparent
            drawCtx.beginPath();
            drawCtx.arc(
              xCenter,
              yTop > minY ? yTop : minY,
              baseRadius,
              0,
              2 * Math.PI
            );
            drawCtx.fillStyle = gradient;
            drawCtx.fill();
            drawCtx.shadowBlur = 10;
            drawCtx.shadowColor = "rgba(0, 255, 0, 0.5)";
            drawCtx.fill();
            drawCtx.shadowBlur = 0;

            // Holographic ring
            drawCtx.beginPath();
            drawCtx.arc(
              xCenter,
              yTop > minY ? yTop : minY,
              baseRadius + 2,
              0,
              2 * Math.PI
            );
            drawCtx.strokeStyle = "rgba(0, 255, 0, 0.3)";
            drawCtx.lineWidth = 1;
            drawCtx.stroke();

            // Pulsing outer glow
            const pulseSize = baseRadius + pulseRadius;
            const pulseGradient = drawCtx.createRadialGradient(
              xCenter,
              yTop > minY ? yTop : minY,
              0,
              xCenter,
              yTop > minY ? yTop : minY,
              pulseSize
            );
            pulseGradient.addColorStop(0, "rgba(0, 255, 0, 0.2)");
            pulseGradient.addColorStop(1, "rgba(0, 255, 0, 0)");
            drawCtx.beginPath();
            drawCtx.arc(
              xCenter,
              yTop > minY ? yTop : minY,
              pulseSize,
              0,
              2 * Math.PI
            );
            drawCtx.fillStyle = pulseGradient;
            drawCtx.fill();
          });
        } catch (err) {
          console.error("YOLO detection error:", err);
        }
      },
      "image/jpeg"
    );
  };

  const handleSelectObject = async (objectName) => {
    try {
      const info = await fetchEcoInfo(objectName);
      const selected = {
        name: objectName,
        ...info,
      };
      setSelectedObject(selected);
      if (onSelectObject) onSelectObject(selected); // Pass to parent
    } catch (err) {
      console.error("Error fetching eco info:", err);
      const fallback = {
        name: objectName,
        recyclable: "Unknown",
        carbon: "Unknown",
        alternative: "Unknown",
        summary: "No data available.",
        videos: [],
        links: [],
      };
      setSelectedObject(fallback);
      if (onSelectObject) onSelectObject(fallback); // Pass fallback to parent
    }
  };

  useEffect(() => {
    const interval = setInterval(detectObjects, 1000);
    const animatePulse = () => {
      setPulseRadius((prev) => (prev >= 3 ? 0 : prev + 0.1)); // Pulse effect from 0 to 3px
      requestAnimationFrame(animatePulse);
    };
    animatePulse();
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ position: "relative", flex: "2" }}>
        <Webcam ref={webcamRef} audio={false} style={{ width: 640, height: 480 }} />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
      <div style={{ flex: "1", minWidth: "300px" }}>
        <EcoInfoSidebar
          detectedObjects={detectedObjects}
          selectedObject={selectedObject}
          onSelectObject={handleSelectObject}
        />
      </div>
    </div>
  );
};

export default LiveCamera;