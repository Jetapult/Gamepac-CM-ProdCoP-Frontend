import { useState, useEffect } from "react";
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
import { ArrowUp, ArrowDown, FileText, ChartNoAxesColumn } from "lucide-react";
import { PDFViewer } from "../../pages/GameDesignDocument/conceptGenerator/PDFViewer";
import api from "../../api";
import PropTypes from "prop-types";
import gameIcon from "../../assets/game-icon.png";
import playableShowcase from "../../assets/playable-showcase.png";
import smileGame from "../../assets/smiley.png";

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

// Utility function for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

export default function OpportunityDetails({ studioId }) {
  const [activeView, setActiveView] = useState("market");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState("");

  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    const loadTabs = async () => {
      if (!studioId) return;
      try {
        setTabsLoading(true);
        setTabsError("");
        const res = await api.get(`/v1/ideapac/opportunity-cards`, {
          params: { studio_id: studioId, page: 1, limit: 5 },
        });
        const items = Array.isArray(res?.data?.data) ? res.data.data : [];
        const newTabs = items.slice(0, 3).map((item, index) => ({
          id: String(item?.id ?? index + 1),
          label: `${item?.genre_name || ""} | ${item?.sub_genre_name || ""}`,
        }));
        setTabs(newTabs);
        if (!activeTabId && newTabs[0]?.id) {
          setActiveTabId(newTabs[0].id);
        }
      } catch (e) {
        setTabsError("Failed to load tabs");
      } finally {
        setTabsLoading(false);
      }
    };
    loadTabs();
  }, [studioId]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!activeTabId || !studioId) return;
      try {
        setLoading(true);
        setError("");
        const res = await api.get(
          `/v1/ideapac/opportunity-cards/${activeTabId}`,
          {
            params: { studio_id: studioId },
          }
        );
        const data = res?.data?.data || null;
        setDetail(data);
        if (data?.prd_url) {
          setSelectedPdf(data.prd_url);
        }
      } catch (e) {
        setError("Failed to load opportunity details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [activeTabId, studioId]);

  // Derived values with safe fallbacks
  const title =
    detail?.name ||
    (activeTabId ? `Opportunity ${activeTabId}` : "Opportunity");
  const subtitle = detail?.genre_name || "";
  const confidenceLevel =
    typeof detail?.confidence_level === "number"
      ? detail.confidence_level
      : null;
  const confPct = Math.max(0, Math.min(100, Number(confidenceLevel ?? 0)));
  //   const confPct = 50;
  const confidenceFillBackground =
    confPct < 25
      ? "#FF3B30"
      : confPct < 50
      ? "#FF9500"
      : confPct < 75
      ? "#FFD60A"
      : "#34C759";

  const fitScores = detail?.fit_scores || {};
  const totalScore = Math.max(
    0,
    Math.min(100, Math.round(fitScores?.total ?? 0))
  );
  const fitScoreMetrics = [
    {
      name: "MarketFit",
      score: Math.max(0, Math.round(fitScores?.market_fit ?? 0)),
      color: "#FFC90A",
    },
    {
      name: "TechnicalFit",
      score: Math.max(0, Math.round(fitScores?.technical_fit ?? 0)),
      color: "#45E12A",
    },
    {
      name: "ArtFit",
      score: Math.max(0, Math.round(fitScores?.art_fit ?? 0)),
      color: "#FF8C42",
    },
    {
      name: "Confid. adj",
      score: Math.max(0, Math.round(fitScores?.confidence_fit ?? 0)),
      color: "#45E12A",
    },
  ];

  // Build chart data from market_snapshot.graph_data
  const graphData = detail?.market_snapshot?.graph_data || {};
  const revenueByYear = graphData?.revenue || {};
  const downloadsByYear = graphData?.downloads || {};
  const yearSet = new Set([
    ...Object.keys(revenueByYear || {}),
    ...Object.keys(downloadsByYear || {}),
  ]);
  const labels = Array.from(yearSet)
    .filter(
      (y) => /^(19|20|21)\d{2}$/.test(String(y)) || /^\d{4}$/.test(String(y))
    )
    .sort((a, b) => Number(a) - Number(b));

  const chartData = {
    labels: labels.length > 0 ? labels : ["2023", "2024", "2025"],
    datasets: [
      {
        label: "Downloads",
        data: (labels.length > 0 ? labels : ["2023", "2024", "2025"]).map((y) =>
          Number(downloadsByYear?.[y] ?? 0)
        ),
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
        data: (labels.length > 0 ? labels : ["2023", "2024", "2025"]).map((y) =>
          Number(revenueByYear?.[y] ?? 0)
        ),
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
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false },
    },
    scales: {
      y: {
        display: false,
        border: { display: false },
        ticks: { display: false },
        grid: { display: false },
      },
      x: {
        display: true,
        grid: { display: false, drawBorder: false, lineWidth: 0 },
        ticks: {
          color: "#9CA3AF",
          font: { size: 12 },
          padding: 0,
          maxTicksLimit: 3,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: { borderJoinStyle: "round" },
      point: { radius: 0, hoverRadius: 0 },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    datasets: { line: { pointStyle: false } },
  };

  const yoyDownloads = detail?.market_snapshot?.yoy?.downloads;
  const yoyRevenue = detail?.market_snapshot?.yoy?.revenue;
  const downloadsUp =
    typeof yoyDownloads === "number" ? yoyDownloads >= 0 : true;
  const revenueUp = typeof yoyRevenue === "number" ? yoyRevenue >= 0 : true;

  const positiveInsights = detail?.insights?.positive || [];
  const negativeInsights = detail?.insights?.negative || [];
  const neutralInsights = detail?.insights?.neutral || [];

  const topGames = [
    { name: "Royal Match", img: gameIcon, author: "Voodoo" },
    { name: "Brawl Stars", img: playableShowcase, author: "Supercell" },
    { name: "Smiley Wars", img: smileGame, author: "Brawl Stars" },
  ];

  const isTabsPlaceholder = tabsLoading || !!tabsError || tabs.length === 0;
  const placeholderTabs = [1, 2, 3].map((i) => ({
    id: String(i),
    label: tabsLoading ? "Loading..." : "Loading...",
  }));
  const tabsToRender = tabs.length > 0 ? tabs : placeholderTabs;

  return (
    <>
      {/* Top Nav Tabs moved here */}
      <div className="mb-0">
        <div className="flex items-center">
          <div className="bg-gray-300 py-1 px-2 rounded-md text-xs max-w-[100px] ml-3">
            Suggested
          </div>
          {/* Tabs */}
          <div className="flex items-end gap-[9px] px-2  pb-[4px]">
            {tabsToRender.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => !isTabsPlaceholder && setActiveTabId(tab.id)}
                disabled={isTabsPlaceholder}
                className={cn(
                  "relative group flex items-center gap-2 px-4 py-2.5 min-w-[180px] max-w-[240px]",
                  "transition-all duration-150 ease-out ",
                  isTabsPlaceholder ? "opacity-60 cursor-not-allowed" : "",
                  activeTabId === tab.id
                    ? "bg-[#303030] text-white z-10 pb-3"
                    : "bg-[#A5A5A54A] text-white hover:bg-[#28292d] pb-2.5"
                )}
                style={{
                  clipPath:
                    activeTabId === tab.id
                      ? "polygon(12px 0%, calc(100% - 12px) 0%, 100% 100%, 0% 100%)"
                      : "polygon(12px 0%, calc(100% - 12px) 0%, 100% 100%, 0% 100%)",
                  marginLeft: index > 0 ? "-8px" : "0",
                }}
              >
                {/* Tab content */}
                <span className="flex-1 text-sm font-normal truncate text-center">
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
              {title}
            </h1>
            <p className="text-gray-300 -mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {activeView === "market" ? (
                <button
                  onClick={() => {
                    setActiveView("gdd");
                    console.log("selectedPdf", selectedPdf);
                  }}
                  className="bg-[#27C128] text-white rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-1 hover:cursor-pointer "
                  disabled={!selectedPdf}
                >
                  View GDD <FileText size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setActiveView("market")}
                  className="bg-[#27C128] text-white rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-1 hover:cursor-pointer"
                >
                  View Market <ChartNoAxesColumn size={16} />
                </button>
              )}
            </div>
            {activeView === "market" && (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 text-sm">Confidence Level</span>
                <div className="w-[220px] h-3 relative rounded-full bg-[#1f1f1f] overflow-hidden">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${confPct}%`,
                      background:
                        confPct < 20
                          ? confidenceFillBackground
                          : "linear-gradient(90deg, #FF3B30 0%, #FF9500 25%, #FFD60A 50%, #34C759 100%)",
                    }}
                  />
                </div>
                {typeof confidenceLevel === "number" && (
                  <span className="text-gray-300 text-sm">
                    {Math.round(confidenceLevel)}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center text-gray-300">Loading...</div>
        )}
        {!loading && error && (
          <div className="py-6 text-center text-red-400">
            {error}
            <button
              className="ml-3 underline"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError("");
                  const res = await api.get(
                    `/v1/ideapac/opportunity-cards/${activeTabId}`,
                    {
                      params: { studio_id: studioId },
                    }
                  );
                  const data = res?.data?.data || null;
                  setDetail(data);
                  if (data?.prd_url) {
                    setSelectedPdf(data.prd_url);
                  }
                } catch (e) {
                  setError("Failed to load opportunity details");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Reload
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
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
                          {downloadsUp ? (
                            <ArrowUp className="text-black" size={12} />
                          ) : (
                            <ArrowDown className="text-black" size={12} />
                          )}
                          {typeof yoyDownloads === "number"
                            ? Math.abs(yoyDownloads)
                            : 0}
                          %
                        </span>
                        <span className="text-gray-300 text-sm">
                          Downloads (#)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#45E12A] text-[12px] px-2 py-0.5 rounded-full font-medium flex items-center">
                          {revenueUp ? (
                            <ArrowUp className="text-black" size={12} />
                          ) : (
                            <ArrowDown className="text-black" size={12} />
                          )}
                          {typeof yoyRevenue === "number"
                            ? Math.abs(yoyRevenue)
                            : 0}
                          %
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
                          {detail?.market_snapshot?.growth || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                          Retention:
                        </span>
                        <span className="text-white font-medium ml-1">
                          {detail?.market_snapshot?.retention || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[16px] before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                          Monetization:
                        </span>
                        <span className="text-white font-medium ml-1">
                          {detail?.market_snapshot?.monetization || "-"}
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
                        <div className="relative group">
                          <div className="w-[20px] h-[20px] rounded-full bg-[#a1a1a1] flex items-center justify-center hover:cursor-pointer">
                            <div className=" text-white">?</div>
                          </div>
                          <div className="absolute right-0 mt-2 w-[320px] p-3 rounded-md bg-black/90 text-white text-xs leading-snug shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                            Your Feasibility Score reflects how well your idea
                            aligns with market trends and your studio’s
                            capabilities. It’s based on weighted inputs across
                            Market Fit, Technical Fit, Art Fit plus a ±5%
                            confidence adjustment.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-8">
                        <div className="flex justify-center mb-4">
                          <CircularProgress score={totalScore} />
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
                    {/* Top Games card - placeholder retained */}
                    <div className="bg-[#434343] rounded-[10px] p-6 border-[0.5px] border-[#636363]">
                      <h3 className="text-white text-xl font-bold mb-2">
                        Top Games
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mt-2 ">
                        {topGames.map((g, idx) => (
                          <div key={`${g}-${idx}`}>
                            <div className="rounded-[14px] overflow-hidden border border-white/70 bg-[#1f1f1f] w-full h-[80px] flex items-center justify-center">
                              <img
                                src={g.img}
                                alt={g.name}
                                className="w-full h-full object-cover"
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
                <div className="py-6 pl-2 col-span-12">
                  <h3 className="text-white pl-6 text-xl font-bold mb-4">
                    Insights
                  </h3>
                  <div className="grid grid-cols-3 gap-8">
                    {/* positive insights */}
                    <ul className="list-disc pl-6 border-l-4 border-[#27C128] text-gray-200 space-y-3">
                      {(positiveInsights.length > 0
                        ? positiveInsights
                        : ["—"]
                      ).map((text, i) => (
                        <li key={`pos-${i}`}>{text}</li>
                      ))}
                    </ul>

                    {/* neutral insights */}
                    <ul className="list-disc pl-6 border-l-4 border-[#FFC90A] text-gray-200 space-y-3">
                      {(neutralInsights.length > 0
                        ? neutralInsights
                        : ["—"]
                      ).map((text, i) => (
                        <li key={`neu-${i}`}>{text}</li>
                      ))}
                    </ul>

                    {/* negative insights */}
                    <ul className="list-disc pl-6 border-l-4 border-[#FF3B30] text-gray-200 space-y-3">
                      {(negativeInsights.length > 0
                        ? negativeInsights
                        : ["—"]
                      ).map((text, i) => (
                        <li key={`neg-${i}`}>{text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* GDD Section */}
            {activeView === "gdd" && (
              <div className="mt-4">
                <PDFViewer pdfUrl={selectedPdf} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

OpportunityDetails.propTypes = {
  studioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
