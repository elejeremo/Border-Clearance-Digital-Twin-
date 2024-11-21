import React, { useState, useRef, useEffect } from "react";
import { useGLTF } from '@react-three/drei';
import modelurl from './gltf/gate model 1.3.gltf'


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