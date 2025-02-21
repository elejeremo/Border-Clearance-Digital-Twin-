import React, { useState, useRef} from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from '@mui/x-charts/Gauge';
import Stack from '@mui/material/Stack';


const ChartsOverviewDemo = () => {
    return (
      <div>
        <LineChart
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
          data: [2, 5.5, 2, 8.5, 1.5, 5],
          color: '#430099'
        },
    
      ]}
      margin={{ top: 10, right: 10, left: 25, bottom: 25 }}
        height={150}
    />
    
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
      <Gauge width={100} height={100} value={60} color='#430099' />
      <Gauge width={100} height={100} value={60} startAngle={-90} endAngle={90} />
    </Stack></div>
       
      );
}

export default ChartsOverviewDemo