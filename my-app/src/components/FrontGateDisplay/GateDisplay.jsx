import React, { useState, useRef, useEffect, Suspense} from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from "@mui/x-charts/Gauge";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import { CardContent } from "@mui/material";
import Typography from '@mui/material/Typography';
import { useWebSocket } from "../WebSocketContext/Websocket";
import "./GateDisplay.css"

const GateOverview = () => {
   //const [sensorData, setSensorData] = useWebSocket();
    const { sensorData, connected } = useWebSocket();
    const websocketRef = useRef(null);
    const [tableopen, settableopen] = useState(false)

  
  return (

    <div className="card_formatting">
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

        {/* <Button
                  variant="outlined"
                    type="button"
                    onClick={() => {
                        settableopen(!tableopen)
                    }}
                  >
                    DataTable
          </Button> */}
   
        
{/* 
      {tableopen && 
      
      ( */}
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
      {/* )} */}
      
      
    </div>
  );
  
}

export default GateOverview