import React, { useState } from "react";
import "./Card.css"
import {AnimateSharedLayout, motion} from 'framer-motion'


const Card = (props)=>{

    const [expanded, setExpanded] = useState(false);
    return(
        <div className="Card">
            Card
        </div>
)}


//compactcard

function CompactCard({param}){
    const png = param.png;
    return(

        <div className="CompactCard">
            <div className="radialBlur">
                Chart
            </div>
        </div>
    )
}


 
export default Card;

