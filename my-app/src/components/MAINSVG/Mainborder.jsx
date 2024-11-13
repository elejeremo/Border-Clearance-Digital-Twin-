import React, { useState, useRef } from "react";
import "./Mainborder.css";
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, CameraControls, Html } from '@react-three/drei';
import { DEG2RAD } from "three/src/math/MathUtils.js";
import Model from "../model/model";
import { extend } from '@react-three/fiber'
import Tooltip from '@mui/material/Tooltip'

const Scene = ({ annotations, onPointClick, cameraControlRef, activePoint }) => {
  return (
    <>
      <PerspectiveCamera
        aspect={window.innerWidth / window.innerHeight}
        makeDefault
        position={[5, 2, 5]}
        fov={45}
      />
      <CameraControls
        ref={cameraControlRef}
        maxPolarAngle={DEG2RAD * 65}
        autoRotate={true}
        autoRotateSpeed={0.5}
        dollySpeed={0}
      />
      
      <directionalLight position={[10, 10, 5]} intensity={3} />
      <directionalLight position={[-10, -10, -5]} intensity={2} />
      <directionalLight position={[-10, 10, -5]} intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={10}/>
      
      <mesh>
        <Model url="" scale={0.001} position={[0, 0, 0]} />
      </mesh>

      {annotations.map((annotation, index) => (
        <AnnotationPoint 
          key={index} 
          {...annotation}
          isActive={activePoint === annotation.title} // if active point is any existing ppoint returns true else false
          onClick={() => onPointClick(annotation)} 
        />
      ))}
    </>
  );
};

const AnnotationPoint = ({ position, title, onClick, isActive }) => {
  const [shiny, setShiny] = useState(false);
  
  return (
    <>
      <mesh
        position={position}
        onClick={onClick}
        onPointerEnter={() => setShiny(true)}
        onPointerLeave={() => setShiny(false)}
        renderOrder={1}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={shiny ? 0xff00ff : 0x880088} depthTest={false} />
      </mesh>

      {isActive && (
        <Html position={position}>
          <div className="stats">
            <h2>{title}</h2>
          </div>
              
        </Html>
      )}
    </>
  );
};

const ThreeModel = () => {
  const cameraControlRef = useRef();
  const [activePoint, setActivePoint] = useState(null);
  const [annotations] = useState([
    {
      position: [0.8, 1.15, 1.2],
      title: "1",
      cameraView: {
        position: [2, 2, 0],
        lookAt: [0.8, 1.15, 1.2],
        zoom: 8
      }
    },
    {
      position: [-0.5, 0.7, -1.2],
      title: "2",
      cameraView: {
        position: [0, 1, -5],
        lookAt: [-0.5, 0.7, -1.2],
        zoom: 7
      }
    },
  ]);

  const handlePointClick = (annotation) => {
    const { cameraView } = annotation;
    cameraControlRef.current.moveTo(
      cameraView.position[0],
      cameraView.position[1],
      cameraView.position[2],
      true
    );
    cameraControlRef.current.lookInDirectionOf(
      cameraView.lookAt[0],
      cameraView.lookAt[1],
      cameraView.lookAt[2],
      true
    );
    cameraControlRef.current.zoomTo(cameraView.zoom, true);
    setActivePoint(annotation.title);
  };

  return (
    <div className="MainBorder">
      <Canvas>
        <Scene 
          annotations={annotations}
          onPointClick={handlePointClick}
          cameraControlRef={cameraControlRef}
          activePoint={activePoint}
        />
      </Canvas>

      {/* Reset Button */}
      <div style={{ position: 'absolute', top: '0' }}>
      <Tooltip title="Delete">
        <button
          type="button"
          onClick={() => {
            cameraControlRef.current?.reset(true);
            setActivePoint(null);
         
          }}
        >
          Reset View
        </button> </Tooltip>
      </div>
    </div>
  );
};

export default ThreeModel;