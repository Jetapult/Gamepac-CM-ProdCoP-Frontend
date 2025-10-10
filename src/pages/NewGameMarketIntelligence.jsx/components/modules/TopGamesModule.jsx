import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

const gameData = [
  {
    id: 1,
    name: "Tile Club - Match Puzzle Game",
    developer: "GamoVation",
    releaseDate: "Mar 2024",
    downloads: "1.5M",
    revenue: "$505.6K",
    retention: "41%",
    dau: "191.5K",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 27.7, android: 72.3 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/tile+club+-+GamoVation.jpg",
  },
  {
    id: 2,
    name: "Mahjong Tile Dynasty",
    developer: "Tripledot Studios",
    releaseDate: "Mar 2024",
    downloads: "1.9M",
    revenue: "-",
    retention: "42%",
    dau: "54.3K",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 0.0, android: 67.9 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/mahjong+tile+dynasty.png",
  },
  {
    id: 3,
    name: "Tile Explorer - Triple Match",
    developer: "Oakever Games",
    releaseDate: "May 2024",
    downloads: "1.2M",
    revenue: "$33.4k",
    retention: "49%",
    dau: "30.1k",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 47.3, android: 52.7 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/tile+explorer+-+oakever+games.png",
  },
  {
    id: 4,
    name: "Blossom Match - Puzzle Game",
    developer: "Tripledot Studios",
    releaseDate: "May 2024",
    downloads: "1.09M",
    revenue: "-",
    retention: "45%",
    dau: "40.76K",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 38.3, android: 61.7 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/blossom+match+-+tripledot+games.png",
  },
  {
    id: 5,
    name: "Tile Master Pro: Triple Match",
    developer: "Higgs Studio",
    releaseDate: "Jan 2024",
    downloads: "534.1K",
    revenue: "$410",
    retention: "39%",
    dau: "14.0K",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 17.3, android: 82.7 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/tile+master+pro+-+higgs.png",
  },
  {
    id: 6,
    name: "Tile Match puzzle - Tiletopia",
    developer: "Modern Times Group",
    releaseDate: "Jan 2023",
    downloads: "399.4k",
    revenue: "113.0k",
    retention: "25%",
    dau: "16.5k",
    theme: "Puzzle",
    meta: "Match Pair",
    platforms: { ios: 36.9, android: 63.1 },
    image:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/asset-generator/tile+match+puzzle+-+tiletopia.png",
  },
];

export function TopGamesModule() {
  const [view, setView] = useState("grid");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm col-span-1 md:col-span-2">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h3 className="text-xl font-semibold leading-none tracking-tight">
            Top New Games
          </h3>
          <p className="text-sm text-gray-500">
            Simulation games released after Jan 2023 in EU
          </p>
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
                    className={`flex w-full items-center px-3 py-2 text-sm ${
                      view === "grid" ? "bg-gray-100" : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setView("grid");
                      setIsSelectOpen(false);
                    }}
                  >
                    Grid View
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-sm ${
                      view === "list" ? "bg-gray-100" : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setView("list");
                      setIsSelectOpen(false);
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
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {gameData.map((game) => (
            <GameCard key={game.id} game={game} view={view} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, view }) {
  const navigate = useNavigate();
  return (
    <div
      className={`rounded-lg border bg-card p-4 text-card-foreground shadow-sm ${
        view === "list" ? "flex items-center gap-4" : ""
      }`}
    >
      <div className={view === "list" ? "flex-shrink-0" : "mb-4"}>
        <img
          src={game.image || "/placeholder.svg"}
          alt={game.name}
          className="h-20 w-20 rounded-md object-cover"
        />
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
            <span className="text-xs text-gray-500">
              iOS: {game.platforms.ios}%
            </span>
            <span className="text-xs text-gray-500">
              Android: {game.platforms.android}%
            </span>
          </div>
          <div className="flex gap-1">
            <button
              className="bg-[#B9FF66] px-3 py-[2px] inline-flex items-center justify-center rounded-md text-sm font-medium"
              onClick={() => navigate(`/gdd/concept-generator`)}
            >
              GDD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
