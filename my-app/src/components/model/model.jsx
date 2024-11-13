import React, { useState, useRef, useEffect } from "react";
import { useGLTF } from '@react-three/drei';
import modelurl from './gltf/Gate model 1.gltf'


const Model = ({ url, scale, position, rotation }) => {
    const { scene } = useGLTF(modelurl);
   
    return (
      <group>
        <primitive
          object={scene}
          scale={scale}
          position={position}
          rotation={rotation}
        />
      </group>
    );
  };


  export default Model;