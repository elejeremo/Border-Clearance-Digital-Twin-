import React from 'react';
import "../Alert/Alert.css";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const AlertWidget = ({onClick}) => {
    return (
        <div className="alert_format">
            <Card className="alert_warning">
                <CardContent sx={{backgroundColor:"#FF5349"}}>
                    <Button
                        onClick={onClick}
                        variant="contained"
                        color="error"
                        sx={{ 
                            alignSelf: 'flex-end', 
                            minWidth: 'auto', 
                            padding: '4px 8px' 
                        }}
                    >
                        X
                    </Button>
                    <h2>
                        Current Exceeded
                    </h2>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertWidget;