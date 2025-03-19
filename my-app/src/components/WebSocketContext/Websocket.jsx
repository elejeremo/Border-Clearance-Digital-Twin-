// WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [sensorData, setSensorData] = useState([]);
  const [connected, setConnected] = useState(false);
  const websocketRef = useRef(null);

  useEffect(() => {
    websocketRef.current = new WebSocket("ws://localhost:8000/ws");
    
    websocketRef.current.onopen = () => {
      console.log("Connected to WebSocket");
      setConnected(true);
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setSensorData((prevData) => [newData, ...prevData].slice(0, 10));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ sensorData, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}