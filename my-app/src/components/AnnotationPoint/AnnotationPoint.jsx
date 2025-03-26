import React, { useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import { useWebSocket } from "../WebSocketContext/Websocket";


const AnnotationPoint = ({ position, title, gateId, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const dynamicColor = useMemo(() => {
    // Check specifically for gate3 and ensure connected and data exists
    if (connected && sensorData && gateId === "gate3") {
      // Extract updated color from sensor data
      const updatedColor = sensorData["gate3"]?.updated_colour;

      // If updated color exists, convert to CSS color
      if (updatedColor) {
        // Convert hex number colors to CSS color strings
        const color1 = `#${updatedColor[0].toString(16).padStart(6, '0')}`;
        const color2 = `#${updatedColor[1].toString(16).padStart(6, '0')}`;

        // Return color based on shiny state
        return shiny ? color1 : color2;
      }
    }

    // Fallback to original colors if no websocket data
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
