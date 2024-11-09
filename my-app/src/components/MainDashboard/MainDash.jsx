import React, { useState } from "react";
import "./MainDash.css"
import Cards from "../Cards1/Cards1";
import Mainborder from '../MAINSVG/Mainborder'

    const MainDash = () => {
        return (
            <div className="MainDash">
                <Cards/>
                    <div className="BorderViewbox">
                    <Mainborder/>
                    </div>
            </div>
            
        )

    }

    export default MainDash;