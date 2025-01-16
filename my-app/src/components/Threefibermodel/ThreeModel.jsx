import React, { useState, useRef } from "react";
import { Canvas } from '@react-three/fiber';
import Scene from '../Scene/Scene';
import Tooltip from '@mui/material/Tooltip';
import { AnnotationPointData } from "../../data/data";
import { GatePointData } from "../../data/data";
import "./ThreeModel.css"
import Model from "../model/model";

const ThreeModel = () => {
  const cameraControlRef = useRef();
  const [activePoint, setActivePoint] = useState(null);
  const [activeGatePoint, setActiveGatePoint] = useState(null);

  const [annotations] = useState(
    AnnotationPointData.map(item => ({
      position: item.Rendering.position,
      widgetposition: item.Rendering.widgetposition,
      title: item.title,
      gateId: item.gateId,
      description: item.Rendering.description,
      color1: item.Rendering.color1,
      color2: item.Rendering.color2,
      cameraView: item.Rendering.cameraView,
      contentTitle: item.title,
      content: item.content
    }))
  );

  const [gates] = useState(
    GatePointData.map(item => ({
      gatePosition: item.gatePosition,
      gateTitle: item.gateTitle,
      cameraView: item.cameraView,
      color1:item.color1,
      color2:item.color2
    }))
  );

  const handlePointClick = (annotation) => {
    const { cameraView } = annotation;
    cameraControlRef.current.moveTo(cameraView.position[0], cameraView.position[1], cameraView.position[2], true);
    cameraControlRef.current.lookInDirectionOf(cameraView.lookAt[0], cameraView.lookAt[1], cameraView.lookAt[2], true);
    cameraControlRef.current.zoomTo(cameraView.zoom, true);
    setActivePoint(annotation.title);
  };

  const handlefirstlevelzoom = (gate) => {
    const { cameraView } = gate;
    cameraControlRef.current.moveTo(cameraView.position[0], cameraView.position[1], cameraView.position[2], true);
    cameraControlRef.current.lookInDirectionOf(cameraView.lookAt[0], cameraView.lookAt[1], cameraView.lookAt[2], true);
    cameraControlRef.current.zoomTo(cameraView.zoom, true);
    setActiveGatePoint(gate.gateTitle);
    setActivePoint(null);
  };

  return (
    <div className="MainBorder">
      <Canvas>
        <Scene 
          annotations={annotations}
          gates={gates}
          onPointClick={handlePointClick}
          onFirstClick={handlefirstlevelzoom}
          cameraControlRef={cameraControlRef}
          activePoint={activePoint}
          activeGatePoint={activeGatePoint}
        />
      </Canvas>

      <div style={{ position: 'absolute', top: '0' }}>
        <Tooltip title="Reset">
          <button
            type="button"
            onClick={() => {
              cameraControlRef.current?.reset(true);
              setActivePoint(null);
              setActiveGatePoint(null);
            }}
          >
            Reset View
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ThreeModel;
