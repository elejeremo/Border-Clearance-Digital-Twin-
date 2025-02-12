import React, { useState, useRef, useEffect } from "react";
import { Canvas } from '@react-three/fiber';
import Scene from '../Scene/Scene';
import Tooltip from '@mui/material/Tooltip';
import "./ThreeModel.css"
import api from "../../api.js"




const ThreeModel = ({onGateSelect}) => {
  const cameraControlRef = useRef();
  const [activePoint, setActivePoint] = useState(null);
  const [activeGatePoint, setActiveGatePoint] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const[gates,setGates] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const debugLog = (message, data) => {
    console.log(`[Debug] ${message}:`, data);
  };
  
  const fetchAnnotationPointData = async () => {
    try {
      setIsLoading(true);
      const annotationresponse = await api.get('/api/annotationdata');
      const gateresponse = await api.get('/api/gatedata');
      debugLog('Raw API Response', gateresponse.data);
      const transformedGateData = gateresponse.data.gate_points.map(item => ({
        gatePosition: item.gatePosition,
        gateTitle: item.gateTitle,
        gateId: item.gateId,
        color1: item.color1,
        color2: item.color2,
        cameraView: item.cameraView,
      }));
      
      // Transform backend data to match frontend structure
      const transformedAnnotationData = annotationresponse.data.annotation_points.map(item => ({
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
      }));
      debugLog('data', transformedAnnotationData)
      setAnnotations(transformedAnnotationData);
      setGates(transformedGateData);
      setError(null);
    } catch (error) {
      console.error("Error fetching annotation points:", error);
      setError("Failed to load annotation data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts

  useEffect(() => {
    fetchAnnotationPointData();
  }, []);


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
    onGateSelect(gate)
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
              onGateSelect(null)
            }}
          >
            Reset View
          </button>
        </Tooltip>
        <Tooltip title="Reset">
          <button
            type="button"
            onClick={() => {
                fetchAnnotationPointData();
            }}
          >
            Refresh Data
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ThreeModel;
