import { useSelector } from "react-redux";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ArrowUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const subGenres = [
  "Idle Merge",
  "Casual",
  "RPG",
  "Puzzle",
  "Simulation",
  "FPS",
];

const IdeaPac = () => {
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );
  const confidenceLevel = 8;

  const chartData = {
    labels: ["2022", "", "", "", "", "2023", "", "", "", "", "2024"],
    datasets: [
      {
        label: "Revenue",
        data: [65, 70, 68, 72, 75, 70, 74, 76, 72, 78, 82],
        borderColor: "#FFC90A",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(255, 201, 10, 0.7)");
          gradient.addColorStop(1, "rgba(255, 201, 10, 0.1)");
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: 'origin',
      },
      {
        label: "Downloads",
        data: [75, 82, 78, 85, 88, 84, 90, 87, 92, 89, 95],
        borderColor: "#45E12A",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(69, 225, 42, 0.6)");
          gradient.addColorStop(1, "rgba(69, 225, 42, 0.1)");
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: 'origin',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        display: true,
        border: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 14,
            weight: 'normal',
          },
          padding: 10,
          maxTicksLimit: 3,
        },
        grid: {
          color: "rgba(107, 114, 128, 0.3)",
          drawBorder: false,
          lineWidth: 1,
          display: true,
        },
      },
      x: {
        display: false,
        grid: {
          display: false,
          drawBorder: false,
          lineWidth: 0,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
      },
      point: {
        radius: 0,
        hoverRadius: 0,
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 10,
        bottom: 0,
      },
    },
    datasets: {
      line: {
        pointStyle: false,
      },
    },
  };

  const CircularProgress = ({ score, size = 200 }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#6B7280"
            strokeWidth="16"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ffffff"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-sm text-gray-400">Score</span>
        </div>
      </div>
    );
  };

  const fitScoreMetrics = [
    { name: "MarketFit", score: 85 },
    { name: "TechnicalFit", score: 70 },
    { name: "ArtFit", score: 65 },
    { name: "Confidence adj", score: 80 },
  ];
  return (
    <div className="bg-[#404040] h-[calc(100vh-56px)]">
      <div className="w-[1200px] mx-auto py-4 grid grid-cols-12 gap-4">
        <div className="p-4 col-span-8">
          <div className="bg-[#303030] rounded-[20px] p-4 border border-[0.5px] border-[#636363]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">
                Opportunity - Idle Merge
              </h1>
              <p className="bg-[#323232] text-white text-sm rounded-lg px-4 py-1">
                Genre: Idle
              </p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                {subGenres.map((subGenre) => (
                  <p className="bg-[#323232] text-white text-sm rounded-[12px] px-3 py-1 border border-[0.5px] border-[#fff]">
                    {subGenre}
                  </p>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-white text-sm whitespace-nowrap">
                  Confidence Level:
                </p>
                <div className="w-20 h-[6px] rounded-full w-[140px] bg-[#6b6b6b] flex items-center gap-[2px]">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-[4px] w-[17px] rounded-full ${
                        index < confidenceLevel
                          ? "bg-[#b5b5b5]"
                          : "bg-[#6b6b6b]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7 bg-[#434343] rounded-[20px] p-4 pb-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white text-[24px] font-bold">
                    Market Snapshot
                  </h2>
                  <p className="bg-[#323232] text-white text-sm rounded-lg px-4 py-1">
                    3 year trend
                  </p>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC90A] text-[12px] px-1 rounded-full font-regular flex items-center">
                      <ArrowUp className="text-black" size={14} />12%
                    </span>
                    <span className="text-gray-300 text-sm">Downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#45E12A] text-[12px] px-1 rounded-full font-regular flex items-center">
                      <ArrowUp className="text-black" size={14} />6%
                    </span>
                    <span className="text-gray-300 text-sm">Revenue</span>
                  </div>
                </div>

                 <div className="h-48 mb-4 relative w-full">
                   <Line data={chartData} options={chartOptions} />
                 </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] before:content-['|'] before:mr-1 before:text-[20px]">Growth:</span>
                    <span className="text-white font-regular">High</span>
                  </div>
                  <div className="flex items-center gap-2"> 
                    <span className="text-white text-[16px] before:content-['|'] before:mr-1 before:text-[20px]">Retention:</span>
                    <span className="text-white font-regular">Top 25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] before:content-['|'] before:mr-1 before:text-[20px]">Monetization:</span>
                    <span className="text-white font-regular">Medium</span>
                  </div>
                </div>
              </div>
              <div className="col-span-5 bg-[#434343] rounded-[20px] p-4 pb-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white text-[24px] font-bold">
                    Fit Score
                  </h2>
                  <p className="bg-[#a1a1a1] rounded-full w-[20px] h-[20px] flex items-center justify-center">
                    <span className="w-[12px] h-[12px] rounded-full bg-[#fff] block"></span>
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  <CircularProgress score={75} />
                </div>

                <div className="space-y-3 mb-4">
                  {fitScoreMetrics.map((metric) => (
                    <div
                      key={metric.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-[#fff] min-w-[90px]">
                        {metric.name}
                      </span>
                      <div className="w-full flex-1 mx-4">
                        <div
                          className="bg-white h-1 rounded-full transition-all duration-300"
                          style={{ width: `${metric.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 col-span-4"></div>
      </div>
    </div>
  );
};

export default IdeaPac;
