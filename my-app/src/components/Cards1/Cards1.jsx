import React, { useEffect, useState } from "react";
import "./Cards.css"
import Card from "../Card/Card"
import api from "../../api.js"

const Cards = () => {
    const [CountData, setCountData] = useState([]); 
    const [error, setError] = useState(null);

    const debugLog = (message, data) => {
        console.log(`[Debug] ${message}:`, data);
    };

    const fetchCardData = async () => {
        try {
            const cardresponse = await api.get('/api/countdata');
            debugLog('Raw API Response', cardresponse.data);
            if (cardresponse.data.CountData) {
                setCountData(cardresponse.data.CountData);
            } else {
                setError("Invalid data format received from server");
            }
        } catch (error) {
            console.error("Error fetching card data:", error);
            setError("Failed to load card data");
        }
    };

    useEffect(() => {
        fetchCardData();
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="Cards">
            {CountData.length === 0 ? (
                <p>Loading...</p>
            ) : (
                CountData.map((card, index) => (
                    <Card
                        key={index}
                        title={card.title}
                        content={card.content}
                        colour={card.colour}
                    />
                ))
            )}
        </div>
    );
};

export default Cards;