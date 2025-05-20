import { useState } from "react"
import { Bookmark, Download, ExternalLink } from "lucide-react"
import PlaceholderSvg from "../../../../assets/placeholder.svg"

// Sample data for demonstration
const gameData = [
  {
    id: 1,
    name: "Gardenscapes",
    developer: "Playrix",
    releaseDate: "Aug 2016",
    downloads: "3.5M",
    revenue: "$38.3M",
    retention: "45%",
    dau: "3.9M",
    theme: "Puzzle",
    meta: "Match Swap",
    platforms: { ios: 47.9, android: 52.1 },
    image: "https://play-lh.googleusercontent.com/MI0aupX4o-83J3FhZILVyrl7WMnBVF9AiMghexepstdhSV6JnaTMgd18YvuFuFdKxBU",
  },
  {
    id: 2,
    name: "Truck Star",
    developer: "Century Games",
    releaseDate: "Feb 2021",
    downloads: "1.5M",
    revenue: "$2.2M",
    retention: "35%",
    dau: "875K",
    theme: "Puzzle",
    meta: "Match Swap",
    platforms: { ios: 75.1, android: 24.9 },
    image: "https://play-lh.googleusercontent.com/mDTRKMe56opJP8bMEAHQi8AYIyeF7gFm9IEPfYCl4LZ9puB6Ib-vpOmMvdmVYhMkiQY",
  },
  {
    id: 3,
    name: "Royal Match",
    developer: "Dream Games",
    releaseDate: "May 2024",
    downloads: "8.1M",
    revenue: "$107.7M",
    retention: "48%",
    dau: "16.3M",
    theme: "Puzzle",
    meta: "Match Swap",
    platforms: { ios: 74.3, android: 25.7 },
    image: "https://play-lh.googleusercontent.com/qBdVfwRCsI4KM7qewhJ0AKZKQjyD-DdxPDcdDbsRMhNO9zrwbefggn1vGqRIDZA3fg",
  },
]

export function TopGamesModule() {
  const [view, setView] = useState("grid")
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm col-span-1 md:col-span-2">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h3 className="text-xl font-semibold leading-none tracking-tight">Top New Games</h3>
          <p className="text-sm text-gray-500">Simulation games released after Jan 2023 in EU</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Custom Select Dropdown */}
          <div className="relative">
            <button
              className="flex h-9 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-[120px]"
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <span>{view === "grid" ? "Grid View" : "List View"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 ml-2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            
            {isSelectOpen && (
              <div className="absolute right-0 mt-1 w-[120px] rounded-md border border-gray-200 bg-white shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className={`flex w-full items-center px-3 py-2 text-sm ${view === "grid" ? "bg-gray-100" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      setView("grid")
                      setIsSelectOpen(false)
                    }}
                  >
                    Grid View
                  </button>
                  <button 
                    className={`flex w-full items-center px-3 py-2 text-sm ${view === "list" ? "bg-gray-100" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      setView("list")
                      setIsSelectOpen(false)
                    }}
                  >
                    List View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {gameData.map((game) => (
            <GameCard key={game.id} game={game} view={view} />
          ))}
        </div>
      </div>
    </div>
  )
}

function GameCard({ game, view }) {
  return (
    <div
      className={`rounded-lg border bg-card p-4 text-card-foreground shadow-sm ${
        view === "list" ? "flex items-center gap-4" : ""
      }`}
    >
      <div className={view === "list" ? "flex-shrink-0" : "mb-4"}>
        <img src={game.image || "/placeholder.svg"} alt={game.name} className="h-20 w-20 rounded-md object-cover" />
      </div>
      <div className={view === "list" ? "flex-1" : ""}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{game.name}</h3>
            <p className="text-sm text-muted-foreground">{game.developer}</p>
          </div>
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium">
            {game.theme}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium">
            {game.meta}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
            {game.releaseDate}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Downloads</p>
            <p className="font-medium">{game.downloads}</p>
          </div>
          <div>
            <p className="text-gray-500">Revenue</p>
            <p className="font-medium">{game.revenue}</p>
          </div>
          <div>
            <p className="text-gray-500">D1 Retention</p>
            <p className="font-medium">{game.retention}</p>
          </div>
          <div>
            <p className="text-gray-500">DAU</p>
            <p className="font-medium">{game.dau}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">iOS: {game.platforms.ios}%</span>
            <span className="text-xs text-gray-500">Android: {game.platforms.android}%</span>
          </div>
          <div className="flex gap-1">
            <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
