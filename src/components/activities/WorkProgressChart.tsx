"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  // If you need more features (like axes), import them here
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WorkProgressChart = () => {
  // Chart data
  const data = {
    labels: ["Completed", "Not Started", "Blocked", "In Progress"],
    datasets: [
      {
        label: "Work Progress",
        // Provide the values for each label
        data: [9, 0, 2, 10], 
        backgroundColor: [
          "#71dd37", // Completed (Green)
          "#ffab00", // Not Started (Yellow/Orange)
          "#ff3e1d", // Blocked (Orange/Red)
          "#696cff", // In Progress (Purple/Blue)
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Work Progress Graph",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        // You can customize step size or other scale options here
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* The canvas is rendered by the Bar component from react-chartjs-2 */}
      <Bar data={data} options={options} />
    </div>
  );
};

export default WorkProgressChart;
