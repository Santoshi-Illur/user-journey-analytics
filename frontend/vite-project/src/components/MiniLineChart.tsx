// src/components/common/MiniLineChart.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type Props = {
  labels?: string[];
  data?: number[];
  color?: string;
  height?: number;
  width?: number;
};

const MiniLineChart: React.FC<Props> = ({ labels = [], data = [], color = "#1976d2", height = 70, width = 220 }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "",
        data,
        borderColor: color,
        backgroundColor: (ctx: any) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, height);
          g.addColorStop(0, `${color}33`);
          g.addColorStop(1, `${color}05`);
          return g;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div style={{ height, width }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MiniLineChart;
