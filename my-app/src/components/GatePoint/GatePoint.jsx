import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import "./GatePoint.css"

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
     
      {/* {isActiveGate && (
        <Html
          position={gatePosition}
          wrapperClass="gate-wrapper"
          distanceFactor={2}
          style={{
            transition: 'all 0.2s',
          }}
        >
          <div className="gate-widget">
            <h2>{gateTitle}</h2>
            <h3>
            "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes
            </h3>
          </div>        
        </Html>
      )} */}
    </>
  );
};

export default GatePoint;
