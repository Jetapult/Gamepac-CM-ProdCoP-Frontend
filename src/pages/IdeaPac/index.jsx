import { useSelector } from "react-redux";
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
import { ArrowUp, ArrowDown, File, Mic, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

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

const IdeaPac = () => {
  // Using Redux state if needed for future functionality
  useSelector((state) => state.admin.ContextStudioData);

  const chartData = {
    labels: ["2022", "", "", "", "", "2023", "", "", "", "", "2024"],
    datasets: [
      {
        label: "Downloads",
        data: [75, 82, 78, 85, 88, 84, 90, 87, 92, 89, 95],
        borderColor: "#FFC90A",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(255, 201, 10, 0.7)");
          gradient.addColorStop(1, "rgba(255, 201, 10, 0.1)");
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: "origin",
      },
      {
        label: "Revenue",
        data: [65, 70, 68, 72, 75, 70, 74, 76, 72, 78, 82],
        borderColor: "#45E12A",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(69, 225, 42, 0.6)");
          gradient.addColorStop(1, "rgba(69, 225, 42, 0.1)");
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: "origin",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
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
        display: false,
        border: {
          display: false,
        },
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      x: {
        display: true,
        grid: {
          display: false,
          drawBorder: false,
          lineWidth: 0,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 12,
          },
          padding: 5,
          maxTicksLimit: 3,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderJoinStyle: "round",
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

  const CircularProgress = ({ score, size = 170 }) => {
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
          <span className="text-5xl font-bold text-white">{score}</span>
          <span className="text-sm text-gray-400">Score</span>
        </div>
      </div>
    );
  };

  CircularProgress.propTypes = {
    score: PropTypes.number.isRequired,
    size: PropTypes.number,
  };

  const fitScoreMetrics = [
    { name: "MarketFit", score: 100 },
    { name: "TechnicalFit", score: 70 },
    { name: "ArtFit", score: 65 },
    { name: "Confid. adj", score: 80 },
  ];
  return (
    <div className="bg-[#404040] h-[100vh]">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 p-4">
          <div className="bg-[#303030] rounded-[20px] p-6 border-[0.5px] border-[#636363]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-white">
                Opportunity - Idle Merge
              </h1>
              <div className="flex items-center gap-2">
                <p className="bg-[#323232] text-white text-sm rounded-2xl px-4 py-2 border border-[#636363]">
                  Genre: IDLE
                </p>
                <button className="bg-white text-[#303030] rounded-2xl px-4 py-2 flex items-center gap-1 text-sm font-medium">
                  Export PDF{" "}
                  <span className=" ml-1">
                    {" "}
                    <ChevronRight size={16} />
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button className="bg-transparent text-white text-sm rounded-2xl px-3 py-1 border border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white"></span> Casual
                </button>
                <button className="bg-transparent text-white text-sm rounded-2xl px-3 py-1 border border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white"></span> RPG
                </button>
                <button className="bg-transparent text-white text-sm rounded-2xl px-3 py-1 border border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white"></span> Puzzle
                </button>
                <button className="bg-transparent text-white text-sm rounded-2xl px-3 py-1 border border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white"></span>{" "}
                  Simulation
                </button>
                <button className="bg-transparent text-white text-sm rounded-2xl px-3 py-1 border border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white"></span> FPS
                </button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 bg-[#434343] rounded-[20px] p-6 pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white text-[24px] font-bold">
                    Market Snapshot
                  </h2>
                  <p className="bg-[#323232] text-white text-sm rounded-md px-3 py-1">
                    3 Year Trend
                  </p>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC90A] text-[12px] px-2 py-0.5 rounded-full font-medium flex items-center">
                      <ArrowUp className="text-black" size={12} />
                      12%
                    </span>
                    <span className="text-gray-300 text-sm">Downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#45E12A] text-[12px] px-2 py-0.5 rounded-full font-medium flex items-center">
                      <ArrowDown className="text-black" size={12} />
                      6%
                    </span>
                    <span className="text-gray-300 text-sm">Revenue</span>
                  </div>
                </div>

                <div className="h-36 mb-4 relative w-full border-b border-dashed border-gray-500">
                  <Line data={chartData} options={chartOptions} />
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                      Growth:
                    </span>
                    <span className="text-white font-medium ml-1">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                      Retention:
                    </span>
                    <span className="text-white font-medium ml-1">Top 25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                      Monetizaton:
                    </span>
                    <span className="text-white font-medium ml-1">Medium</span>
                  </div>
                </div>
              </div>
              <div className="col-span-6 space-y-4">
                {/* Fit Score card */}
                <div className="bg-[#434343] rounded-[20px] p-6 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-[24px] font-bold">
                      Fit Score
                    </h2>
                    <div className="w-[20px] h-[20px] rounded-full bg-[#a1a1a1] flex items-center justify-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-white"></div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex justify-center mb-4">
                      <CircularProgress score={75} />
                    </div>

                    <div className="space-y-4 mt-2">
                      {fitScoreMetrics.map((metric) => (
                        <div key={metric.name} className="flex flex-col">
                          <span className="text-sm text-[#fff] min-w-[100px]">
                            {metric.name}
                          </span>
                          <div className="w-full flex-1">
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

                {/* Confidence Level card */}
                <div className="bg-[#434343] rounded-[20px] p-6 pb-4 border-[0.5px] border-[#636363]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-[24px] font-bold">
                      Confidence Level
                    </h2>
                    <div className="w-[20px] h-[20px] rounded-full bg-[#a1a1a1] flex items-center justify-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center mt-12">
                    <div className="w-full h-2 mb-6 relative">
                      <div className="absolute w-full flex justify-between -top-6">
                        <span className="text-sm text-gray-300">Low</span>
                        <span className="text-sm text-gray-300">Decent</span>
                        <span className="text-sm text-gray-300">High</span>
                      </div>
                      <div className="w-full h-4 bg-[#6B7280] rounded-full">
                        <div className="flex w-full gap-2 p-1 absolute top-0 left-0 right-0">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 ${
                                i < 5 ? "bg-[#b5b5b5]" : "bg-[#6B7280]"
                              } rounded-full`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="bg-[#303030] rounded-[20px] p-6 border-[0.5px] border-[#636363] col-span-6">
              <h3 className="text-white text-xl font-bold mb-2">Controls</h3>
            </div>
            <div className="bg-[#303030] rounded-[20px] p-6 border-[0.5px] border-[#636363] col-span-6">
              <h3 className="text-white text-xl font-bold mb-2">
                Top Games - Idle Merge
              </h3>
            </div>
          </div>
        </div>
        <div className="col-span-4 p-4">
          <div className="bg-[#303030] rounded-[20px]  border-[0.5px] border-[#636363] h-full flex flex-col">
            <div className="bg-[#0E0E0F59] flex items-center justify-between p-4 rounded-[20px] border-b-0">
              <h2 className="text-white text-[20px] font-bold">
                Gamepac Assistant
              </h2>
              <button className="bg-white text-[#303030] rounded-full px-3 py-1 text-xs font-medium">
                New Chat
              </button>
            </div>
            <div className="p-2 flex flex-col flex-1">
              <div className="text-center text-gray-300 text-xs mb-4">
                Friday, October 3
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* User message (right) */}
                <div className="flex w-full justify-end">
                  <div className="max-w-[80%] bg-[#3a3a3a] border border-[#535353] rounded-xl p-4 text-gray-200 text-sm text-left">
                    How are the downloads of merge-based puzzle games in the US
                    vs India?
                  </div>
                </div>

                {/* Assistant reply (left) */}
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] bg-[#4a4a4a] border border-[#5a5a5a] rounded-xl p-4 text-gray-200 text-sm">
                    <ul className="list-disc ml-5 space-y-4">
                      <li>
                        Since Growth is high and Retention is in the Top 25%,
                        merge-based puzzle games are gaining strong traction
                        globally.
                      </li>
                      <li>
                        In markets like the US, downloads are likely higher but
                        more expensive (higher CPI).
                      </li>
                      <li>
                        In India, downloads would be cheaper but monetization
                        may be weaker.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Chips under reply */}
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-full border border-[#7a7a7a] text-xs text-white">
                    Expand on this further
                  </button>
                  <button className="px-3 py-1 rounded-full border border-[#7a7a7a] text-xs text-white">
                    Other country comparison
                  </button>
                </div>
              </div>

              {/* Input pinned to bottom */}
              <div className="pt-4 bg-[#0E0E0F59] p-4 rounded-[20px]">
                <input
                  className="w-full rounded-[16px] p-3 border border-[#545454]  bg-[#2f2f2f] text-gray-300 text-sm"
                  placeholder="Ask, add files or find anything"
                ></input>
                <div className="flex items-center justify-between mt-3">
                  <button className="w-9 h-9 rounded-full bg-white/10 text-white border border-[#6b6b6b]  flex items-center justify-center">
                    <File size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full bg-white/10 text-white border border-[#6b6b6b] flex items-center justify-center">
                      <Mic size={16} />
                    </button>
                    <button className="rounded-full bg-white text-[#303030] px-4 py-2 text-xs font-semibold">
                      Ask AI ▸
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaPac;
