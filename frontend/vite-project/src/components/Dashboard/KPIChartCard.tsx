import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface KPIChartCardProps {
  title: string;
  value: number;
  data: number[];
}

const KPIChartCard: React.FC<KPIChartCardProps> = ({ title, value, data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: data.map((_, i) => i + 1),
        datasets: [
          {
            data,
            borderWidth: 1,
            tension: 0.3,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div style={{
      width: "260px",
      padding: "15px",
      borderRadius: "10px",
      background: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <canvas ref={canvasRef} height={60}></canvas>
    </div>
  );
};

export default KPIChartCard;
