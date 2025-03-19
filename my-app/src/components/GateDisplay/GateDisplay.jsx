import React, { useState, useRef, useEffect, Suspense} from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from "@mui/x-charts/Gauge";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import { CardContent } from "@mui/material";
import Typography from '@mui/material/Typography';
import "./GateDisplay.css"


const ChartsOverviewDemo = () => {
  const [sensorData, setSensorData] = useState([]);
  const [connected, setConnected] = useState(false);
  const websocketRef = useRef(null);

  useEffect(() => { //websocket upon mount
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

    <div className="card_formatting">
      <Card style= {{borderRadius:'10px',backgroundColor:"#fdf9f9"}}>
        <CardContent>
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Current Sensors
            </Typography>
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
        </CardContent>
      </Card>
     
      <Card style= {{borderRadius:'10px',backgroundColor:"#fdf9f9"}} >
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
              Current Average Value
          </Typography>
          <Typography variant="h5" component="div">
            {sensorData.average_value}
          </Typography>
        </CardContent>
      </Card>

      <Card style= {{borderRadius:'10px',backgroundColor:"#fdf9f9"}}>
          <CardContent>
              <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Alert Status
              </Typography>
              <Typography variant="h5" component="div">
                  {sensorData.alert_status}
              </Typography>
          </CardContent>
      </Card>
        


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
                <th>Force accelerotmeter</th>
                <th>average value</th>
                <th>Health</th>
                <th>average_value</th>
                <th>alert_count</th>
                <th>alert_status</th>
                <th>health_status_value</th>
                <th>health_status</th>
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
              <td>{data.Force}</td>
              <td>{data.average_value}</td>
              <td>{data.alert_count}</td>
              <td>{data.alert_status}</td>
              <td>{data.force_alert_value}</td>
              <td>{data.force_alert_count}</td>
              <td>{data.force_alert_status}</td>
              <td>{data.health_status_value}</td>
              <td>{data.health_status}</td>
         
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