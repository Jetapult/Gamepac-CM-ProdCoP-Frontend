import { useState } from "react"
import { Download, Copy, RefreshCw } from "lucide-react"
import Layout from "../Layout"

export default function TranslatorPage() {
  const getProjectId = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };
  
  const projectId = getProjectId();

  const [selectedSection, setSelectedSection] = useState("gameLoop")
  const [activeTab, setActiveTab] = useState("flowchart")
  const [showCritique, setShowCritique] = useState(true)

  const projectData = {
    title:
      projectId === "project-1"
        ? "Space Explorer RPG"
        : projectId === "project-2"
          ? "Puzzle Adventure"
          : projectId === "project-3"
            ? "Strategy Conquest"
            : "New Game Project",
  }

  const gameLoopFlowchart = `
graph TD
    A["Start Game"] --> B["Explore Planet"]
    B --> C["Discover Resources"]
    C --> D["Gather Resources"]
    D --> E["Return to Base"]
    E --> F["Craft/Upgrade Equipment"]
    F --> G["Research Technology"]
    G --> H["Unlock New Areas"]
    H --> B
  `

  const economyFlowchart = `
graph TD
    A["Resource Collection"] --> B["Raw Materials"]
    B --> C["Processing"]
    C --> D["Refined Materials"]
    D --> E["Crafting"]
    E --> F["Equipment/Items"]
    F --> G["Use in Gameplay"]
    G --> H["Wear/Consumption"]
    H --> A
    B --> I["Trading"]
    D --> I
    I --> J["Currency"]
    J --> E
  `

  const uiFlowchart = `
graph TD
    A["Main Menu"] --> B["Game World"]
    B --> C["Inventory Screen"]
    C --> B
    B --> D["Crafting Interface"]
    D --> B
    B --> E["Map Screen"]
    E --> B
    B --> F["Character Stats"]
    F --> B
    B --> G["Quest Log"]
    G --> B
    B --> H["Pause Menu"]
    H --> A
    H --> B
  `

  const getFlowchartForSection = () => {
    switch (selectedSection) {
      case "gameLoop":
        return gameLoopFlowchart
      case "economy":
        return economyFlowchart
      case "uiFlow":
        return uiFlowchart
      default:
        return gameLoopFlowchart
    }
  }

  const getJsonForSection = () => {
    switch (selectedSection) {
      case "gameLoop":
        return JSON.stringify(
          {
            name: "Game Loop",
            steps: [
              { id: "explore", name: "Explore Planet", next: ["discover"] },
              { id: "discover", name: "Discover Resources", next: ["gather"] },
              { id: "gather", name: "Gather Resources", next: ["return"] },
              { id: "return", name: "Return to Base", next: ["craft"] },
              { id: "craft", name: "Craft/Upgrade Equipment", next: ["research"] },
              { id: "research", name: "Research Technology", next: ["unlock"] },
              { id: "unlock", name: "Unlock New Areas", next: ["explore"] },
            ],
          },
          null,
          2,
        )
      case "economy":
        return JSON.stringify(
          {
            name: "Economy System",
            resources: [
              { id: "raw", name: "Raw Materials", sources: ["mining", "harvesting"] },
              { id: "refined", name: "Refined Materials", sources: ["processing"] },
              { id: "currency", name: "Credits", sources: ["trading", "missions"] },
            ],
            processes: [
              { id: "processing", inputs: ["raw"], outputs: ["refined"], ratio: 2 },
              { id: "crafting", inputs: ["refined", "currency"], outputs: ["equipment"] },
              { id: "trading", inputs: ["raw", "refined"], outputs: ["currency"] },
            ],
          },
          null,
          2,
        )
      case "uiFlow":
        return JSON.stringify(
          {
            name: "UI Navigation",
            screens: [
              { id: "main", name: "Main Menu", connections: ["game"] },
              {
                id: "game",
                name: "Game World",
                connections: ["inventory", "crafting", "map", "character", "quests", "pause"],
              },
              { id: "inventory", name: "Inventory Screen", connections: ["game"] },
              { id: "crafting", name: "Crafting Interface", connections: ["game"] },
              { id: "map", name: "Map Screen", connections: ["game"] },
              { id: "character", name: "Character Stats", connections: ["game"] },
              { id: "quests", name: "Quest Log", connections: ["game"] },
              { id: "pause", name: "Pause Menu", connections: ["main", "game"] },
            ],
          },
          null,
          2,
        )
      default:
        return "{}"
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Design Translator: {projectData.title}</h1>
            <p className="text-muted-foreground">
              Visualize and export your game design as diagrams, flowcharts, and data
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="border rounded-lg shadow-sm mb-6 bg-white">
              <div className="p-4 flex justify-between items-center pb-3 border-b">
                <h3 className="text-xl font-semibold">Design Translator</h3>
                <select 
                  className="border rounded-md p-2 w-[200px]"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="gameLoop">Game Loop</option>
                  <option value="economy">Economy System</option>
                  <option value="uiFlow">UI Flow</option>
                </select>
              </div>
              <div className="p-6">
                <div>
                  <div className="border rounded-md flex mb-4 p-2">
                    <button 
                      className={`px-3 py-1 rounded-md mr-2 ${activeTab === "flowchart" ? "bg-gray-200" : "hover:bg-gray-200"}`}
                      onClick={() => setActiveTab("flowchart")}
                    >
                      Flowchart
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md mr-2 ${activeTab === "json" ? "bg-gray-200" : "hover:bg-gray-200"}`}
                      onClick={() => setActiveTab("json")}
                    >
                      JSON Data
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md mr-2 ${activeTab === "code" ? "bg-gray-200" : "hover:bg-gray-200"}`}
                      onClick={() => setActiveTab("code")}
                    >
                      Pseudo-Code
                    </button>
                  </div>

                  {activeTab === "flowchart" && (
                    <div className="bg-card border rounded-md p-4 min-h-[500px] flex flex-col">
                      <div className="flex justify-end mb-4 gap-2">
                        <button className="px-4 py-2 border rounded-md text-sm flex items-center hover:bg-accent">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </button>
                        <button className="px-4 py-2 border rounded-md text-sm flex items-center hover:bg-accent">
                          <Download className="h-4 w-4 mr-2" />
                          Export as PNG
                        </button>
                      </div>

                      <div className="flex-1 bg-background rounded-md p-4 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{getFlowchartForSection()}</pre>

                        <div className="mt-4 border border-dashed rounded-md p-8 flex items-center justify-center min-h-[300px]">
                          <p className="text-muted-foreground text-center">
                            [Flowchart visualization would render here using Mermaid.js]
                            <br />
                            <span className="text-sm">
                              The diagram would show the{" "}
                              {selectedSection === "gameLoop"
                                ? "game loop"
                                : selectedSection === "economy"
                                  ? "economy system"
                                  : "UI navigation flow"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "json" && (
                    <div className="bg-card border rounded-md p-4 min-h-[500px] flex flex-col">
                      <div className="flex justify-end mb-4 gap-2">
                        <button className="px-4 py-2 border rounded-md text-sm flex items-center hover:bg-accent">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy JSON
                        </button>
                        <button className="px-4 py-2 border rounded-md text-sm flex items-center hover:bg-accent">
                          <Download className="h-4 w-4 mr-2" />
                          Download JSON
                        </button>
                      </div>

                      <div className="flex-1 bg-background rounded-md p-4 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{getJsonForSection()}</pre>
                      </div>
                    </div>
                  )}

                  {activeTab === "code" && (
                    <div className="bg-card border rounded-md p-4 min-h-[500px] flex flex-col">
                      <div className="flex justify-end mb-4 gap-2">
                        <button className="px-4 py-2 border rounded-md text-sm flex items-center hover:bg-accent">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </button>
                      </div>

                      <div className="flex-1 bg-background rounded-md p-4 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {selectedSection === "gameLoop" ? `
// Game Loop Pseudo Code
function gameLoop() {
  while (gameIsRunning) {
    let planet = explorePlanet();
    let resources = discoverResources(planet);
    let gatheredResources = gatherResources(resources);
    
    returnToBase(gatheredResources);
    let newEquipment = craftEquipment(gatheredResources);
    let newTech = researchTechnology(gatheredResources);
    
    unlockNewAreas(newTech);
  }
}` : selectedSection === "economy" ? `
// Economy System Pseudo Code
class EconomySystem {
  constructor() {
    this.rawMaterials = [];
    this.refinedMaterials = [];
    this.currency = 0;
  }
  
  collectResources(location) {
    this.rawMaterials = this.rawMaterials.concat(location.harvest());
  }
  
  processResources() {
    if (this.rawMaterials.length >= 2) {
      this.rawMaterials.splice(0, 2);
      this.refinedMaterials.push(new RefinedMaterial());
    }
  }
  
  craftItem(blueprint) {
    if (this.refinedMaterials.length >= blueprint.cost.refined && 
        this.currency >= blueprint.cost.currency) {
      this.refinedMaterials.splice(0, blueprint.cost.refined);
      this.currency -= blueprint.cost.currency;
      return new Item(blueprint);
    }
    return null;
  }
  
  tradeResources(market) {
    let offer = market.getOffer(this.rawMaterials, this.refinedMaterials);
    if (offer.acceptable) {
      this.rawMaterials = offer.remainingRaw;
      this.refinedMaterials = offer.remainingRefined;
      this.currency += offer.currency;
    }
  }
}` : `
// UI Navigation Pseudo Code
class UISystem {
  constructor() {
    this.currentScreen = "main";
    this.screenStack = [];
  }
  
  navigate(targetScreen) {
    this.screenStack.push(this.currentScreen);
    this.currentScreen = targetScreen;
    this.render();
  }
  
  back() {
    if (this.screenStack.length > 0) {
      this.currentScreen = this.screenStack.pop();
      this.render();
    }
  }
  
  render() {
    hideAllScreens();
    
    switch(this.currentScreen) {
      case "main":
        showMainMenu();
        break;
      case "game":
        showGameWorld();
        break;
      case "inventory":
        showInventory();
        break;
      case "crafting":
        showCrafting();
        break;
      // other screens...
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg shadow-sm bg-white">
                <div className="p-4 pb-2 border-b">
                  <h3 className="text-xl font-semibold">Export Options</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full p-2 border rounded-md hover:bg-accent flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PNG
                  </button>
                  <button className="w-full p-2 border rounded-md hover:bg-accent flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export as SVG
                  </button>
                  <button className="w-full p-2 border rounded-md hover:bg-accent flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </button>
                </div>
              </div>

              <div className="border rounded-lg shadow-sm bg-white">
                <div className="p-4 pb-2 border-b">
                  <h3 className="text-xl font-semibold">Integrations</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full p-2 border rounded-md hover:bg-accent text-left">
                    Figma Plugin
                  </button>
                  <button className="w-full p-2 border rounded-md hover:bg-accent text-left">
                    Unity Integration
                  </button>
                  <button className="w-full p-2 border rounded-md hover:bg-accent text-left">
                    Unreal Engine Integration
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showCritique && (
            <div className="w-80 shrink-0">
              <div className="border rounded-lg shadow-sm h-full bg-white">
                <div className="p-4 flex flex-row items-center justify-between pb-2 border-b">
                  <h3 className="text-md font-medium">AI Insights</h3>
                  <button 
                    className="p-1 rounded-md hover:bg-accent"
                    onClick={() => setShowCritique(false)}
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-4">Analysis for: {selectedSection === "gameLoop" ? "Game Loop" : selectedSection === "economy" ? "Economy System" : "UI Flow"}</h3>

                  <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium text-sm mb-2">Design Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSection === "gameLoop"
                          ? "Your game loop creates a solid cycle of exploration, gathering, and progression. Consider adding branching paths for player choice."
                          : selectedSection === "economy"
                            ? "The economy system has good resource flow but might need balancing for inflation as players progress."
                            : "UI navigation is well-structured. Consider adding shortcuts between frequently used screens."}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium text-sm mb-2">Technical Considerations</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSection === "gameLoop"
                          ? "Implement save points after major progression milestones to prevent player frustration."
                          : selectedSection === "economy"
                            ? "Cache resource calculations to optimize performance when processing large resource pools."
                            : "Consider memory usage when transitioning between UI screens with complex elements."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
