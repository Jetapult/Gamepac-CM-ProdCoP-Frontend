import { useState, useEffect, useCallback, useRef } from "react";
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
  FileText,
  ChartNoAxesColumn,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { PDFViewer } from "../../pages/GameDesignDocument/conceptGenerator/PDFViewer";
import OpportunityDetailsSkeleton from "./OpportunityDetailsSkeleton";
import api from "../../api";
import PropTypes from "prop-types";
import gameIcon from "../../assets/game-icon.png";
import playableShowcase from "../../assets/playable-showcase.png";
import smileGame from "../../assets/smiley.png";
import { Tooltip as ReactTooltip } from "react-tooltip";

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

export default function OpportunityDetails({
  studioId,
  activeTabId: propActiveTabId,
  onActiveTabChange,
  onAfterAutoGenerate,
}) {
  const [activeView, setActiveView] = useState("market");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [internalActiveTabId, setInternalActiveTabId] = useState(null);
  const activeTabId = propActiveTabId ?? internalActiveTabId;
  const setActiveTabId = onActiveTabChange ?? setInternalActiveTabId;
  const [tabs, setTabs] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState("");
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoGenError, setAutoGenError] = useState("");

  const [selectedPdf, setSelectedPdf] = useState(null);
  const hasAttemptedAutoGenerateRef = useRef(false);
  const autoGenInFlightRef = useRef(false);

  // Reset auto-generate guard when studio changes
  useEffect(() => {
    hasAttemptedAutoGenerateRef.current = false;
  }, [studioId]);

  console.log("activeTabId", activeTabId, "selectedPdf->", selectedPdf);

  // Define helpers BEFORE effects that depend on them
  const reloadTabs = useCallback(async () => {
    try {
      setTabsLoading(true);
      setTabsError("");
      const res = await api.get(`/v1/ideapac/opportunity-cards`, {
        params: { studio_id: studioId, page: 1, limit: 5 },
      });
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      const baseTabs = items.slice(0, 3).map((item, index) => ({
        id: String(item?.id ?? index + 1),
        label: `${item?.genre_name || ""} | ${item?.sub_genre_name || ""}`,
      }));
      setTabs(baseTabs);
      if (items[0]?.id != null) {
        setActiveTabId(String(items[0].id));
      }
    } catch (e) {
      setTabsError("Failed to load tabs");
    } finally {
      setTabsLoading(false);
    }
  }, [studioId, setActiveTabId]);

  const triggerAutoGenerate = useCallback(async () => {
    if (autoGenInFlightRef.current) return;
    try {
      setAutoGenError("");
      setAutoGenerating(true);
      autoGenInFlightRef.current = true;
      await api.post(`/v1/ideapac/opportunity-card/generate`, {
        studio_id: studioId,
        simulate: false,
      });
      // After successful generation, reload list and show details
      await reloadTabs();
      // Notify parent to refresh Previous Opportunities list
      if (typeof onAfterAutoGenerate === "function") {
        await onAfterAutoGenerate();
      }
    } catch (e) {
      setAutoGenError("Failed to generate opportunity. Please retry.");
    } finally {
      setAutoGenerating(false);
      autoGenInFlightRef.current = false;
    }
  }, [reloadTabs, studioId, onAfterAutoGenerate]);

  const fetchOrGeneratePdfUrl = useCallback(
    async (cardId) => {
      if (!cardId || !studioId) return null;
      try {
        const res = await api.get(`/v1/ideapac/gdd/${cardId}`, {
          params: { studio_id: studioId },
        });
        const prdUrl = res?.data?.data?.prd_url || res?.data?.prd_url || null;
        if (prdUrl) {
          setSelectedPdf(prdUrl);
        }
        return prdUrl;
      } catch (_) {
        return null;
      }
    },
    [studioId]
  );

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

        if (items.length === 0) {
          // No cards yet: trigger once per studio
          if (!hasAttemptedAutoGenerateRef.current) {
            hasAttemptedAutoGenerateRef.current = true;
            triggerAutoGenerate();
          }
          return;
        }

        const baseTabs = items.slice(0, 3).map((item, index) => ({
          id: String(item?.id ?? index + 1),
          label: `${item?.genre_name || ""} | ${item?.sub_genre_name || ""}`,
        }));
        // Preserve any previously appended extra tab (e.g., a clicked card)
        setTabs((prev) => {
          const extra = Array.isArray(prev)
            ? prev
                .filter(
                  (t) => !baseTabs.some((b) => String(b.id) === String(t.id))
                )
                .slice(0, 1)
            : [];

          return extra.length > 0 ? [...baseTabs, extra[0]] : baseTabs;
        });
      } catch (e) {
        setTabsError("Failed to load tabs");
      } finally {
        setTabsLoading(false);
      }
    };
    loadTabs();
  }, [studioId, triggerAutoGenerate]);

  // Ensure a default selection after tabs are loaded if none selected yet
  useEffect(() => {
    if (!studioId) return;
    if (!activeTabId && tabs && tabs[0]?.id) {
      setActiveTabId(tabs[0].id);
    }
  }, [studioId, tabs, activeTabId, setActiveTabId]);
  useEffect(() => {
    const fetchDetail = async () => {
      if (!activeTabId || !studioId) return;
      try {
        setLoading(true);
        setError("");
        setSelectedPdf(null);
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
        } else {
          fetchOrGeneratePdfUrl(activeTabId);
        }
        // Ensure the selected card appears as a 4th tab in the nav
        try {
          const selectedId = String(activeTabId);
          const tabLabel = `${data?.genre_name || ""} | ${data?.name || ""}`;
          setTabs((prev) => {
            // If already present (including among the first 3), do nothing
            if (prev.some((t) => String(t.id) === selectedId)) {
              return prev;
            }
            // Keep the first three suggested tabs and append the clicked as the 4th
            const base = prev.slice(0, 3);
            return [...base, { id: selectedId, label: tabLabel }];
          });
        } catch (_) {
          // no-op: tabs are non-critical UI hints
        }
      } catch (e) {
        setError("Failed to load opportunity details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [activeTabId, studioId, fetchOrGeneratePdfUrl]);

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

  // Confidence bar: 7 segments with specified gradients
  const segmentGradients = [
    "linear-gradient(90deg, #FF0000 63.27%, #E7CB2A 135.66%)",
    "linear-gradient(90deg, #FF0000 21.52%, #E7CB2A 135.66%)",
    "linear-gradient(90deg, #FF0000 -41.07%, #E7CB2A 49.95%)",
    "linear-gradient(90deg, #E7CB2A 54.79%, #9DFF00 135.67%)",
    "linear-gradient(90deg, #FFEA00 0%, #48F04B 135.67%)",
    "linear-gradient(90deg, #B8F048 0%, #47DA08 135.67%)",
    "linear-gradient(90deg, #47DA08 0%, #0BD900 135.67%)",
  ];
  const SEGMENT_COUNT = 7;
  const segmentStep = 100 / SEGMENT_COUNT;
  const filledCount = Math.floor(confPct / segmentStep);
  const partialWidthPct = Math.max(
    0,
    Math.min(100, ((confPct - filledCount * segmentStep) / segmentStep) * 100)
  );
  const segmentFillPercents = Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    if (i < filledCount) return 100;
    if (i === filledCount) return partialWidthPct;
    return 0;
  });

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
        // Show only dotted horizontal grid lines; no ticks or axis border
        display: true,
        border: { display: false },
        ticks: { display: false },
        grid: {
          display: true,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false,
          color: "rgba(148, 163, 184, 0.25)", // slate-400 at low opacity
          lineWidth: 1,
          borderDash: [6, 6],
        },
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

  // Prefer API-provided top apps, fallback to placeholders for resilience
  const rawTopApps = Array.isArray(detail?.top_apps) ? detail.top_apps : [];
  const topApps = rawTopApps.slice(0, 6).map((app, index) => ({
    url: typeof app?.url === "string" ? app.url : "#",
    name: typeof app?.name === "string" ? app.name : `App ${index + 1}`,
    iconUrl: typeof app?.icon_url === "string" ? app.icon_url : null,
    publisher:
      typeof app?.publisher_name === "string" ? app.publisher_name : "",
  }));
  const placeholderTopApps = [
    { url: "#", name: "Royal Match", iconUrl: gameIcon, publisher: "Voodoo" },
    {
      url: "#",
      name: "Brawl Stars",
      iconUrl: playableShowcase,
      publisher: "Supercell",
    },
    {
      url: "#",
      name: "Smiley Wars",
      iconUrl: smileGame,
      publisher: "Brawl Stars",
    },
  ];
  const topItemsToRender = topApps.length > 0 ? topApps : placeholderTopApps;

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
          <div className="bg-white py-1 px-2 rounded-md text-xs font-bold max-w-[100px] mx-6 ml-8">
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
        {autoGenerating ? (
          <div className="min-h-[440px] flex items-center justify-center">
            <div className="text-center max-w-[520px] mx-auto">
              <h2 className="text-white text-2xl font-bold mb-6">
                Finding the right Opportunity for you…
              </h2>
              <div className="space-y-4 text-left inline-block">
                <div className="flex items-center gap-3 text-gray-200">
                  <CheckCircle className="text-[#27C128]" size={20} />
                  <span>Creating a Market Snapshot</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200">
                  <CheckCircle className="text-[#27C128]" size={20} />
                  <span>Determining Fit Score</span>
                </div>
                <div className="flex items-center gap-3 text-gray-200">
                  <Loader2 className="animate-spin text-white" size={20} />
                  <span>Identifying Top Games</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Circle size={20} />
                  <span>Generating Insights</span>
                </div>
              </div>
              {autoGenError && (
                <div className="mt-6 text-red-400">
                  {autoGenError}
                  <button
                    onClick={triggerAutoGenerate}
                    className="ml-3 underline text-white"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {loading && <OpportunityDetailsSkeleton />}
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
                      } else {
                        fetchOrGeneratePdfUrl(activeTabId);
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

            {/* Header */}
            {!loading && (
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-4xl font-bold text-white leading-tight ">
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
                        className="bg-[#27C128] text-white rounded-2xl py-[9px] px-[14px] text-sm font-medium flex items-center gap-1 hover:cursor-pointer "
                        disabled={!selectedPdf}
                      >
                        View GDD <FileText size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveView("market")}
                        className="bg-[#27C128] text-white rounded-2xl py-[9px] px-[14px] text-sm font-medium flex items-center gap-1 hover:cursor-pointer"
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
                      <div className="w-[220px] h-3 bg-white rounded-full p-[2px]">
                        <div className="w-full h-full flex gap-[2px]">
                          {segmentGradients.map((bg, i) => (
                            <div
                              key={i}
                              className="relative flex-1 h-full bg-white rounded-full overflow-hidden"
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${segmentFillPercents[i]}%`,
                                  background: bg,
                                }}
                              />
                            </div>
                          ))}
                        </div>
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
            )}

            {!loading && !error && (
              <>
                {/* Market Section */}
                {activeView === "market" && (
                  <div>
                    {/* Market */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 bg-[#434343] rounded-[10px] p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-white text-[24px] font-bold ">
                            Market Snapshot
                          </h2>
                          {/* <p className="bg-[#323232] text-white text-sm rounded-md px-3 py-1">
                            3 Year Trend
                          </p> */}
                        </div>

                        <div className="flex gap-4 mb-4">
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

                        <div className="space-y-2 text-sm pt-8">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                              Active User Growth:
                            </span>
                            <span className="text-white font-normal text-lg ml-1 capitalize">
                              {detail?.market_snapshot?.growth || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                              Retention:
                            </span>
                            <span className="text-white font-normal text-lg ml-1 capitalize">
                              {detail?.market_snapshot?.retention || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg before:content-['|'] before:mr-2 before:text-[20px] before:text-white">
                              Monetization:
                            </span>
                            <span className="text-white font-normal text-lg ml-1 capitalize">
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
                              <div
                                data-tooltip-id="tip"
                                className="w-[20px] h-[20px] rounded-full bg-[#a1a1a1] flex items-center justify-center hover:cursor-pointer"
                              >
                                <div className=" text-white">?</div>
                              </div>

                              <ReactTooltip
                                id="tip"
                                place="top"
                                content="Your Feasibility Score reflects how well your
                                idea aligns with market trends and your studio’s
                                capabilities. It’s based on weighted inputs
                                across Market Fit, Technical Fit, Art Fit plus a
                                ±5% confidence adjustment."
                                style={{
                                  backgroundColor: "#000",
                                  color: "#fff",
                                  border: "12px solid #FFFFFF",
                                  borderRadius: "2px",
                                  padding: "8px 12px",
                                  maxWidth: "320px",
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-8">
                            <div className="flex justify-center mb-4">
                              <CircularProgress score={totalScore} />
                            </div>

                            <div className="space-y-4 mt-2 w-full">
                              {fitScoreMetrics.map((metric) => (
                                <div
                                  key={metric.name}
                                  className="flex flex-col"
                                >
                                  <span className="text-sm text-[#fff] min-w-[100px] mb-1">
                                    {metric.name}
                                  </span>
                                  <div className="w-full flex-1">
                                    <div
                                      className="h-[5px] rounded-full transition-all duration-300 bg-[#808080]"
                                      style={{
                                        width: `${metric.score}%`,
                                        // backgroundColor: metric.color,
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
                          <h3 className="text-white text-2xl font-bold mb-4">
                            Top Games
                          </h3>
                          <div className="grid grid-cols-3 gap-4 mt-2 ">
                            {topItemsToRender.map((app, idx) => (
                              <a
                                key={`${app.name}-${idx}`}
                                href={app.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center flex-col w-full min-w-0"
                              >
                                <div className="rounded-[14px] overflow-hidden border border-white/70 bg-[#1f1f1f] w-[70px] h-[70px] flex items-center justify-center">
                                  <img
                                    src={app.iconUrl || gameIcon}
                                    alt={app.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = gameIcon;
                                    }}
                                  />
                                </div>
                                <div
                                  className="text-white text-center mt-2 truncate w-full"
                                  data-tooltip-id={`top-game-name-${idx}`}
                                  data-tooltip-content={app.name}
                                >
                                  {app.name}
                                </div>
                                <ReactTooltip
                                  id={`top-game-name-${idx}`}
                                  place="top"
                                  style={{
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    border: "6px solid #FFFFFF",
                                    borderRadius: "2px",
                                    padding: "8px 12px",
                                  }}
                                />
                                <div
                                  className="text-gray-200 text-sm text-center truncate w-full"
                                  data-tooltip-id={`top-game-pub-${idx}`}
                                  data-tooltip-content={app.publisher}
                                >
                                  {app.publisher}
                                </div>
                                {/* <ReactTooltip
                                  id={`top-game-pub-${idx}`}
                                  place="top"
                                  style={{
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,0.25)",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                  }}
                                /> */}
                              </a>
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
                        <ul className="list-disc pl-6 border-l-4 h-fit border-[#27C128] text-gray-200 space-y-3">
                          {(positiveInsights.length > 0
                            ? positiveInsights
                            : ["—"]
                          ).map((text, i) => (
                            <li key={`pos-${i}`}>{text}</li>
                          ))}
                        </ul>

                        {/* neutral insights */}
                        <ul className="list-disc pl-6 border-l-4 h-fit border-[#FFC90A] text-gray-200 space-y-3">
                          {(neutralInsights.length > 0
                            ? neutralInsights
                            : ["—"]
                          ).map((text, i) => (
                            <li key={`neu-${i}`}>{text}</li>
                          ))}
                        </ul>

                        {/* negative insights */}
                        <ul className="list-disc pl-6 border-l-4 h-fit border-[#FF3B30] text-gray-200 space-y-3">
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
          </>
        )}
      </div>
    </>
  );
}

OpportunityDetails.propTypes = {
  studioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeTabId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onActiveTabChange: PropTypes.func,
  onAfterAutoGenerate: PropTypes.func,
};
