import React, { useState, useRef} from "react";
import "./Mainborder.css"
import{motion} from 'framer-motion'
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import modelurl from './gltf/Gate model 1.gltf'
import {OrbitControls} from '@react-three/drei';

const Model = ({ url, scale, position, rotation }) => {
  const { scene } = useGLTF(modelurl);
  

  return (
    <group>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </group>
  );
};

const ThreeModel = () => {
  return (
    <div className="MainBorder">
      <Canvas 
      
    
      camera={{
          position: [10, 10, 10]
        }}>
      <directionalLight position={[10, 10, 5]} intensity={3} />
      <directionalLight position={[-10, -10, -5]} intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={10}/>
        <Model
          url=""
          scale={0.004}
          position={[0,0,0]}
          rotation={[Math.PI / 7, -Math.PI / 10, 0]}
          
        />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default ThreeModel;