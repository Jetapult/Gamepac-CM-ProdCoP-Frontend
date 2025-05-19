import React, { useState } from "react";

const topPerformingPatterns = [
  "Immediate Gameplay Visibility",
  "Visual Progression & Rewards",
  "Character Transformation",
  "Problem-Solution Scenarios",
  "Interactive Elements",
  "Emotional Storytelling",
  "Achievement Showcases",
  "Time Pressure Elements",
];

const BriefGenerator = () => {
  const [category, setCategory] = useState("demo");
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("examples");

  const handleGenerate = () => {
    setGenerated(true);
  };
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Automated Brief Generator
        </h2>
        <p className="text-gray-500">
          Generate creative briefs based on successful patterns and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Brief Configuration Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-semibold">Brief Configuration</h3>
            <p className="text-sm text-gray-500">
              Set parameters for your new creative brief
            </p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Creative Category</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="hook">Hook</option>
                <option value="story">Story</option>
                <option value="demo">Demo</option>
                <option value="cta">CTA</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                defaultValue="casual"
              >
                <option value="casual">Casual Gamers</option>
                <option value="midcore">Midcore Gamers</option>
                <option value="hardcore">Hardcore Gamers</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Goal</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                defaultValue="installs"
              >
                <option value="installs">App Installs</option>
                <option value="retention">User Retention</option>
                <option value="monetization">Monetization</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Include Top Performing Patterns
              </label>
              <div className="grid grid-cols-2 gap-2">
                {topPerformingPatterns.map((pattern, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`pattern-${i}`}
                      defaultChecked={i < 3}
                      className="h-4 w-4 green-checkbox"
                    />
                    <label htmlFor={`pattern-${i}`} className="text-sm">
                      {pattern}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-2"
                rows="4"
                placeholder="Any specific requirements or focus areas..."
              ></textarea>
            </div>
          </div>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleGenerate}
              className="w-full rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Generate Brief
            </button>
          </div>
        </div>

        {/* Generated Brief Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-semibold">Generated Brief</h3>
            <p className="text-sm text-gray-500">
              Based on successful creative patterns
            </p>
          </div>
          <div className="p-6 pt-0 space-y-6">
            {!generated ? (
              <div className="flex h-[400px] items-center justify-center border border-dashed rounded-lg">
                <p className="text-gray-500">
                  Configure and generate a brief to see results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">
                    Creative Brief: Game Feature Demo
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Demo
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                    Casual Gamers
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    App Installs
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Concept Overview
                  </h4>
                  <p className="text-sm">
                    Create a gameplay demonstration that highlights the core
                    mechanics of the game with a focus on instant gratification
                    and visual rewards. This approach has shown a 32% lower CPI
                    compared to other creative formats.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Hook (0-3s)</h4>
                  <p className="text-sm">
                    Start with an immediate gameplay challenge that shows a
                    problem-solution scenario. Show a character facing an
                    obstacle, then immediately solving it with a satisfying
                    visual payoff.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Main Demo (3-20s)
                  </h4>
                  <p className="text-sm">
                    Demonstrate 2-3 core gameplay mechanics with increasing
                    complexity. Focus on visual feedback and rewards. Include
                    level progression or character upgrades to show depth.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Call to Action (20-30s)
                  </h4>
                  <p className="text-sm">
                    End with a clear, action-oriented CTA that creates urgency:
                    "Play Now" or "Download to Start Your Adventure". Include
                    app store badges and a final gameplay highlight.
                  </p>
                </div>
              </div>
            )}
          </div>
          {generated && (
            <div className="border-t border-gray-200 p-4 flex justify-between">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium">
                Copy Brief
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium">
                Export as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {generated && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-semibold">Reference Materials</h3>
            <p className="text-sm text-gray-500">
              Examples and insights from top performing creatives
            </p>
          </div>
          <div className="p-6 pt-0">
            {/* Reference materials tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                <p
                  onClick={() => setActiveTab("examples")}
                  className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                    activeTab === "examples"
                      ? "text-black border-b-[2px] border-black"
                      : "text-[#808080]"
                  }`}
                >
                  Creative Examples
                </p>
                <p
                  onClick={() => setActiveTab("patterns")}
                  className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                    activeTab === "patterns"
                      ? "text-black border-b-[2px] border-black"
                      : "text-[#808080]"
                  }`}
                >
                  Pattern Analysis
                </p>
                <p
                  onClick={() => setActiveTab("insights")}
                  className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                    activeTab === "insights"
                      ? "text-black border-b-[2px] border-black"
                      : "text-[#808080]"
                  }`}
                >
                  Performance Insights
                </p>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="mt-4">
              {/* Creative Examples Tab */}
              {activeTab === "examples" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-2 space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Demo Video 1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Puzzle Solver Demo</h4>
                      <p className="text-xs text-gray-500">$0.87 CPI • 4.2% CVR</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-2 space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Demo Video 2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Character Upgrade Demo</h4>
                      <p className="text-xs text-gray-500">$0.92 CPI • 3.8% CVR</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-2 space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Demo Video 3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Level Progression Demo</h4>
                      <p className="text-xs text-gray-500">$0.95 CPI • 3.5% CVR</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pattern Analysis Tab */}
              {activeTab === "patterns" && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Key Patterns in Successful Demo Creatives</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                          Pattern
                        </span>
                        <div>
                          <p className="text-sm font-medium">Immediate Gameplay Visibility</p>
                          <p className="text-xs text-gray-500">
                            Creatives that show actual gameplay within the first 2 seconds have 28% lower CPI
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                          Pattern
                        </span>
                        <div>
                          <p className="text-sm font-medium">Visual Progression</p>
                          <p className="text-xs text-gray-500">
                            Showing clear before/after states or level progression improves conversion by 22%
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                          Pattern
                        </span>
                        <div>
                          <p className="text-sm font-medium">Interactive Elements</p>
                          <p className="text-xs text-gray-500">
                            Simulated taps/interactions increase engagement by 18%
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Performance Insights Tab */}
              {activeTab === "insights" && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Performance Insights for Demo Creatives</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium">Optimal Duration</h5>
                      <p className="text-sm text-gray-500">
                        Demo creatives between 15-25 seconds perform 34% better than shorter or longer videos
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Visual Style Impact</h5>
                      <p className="text-sm text-gray-500">
                        High-contrast, saturated color schemes outperform muted palettes by 27% in CPI
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Sound Design</h5>
                      <p className="text-sm text-gray-500">
                        Creatives with satisfying sound effects for achievements show 19% higher engagement
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Call-to-Action Placement</h5>
                      <p className="text-sm text-gray-500">
                        CTAs that appear after a major achievement or reward have 23% higher click-through rates
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BriefGenerator;
