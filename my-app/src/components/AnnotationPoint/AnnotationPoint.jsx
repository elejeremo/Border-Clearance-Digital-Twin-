import React, { useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import { useWebSocket } from "../WebSocketContext/Websocket";


const AnnotationPoint = ({ position, title, gateId, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const dynamicColor = useMemo(() => {
    
    // Check specifically for gate3 (cos the websocket is connected to gate3)
    if (sensorData && gateId === "gate3") {
      // Extract scanner colors from the sensor data for gate3
      const scannerColors = sensorData["gate3"]?.scanner_colors;
  
      // Check if scanner colors exist
      if (scannerColors) {
        // Convert hex number colors to CSS color strings
        const color1 = `#${scannerColors[0].toString(16).padStart(6, '0')}`;
        const color2 = `#${scannerColors[1].toString(16).padStart(6, '0')}`;
  
        // Return color based on shiny state
        return shiny ? color1 : color2;
      }
    }
  
    // If no websocket data is available for gate3, fall back to original colors
    return shiny ? color1 : color2;
  }, [sensorData, connected, gateId, shiny, color1, color2]);
    
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
        {/* <meshBasicMaterial color={shiny ? color1 : color2} depthTest={false} /> */}
        <meshBasicMaterial color={dynamicColor} depthTest={false} />
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
          {/* <div className="annotation-widget">
            <h2>{title}</h2>
            <DataCards content={content} /> 
          </div> */}
        </Html>
      )}
    </>
  );
};

export default AnnotationPoint;
