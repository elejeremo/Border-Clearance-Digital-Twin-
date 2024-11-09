import React, { useState, useRef} from "react";
import "./Mainborder.css"
import {ReactComponent as MySvg} from "../../svgs/BORDER-03.svg"
import { ReactSVGPanZoom } from 'react-svg-pan-zoom'; 
import{motion} from 'framer-motion'

const MainBorder = () => {
  const initialViewBox = "0 0 3000 2000";
  const [viewBox, setViewBox] = useState(initialViewBox);
  const [selectedRegion, setSelectedRegion] = useState(null); // Track clicked region
  const [showCard, setShowCard] = useState(false); // Track card visibility
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleSvgClick = (event) => {
    const svg = svgRef.current;
    const boundingRect = svg.getBoundingClientRect();
    const xClick = event.clientX - boundingRect.left;
    const yClick = event.clientY - boundingRect.top;

    // Set zoom logic
    const zoomScale = 8;
    const newWidth = 2000 + (zoomScale / 10) * xClick;
    const newHeight = 1500 + (zoomScale / 10) * yClick;
    const newX = xClick - (zoomScale / 10) * xClick;
    const newY = yClick;

    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);

    // Track selected region and set card visibility/position
    setSelectedRegion("Region Name"); // Customize based on actual regions
    //setCardPosition({ x: xClick+200, y: yClick+200 });
    setShowCard(true);
  };    

  const resetViewBox = () => {
    setViewBox(initialViewBox);
    setShowCard(false); // Hide card on reset
  };

  

  return (
    <motion.div className="MainBorder">
      <button onClick={resetViewBox} style={{ marginBottom: "10px" }}>
        Reset View
      </button>
      <motion.svg
          ref={svgRef}
          width="800"
          height="400"
          viewBox={viewBox}
          onClick={handleSvgClick}
          style={{ cursor: "pointer" }}
          animate={{ viewBox }}
          transition={{ duration: 1 }}
        >
          <MySvg />
      </motion.svg>

        <div className="info-card" >
          <h3>{selectedRegion}</h3>
          <p>Details about the selected region.</p>
        </div>
  
    </motion.div>
  );
};

export default MainBorder;