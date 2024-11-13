import React, { useState, useRef, useEffect } from "react";
import "./Mainborder.css"
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { DEG2RAD, degToRad } from "three/src/math/MathUtils.js";
import gsap from 'gsap'
import { CameraControls } from '@react-three/drei';
import Model from "../model/model";

const DEG45 = Math.PI / 1.5;

const ThreeModel = () => {
  
  //animation

  const cameraControlRef = useRef(); //references the camera 
  const meshfitcamerahome = useRef();


 

  return (
    <div className="MainBorder">
      <Canvas>
        {/* Add PerspectiveCamera with initial position */}
        <PerspectiveCamera
          makeDefault
          position={[5, 2, 5]}  // top right of the model.Adjust these values to change camera position
          fov={75}              // Field of view
        />

        {/* Combine OrbitControls settings into one component */}

        <CameraControls ref={cameraControlRef} 
        max
          autoRotate
          enableZoom={false}     // Changed from false to match your requirements
          maxPolarAngle={DEG2RAD * 55}
        
          autoRotateSpeed={0.5}
    
        />

        {/* Lights */}
        <directionalLight position={[10, 10, 5]} intensity={3} />
        <directionalLight position={[-10, -10, -5]} intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={10}/>
                 
        {/* Model */}

    

        <mesh >
          <Model
          url=""
          scale={0.001}
          position={[0, 0, 0]}
        />
        
        </mesh>
      </Canvas>

      <div style={{ position: 'absolute', top: '0' }}>
				<button
					type="button"
					onClick={() => {
            console.log(cameraControlRef.current)
						cameraControlRef.current.moveTo(-0.05,0,0, true)
            cameraControlRef.current.lookInDirectionOf(0,0,0,true)

  
            //cameraControlRef.current?
					}}
				>
					rotate theta 45deg
				</button>
				<button
					type="button"
					onClick={() => {
						cameraControlRef.current?.reset(true);
					}}
				>
					reset
				</button>
			</div>
    </div>
  );
};

export default ThreeModel;