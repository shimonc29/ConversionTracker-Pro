import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const mockChartData = {
  labels: ['2024-06-01', '2024-06-02', '2024-06-03', '2024-06-04', '2024-06-05'],
  datasets: [
    {
      label: 'Conversions',
      data: [10, 20, 15, 30, 25],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      tension: 0.3,
    },
  ],
};

export const ConversionsChart: React.FC = () => {
  return (
    <div className="chart-container">
      <h3>Conversions Over Time</h3>
      <Line data={mockChartData} />
    </div>
  );
}; 