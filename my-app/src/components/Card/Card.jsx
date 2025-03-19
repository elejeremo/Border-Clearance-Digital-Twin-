import React, { useState } from "react";
import "./Card.css"


const Card = ({title, content,colour})=>{ //props
    return(
        <div className="Card" style={{ backgroundColor: colour }}>
            <h5>{title}</h5>
            <p>{content}</p>
        </div>
)}


 
export default Card;

