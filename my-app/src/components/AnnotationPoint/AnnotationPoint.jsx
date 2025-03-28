import React, { useState, useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import { useWebSocket } from "../WebSocketContext/Websocket";

const AnnotationPoint = ({ position, title, gateId, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const [currentColors, setCurrentColors] = useState({ color1, color2 });



  // Dynamic color update based on WebSocket data for gate 3
  useEffect(() => {
    if (connected && sensorData && gateId === "gate3" && title === "Scanner") {
      const updatedColor = sensorData?.[0]?.updated_colour;
      
      if (updatedColor) {
        console.log('Updated Colors:', updatedColor);
        setCurrentColors({ 
          color1: updatedColor[0], 
          color2: updatedColor[1] 
        });
      }
    }
  }, [sensorData?.[0]?.updated_colour, connected]);
  

// add more gate websockets here //



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