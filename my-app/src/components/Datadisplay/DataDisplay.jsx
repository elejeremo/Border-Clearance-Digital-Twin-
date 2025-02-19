import React, { useState, useRef} from "react";
import { LineChart } from '@mui/x-charts/LineChart';

const ChartsOverviewDemo = () => {

    return (
        <LineChart
          xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
          series={[
            {
              data: [2, 5.5, 2, 8.5, 1.5, 5],
            },
          ]}
          margin={{ top: 10, right: 10, left: 25, bottom: 25 }}
            height={150}
        />
      );
}

export default ChartsOverviewDemo