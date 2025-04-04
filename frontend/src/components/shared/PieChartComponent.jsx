import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin

// Register ChartJS components and DataLabels plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChartComponent = ({ data }) => {
  console.log(data);

  const customColors = {
    Approved: "#6225C5",  // Green
    Reverted: "#A684FF",  // Amber
    Rejected: "#2F0D68",  // Red
    Pending: "#C4B4FF",   // Yellow
  };

  const chartData = {
    labels: ["Approved", "Reverted", "Rejected", "Pending"],
    datasets: [
      {
        data: data || [60, 25, 15, 10], // Default values if no data is passed
        backgroundColor: [
          customColors.Approved,
          customColors.Reverted,
          customColors.Rejected,
          customColors.Pending,
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff", // Set label text color
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${percentage}%`; // Show count and percentage
        },
        anchor: "end", // Position labels properly
        align: "start",
        offset: 30,
      },
    },
  };

  return(
<>
<div className="text-2xl font-bold my-4">Status Chart</div>
<Pie data={chartData} options={options} />
<p>Total Request : {data.reduce((a, b) => a + b, 0)}</p>
</>
  )
  
};

export default PieChartComponent;
