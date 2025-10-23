import React, { useState, useCallback } from 'react';
import '../styles/EcoInfoSidebar.css';
import ThreeDAlternativeViewer from './ThreeDAlternativeViewer';
import { debounce } from 'lodash'; // Install lodash: npm install lodash

const EcoInfoSidebar = ({ detectedObjects, selectedObject, onSelectObject }) => {
  const [show3DViewer, setShow3DViewer] = useState(false);

  const handleView3D = useCallback(
    debounce(() => setShow3DViewer(true), 300),
    []
  );

  return (
    <div className="eco-info-sidebar">
      <h3>🌱 Eco Insights</h3>
      <p className="eco-muted">
        Click a detected item to view recyclability, carbon impact, alternatives, videos & resources.
      </p>
      <div className="eco-section">
        <h4>Detected Items</h4>
        {(!detectedObjects || detectedObjects.length === 0) && <p>No items detected yet.</p>}
        <ul className="eco-object-list">
          {(detectedObjects || []).map((obj, i) => (
            <li
              key={i}
              className={selectedObject?.name === obj.class ? 'selected' : ''}
              onClick={() => onSelectObject(obj.class)}
            >
              {obj.class} ({Math.round(obj.confidence * 100)}%)
            </li>
          ))}
        </ul>
      </div>
      {selectedObject && (
        <div className="eco-selected-info">
          <h4>{(selectedObject.name || 'UNKNOWN').toUpperCase()}</h4>
          <p><b>♻️ Recyclable:</b> {selectedObject.recyclable || 'Unknown'}</p>
          <p><b>💨 Carbon Impact:</b> {typeof selectedObject.carbon === 'number' ? `${selectedObject.carbon} kg CO2 emission` : 'Unknown'}</p>
          <p><b>✅ Alternative:</b> {selectedObject.alternative || 'Unknown'}</p>
          {selectedObject.alternative && selectedObject.alternative !== 'Unknown' && (
            <button onClick={handleView3D}>View 3D Alternative</button>
          )}
          <p><b>Summary:</b> {selectedObject.summary || 'No data available'}</p>
          {selectedObject.videos?.length > 0 && (
            <>
              <h5>🎥 Videos</h5>
              <ul>
                {selectedObject.videos.map((v, i) =>
                  typeof v.link === 'string' ? (
                    <li key={i}>
                      <a href={v.link} target="_blank" rel="noreferrer">{v.title || `Video ${i + 1}`}</a>
                    </li>
                  ) : null
                )}
              </ul>
            </>
          )}
          {selectedObject.links?.length > 0 && (
            <>
              <h5>🌐 Links</h5>
              <ul>
                {selectedObject.links.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {show3DViewer && (
        <ThreeDAlternativeViewer
          alternative={selectedObject.alternative}
          onClose={() => setShow3DViewer(false)}
        />
      )}
    </div>
  );
};

export default EcoInfoSidebar;