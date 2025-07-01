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
import dayjs from "dayjs";
import { OrderTimeline } from "../pages/private/Dashboard";

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

interface CustomOrderTimeLineProps {
  orders: OrderTimeline[];
  title?: string;
}

const CustomOrderTimeLine: React.FC<CustomOrderTimeLineProps> = ({
  orders,
  title = "",
}) => {
  const dateCounts: Record<string, number> = {};

  orders.forEach((order) => {
    const dateKey = dayjs(order.date).format("YYYY-MM-DD");
    dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
  });

  const sortedDates = Object.keys(dateCounts).sort();
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Orders",
        data: sortedDates.map((date) => dateCounts[date]),
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
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          padding: 10,
        },
      },
      title: {
        display: !!title,
        text: title,
        align: "start",
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
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: { display: false },
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
      data={chartData}
      options={options}
      className="max-w-full max-h-[24rem] rounded-sm"
    />
  );
};

export default CustomOrderTimeLine;
