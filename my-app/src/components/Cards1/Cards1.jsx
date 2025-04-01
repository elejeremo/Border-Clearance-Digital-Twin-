import React, { useEffect, useState } from "react";
import "./Cards.css"
import Card from "../Card/Card"
import api from "../../api.js"
import { useWebSocket } from "../WebSocketContext/Websocket";

const Cards = () => {
    const [CountData, setCountData] = useState([]);
    const [error, setError] = useState(null);
   
    // Import all WebSocket data sources
    const {
        sensorData,
        connected
    } = useWebSocket();

    // Target colors as numbers
    const targetColors = [16711680, 16756258, 10651156];
   
    // Color mapping for display
    const colorMap = {
        16711680: { title: 'Number of Red Gates', colour: '#FF6961' },
        16756258: { title: 'Number of Yellow Gates', colour: '#FFB54C' },
        10651156: { title: 'Number of Green Gates', colour: '#8CD47E' },
    };

    // Function to count gate colors from multiple data sources
    const countGateColors = (dataSources) => {
        // Initialize counts with zero for all target colors
        const counts = targetColors.reduce((acc, color) => {
            acc[color] = 0;
            return acc;
        }, {});

        // Function to safely process each data source
        const processDataSource = (data) => {
            // If data is a single color value, convert to array
            const processData = Array.isArray(data) ? data : [data];
            
            processData.forEach(gate => {
                // Handle different data structures
                const gateColor = gate?.updated_gate_colour ?? gate;
                
                console.log("Gate color processing:", gateColor);
                
                if (targetColors.includes(gateColor)) {
                    counts[gateColor]++;
                }
            });
        };

        // Process all provided data sources
        dataSources.forEach(processDataSource);

        // Construct result array including colors with zero count
        const result = targetColors.map(color => ({
            title: colorMap[color].title,
            content: counts[color],
            colour: colorMap[color].colour,
        }));

        return result;
    };

    // Effect to update card data when WebSocket data changes
    // useEffect(() => {
    //     if (sensorData && sensorData.length > 0) {
    //         const processedColors = sensorData.map(item => 
    //             item.updated_gate_colour
    //         ).filter(color => color !== undefined);

    //         const CountData = countGateColors(processedColors);
    //         setCountData(CountData);
    //     }
    // }, [sensorData]);

    // Initial data fetch
    const fetchInitialCardData = async () => {
        try {
            const gateresponse = await api.get('/api/gatedata')
            const transformedGateData = gateresponse.data.gate_points.map(item => ({
                updated_gate_colour: item.color2,
            }));
           
            const CountData = countGateColors(transformedGateData);
           
            if (CountData) {
                setCountData(CountData);
            } else {
                setError("Invalid data format received from server");
            }
        } catch (error) {
            console.error("Error fetching initial card data:", error);
            setError("Failed to load initial card data");
        }
    };

    // Fetch initial data when component mounts
    useEffect(() => {
        fetchInitialCardData();
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