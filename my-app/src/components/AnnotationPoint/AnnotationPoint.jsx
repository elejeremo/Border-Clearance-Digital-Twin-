import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import { useWebSocket } from "../WebSocketContext/Websocket";

const AnnotationPoint = ({ position, title, gateId, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const [currentColors, setCurrentColors] = useState({ 
    color1: `#${color1.toString(16).padStart(6, '0')}`, 
    color2: `#${color2.toString(16).padStart(6, '0')}` 
  });

  // Convert numeric color to hex string
  const convertColorToHex = (colorNumber) => {
    return `#${colorNumber.toString(16).padStart(6, '0')}`;
  };

  // Effect to update colors when WebSocket data changes
  useEffect(() => {
    // Check specifically for gate3 and ensure connected and data exists
    if (connected && sensorData && gateId === "gate3") {
      // Extract updated color from sensor data
      const updatedColor = sensorData["gate3"]?.updated_colour;

      // If updated color exists, convert to CSS color
      if (updatedColor && Array.isArray(updatedColor) && updatedColor.length === 2) {
        const newColor1 = convertColorToHex(updatedColor[0]);
        const newColor2 = convertColorToHex(updatedColor[1]);

        console.log("Updating colors:", { newColor1, newColor2 });
        setCurrentColors({ color1: newColor1, color2: newColor2 });
      }
    }
  }, [sensorData, connected, gateId]);
   
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