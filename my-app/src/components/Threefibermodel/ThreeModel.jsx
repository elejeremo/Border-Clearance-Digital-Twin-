import React, { useState, useRef, useEffect } from "react";
import { Canvas } from '@react-three/fiber';
import Scene from '../Scene/Scene';
import Tooltip from '@mui/material/Tooltip';
import "./ThreeModel.css"
import api from "../../api.js"
import Button from '@mui/material/Button';




const ThreeModel = ({onGateSelect, onAnnotationSelect, annotations, gates, fetchAnnotationPointData}) => {
  const cameraControlRef = useRef();
  const [activePoint, setActivePoint] = useState(null);
  const [activeGatePoint, setActiveGatePoint] = useState(null);


  const handleSecondlevelzoom = (annotation) => {
    const { cameraView } = annotation;
    cameraControlRef.current.moveTo(cameraView.position[0], cameraView.position[1], cameraView.position[2], true);
    cameraControlRef.current.lookInDirectionOf(cameraView.lookAt[0], cameraView.lookAt[1], cameraView.lookAt[2], true);
    cameraControlRef.current.zoomTo(cameraView.zoom, true);
    setActivePoint(annotation.title);
    onAnnotationSelect(annotation)
  };

  const handlefirstlevelzoom = (gate) => {
    const { cameraView } = gate;
    cameraControlRef.current.moveTo(cameraView.position[0], cameraView.position[1], cameraView.position[2], true);
    cameraControlRef.current.lookInDirectionOf(cameraView.lookAt[0], cameraView.lookAt[1], cameraView.lookAt[2], true);
    cameraControlRef.current.zoomTo(cameraView.zoom, true);
    setActiveGatePoint(gate.gateTitle);
    setActivePoint(null);
    onGateSelect(gate)
    onAnnotationSelect(null)
  };

  return (
    <div className="MainBorder">
      <Canvas>
        <Scene 
          annotations={annotations}
          gates={gates}
          onPointClick={handleSecondlevelzoom}
          onFirstClick={handlefirstlevelzoom}
          cameraControlRef={cameraControlRef}
          activePoint={activePoint}
          activeGatePoint={activeGatePoint}
        />
      </Canvas>

      <div className="reset-buttons">
        <Tooltip title="ResetView">
          <Button
            variant="contained"
            type="button"
            onClick={() => {
              cameraControlRef.current?.reset(true);
              setActivePoint(null);
              setActiveGatePoint(null);
              onGateSelect(null)
              onAnnotationSelect(null)
            }}
          >
            Reset View
          </Button>
        </Tooltip>
        <Tooltip title="ResetData">
          <Button
          variant="outlined"
            type="button"
            onClick={() => {
                fetchAnnotationPointData();
            }}
          >
            Refresh Data
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ThreeModel;
