import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, ChartOptions } from 'chart.js';
import { ChartDataPoint } from './CustomLineChart';
import Box from '@mui/material/Box';

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface CustomLineChartProps {
  chartData: ChartDataPoint[];
  title?: string;
}

const CustomPieChart: React.FC<CustomLineChartProps> = ({ chartData, title = '' }) => {
  console.log('chartData: ', chartData);
  const data = {
    labels: chartData.map((point) => point.x),
    datasets: [
      {
        label: 'Count',
        data: chartData.map((point) => point.y),
        backgroundColor: [
          'rgba(128, 0, 128, 0.6)',
          'rgba(255, 255, 0, 0.6)',
          'rgba(0, 0, 255, 0.6)',
          'rgba(255, 0, 0, 0.6)',
          'rgba(0, 128, 0, 0.6)',
          'rgba(0, 0, 0, 0.6)',
          'rgba(255, 153, 0, 0.6)',
          'rgba(255, 0, 255, 0.6)',
        ],
        borderColor: [
          'rgba(128, 0, 128, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(0, 128, 0, 1)',
          'rgba(0, 0, 0, 1)',
          'rgba(255, 153, 0, 1)',
          'rgba(255, 0, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: !!title,
        text: title,
        align: 'start' as const,
        font: {
          size: 16,
        },
      },
    },
    animations: {
      y: {
        type: 'number',
        easing: 'easeOutCubic',
        duration: 1000,
        from: (ctx) => ctx.chart.scales.y?.max ?? 0,
      },
      x: {
        type: 'number',
        easing: 'easeOutQuad',
        duration: 500,
      },
    },
  };

  return (
    <Box className="h-full w-full flex items-center justify-center">
      <Pie data={data} options={options} />
    </Box>
  );
};

export default CustomPieChart;
