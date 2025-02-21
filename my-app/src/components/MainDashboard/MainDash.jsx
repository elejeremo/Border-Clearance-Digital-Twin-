import React, { useState } from "react";
import "./MainDash.css"
import Cards from "../Cards1/Cards1";
import ThreeModel from "../Threefibermodel/ThreeModel";
import ChartsOverviewDemo from "../Datadisplay/DataDisplay";

    const MainDash = () => {
        const [activeGate, setActiveGate] = useState(null);
        const [activeAnnotation, setActiveAnnotation] = useState(null)
        const handleGateSelect = (gateData) => {
            setActiveGate(gateData);
        };
        const handleAnnotationSelect = (annotationData) => {
            setActiveAnnotation(annotationData);
        };
        return (
            <div className="MainDash">
                <div className="topbar"><Cards/></div>
                <div className="BorderViewbox">
                    <ThreeModel 
                    onGateSelect = {handleGateSelect} 
                    onAnnotationSelect = {handleAnnotationSelect}
                    />
                </div>
                
                {activeGate && !activeAnnotation && (
                    <div className="fixed-info-widget">
                        <div className="info-widget">
                            <h2>{activeGate.gateTitle}</h2>
                            
                                <ChartsOverviewDemo/>
                                    <h3>
                                    "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes
                                    </h3>
                        </div>
                    </div>
                )}

{activeAnnotation && (
                    <div className="fixed-info-widget">
                        <div className="info-widget">
                            <h2>{activeAnnotation.title}</h2>
                            
                                
                                    <h3>
                                    "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes
                                    </h3>
                        </div>
                    </div>
                )}


            </div>
            
        )

    }

    export default MainDash;