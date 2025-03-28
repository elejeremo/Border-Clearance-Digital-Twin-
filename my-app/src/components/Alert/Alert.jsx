import "../Alert/Alert.css"
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';



const AlertWidget = ({onClick}) => {
    //const {sensorData, connected } = useWebSocket();
 
return(
   
            <div className="alert_warning">
                <h2>Current Exceeded</h2>
                <Button
                variant="contained"
                type="button"
                onClick={onClick}
                >
                X
                </Button>
            </div>

    )};






export default AlertWidget;