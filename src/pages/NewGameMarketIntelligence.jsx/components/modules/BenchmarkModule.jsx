import { useState } from "react"
import { Download, Info } from "lucide-react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Sample data for demonstration
const benchmarkData = {
  metrics: [
    {
      name: "D1 Retention",
      top10: "45%",
      median: "32%",
      bottom25: "22%",
      unit: "%",
    },
    {
      name: "D7 Retention",
      top10: "22%",
      median: "15%",
      bottom25: "8%",
      unit: "%",
    },
    {
      name: "DAU",
      top10: "450K",
      median: "180K",
      bottom25: "75K",
      unit: "",
    },
    {
      name: "ARPU",
      top10: "$0.85",
      median: "$0.42",
      bottom25: "$0.18",
      unit: "$",
    },
    {
      name: "Session Time",
      top10: "12.5 min",
      median: "8.2 min",
      bottom25: "4.8 min",
      unit: "min",
    },
  ],
  chartData: [
    {
      name: "D1 Retention",
      top10: 45,
      median: 32,
      bottom25: 22,
    },
    {
      name: "D7 Retention",
      top10: 22,
      median: 15,
      bottom25: 8,
    },
    {
      name: "ARPU (cents)",
      top10: 85,
      median: 42,
      bottom25: 18,
    },
  ],
}

export function BenchmarkModule() {
  const [view, setView] = useState("table")
  const [showTooltip, setShowTooltip] = useState({
    top10: false,
    median: false,
    bottom25: false
  })

  // Prepare data for Chart.js
  const chartJsData = {
    labels: benchmarkData.chartData.map(item => item.name),
    datasets: [
      {
        label: 'Top 10%',
        data: benchmarkData.chartData.map(item => item.top10),
        backgroundColor: '#4ade80',
        borderRadius: 4,
      },
      {
        label: 'Median',
        data: benchmarkData.chartData.map(item => item.median),
        backgroundColor: '#60a5fa',
        borderRadius: 4,
      },
      {
        label: 'Bottom 25%',
        data: benchmarkData.chartData.map(item => item.bottom25),
        backgroundColor: '#f87171',
        borderRadius: 4,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgb(31, 41, 55)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Genre Benchmarks</h3>
          <p className="text-sm text-gray-500">Benchmarks for new puzzle games in US</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Selector */}
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-[100px]"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="table">Table</option>
              <option value="chart">Chart</option>
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
        {view === "table" ? (
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Metric</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      Top 10%
                      <div className="relative">
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                          onMouseEnter={() => setShowTooltip({...showTooltip, top10: true})}
                          onMouseLeave={() => setShowTooltip({...showTooltip, top10: false})}
                        >
                          <Info className="h-3 w-3" />
                        </button>
                        {showTooltip.top10 && (
                          <div className="absolute z-50 w-48 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                            <p>Top 10% of games in this genre</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      Median
                      <div className="relative">
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                          onMouseEnter={() => setShowTooltip({...showTooltip, median: true})}
                          onMouseLeave={() => setShowTooltip({...showTooltip, median: false})}
                        >
                          <Info className="h-3 w-3" />
                        </button>
                        {showTooltip.median && (
                          <div className="absolute z-50 w-48 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                            <p>Median value across all games</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      Bottom 25%
                      <div className="relative">
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                          onMouseEnter={() => setShowTooltip({...showTooltip, bottom25: true})}
                          onMouseLeave={() => setShowTooltip({...showTooltip, bottom25: false})}
                        >
                          <Info className="h-3 w-3" />
                        </button>
                        {showTooltip.bottom25 && (
                          <div className="absolute z-50 w-48 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                            <p>Bottom 25% of games in this genre</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.metrics.map((metric, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-4 align-middle font-medium">{metric.name}</td>
                    <td className="p-4 align-middle text-green-600">{metric.top10}</td>
                    <td className="p-4 align-middle">{metric.median}</td>
                    <td className="p-4 align-middle text-red-600">{metric.bottom25}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[350px] chart-container">
            <Bar data={chartJsData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  )
}
