import React, { useState, useRef } from "react";
import "./Mainborder.css";
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, CameraControls, Html } from '@react-three/drei';
import { DEG2RAD } from "three/src/math/MathUtils.js";
import Model from "../model/model";
import { extend } from '@react-three/fiber'
import Tooltip from '@mui/material/Tooltip'

const Scene = ({ annotations, onPointClick, gates, onFirstClick, cameraControlRef, activePoint, activeGatePoint }) => {
  return (
    <>
      <PerspectiveCamera
        aspect={window.innerWidth / window.innerHeight}
        makeDefault
        position={[8, 5, 8]}
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


      {gates.map((gate, index) => (
        <GatePoint 
          key={index} 
          {...gate}
          // if active point is any existing ppoint returns true else false
          onClick={() => onFirstClick(gate)} 
        />
      ))} 


      
      {activeGatePoint !== null && ( //render only when there is 
        
        <>
        
        {annotations.map((annotation, index) => (
        <AnnotationPoint 
          key={index} 
          {...annotation}
          isActive={activePoint === annotation.title} // if active point is any existing ppoint returns true else false
          onClick={() => onPointClick(annotation)} 
        />
      ))}
      
      </>
    )}


      
    </>
  );
};






const AnnotationPoint = ({ position, title, onClick, isActive, }) => {
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

      {isActive && ( //renders html tag by knowing which isA
        <Html position={position}>
          <div className="stats">
            <h2>{title}</h2>
          </div>
              
        </Html>
      )}
    </>
  );
};


const GatePoint = ({ gatePosition, gateTitle, onClick, isActiveGate }) => {
  const [GateShiny, setGateShiny] = useState(false);
  
  return (
    <>
      <mesh
        position={gatePosition}
        onClick={onClick}
        onPointerEnter={() => setGateShiny(true)}
        onPointerLeave={() => setGateShiny(false)}
        renderOrder={1}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={"#fcfcfc"} depthTest={false} />
      </mesh>

      {isActiveGate && (
        <Html position={gatePosition}>
          <div className="stats1">
            <h2>{gateTitle}</h2>
          </div>         
        </Html>
      )}
    </>
  );
};

const ThreeModel = () => {
  const cameraControlRef = useRef();
  const [activePoint, setActivePoint] = useState(null); //active annotaion point
  const [activeGatePoint, setActiveGatePoint] = useState(null); //active gate point

  const [zoomed,setZoomed] = useState(null)
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

  const [gates] = useState([
    {
      gatePosition: [0.2, 0.5, 3],
      gateTitle: "gate1",
      cameraView: {
        position: [3,3,5],
        lookAt: [0,0,0],
        zoom: 3
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



  const handlefirstlevelzoom = (gate) => {
    const { cameraView } = gate;
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
    setActiveGatePoint(gate.title);
    setActivePoint(null)
  };





  return (
    <div className="MainBorder">
      <Canvas>
        <Scene 
          annotations={annotations}
          gates={gates}
          onPointClick={handlePointClick}
          onFirstClick = {handlefirstlevelzoom}
          cameraControlRef={cameraControlRef}
          activePoint={activePoint}
          activeGatePoint = {activeGatePoint}
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
            setActiveGatePoint(null)
         
          }}
        >
          Reset View
        </button> </Tooltip>
      </div>


      
    </div>
  );
};

export default ThreeModel;