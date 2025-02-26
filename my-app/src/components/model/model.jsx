import React, { useState, useRef, useEffect } from "react";
import { useGLTF } from '@react-three/drei';
import modelurl from './gltf/gate model 5.2 DRACO.glb'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'


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