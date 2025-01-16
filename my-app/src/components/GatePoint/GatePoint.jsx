import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import "./GatePoint.css"

const GatePoint = ({ gatePosition, gateTitle, onClick,color1, color2, isActiveGate }) => {
  const [GateShiny, setGateShiny] = useState(false);

  return (
    <>
      <mesh
        position={gatePosition}
        onClick={onClick}
        onPointerEnter={() => setGateShiny(true)}
        onPointerLeave={() => setGateShiny(false)}
        renderOrder={1}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={GateShiny ? color1 : color2} depthTest={false} />
      </mesh>

      {isActiveGate && (
        <Html position={gatePosition}>
          <div className="stats1">
            <h2>{gateTitle}</h2>
          </div>         
        </Html>
      )}
    </>
  );
};

export default GatePoint;
