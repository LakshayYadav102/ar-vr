import React, { useRef, useEffect, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader } from '@babylonjs/core';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';
import { WebXRHitTest } from '@babylonjs/core/XR/features/WebXRHitTest';
import '@babylonjs/loaders/glTF/2.0';

const ThreeDAlternativeViewer = ({ alternative, onClose }) => {
  const canvasRef = useRef(null);
  const [isAR, setIsAR] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const modelMap = {
    'Glass or metal version': './assets/models/glass-bottle/scene.gltf',
    default: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/WaterBottle/glTF/WaterBottle.gltf', // Use WaterBottle as fallback
  };

  const modelUrl = modelMap[alternative] || modelMap.default;

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('Attempting to load model from:', modelUrl);

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    let isMounted = true;

    let camera;
    if (!isAR) {
      camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);
      camera.attachControl(canvasRef.current, true);
    }

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // Test accessibility of model and dependencies
    const basePath = modelUrl.substring(0, modelUrl.lastIndexOf('/'));
    const dependencies = modelUrl.includes('glass-bottle')
      ? [modelUrl, `${basePath}/scene.bin`, `${basePath}/textures/Material.001_baseColor.png`]
      : [modelUrl]; // Only check .gltf for WaterBottle

    Promise.all(
      dependencies.map((url) =>
        fetch(url)
          .then((response) => {
            console.log(`Fetch response for ${url}: ${response.status} ${response.statusText}`);
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status} for ${url}`);
            }
            return url;
          })
          .catch((err) => {
            console.error(`Fetch error for ${url}:`, err);
            throw err;
          })
      )
    )
      .then(() => {
        console.log('All dependencies accessible, loading model');
        SceneLoader.ImportMeshAsync('', '', modelUrl, scene, null, '.gltf')
          .then((result) => {
            if (!isMounted) return;
            console.log('Model loaded successfully:', result.meshes);
            const model = result.meshes[0];
            model.scaling = new Vector3(0.1, 0.1, 0.1);
            model.position = new Vector3(0, 0, 0);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('SceneLoader error:', err.message, err.stack);
            alert('Failed to load 3D model. Check console for details.');
            console.log('Attempting fallback model:', modelMap.default);
            SceneLoader.ImportMeshAsync('', '', modelMap.default, scene, null, '.gltf')
              .then((result) => {
                if (!isMounted) return;
                console.log('Fallback model loaded:', result.meshes);
                const model = result.meshes[0];
                model.scaling = new Vector3(0.1, 0.1, 0.1);
                model.position = new Vector3(0, 0, 0);
                setIsLoading(false);
              })
              .catch((fallbackErr) => {
                console.error('Fallback model error:', fallbackErr.message, fallbackErr.stack);
                alert('Failed to load fallback model. Check console.');
                setIsLoading(false);
              });
          });
      })
      .catch((err) => {
        console.error('Dependency check failed:', err);
        alert('Cannot access model dependencies. Trying fallback model.');
        SceneLoader.ImportMeshAsync('', '', modelMap.default, scene, null, '.gltf')
          .then((result) => {
            if (!isMounted) return;
            console.log('Fallback model loaded:', result.meshes);
            const model = result.meshes[0];
            model.scaling = new Vector3(0.1, 0.1, 0.1);
            model.position = new Vector3(0, 0, 0);
            setIsLoading(false);
          })
          .catch((fallbackErr) => {
            console.error('Fallback model error:', fallbackErr.message, fallbackErr.stack);
            alert('Failed to load fallback model. Check console.');
            setIsLoading(false);
          });
      });

    if (isAR) {
      WebXRDefaultExperience.CreateAsync(scene)
        .then((xr) => {
          if (!isMounted) return;
          console.log('WebXR initialized successfully');
          const featuresManager = xr.baseExperience.featuresManager;
          const hitTest = featuresManager.enableFeature(WebXRHitTest, 'latest');
          let placed = false;

          hitTest.onHitTestResultObservable.add((results) => {
            if (results.length && !placed && scene.meshes[0]) {
              const hit = results[0];
              scene.meshes[0].position = hit.position;
              scene.meshes[0].rotationQuaternion = hit.rotationQuaternion;
              placed = true;
              console.log('Model placed in AR:', hit.position);
            }
          });
        })
        .catch((err) => {
          console.error('AR not supported:', err);
          alert('AR mode not supported on this device/browser. Using 3D view.');
          setIsAR(false);
        });
    }

    engine.runRenderLoop(() => {
      if (isMounted) scene.render();
    });

    return () => {
      isMounted = false;
      // Delay disposal to ensure loading completes
      setTimeout(() => {
        engine.stopRenderLoop();
        engine.dispose();
        console.log('Scene and engine disposed');
      }, 1000);
    };
  }, [isAR, modelUrl]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, background: 'black' }}>
      {isLoading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>Loading model...</div>}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={onClose}>
        Close
      </button>
      {!isAR && (
        <button
          style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}
          onClick={() => setIsAR(true)}
          disabled={isLoading}
        >
          Place in AR
        </button>
      )}
    </div>
  );
};

export default ThreeDAlternativeViewer;