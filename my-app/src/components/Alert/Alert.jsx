import { useState } from "react";
import "../Alert/Alert.css"
import { useWebSocket } from "../WebSocketContext/Websocket";
import Button from '@mui/material/Button';



const AlertWidget = ({onClick}) => {
    //const {sensorData, connected } = useWebSocket();
 
return(
   
            <div className="alert_warning">
                <h2>Hello World</h2>
                <Button
                
                variant="contained"
                type="button"
                onClick={onClick}
          >
                    
                </Button>
            </div>

    )};






export default AlertWidget;