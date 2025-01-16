import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import "./AnnotationPoint.css"
import DataCards from '../DataCards/DataCards';

const AnnotationPoint = ({ position, title, onClick, isActive, color1, color2, content }) => {
  const [shiny, setShiny] = useState(false);

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
        <meshBasicMaterial color={shiny ? color1 : color2} depthTest={false} />
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
          <div className="info-widget">
            <h2>{title}</h2>
            <DataCards content={content} />
          </div>
        </Html>
      )}
    </>
  );
};

export default AnnotationPoint;
