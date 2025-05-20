import { useState } from "react"
import { Download, Info } from "lucide-react"
import { Line, Pie, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
)

// Sample data for demonstration
const trendData = {
  themes: [
    { name: "Fantasy RPG", frequency: 28, performance: 85 },
    { name: "Sci-Fi Adventure", frequency: 22, performance: 72 },
    { name: "Medieval Strategy", frequency: 18, performance: 65 },
    { name: "Modern Combat", frequency: 15, performance: 78 },
    { name: "Post-Apocalyptic", frequency: 12, performance: 60 },
    { name: "Cyberpunk", frequency: 5, performance: 90 },
  ],
  meta: [
    { name: "Restoration", frequency: 15, newGamesRatio: 0.86, topGamesRatio: 2.54 },
    { name: "Build", frequency: 22, newGamesRatio: 0.36, topGamesRatio: 3.05 },
    { name: "Makeover", frequency: 18, newGamesRatio: 1.8, topGamesRatio: 1.64 },
    { name: "Help", frequency: 25, newGamesRatio: 2.19, topGamesRatio: 1.47 },
    { name: "Level Custom", frequency: 20, newGamesRatio: 2.87, topGamesRatio: 3.53 },
  ],
  timeline: [
    { month: "Jan", fantasy: 5, scifi: 3, medieval: 2, modern: 4 },
    { month: "Feb", fantasy: 7, scifi: 4, medieval: 3, modern: 5 },
    { month: "Mar", fantasy: 10, scifi: 6, medieval: 5, modern: 4 },
    { month: "Apr", fantasy: 12, scifi: 8, medieval: 6, modern: 3 },
    { month: "May", fantasy: 15, scifi: 10, medieval: 7, modern: 5 },
    { month: "Jun", fantasy: 18, scifi: 12, medieval: 8, modern: 6 },
  ],
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export function TrendHeatmapModule() {
  const [timeRange, setTimeRange] = useState("6m")
  const [activeTab, setActiveTab] = useState("distribution")
  const [showTooltip, setShowTooltip] = useState({
    themes: false,
    meta: false
  })

  // Prepare chart data for Chart.js
  const themePieData = {
    labels: trendData.themes.map(item => item.name),
    datasets: [
      {
        data: trendData.themes.map(item => item.frequency),
        backgroundColor: COLORS.slice(0, trendData.themes.length),
        borderWidth: 1
      }
    ]
  }

  const metaPieData = {
    labels: trendData.meta.map(item => item.name),
    datasets: [
      {
        data: trendData.meta.map(item => item.frequency),
        backgroundColor: COLORS.slice(0, trendData.meta.length),
        borderWidth: 1
      }
    ]
  }

  const timelineData = {
    labels: trendData.timeline.map(item => item.month),
    datasets: [
      {
        label: "Fantasy RPG",
        data: trendData.timeline.map(item => item.fantasy),
        fill: true,
        backgroundColor: "rgba(136, 132, 216, 0.6)",
        borderColor: "#8884d8",
      },
      {
        label: "Sci-Fi Adventure",
        data: trendData.timeline.map(item => item.scifi),
        fill: true,
        backgroundColor: "rgba(130, 202, 157, 0.6)",
        borderColor: "#82ca9d",
      },
      {
        label: "Medieval Strategy",
        data: trendData.timeline.map(item => item.medieval),
        fill: true,
        backgroundColor: "rgba(255, 198, 88, 0.6)",
        borderColor: "#ffc658",
      },
      {
        label: "Modern Combat",
        data: trendData.timeline.map(item => item.modern),
        fill: true,
        backgroundColor: "rgba(255, 128, 66, 0.6)",
        borderColor: "#ff8042",
      }
    ]
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  }

  const lineOptions = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)"
        }
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)"
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

  // First, create a new barOptions configuration for the bar chart
  const metaBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          },
          boxWidth: 15,
          boxHeight: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Avg Paid/Organic Ratio',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)"
        },
        title: {
          display: true,
          text: 'Ratio',
          font: {
            size: 14
          },
          padding: {
            top: 15
          }
        },
        ticks: {
          font: {
            size: 12
          },
          maxTicksLimit: 6,
          max: 4.5
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 10
        }
      }
    },
    layout: {
      padding: {
        left: 15,
        right: 25,
        top: 15,
        bottom: 15
      }
    },
    barThickness: 25,
    barPercentage: 0.8,
    categoryPercentage: 0.8
  };

  // Then, modify the data structure for a bar chart
  const metaBarData = {
    labels: trendData.meta.map(item => item.name),
    datasets: [
      {
        label: 'New Games',
        data: trendData.meta.map(item => item.newGamesRatio),
        backgroundColor: '#0088FE',
        borderColor: '#0088FE',
        borderWidth: 1,
      },
      {
        label: 'Top Games',
        data: trendData.meta.map(item => item.topGamesRatio),
        backgroundColor: '#00C49F',
        borderColor: '#00C49F',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Meta Trends</h3>
          <p className="text-sm text-gray-500">Trending meta in new idle-RPG games</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-[100px]"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {/* Download Button */}
          <button className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap -mb-px">
            <button 
              className={`inline-block px-4 py-2 text-sm font-medium ${activeTab === "distribution" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("distribution")}
            >
              Distribution
            </button>
            <button 
              className={`inline-block px-4 py-2 text-sm font-medium ${activeTab === "heatmap" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("heatmap")}
            >
              Performance
            </button>
            <button 
              className={`inline-block px-4 py-2 text-sm font-medium ${activeTab === "timeline" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Distribution Tab */}
          {activeTab === "distribution" && (
            <div className="flex flex-col gap-4 md:flex-row">
              {/* <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Theme Distribution</h4>
                  <div className="relative">
                    <button 
                      className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                      onMouseEnter={() => setShowTooltip({...showTooltip, themes: true})}
                      onMouseLeave={() => setShowTooltip({...showTooltip, themes: false})}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    {showTooltip.themes && (
                      <div className="absolute right-0 z-50 w-48 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                        <p>Distribution of themes in new idle-RPG games</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[250px]">
                  <Pie data={themePieData} options={pieOptions} />
                </div>
              </div> */}

              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Paid/Organic Ratio by Meta Type</h4>
                  <div className="relative">
                    <button 
                      className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                      onMouseEnter={() => setShowTooltip({...showTooltip, meta: true})}
                      onMouseLeave={() => setShowTooltip({...showTooltip, meta: false})}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    {showTooltip.meta && (
                      <div className="absolute right-0 z-50 w-48 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                        <p>Comparison of paid vs organic install ratios across meta mechanics</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[450px]">
                  <Bar data={metaBarData} options={metaBarOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "heatmap" && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Theme Performance Heatmap</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {trendData.themes.map((theme, index) => (
                    <div
                      key={index}
                      className="flex flex-col rounded-md border p-3"
                      style={{
                        backgroundColor: `rgba(0, 136, 254, ${theme.performance / 100})`,
                      }}
                    >
                      <span className="font-medium">{theme.name}</span>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm">Frequency: {theme.frequency}%</span>
                        <span className="text-sm">Performance: {theme.performance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Meta Performance Heatmap</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {trendData.meta.map((meta, index) => (
                    <div
                      key={index}
                      className="flex flex-col rounded-md border p-3"
                      style={{
                        backgroundColor: `rgba(0, 196, 159, ${meta.performance / 100})`,
                      }}
                    >
                      <span className="font-medium">{meta.name}</span>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm">Frequency: {meta.frequency}%</span>
                        <span className="text-sm">Performance: {meta.performance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Theme Adoption Timeline</h4>
                <div className="h-[300px]">
                  <Line data={timelineData} options={lineOptions} />
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#8884d8]" />
                      <span className="text-xs">Fantasy RPG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#82ca9d]" />
                      <span className="text-xs">Sci-Fi Adventure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#ffc658]" />
                      <span className="text-xs">Medieval Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#ff8042]" />
                      <span className="text-xs">Modern Combat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
