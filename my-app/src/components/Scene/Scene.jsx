import React from 'react';
import { PerspectiveCamera, CameraControls } from '@react-three/drei';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import GatePoint from '../GatePoint/GatePoint';
import AnnotationPoint from '../AnnotationPoint/AnnotationPoint';
import Model from '../model/model';

const Scene = ({ annotations, onPointClick, gates, onFirstClick, cameraControlRef, activePoint, activeGatePoint }) => {
  console.log('Clicked Gate:', activeGatePoint);
  const filteredAnnotations = activeGatePoint 
    ? annotations.filter(annotation => annotation.gateId === activeGatePoint)
    : [];

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
        maxPolarAngle={DEG2RAD * 80}
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
          isActiveGate={activeGatePoint === gate.gateTitle}
          onClick={() => onFirstClick(gate)}
        />
      ))}
     
      {activeGatePoint !== null && (
        <>
          {filteredAnnotations.map((annotation, index) => (
            <AnnotationPoint
              key={index}
              {...annotation}
              isActive={activePoint === annotation.title}
              onClick={() => onPointClick(annotation)}
            />
          ))}
        </>
      )}
      
    </>

    
  );
};

export default Scene;
