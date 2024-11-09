import React, { useState} from "react";
import "./Cards.css"
import{CardsData} from "../../data/data"
import Card from "../Card/Card"

const Cards= (props) => {
    console.log("CardsData:", CardsData);
    return (
        <div className="Cards">
                {CardsData.map((card, index) => {
                    return(
                        <Card 
                        key={index} 
                        title={card.title} 
                        content={card.content} 
                        
                    />

                    )
                })}
            </div>

        
    )

}

export default Cards;