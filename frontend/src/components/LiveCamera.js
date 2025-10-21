import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { fetchEcoInfo } from "../ecoAI";

const LiveCamera = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  // 🔎 Detect objects from backend YOLO
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
          const res = await axios.post("http://localhost:8000/detect", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const predictions = res.data.predictions || [];
          setDetectedObjects(predictions);

          // 🎯 Draw boxes
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
          });
        } catch (err) {
          console.error("YOLO detection error:", err);
        }
      },
      "image/jpeg"
    );
  };

  // 🖱️ Click handler → fetch eco info
  const handleSelectObject = async (objectName) => {
    const info = await fetchEcoInfo(objectName);
    setSelectedObject({
      name: objectName,
      ...info,
    });
  };

  // 🔁 Run detection every second
  useEffect(() => {
    const interval = setInterval(detectObjects, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* 📷 Webcam with bounding boxes */}
      <div style={{ position: "relative" }}>
        <Webcam ref={webcamRef} audio={false} style={{ width: 640, height: 480 }} />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>

      {/* 📋 Sidebar with detected objects */}
      <div
        style={{
          maxHeight: "480px",
          overflowY: "auto",
          padding: "10px",
          background: "#e0ffe0",
          width: "200px",
          borderRadius: "8px",
        }}
      >
        <h4>Detected Items:</h4>
        <ul>
          {detectedObjects.map((obj, i) => (
            <li
              key={i}
              style={{ cursor: "pointer", margin: "5px 0" }}
              onClick={() => handleSelectObject(obj.class)}
            >
              {obj.class} ({Math.round(obj.confidence * 100)}%)
            </li>
          ))}
        </ul>
      </div>

      {/* 📝 Info panel for selected object */}
      {selectedObject && (
        <div
          style={{
            maxWidth: "400px",
            background: "#f0f0f0",
            padding: "15px",
            borderRadius: "8px",
            overflowY: "auto",
            maxHeight: "480px",
          }}
        >
          <h3>{selectedObject.name.toUpperCase()}</h3>
          <p>
            <b>♻️ Recyclable:</b> {selectedObject.recyclable}
          </p>
          <p>
            <b>💨 Carbon Impact:</b> {selectedObject.carbon}
          </p>
          <p>
            <b>✅ Alternative:</b> {selectedObject.alternative}
          </p>
          <p>
            <b>Summary:</b> {selectedObject.summary}
          </p>

          {selectedObject.videos && selectedObject.videos.length > 0 && (
            <>
              <h4>🎥 Videos</h4>
              <ul>
                {selectedObject.videos.map((v, i) =>
                  v.link && typeof v.link === "string" ? (
                    <li key={i}>
                      <a href={v.link} target="_blank" rel="noreferrer">
                        {v.title}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </>
          )}

          {selectedObject.links && Array.isArray(selectedObject.links) && selectedObject.links.length > 0 && (
            <p>
              🌐 {selectedObject.links.map((link, i) =>
                typeof link === "string" && link.trim() !== "" ? (
                  <span key={i}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                    <br />
                  </span>
                ) : null
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveCamera;
