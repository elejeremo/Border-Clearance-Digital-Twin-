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
    const targetColors = [16711680, 16756258, 10651156];
    
    const colorMap = {
        
        16711680: { title: 'Number of Red/month', colour: '#FF6961' },
        16756258: { title: 'Number of Yellow/month', colour: '#FFB54C' },
        10651156: { title: 'Number of Green/month', colour: '#8CD47E' },
      };
    const colorCounts = (data) => {
        const counts = data.reduce((acc, item) => {
          [ item.color2].forEach(color => {
            if (targetColors.includes(color)) {
              acc[color] = (acc[color] || 0) + 1;
            }
          });
          return acc;
        }, {});
      
        // Construct result array without mapping to RGB
        const result = [];
        for (const color of targetColors) {
          if (counts[color]) {
            result.push({
              title: colorMap[color].title, // Keeping numerical color in title
              content: counts[color],
              colour: colorMap[color].colour, // Keeping color as its original number
            });
          }
        }
      
        return result;
      };

    const fetchCardData = async () => {
        try {
            //const cardresponse = await api.get('/api/countdata');
            const gateresponse = await api.get('/api/gatedata')
            const transformedGateData = gateresponse.data.gate_points.map(item => ({
                color1: item.color1,
                color2: item.color2,
              }));
            const CountData =  colorCounts(transformedGateData);
            //debugLog('Raw API Response', cardresponse.data);
            if (CountData) {
                setCountData(CountData);
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