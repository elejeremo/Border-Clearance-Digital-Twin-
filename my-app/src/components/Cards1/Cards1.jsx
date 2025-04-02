import React, { useEffect, useState } from "react";
import "./Cards.css"
import Card from "../Card/Card"
import api from "../../api.js"
import { useWebSocket } from "../WebSocketContext/Websocket";

const Cards = () => {
    const [countData, setCountData] = useState([]);
    const [error, setError] = useState(null);
   
    // Import all WebSocket data sources
    const {
        sensorData,
        connected
    } = useWebSocket();

    // Target colors as numbers
    const targetColors = [16711680, 16759586, 10661140];
   
    // Color mapping for display
    const colorMap = {
        16711680: { title: 'Number of Red Gates', colour: '#FF6961' },
        16759586: { title: 'Number of Yellow Gates', colour: '#FFB54C' },
        10661140: { title: 'Number of Green Gates', colour: '#8CD47E' },
    }
    
    // Function to count gate colors from a single data source
    const countGateColors = (dataSource) => {
        // Initialize counts with zero for all target colors
        const counts = targetColors.reduce((acc, color) => {
            acc[color] = 0;
            return acc;
        }, {});

        // Skip if data is undefined or null
        if (!dataSource) return targetColors.map(color => ({
            title: colorMap[color].title,
            content: 0,
            colour: colorMap[color].colour,
        }));
        
        // Check if gate object exists and has updated_gate_colour property
        if (dataSource && dataSource.updated_gate_colour) {
            // For tuple colors (color1, color2), use the second value
            const gateColor = Array.isArray(dataSource.updated_gate_colour) 
                ? dataSource.updated_gate_colour[1] 
                : dataSource.updated_gate_colour;
            
            console.log("Processing gate color:", gateColor);
            
            if (targetColors.includes(gateColor)) {
                counts[gateColor]++;
            }
        }

        // Construct result array including colors with zero count
        const result = targetColors.map(color => ({
            title: colorMap[color].title,
            content: counts[color],
            colour: colorMap[color].colour,
        }));

        return result;
    };

    // Effect to update card data when WebSocket data changes
    useEffect(() => {
        if (sensorData && Array.isArray(sensorData) && sensorData.length > 0) {
            console.log("WebSocket data received (first item):", sensorData[0]);
            const newCountData = countGateColors(sensorData[0]);
            setCountData(newCountData);
        } else if (sensorData && !Array.isArray(sensorData)) {
            // Handle case where sensorData is a single object
            console.log("WebSocket data received (single object):", sensorData);
            const newCountData = countGateColors(sensorData);
            setCountData(newCountData);
        }
    }, [sensorData]);

    // Initial data fetch
    const fetchInitialCardData = async () => {
        try {
            const gateResponse = await api.get('/api/gatedata');
            console.log("Initial gate data:", gateResponse.data);
            
            if (gateResponse.data && gateResponse.data.gate_points && gateResponse.data.gate_points.length > 0) {
                // Just take the first item from gate_points
                const firstGatePoint = gateResponse.data.gate_points[0];
                
                // Transform data to match expected format for counting
                const transformedGateData = {
                    updated_gate_colour: firstGatePoint.color2,
                };
               
                const newCountData = countGateColors(transformedGateData);
               
                if (newCountData) {
                    setCountData(newCountData);
                } else {
                    setError("Invalid data format received from server");
                }
            } else {
                setError("No gate data received from server");
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
            {countData.length === 0 ? (
                <p>Loading...</p>
            ) : (
                countData.map((card, index) => (
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