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
import {
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronDownIcon,
  FileText,
  ChartNoAxesColumn,
} from "lucide-react";
import PropTypes from "prop-types";
import gameIcon from "../../assets/game-icon.png";
import playableShowcase from "../../assets/playable-showcase.png";
// import mergeGame from "../../assets/2x_Retina.png";
import smileGame from "../../assets/smiley.png";
import PdfViewer from "../GameReviewer/components/PdfViewer";

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
import { useState } from "react";

// Utility function for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
          padding: 0,
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
        top: 0,
        bottom: 0,
      },
    },
    datasets: {
      line: {
        pointStyle: false,
      },
    },
  };

  const tabs = [
    { id: "1", label: "1. Puzzle | Idle Merge" },
    { id: "2", label: "2. Match 3 | Lorem Ip" },
    { id: "3", label: "3. Word | Lorem Ipsu" },
  ];
  const [activeTab, setActiveTab] = useState(null || tabs[0]?.id);
  const [activeView, setActiveView] = useState("market");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // onTabChange?.(tabId);
  };

  // const handleCloseTab = (e, tabId) => {
  //   e.stopPropagation();
  //   onTabClose?.(tabId);
  // };

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
            stroke="#FFC90A"
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
    { name: "MarketFit", score: 100, color: "#FFC90A" },
    { name: "TechnicalFit", score: 70, color: "#45E12A" },
    { name: "ArtFit", score: 65, color: "#FF8C42" },
    { name: "Confid. adj", score: 80, color: "#45E12A" },
  ];
  const topGames = [
    { name: "Royal Match", img: gameIcon, author: "Voodoo" },
    { name: "Brawl Stars", img: playableShowcase, author: "Supercell" },
    { name: "Smiley Wars", img: smileGame, author: "Brawl Stars" },
    // { name: "Merge Game", img: mergeGame, author: "Brawl Stars" },
  ];

  const previousOpportunities = [
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 81 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 64 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 72 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 88 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
    { title: "Match 3 - Candy", date: "12 | 03 | 25", score: 93 },
  ];

  // Right panel state for generators/filters
  const [genre, setGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [country, setCountry] = useState("");
  const [platform, setPlatform] = useState("android");
  const [gender, setGender] = useState("male");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [timeRange, setTimeRange] = useState(3);
  const [spendMin, setSpendMin] = useState(20); // in K
  const [spendMax, setSpendMax] = useState(70); // in K
  const [monetization, setMonetization] = useState("ads");
  const gddPdfUrl =
    "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  const [gddSelectedPdf, setGddSelectedPdf] = useState({ file_url: gddPdfUrl });
  const [, setMessageObj] = useState({});

  const clampSpend = (min, max) => {
    const clampedMin = Math.max(0, Math.min(min, max - 1));
    const clampedMax = Math.min(100, Math.max(max, clampedMin + 1));
    setSpendMin(clampedMin);
    setSpendMax(clampedMax);
  };

  const valueToPercent = (value, min = 0, max = 90) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="bg-[#404040] h-[100%]">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Content */}
        <div className="col-span-8 p-4 pr-2">
          {/* Top Nav Tabs */}
          <div className="mb-0">
            <div className="flex items-center">
              <div className="bg-gray-300 py-1 px-2 rounded-md text-xs max-w-[100px] ml-3">
                Suggested
              </div>
              {/* Tabs */}
              <div className="flex items-end gap-[9px] px-2  pb-[4px]">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "relative group flex items-center gap-2 px-4 py-2.5 min-w-[180px] max-w-[240px]",
                      "transition-all duration-150 ease-out ",
                      activeTab === tab.id
                        ? "bg-[#303030] text-white z-10 pb-3"
                        : "bg-[#A5A5A54A] text-white hover:bg-[#28292d] pb-2.5"
                    )}
                    style={{
                      clipPath:
                        activeTab === tab.id
                          ? "polygon(12px 0%, calc(100% - 12px) 0%, 100% 100%, 0% 100%)"
                          : "polygon(12px 0%, calc(100% - 12px) 0%, 100% 100%, 0% 100%)",
                      marginLeft: index > 0 ? "-8px" : "0",
                    }}
                  >
                    {/* Tab content */}
                    <span className="flex-1 text-sm font-normal truncate text-center">
                      {tab.number && (
                        <span className="text-gray-500 mr-1">
                          {tab.number}.
                        </span>
                      )}
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#303030] rounded-[10px] p-6  -mt-1">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Idle Merge
                </h1>
                <p className="text-gray-300 -mt-1">Puzzle</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {activeView === "market" ? (
                    <button
                      onClick={() => setActiveView("gdd")}
                      className="bg-[#27C128] text-white rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-1"
                    >
                      View GDD <FileText size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveView("market")}
                      className="bg-[#27C128] text-white rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-1"
                    >
                      View Market <ChartNoAxesColumn size={16} />
                    </button>
                  )}
                </div>
                {activeView === "market" && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm">
                      Confidence Level
                    </span>
                    <div className="w-[220px] h-3 relative">
                      <div
                        className="w-full h-3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #FF3B30 0%, #FF9500 25%, #FFD60A 50%, #34C759 100%)",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Market Section */}
            {activeView === "market" && (
              <div>
                {/* Market */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6 bg-[#434343] rounded-[10px] p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-white text-[24px] font-bold">
                        Market Snapshot
                      </h2>
                      <p className="bg-[#323232] text-white text-sm rounded-md px-3 py-1">
                        3 Year Trend
                      </p>
                    </div>

                    <div className="flex gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FFC90A] text-[12px] px-2 py-0.5 rounded-full font-medium flex items-center">
                          <ArrowDown className="text-black" size={12} />
                          12%
                        </span>
                        <span className="text-gray-300 text-sm">
                          Downloads (#)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#45E12A] text-[12px] px-2 py-0.5 rounded-full font-medium flex items-center">
                          <ArrowUp className="text-black" size={12} />
                          6%
                        </span>
                        <span className="text-gray-300 text-sm">
                          IAP Revenue (USD)
                        </span>
                      </div>
                    </div>

                    <div className="h-56 relative w-full">
                      <Line
                        className="w-full h-full"
                        data={chartData}
                        options={chartOptions}
                      />
                    </div>

                    <div className="space-y-2 text-sm pt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                          Active User Growth:
                        </span>
                        <span className="text-white font-medium ml-1">
                          High
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                          Demographic:
                        </span>
                        <span className="text-white font-medium ml-1">
                          Young; Female
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                          Monetization:
                        </span>
                        <span className="text-white font-medium ml-1">
                          Medium
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-6 space-y-4">
                    {/* Fit Score card */}
                    <div className="bg-[#434343] rounded-[10px] p-6 pb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white text-[24px] font-bold">
                          Fit Score
                        </h2>
                        <div className="w-[20px] h-[20px] rounded-full bg-[#a1a1a1] flex items-center justify-center">
                          <div className=" text-white">?</div>
                          {/* <QuestionCircleFilled className="text-white" /> */}
                          {/* <QuestionOutlined className="text-white" /> */}
                        </div>
                      </div>

                      <div className="flex gap-8">
                        <div className="flex justify-center mb-4">
                          <CircularProgress score={75} />
                        </div>

                        <div className="space-y-4 mt-2 w-full">
                          {fitScoreMetrics.map((metric) => (
                            <div key={metric.name} className="flex flex-col">
                              <span className="text-sm text-[#fff] min-w-[100px]">
                                {metric.name}
                              </span>
                              <div className="w-full flex-1">
                                <div
                                  className="h-1 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${metric.score}%`,
                                    backgroundColor: metric.color,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Top Games card */}
                    <div className="bg-[#434343] rounded-[10px] p-6 border-[0.5px] border-[#636363]">
                      <h3 className="text-white text-xl font-bold mb-2">
                        Top Games
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mt-2 ">
                        {topGames.map((g, idx) => (
                          <div key={`${g.name}-${idx}`}>
                            <div className="rounded-[14px] overflow-hidden border border-white/70 bg-[#1f1f1f] w-full h-[80px] flex items-center justify-center">
                              <img
                                src={g.img}
                                alt={g.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="text-white text-center mt-2 truncate">
                              {g.name}
                            </div>
                            <div className="text-gray-200 text-sm text-center truncate">
                              {g.author}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Insights */}
                <div className="p-6 col-span-6">
                  <h3 className="text-white text-xl font-bold mb-4">
                    Insights
                  </h3>
                  <div className="flex gap-6">
                    <ul className="list-disc mr-4 text-gray-200 space-y-3">
                      <li>
                        <span className="text-gray-200">Regional Growth:</span>{" "}
                        India, Brazil, and Mexico are emerging as strong Tier 2
                        download markets, with contributions rising to 18.3%,
                        20.7%, and 17.1%, respectively, signaling opportunities
                        for ad-based revenue.
                      </li>
                      <li>
                        <span className="text-gray-200">Platform Growth:</span>{" "}
                        Android&#39;s dominance (91.7% downloads and 86.7%
                        revenue in 2023—24) aligns with Tier 2 regions where
                        Android has a broader reach.
                      </li>
                      <li>
                        <span className="text-gray-200">iOS Monetization:</span>{" "}
                        Despite falling downloads, iOS revenue for Shoe Race
                        reached 77.3% in 2023—24, showing strong engagement from
                        premium users.
                      </li>
                    </ul>

                    <ul className="list-disc ml-6 text-gray-200 space-y-3">
                      <li>
                        <span className="text-gray-200">Regional Growth:</span>{" "}
                        India, Brazil, and Mexico are emerging as strong Tier 2
                        download markets, with contributions rising to 18.3%,
                        20.7%, and 17.1%, respectively, signaling opportunities
                        for ad-based revenue.
                      </li>
                      <li>
                        <span className="text-gray-200">Platform Growth:</span>{" "}
                        Android&#39;s dominance (91.7% downloads and 86.7%
                        revenue in 2023—24) aligns with Tier 2 regions where
                        Android has a broader reach.
                      </li>
                      <li>
                        <span className="text-gray-200">iOS Monetization:</span>{" "}
                        Despite falling downloads, iOS revenue for Shoe Race
                        reached 77.3% in 2023—24, showing strong engagement from
                        premium users.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* GDD Section */}
            {activeView === "gdd" && (
              <div className="mt-4">
                <PdfViewer
                  selectedPdf={gddSelectedPdf}
                  selectedPage={null}
                  setSelectedPdf={setGddSelectedPdf}
                  setMessageObj={setMessageObj}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-4 p-4 pt-[58px] pl-[10px]">
          {/* Previous Opportunities */}
          <div className="bg-[#0F0F0F4D] rounded-[10px] p-6 border-[0.5px] border-[#303030]">
            <h3 className="text-white text-xl font-bold mb-4">
              Previous Opportunities
            </h3>
            <div className="rounded-[14px] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-3 text-gray-300 text-sm ">
                <div className="col-span-6">Title</div>
                <div className="col-span-3 text-center">Date</div>
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              <div className="max-h-[160px] overflow-y-auto">
                {previousOpportunities.map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className="grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-[#3f3f3f] text-gray-200"
                  >
                    <div className="col-span-6 truncate">{item.title}</div>
                    <div className="col-span-3 text-center text-gray-300">
                      {item.date}
                    </div>
                    <div className="col-span-2 text-right text-white font-medium">
                      {item.score}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        className="text-gray-300 hover:text-white"
                        aria-label="View"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate New Opportunity */}
          <div className="bg-[#0F0F0F4D] rounded-[10px] p-6 border-[0.5px] border-[#303030] mt-[28px]">
            <h3 className="text-white text-xl font-bold mb-6">
              Generate New Opportunity
            </h3>

            {/* Genre */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Genre</div>
              <div className="relative inline-block">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="appearance-none bg-[#454545] border border-[#3f3f3f] text-gray-200 text-sm rounded-md px-4 py-2 pr-9 focus:outline-none"
                >
                  <option value="">Select Genre</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="strategy">Strategy</option>
                  <option value="word">Word</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Sub-Genre */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Sub-Genre</div>
              <div className="relative inline-block">
                <select
                  value={subGenre}
                  onChange={(e) => setSubGenre(e.target.value)}
                  className="appearance-none bg-[#454545] border border-[#3f3f3f] text-gray-200 text-sm rounded-md px-4 py-2 pr-9 focus:outline-none"
                >
                  <option value="">Select Sub-genre</option>
                  <option value="match3">Match-3</option>
                  <option value="idle">Idle</option>
                  <option value="merge">Merge</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Country */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Region / Country</div>
              <div className="relative inline-block">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="appearance-none bg-[#454545] border border-[#3f3f3f] text-gray-200 text-sm rounded-md px-4 py-2 pr-9 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Platform */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Platform</div>
              <div className="flex gap-3">
                {[
                  { id: "ios", label: "iOS" },
                  { id: "android", label: "Android" },
                  { id: "unified", label: "Unified" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`px-4 py-2 rounded-md text-sm  ${
                      platform === p.id
                        ? "bg-white text-black "
                        : "bg-[#454545] text-gray-200 "
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Gender</div>
              <div className="flex gap-3">
                {[
                  { id: "male", label: "Male" },
                  { id: "female", label: "Female" },
                  { id: "all", label: "All" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    className={`px-4 py-2 rounded-md text-sm  ${
                      gender === g.id
                        ? "bg-white text-black "
                        : "bg-[#454545] text-gray-200 "
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Age */}
            <div className="mb-5 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Target Age</div>
              <div className="relative inline-block">
                <select
                  value={targetAgeGroup}
                  onChange={(e) => setTargetAgeGroup(e.target.value)}
                  className="appearance-none bg-[#454545] border border-[#3f3f3f] text-gray-200 text-sm rounded-md px-4 py-2 pr-9 focus:outline-none"
                >
                  <option value="">Select Age Groups</option>
                  <option value="13-17">13-17</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Time Period */}
            <div className="mb-[42px] flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">Time Period</div>
              <div className="flex gap-3">
                {[2, 3].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setTimeRange(yr)}
                    className={`px-4 py-2 rounded-md text-sm  ${
                      timeRange === yr
                        ? "bg-white text-black "
                        : "bg-[#454545] text-gray-200 "
                    }`}
                  >
                    {yr} Years
                  </button>
                ))}
              </div>
            </div>

            {/* UA Spend */}
            <div className="mb-5 ">
              <div className="flex items-center gap-4">
                <div className="text-gray-300 text-sm whitespace-nowrap">
                  UA Spend
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">0</span>
                    <div className="relative h-8 flex-1">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#6B7280] rounded-full" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-1 bg-white rounded-full"
                        style={{
                          left: `${valueToPercent(spendMin, 0, 100)}%`,
                          right: `${100 - valueToPercent(spendMax, 0, 100)}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={spendMin}
                        onChange={(e) =>
                          clampSpend(parseInt(e.target.value, 10), spendMax)
                        }
                        className="range-input absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-auto z-10"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={spendMax}
                        onChange={(e) =>
                          clampSpend(spendMin, parseInt(e.target.value, 10))
                        }
                        className="range-input absolute w-full h-1 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-auto z-10"
                      />
                      <div
                        className="absolute -top-6 text-xs text-gray-200"
                        style={{
                          left: `calc(${valueToPercent(
                            spendMin,
                            0,
                            100
                          )}% - 14px)`,
                        }}
                      >
                        <span className="bg-white text-black px-2 py-0.5 rounded">
                          {spendMin}K
                        </span>
                      </div>
                      <div
                        className="absolute -top-6 text-xs text-gray-200"
                        style={{
                          left: `calc(${valueToPercent(
                            spendMax,
                            0,
                            100
                          )}% - 14px)`,
                        }}
                      >
                        <span className="bg-white text-black px-2 py-0.5 rounded">
                          {spendMax}K
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">$100K +</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monetization Focus */}
            <div className="mb-7 flex items-center gap-4">
              <div className="text-gray-300 text-sm mb-2">
                Monetization Focus
              </div>
              <div className="flex gap-3">
                {[
                  { id: "iap", label: "IAP" },
                  { id: "ads", label: "Ads" },
                  { id: "hybrid", label: "Hybrid" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMonetization(m.id)}
                    className={`px-4 py-2 rounded-md text-sm  ${
                      monetization === m.id
                        ? "bg-white text-black "
                        : "bg-[#454545] text-gray-200 "
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="pt-2">
              <button className="w-full bg-white text-black rounded-2xl py-3 text-base font-semibold flex items-center justify-center gap-2">
                Generate <span className="-mt-0.5">✦</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaPac;
