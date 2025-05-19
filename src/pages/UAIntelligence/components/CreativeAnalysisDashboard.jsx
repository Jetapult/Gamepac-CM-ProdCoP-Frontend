import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const topPerformers = [
  {
    name: "Gameplay Demo 1",
    category: "Demo",
    description: "Feature showcase with level progression",
    cpi: 0.72,
  },
  {
    name: "Character Story 3",
    category: "Story",
    description: "Emotional narrative with character development",
    cpi: 0.85,
  },
  {
    name: "Quick Demo 7",
    category: "Demo",
    description: "Core gameplay loop with visual rewards",
    cpi: 0.89,
  },
  {
    name: "Challenge Hook 2",
    category: "Hook",
    description: "Puzzle challenge with time pressure",
    cpi: 0.94,
  },
];

const lowPerformers = [
  {
    name: "Generic CTA 5",
    category: "CTA",
    description: "Standard call to action with app icon",
    cpi: 1.82,
  },
  {
    name: "Feature List 3",
    category: "Hook",
    description: "Text-heavy feature overview",
    cpi: 1.76,
  },
  {
    name: "Long Story 2",
    category: "Story",
    description: "Extended narrative without gameplay",
    cpi: 1.68,
  },
  {
    name: "Static Demo 4",
    category: "Demo",
    description: "Non-interactive feature showcase",
    cpi: 1.54,
  },
];

const creativeData = [
  { category: "Hook", high: 8, medium: 12, low: 5 },
  { category: "Story", high: 10, medium: 15, low: 8 },
  { category: "Demo", high: 15, medium: 18, low: 4 },
  { category: "CTA", high: 6, medium: 14, low: 9 },
];

// Mock data imports
const performanceByCategory = [
  { category: "Hook", cpi: 1.45, impressions: 320 },
  { category: "Story", cpi: 1.32, impressions: 280 },
  { category: "Demo", cpi: 0.87, impressions: 420 },
  { category: "CTA", cpi: 1.28, impressions: 180 },
];

// Performance chart data
const performanceChartData = {
  labels: performanceByCategory.map((item) => item.category),
  datasets: [
    {
      label: "CPI ($)",
      data: performanceByCategory.map((item) => item.cpi),
      backgroundColor: "#8884d8", // Purple color for CPI bars
      yAxisID: "y",
    },
    {
      label: "Impressions (K)",
      data: performanceByCategory.map((item) => item.impressions),
      backgroundColor: "#82ca9d", // Green color for Impressions bars
      yAxisID: "y1",
    },
  ],
};

// Performance chart options
const performanceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 20,
      bottom: 0,
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      align: "start",
      labels: {
        boxWidth: 12,
        padding: 15,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            if (context.dataset.label.includes("CPI")) {
              label += "$" + context.parsed.y.toFixed(2);
            } else {
              label += context.parsed.y;
            }
          }
          return label;
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        padding: 5,
      },
    },
    y: {
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "CPI ($)",
        padding: { top: 0, bottom: 0 },
      },
      ticks: {
        callback: function (value) {
          return "$" + value.toFixed(2);
        },
        padding: 5,
      },
      min: 0,
    },
    y1: {
      type: "linear",
      position: "right",
      title: {
        display: true,
        text: "Impressions (K)",
        padding: { top: 0, bottom: 0 },
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        padding: 5,
      },
      min: 0,
    },
  },
  barPercentage: 0.85,
  categoryPercentage: 0.9,
};

// Distribution chart data
const distributionChartData = {
  labels: creativeData.map((item) => item.category),
  datasets: [
    {
      label: "High Performing",
      data: creativeData.map((item) => item.high),
      backgroundColor: "#4ade80", // Green color
      stack: "Stack 0",
    },
    {
      label: "Medium Performing",
      data: creativeData.map((item) => item.medium),
      backgroundColor: "#facc15", // Yellow color
      stack: "Stack 0",
    },
    {
      label: "Low Performing",
      data: creativeData.map((item) => item.low),
      backgroundColor: "#f87171", // Red color
      stack: "Stack 0",
    },
  ],
};

// Distribution chart options
const distributionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 20,
      bottom: 0,
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      align: "start",
      labels: {
        boxWidth: 12,
        padding: 15,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y;
          }
          return label;
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      stacked: true,
      ticks: {
        padding: 5,
      },
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: "Number of Creatives",
        padding: { top: 0, bottom: 0 },
      },
      ticks: {
        padding: 5,
      },
      min: 0,
    },
  },
  barPercentage: 0.85,
  categoryPercentage: 0.9,
};

const CreativeAnalysisDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Creative Analysis Dashboard
          </h2>
          <p className="text-gray-500">
            Analyze your ad performance by creative concept and identify
            patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="rounded-md border border-gray-300 p-2 w-[180px]"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="p-2 border border-gray-300 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          <button className="p-2 border border-gray-300 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium">Total Creatives</h3>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium">Average CPI</h3>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold">$1.24</div>
            <p className="text-xs text-gray-500">-8% from last month</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium">Best Performing Category</h3>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold">Demo</div>
            <p className="text-xs text-gray-500">$0.87 avg. CPI</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium">Conversion Rate</h3>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-gray-500">+0.5% from last month</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance by Creative Category Chart */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4">
            <h3 className="text-xl font-semibold">
              Performance by Creative Category
            </h3>
            <p className="text-sm text-gray-500">
              CPI comparison across different creative concepts
            </p>
          </div>
          <div className="p-0 px-4 pb-4" style={{ height: "360px" }}>
            <Bar
              data={performanceChartData}
              options={performanceChartOptions}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        {/* Creative Distribution Chart */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4">
            <h3 className="text-xl font-semibold">Creative Distribution</h3>
            <p className="text-sm text-gray-500">
              Number of creatives by category and performance
            </p>
          </div>
          <div className="p-0 px-4 pb-4" style={{ height: "360px" }}>
            <Bar
              data={distributionChartData}
              options={distributionChartOptions}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Top and Low Performers section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-semibold">Top Performing Creatives</h3>
            <p className="text-sm text-gray-500">
              Lowest CPI creatives across categories
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {topPerformers.map((creative, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          creative.category === "Hook"
                            ? "bg-blue-100 text-blue-800"
                            : creative.category === "Demo"
                            ? "bg-purple-100 text-purple-800"
                            : creative.category === "Story"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {creative.category}
                      </span>
                      <span className="text-sm font-medium">
                        {creative.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {creative.description}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    ${creative.cpi} CPI
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Performers Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-semibold">Low Performing Creatives</h3>
            <p className="text-sm text-gray-500">
              Highest CPI creatives that need optimization
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {lowPerformers.map((creative, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          creative.category === "Hook"
                            ? "bg-blue-100 text-blue-800"
                            : creative.category === "Demo"
                            ? "bg-purple-100 text-purple-800"
                            : creative.category === "Story"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {creative.category}
                      </span>
                      <span className="text-sm font-medium">
                        {creative.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {creative.description}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    ${creative.cpi} CPI
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeAnalysisDashboard;
