import { useState } from "react"
import { Download, ExternalLink } from "lucide-react"
import PlaceholderSvg from "../../../../assets/placeholder.svg"

// Sample data for demonstration
const teardownData = {
  name: "Tower Defense Legends",
  developer: "Strategy Games Inc.",
  coreLoop: ["Resource Collection", "Tower Placement", "Wave Defense", "Tower Upgrade", "Hero Management"],
  monetization: {
    iap: [
      { type: "Resource Packs", percentage: 45 },
      { type: "Tower Skins", percentage: 25 },
      { type: "Hero Unlocks", percentage: 20 },
      { type: "Remove Ads", percentage: 10 },
    ],
    ads: [
      { type: "Rewarded (2x Rewards)", percentage: 60 },
      { type: "Interstitial", percentage: 30 },
      { type: "Banner", percentage: 10 },
    ],
  },
  uiScreenshots: [
    {
      name: "Main Menu",
      image: PlaceholderSvg,
      tags: ["Navigation", "Store Access", "Level Select"],
    },
    {
      name: "Gameplay",
      image: PlaceholderSvg,
      tags: ["Tower Placement", "Enemy Waves", "Resource UI"],
    },
    {
      name: "Upgrade Screen",
      image: PlaceholderSvg,
      tags: ["Progression", "Skill Tree", "Currency Display"],
    },
  ],
  summary: [
    "Innovative tower synergy system that rewards strategic placement",
    "Hero-based meta progression that carries between levels",
    "Social guild system for collaborative defense challenges",
    "Daily rotating challenge maps with unique constraints",
    "Seasonal events with exclusive towers and enemies",
  ],
}

export function GameTeardownModule() {
  const [activeTab, setActiveTab] = useState("core-loop")
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h3 className="text-xl font-semibold leading-none tracking-tight">Game Teardown</h3>
          <p className="text-sm text-gray-500">Teardown of top new tower defense game</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{teardownData.name}</h3>
          <p className="text-sm text-muted-foreground">{teardownData.developer}</p>
        </div>

        {/* Custom Tabs Implementation */}
        <div>
          {/* Tab List */}
          <div className="flex border-b border-gray-200 mb-4">
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === "core-loop" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("core-loop")}
            >
              Core Loop
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === "monetization" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("monetization")}
            >
              Monetization
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === "ui" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("ui")}
            >
              UI Analysis
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === "summary" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"}`}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "core-loop" && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h4 className="mb-2 font-medium">Core Gameplay Loop</h4>
                <div className="flex flex-wrap gap-2">
                  {teardownData.coreLoop.map((step, index) => (
                    <div key={index} className="relative flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                      {index < teardownData.coreLoop.length - 1 && (
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
                          className="ml-2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="mb-2 font-medium">Loop Diagram</h4>
                <div className="flex justify-center">
                  <img src={PlaceholderSvg} alt="Core Loop Diagram" className="rounded-md" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "monetization" && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h4 className="mb-2 font-medium">In-App Purchases</h4>
                <div className="space-y-2">
                  {teardownData.monetization.iap.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full bg-blue-600" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-sm">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="mb-2 font-medium">Ad Monetization</h4>
                <div className="space-y-2">
                  {teardownData.monetization.ads.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full bg-purple-600" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-sm">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ui" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {teardownData.uiScreenshots.map((screenshot, index) => (
                <div key={index} className="rounded-md border p-3">
                  <h4 className="mb-2 font-medium">{screenshot.name}</h4>
                  <img src={screenshot.image || PlaceholderSvg} alt={screenshot.name} className="mb-2 rounded-md" />
                  <div className="flex flex-wrap gap-1">
                    {screenshot.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="rounded-md border p-4">
              <h4 className="mb-2 font-medium">Key Innovations & Features</h4>
              <ul className="space-y-2">
                {teardownData.summary.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
