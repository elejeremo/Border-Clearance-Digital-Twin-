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

  // const debugLog = (message, data) => {
  //   console.log(`[Debug] ${message}:`, data);
  // };
  
  // const fetchAnnotationPointData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const annotationresponse = await api.get('/api/annotationdata');
  //     const gateresponse = await api.get('/api/gatedata');
  //     debugLog('Raw API Response', gateresponse.data);
  //     const transformedGateData = gateresponse.data.gate_points.map(item => ({
  //       gatePosition: item.gatePosition,
  //       gateTitle: item.gateTitle,
  //       gateId: item.gateId,
  //       color1: item.color1,
  //       color2: item.color2,
  //       cameraView: item.cameraView,
  //     }));
      
  //     // Transform backend data to match frontend structure
  //     const transformedAnnotationData = annotationresponse.data.annotation_points.map(item => ({
  //       position: item.Rendering.position,
  //       widgetposition: item.Rendering.widgetposition,
  //       title: item.title,
  //       gateId: item.gateId,
  //       description: item.Rendering.description,
  //       color1: item.Rendering.color1,
  //       color2: item.Rendering.color2,
  //       cameraView: item.Rendering.cameraView,
  //       contentTitle: item.title,
  //       content: item.content
  //     }));
  //     debugLog('data', transformedAnnotationData)
  //     setAnnotations(transformedAnnotationData);
  //     setGates(transformedGateData);
  //     setError(null);
  //   } catch (error) {
  //     console.error("Error fetching annotation points:", error);
  //     setError("Failed to load annotation data");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Fetch data when component mounts

  // useEffect(() => {
  //   fetchAnnotationPointData();
  // }, []);


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
