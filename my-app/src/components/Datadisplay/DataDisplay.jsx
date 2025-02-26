import React, { useState, useRef, useEffect} from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from "@mui/x-charts/Gauge";
import Stack from "@mui/material/Stack";




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

  
  }, []);

  
  return (
    <div>
     <LineChart
  xAxis={[
    {
      data: Array.from({ length: sensorData.length }, (_, index) => index + 1), // Create an array of numbers from 1 to N
    },
  ]}
  yAxis={[
    {
      min: 0,
      max: 2,
    },
  ]}
  series={[
    {
      data: sensorData.map((data) => data.sensor1),
      color: "rgb(255, 0, 0)",  // Red
    },
    {
      data: sensorData.map((data) => data.sensor2),
      color: "rgb(255, 255, 0)",  // Yellow
    },
    {
      data: sensorData.map((data) => data.sensor3),
      color: "rgb(173, 53, 53)",  // Green
    },
    {
      data: sensorData.map((data) => data.sensor4),
      color: "rgb(35, 137, 35)",  // Green
    }
    
  ]}
  margin={{ top: 10, right: 10, left: 25, bottom: 25 }}
  height={150}
/>


  
      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1, md: 3 }}>
        <Gauge width={100} height={100} value={60} color="#430099" />
        <Gauge width={100} height={100} value={60} startAngle={-90} endAngle={90} />
        <div className="sensor-container">
      <h1>Live Sensor Data</h1>
      <div className="connection-status">
        <span className={`status-indicator ${connected ? "connected" : "disconnected"}`}></span>
        <span>{connected ? "Connected" : "Disconnected"}</span>
      </div>
      <table className="sensor-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Sensor 1</th>
            <th>Sensor 2</th>
            <th>Sensor 3</th>
            <th>Sensor 4</th>
            <th>Sensor X1</th>
            <th>Sensor X2</th>
            <th>Sensor X3</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((data, index) => (
            <tr key={index}>
              <td>{data.timestamp}</td>
              <td>{data.sensor1}</td>
              <td>{data.sensor2}</td>
              <td>{data.sensor3}</td>
              <td>{data.sensor4}</td>
              <td>{data.sensorX1}</td>
              <td>{data.sensorX2}</td>
              <td>{data.sensorX3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </Stack>
    </div>
  );
  
}

export default ChartsOverviewDemo