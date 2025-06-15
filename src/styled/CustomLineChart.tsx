import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataPoint {
  date: string;
  price: number;
}

interface CustomLineChartProps {
  chartData: ChartDataPoint[];
  title?: string;
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({
  chartData,
  title = "",
}) => {
  const data = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: "Price",
        data: chartData.map((point) => point.price),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 12,
          padding: 10,
        },
      },
      title: {
        display: !!title,
        text: title,
        align: "start" as const,
        font: {
          size: 16,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: { display: false },
        title: {
          display: false,
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
    animations: {
      y: {
        type: "number",
        easing: "easeOutCubic",
        duration: 1000,
        from: (ctx) => ctx.chart.scales.y?.max ?? 0,
      },
      x: {
        type: "number",
        easing: "easeOutQuad",
        duration: 500,
      },
    },
  };

  return (
    <Line
      data={data}
      options={options}
      className="max-w-full max-h-[28rem] rounded-sm"
    />
  );
};

export default CustomLineChart;
