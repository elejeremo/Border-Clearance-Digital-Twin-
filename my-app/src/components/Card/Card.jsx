import React, { useState } from "react";
import "./Card.css"
import {AnimateSharedLayout, motion} from 'framer-motion'


const Card = ({title, content,colour})=>{ //props
    const [expanded, setExpanded] = useState(false);
    return(
        <div className="Card" style={{ backgroundColor: colour }}>
            <h5>{title}</h5>
            <p>{content}</p>
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

