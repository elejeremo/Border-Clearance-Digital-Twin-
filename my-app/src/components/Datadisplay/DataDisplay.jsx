import React, { useState, useRef, useEffect} from "react";
import { LineChart } from '@mui/x-charts/LineChart';




const ChartsOverviewDemo = () => {


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
        setSensorData((prevData) => [newData, ...prevData].slice(0, 10)); // Keep latest 10 readings
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocketRef.current.onclose = () => {
      console.log("Disconnected from WebSocket");
      setConnected(false);
    };

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  
  return (
    <div>
      <LineChart
        xAxis={[
          {
            data: sensorData.map((data) => data.timestamp), // Extract timestamps correctly
          },
        ]}
        series={[
          {
            data: sensorData.map((data) => data.sensor1), // Extract the actual sensor values
            color: "#430099",
          },
        ]}
        margin={{ top: 10, right: 10, left: 25, bottom: 25 }}
        height={150}
      />
  
      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1, md: 3 }}>
        <Gauge width={100} height={100} value={60} color="#430099" />
        <Gauge width={100} height={100} value={60} startAngle={-90} endAngle={90} />
      </Stack>
    </div>
  );
  
}

export default ChartsOverviewDemo