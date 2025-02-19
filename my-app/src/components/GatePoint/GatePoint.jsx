import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import "./GatePoint.css"
import Tooltip from '@mui/material/Tooltip';



const GatePoint = ({ gatePosition, gateTitle, onClick, color1, color2, isActiveGate}) => {
  const [GateShiny, setGateShiny] = useState(false);
  
  // Add this console log to check values
  console.log(`Gate ${gateTitle}:`, { isActiveGate, gatePosition });

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
      
        <meshBasicMaterial color={GateShiny ? color1 : color2} depthTest={false} />
      </mesh>
   
      {/*   */}
    </>
  );
};

export default GatePoint;
