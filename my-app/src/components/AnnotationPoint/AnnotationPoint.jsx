import React, { useState, useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import { useWebSocket } from "../WebSocketContext/Websocket";

const AnnotationPoint = ({ position, title, gateId, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const [currentColors, setCurrentColors] = useState({ color1, color2 });

  // Debug effect to log WebSocket data changes
  useEffect(() => {
    console.log("WebSocket Connection Status:", connected);
    console.log("Full Sensor Data:", sensorData);
    
    // Check for gate3 specific data
    if (connected && sensorData && sensorData["gate3"]) {
      console.log("Gate3 Sensor Data:", sensorData["gate3"]);
      
      // Log the updated color only when the updated colour changes
      if (sensorData.updated_colour) {
        console.log("Updated Colour for Gate3:", sensorData.updated_colour);
      }
    }
  }, [sensorData?.updated_colour, connected]);

  // Dynamic color logic based on WebSocket data
  useEffect(() => {
    if (connected && sensorData && gateId === "gate3") {
      const updatedColor = sensorData.updated_colour;
      
      if (updatedColor) {
        console.log('Updated Colors:', updatedColor);
        setCurrentColors({ 
          color1: updatedColor[0], 
          color2: updatedColor[1] 
        });
      }
    }
  }, [sensorData?.updated_colour, connected]);

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
        <meshBasicMaterial 
          color={shiny ? currentColors.color1 : currentColors.color2} 
          depthTest={false} 
        />
      </mesh>
     
      {isActive && (
        <Html
          position={position}
          wrapperClass="annotation-wrapper"
          distanceFactor={6}
          style={{
            transition: 'all 0.2s',
          }}
        >
          {/* Existing HTML content */}
        </Html>
      )}
    </>
  );
};

export default AnnotationPoint;