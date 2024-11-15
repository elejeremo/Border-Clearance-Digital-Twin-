import React, { useState } from "react";
import "./MainDash.css"
import Cards from "../Cards1/Cards1";
import ThreeModel from "../MAINSVG/Mainborder";

    const MainDash = () => {
        return (
            <div className="MainDash">
                <div className="topbar"><Cards/></div>
                <div className="BorderViewbox"><ThreeModel/></div>
            </div>
            
        )

    }

    export default MainDash;