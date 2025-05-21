import { useState } from "react"
import { FileDown, Share2, Sparkles } from "lucide-react"
import Layout from "../Layout"
import { GDDEditor } from "../components/gdd/GDDEditor"
import { AICritiquePanel } from "../components/gdd/AICritiquePanel"

const gddSections = [
  {
    id: "overview",
    title: "Game Overview",
    content:
      "# Game Overview\n\nThis is a sci-fi RPG set in a distant galaxy where players explore uncharted planets, gather resources, and build their own space stations. The game combines elements of exploration, resource management, and character progression.",
  },
  {
    id: "mechanics",
    title: "Game Mechanics",
    content:
      "# Game Mechanics\n\n## Core Gameplay Loop\n\n1. Explore planets to discover resources\n2. Gather resources to upgrade equipment\n3. Use upgraded equipment to explore more dangerous planets\n4. Repeat with increasing difficulty and rewards\n\n## Player Progression\n\nPlayers will progress through skill trees focused on:\n- Exploration\n- Combat\n- Resource Management\n- Technology",
  },
  {
    id: "characters",
    title: "Characters & Story",
    content:
      "# Characters & Story\n\n## Main Character\n\nThe player takes on the role of a space explorer who was part of a failed colonization mission. After being separated from the main fleet, the player must survive and find a way back to civilization.\n\n## Story Arc\n\nThe game follows a three-act structure:\n1. Survival and establishing a base\n2. Discovering the fate of the colonization fleet\n3. Uncovering an ancient alien civilization",
  },
  {
    id: "art",
    title: "Art & Audio",
    content:
      "# Art & Audio\n\n## Visual Style\n\nThe game features a stylized sci-fi aesthetic with vibrant colors for alien flora and fauna, contrasted with the sleek, minimalist design of human technology.\n\n## Audio Design\n\nThe soundtrack will be ambient electronic music that dynamically changes based on the environment and situation. Sound effects will emphasize the alien nature of the environments.",
  },
  {
    id: "economy",
    title: "Economy & Balance",
    content:
      "# Economy & Balance\n\n## Resources\n\n- Energy Crystals: Power equipment and bases\n- Rare Metals: Craft advanced technology\n- Organic Compounds: Create medical supplies\n- Alien Artifacts: Research new technologies\n\n## Economy Loop\n\nResources are gathered from planets and can be refined to increase their value. Players can trade with NPCs or establish automated mining operations for passive income.",
  },
  {
    id: "monetization",
    title: "Monetization",
    content:
      "# Monetization\n\nThe game will use a premium model with a base price of $29.99. Post-launch content will be delivered through expansion packs that add new planets, storylines, and gameplay features.\n\n## Expansion Strategy\n\n- Quarterly updates with free content\n- Major expansions every 6 months (paid)\n- Cosmetic items available as optional DLC",
  },
  {
    id: "ux",
    title: "UX & UI",
    content:
      "# UX & UI\n\n## Interface Design\n\nThe UI will be minimalist and holographic, appearing to float in the game world. Key information will be displayed on the player's suit HUD, while more detailed information will be available through a wrist-mounted device.\n\n## Controls\n\n- WASD for movement\n- Mouse for camera control\n- E for interaction\n- Q for quick inventory\n- Tab for full inventory\n- Space for jump/jetpack",
  },
  {
    id: "technical",
    title: "Technical Specs",
    content:
      "# Technical Specifications\n\n## Platform Requirements\n\n- PC (Windows, Mac, Linux)\n- Minimum Specs: i5 processor, 8GB RAM, GTX 1060\n- Recommended Specs: i7 processor, 16GB RAM, RTX 2070\n\n## Networking\n\nThe game will support co-op multiplayer for up to 4 players with drop-in/drop-out functionality. Player data will be stored on cloud servers with local backups.",
  },
]

export default function GDDProject() {
  // Using window.location.pathname to get params instead of useParams
  const getProjectId = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };
  
  const projectId = getProjectId();

  const [activeSection, setActiveSection] = useState(gddSections[0].id)
  const [sections, setSections] = useState(gddSections)
  const [showCritique, setShowCritique] = useState(true)
  const [activeTab, setActiveTab] = useState("editor")

  // Mock project data based on projectId
  const projectData = {
    title:
      projectId === "project-1"
        ? "Space Explorer RPG"
        : projectId === "project-2"
          ? "Puzzle Adventure"
          : projectId === "project-3"
            ? "Strategy Conquest"
            : "New Game Project",
    lastEdited: "2 days ago",
  }

  const handleContentChange = (sectionId, newContent) => {
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, content: newContent } : section)))
  }

  const handleAIFill = async (sectionId) => {
    // In a real implementation, this would call an AI service
    console.log(`AI Fill requested for section: ${sectionId}`)

    // Mock AI response for demonstration
    const aiContent = `# AI Generated Content for ${sections.find((s) => s.id === sectionId)?.title}\n\nThis is a placeholder for AI-generated content that would be created based on the existing GDD content and the specific section requirements. In a real implementation, this would call an AI service like OpenAI's GPT-4 to generate contextually relevant content for your game design document.`

    handleContentChange(sectionId, aiContent)
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{projectData.title}</h1>
            <p className="text-muted-foreground">Last edited: {projectData.lastEdited}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md flex items-center hover:bg-accent">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </button>
            <button className="px-3 py-1 border rounded-md flex items-center hover:bg-accent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold mb-4">GDD Sections</h2>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeSection === section.id 
                        ? "bg-black text-white" 
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="border rounded-md flex bg-white p-2">
                  <button 
                    className={`px-3 py-1 rounded-md mr-2 ${activeTab === "editor" ? "bg-gray-200" : "hover:bg-gray-200"}`}
                    onClick={() => setActiveTab("editor")}
                  >
                    Editor
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${activeTab === "preview" ? "bg-gray-200" : "hover:bg-gray-200"}`}
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview
                  </button>
                </div>
                <button 
                  className="px-3 py-1 bg-[#B9FF66] border rounded-md flex items-center hover:bg-accent"
                  onClick={() => handleAIFill(activeSection)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Fill Section
                </button>
              </div>

              {activeTab === "editor" && (
                <GDDEditor
                  content={sections.find((s) => s.id === activeSection)?.content || ""}
                  onChange={(content) => handleContentChange(activeSection, content)}
                />
              )}

              {activeTab === "preview" && (
                <div className="border rounded-lg shadow-sm p-6 bg-white">
                  <div className="prose dark:prose-invert max-w-none">
                    {/* In a real implementation, this would render Markdown */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sections
                          .find((s) => s.id === activeSection)
                          ?.content.replace(/\n\n/g, "<br/><br/>")
                          .replace(/\n/g, "<br/>")
                          .replace(/^# (.*)/gm, "<h1>$1</h1>")
                          .replace(/^## (.*)/gm, "<h2>$1</h2>")
                          .replace(/^### (.*)/gm, "<h3>$1</h3>")
                          .replace(/^\d\. (.*)/gm, "<ol><li>$1</li></ol>")
                          .replace(/^- (.*)/gm, "<ul><li>$1</li></ul>"),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {showCritique && (
            <div className="w-80 shrink-0">
              <AICritiquePanel
                sectionId={activeSection}
                sectionTitle={sections.find((s) => s.id === activeSection)?.title || ""}
                onClose={() => setShowCritique(false)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
