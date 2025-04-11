import React, { useState, useRef, useEffect, Suspense} from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from "@mui/x-charts/Gauge";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import { CardContent } from "@mui/material";
import Typography from '@mui/material/Typography';
import "./AnnotationDisplay.css"
import { useWebSocket } from "../WebSocketContext/Websocket";


const ChartsOverviewDemo = () => {
  //const [sensorData, setSensorData] = useWebSocket();
  const { sensorData, connected } = useWebSocket();
  const [open, setOpen] = useState(false);
 //const [connected, setConnected] = useState(false);


  // useEffect(() => { //websocket upon mount
  //   // websocketRef.current = new WebSocket("ws://localhost:8000/ws");
  //   // websocketRef.current.onopen = () => {
  //   //   console.log("Connected to WebSocket");
  //   //   setConnected(true);
  //   // };


  //   websocketRef.current.onmessage = (event) => {
  //     try {
  //       const newData = JSON.parse(event.data);
  //       setSensorData((prevData) => [newData, ...prevData].slice(0, 10)); // Keep latest 10 readings
  //     } catch (error) {
  //       console.error("Error parsing WebSocket message:", error);
  //     }
  //   };

  
  // }, []);

  
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
          <Typography variant="h5" component="div" style = {{fontSize:"14px"}}>
              {sensorData && sensorData.length > 0 && sensorData[0] ? 
                  sensorData[0].average_value: 
                    "No data to display"}
          </Typography>
        </CardContent>
      </Card>

      <Card style= {{borderRadius:'10px',backgroundColor:"#fdf9f9"}}>
          <CardContent>
              <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Alert Status
              </Typography>
              <Typography variant="h5" component="div" style = {{fontSize:"14px"}}>
                  {sensorData && sensorData.length > 0 && sensorData[0] ? 
                  sensorData[0].alert_status : 
                    "No data to display"}
              </Typography>
          </CardContent>
      </Card>
        
      
    </div>
  );
  
}

export default ChartsOverviewDemo