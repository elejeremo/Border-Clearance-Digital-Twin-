import React, { useState } from "react";
import "./MainDash.css"
import Cards from "../Cards1/Cards1";
import ThreeModel from "../Threefibermodel/ThreeModel";

    const MainDash = () => {
        const [activeGate, setActiveGate] = useState(null);
        const handleGateSelect = (gateData) => {
            setActiveGate(gateData);
        };
        return (
            <div className="MainDash">
                <div className="topbar"><Cards/></div>
                <div className="BorderViewbox"><ThreeModel onGateSelect = {handleGateSelect}/></div>
                {activeGate && (
                    <div className="fixed-info-widget">
                        <div className="info-widget">
                            <h2>{activeGate.gateTitle}</h2>
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