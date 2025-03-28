import React, { useState, useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import "./GatePoint.css"
import Tooltip from '@mui/material/Tooltip';
import { useWebSocket } from "../WebSocketContext/Websocket";


const GatePoint = ({ gatePosition, gateTitle, onClick, color1, color2, isActiveGate}) => {
  const [GateShiny, setGateShiny] = useState(false);
  const { sensorData, connected } = useWebSocket();
  const [currentColors, setCurrentColors] = useState({ color1, color2 });
  

    // Dynamic gate color update based on WebSocket data for gate 3
    useEffect(() => {
      if (connected && sensorData && gateTitle === "gate3") {
        const updatedGateColor = sensorData?.[0]?.updated_gate_colour;
        
        if (updatedGateColor) {
          console.log('Updated Colors:', updatedGateColor);
          setCurrentColors({ 
            color1: updatedGateColor[0], 
            color2: updatedGateColor[1] 
          });
        }
      }
    }, [sensorData?.[0]?.updated_gate_colour, connected]);
    

  return (
    <>

      <mesh
        position={gatePosition}
        onClick={(e) => {
          console.log('Gate clicked:', gateTitle); // Add this to verify clicks
          onClick(e);
        }}
        onPointerEnter={() => setGateShiny(true)}
        onPointerLeave={() => setGateShiny(false)}
        renderOrder={1}
      >
       
        <sphereGeometry args={[0.1, 16, 16]} />
      
        <meshBasicMaterial color={GateShiny ? currentColors.color1 : currentColors.color2} />
      </mesh>
   
      {/*   */}
    </>
  );
};

export default GatePoint;
