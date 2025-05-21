import { useState } from "react"
import { Loader2 } from "lucide-react"
import Layout from "../Layout"
import { PDFViewer } from "./PDFViewer";

const generateMockConcepts = (values) => {
  const templates = {
    action: {
      title: `${values.platform === "mobile" ? "Tap" : "Battle"} Heroes: Ultimate ${values.genre.charAt(0).toUpperCase() + values.genre.slice(1)}`,
      coreGameplay: [
        "Fast-paced combat with combo system",
        "Character progression through equipment and skills",
        "PvE campaign with boss battles",
        "Optional PvP arenas for competitive play"
      ],
      uniqueSellingPoints: [
        "Innovative combo system that rewards skill",
        "Deep customization options for character builds",
        "Cross-platform play between mobile and PC"
      ],
      monetizationSummary: values.monetization === "premium" 
        ? "Premium title with optional cosmetic DLC packages" 
        : "Free-to-play with battle pass seasons and cosmetic items",
      marketFitRationale: `Appeals to ${values.audience} gamers looking for quick sessions with depth`
    },
    rpg: {
      title: values.themeMood.includes("fantasy") 
        ? "Ethereal Realms: Legacy" 
        : "Cosmic Odyssey: New Dawn",
      coreGameplay: [
        "Character creation with multiple class options",
        "Open world exploration with side quests",
        "Narrative-driven main storyline with choices",
        "Crafting and economy system"
      ],
      uniqueSellingPoints: [
        "Branching storyline with meaningful consequences",
        "Dynamic world that evolves based on player actions",
        "Innovative companion system with deep relationships"
      ],
      monetizationSummary: values.monetization === "subscription" 
        ? "Monthly subscription with regular content updates" 
        : "Base game purchase with expansion packs",
      marketFitRationale: `Deep storytelling and progression systems appeal to ${values.audience} audience`
    },
    puzzle: {
      title: `Mind Maze: ${values.platform === "mobile" ? "Pocket" : "Ultimate"} Edition`,
      coreGameplay: [
        "Progressive puzzle difficulty with tutorials",
        "Daily challenges with leaderboards",
        "Unlockable puzzle types and themes",
        "Time-based challenge modes"
      ],
      uniqueSellingPoints: [
        "Unique puzzle mechanics not seen in other games",
        "Adaptive difficulty system that matches player skill",
        "Social sharing features for puzzle solutions"
      ],
      monetizationSummary: values.monetization === "ads" 
        ? "Ad-supported free game with premium ad-free option" 
        : "Free-to-play with hint packs and theme bundles",
      marketFitRationale: `Perfect for ${values.audience} looking for mental challenges in short sessions`
    }
  };

  const concepts = [];
  
  const baseTemplate = templates[values.genre] || templates.action;
  
  concepts.push({
    ...baseTemplate,
    title: baseTemplate.title
  });
  
  concepts.push({
    ...baseTemplate,
    title: values.themeMood.split(" ").slice(0, 2).join(" ") + ": " + baseTemplate.title.split(":")[1],
    coreGameplay: [...baseTemplate.coreGameplay].reverse(),
    uniqueSellingPoints: [
      ...baseTemplate.uniqueSellingPoints.slice(1),
      "Revolutionary social features for community building"
    ]
  });
  
  concepts.push({
    ...baseTemplate,
    title: `${values.audience === "kids" ? "Fun" : "Epic"} ${values.genre.charAt(0).toUpperCase() + values.genre.slice(1)}: ${values.platform.charAt(0).toUpperCase() + values.platform.slice(1)} Adventures`,
    coreGameplay: [
      ...baseTemplate.coreGameplay.slice(0, 2),
      "Unique progression system tied to player skill",
      "Seasonal events with exclusive rewards"
    ],
    uniqueSellingPoints: [
      "Accessibility features for all player types",
      ...baseTemplate.uniqueSellingPoints.slice(0, 2)
    ]
  });
  
  return concepts;
};

const validateForm = (values) => {
  const errors = {};
  
  if (!values.genre) {
    errors.genre = { message: "Please select a genre" };
  }
  
  if (!values.monetization) {
    errors.monetization = { message: "Please select a monetization model" };
  }
  
  if (!values.platform) {
    errors.platform = { message: "Please select a platform" };
  }
  
  if (!values.audience) {
    errors.audience = { message: "Please select a target audience" };
  }
  
  if (values.themeMood && values.themeMood.length < 10) {
    errors.themeMood = { message: "Please describe the theme/mood in at least 10 characters" };
  } else if (!values.themeMood) {
    errors.themeMood = { message: "Theme/mood description is required" };
  }
  
  return errors;
};

export default function ConceptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [gameConcepts, setGameConcepts] = useState([])
  const [formValues, setFormValues] = useState({
    genre: "",
    monetization: "",
    platform: "",
    audience: "",
    referenceGames: "",
    themeMood: "",
  })
  const [formErrors, setFormErrors] = useState({})
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formValues);
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const concepts = generateMockConcepts(formValues);
      setGameConcepts(concepts);
    } catch (error) {
      console.error("Error generating game concepts:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Game Concept Generator</h1>
          <p className="text-muted-foreground">Generate game concepts based on your preferences and requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="border rounded-lg shadow-sm bg-white">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-semibold">Input Parameters</h3>
                <p className="text-sm text-muted-foreground">Fill in the form to generate game concepts</p>
              </div>

              <div className="px-6 pb-4">
                <div className="p-4 bg-gray-50 rounded-md border">
                  <h4 className="font-medium text-sm mb-2">Deep Research Resources</h4>
                  <p className="text-xs text-muted-foreground mb-3">Explore these resources to enhance your game concept</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href="https://www.gamedeveloper.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 bg-black text-white rounded-md hover:opacity-90 text-center"
                    >
                      Link 1
                    </a>
                    <a 
                      href="https://www.gamesindustry.biz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 bg-black text-white rounded-md hover:opacity-90 text-center"
                    >
                      Link 2
                    </a>
                    <a 
                      href="https://www.ign.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 bg-black text-white rounded-md hover:opacity-90 text-center"
                    >
                      Link 3
                    </a>
                    <a 
                      href="https://www.gamespot.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-2 bg-black text-white rounded-md hover:opacity-90 text-center"
                    >
                      Link 4
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium mb-1">Genre</label>
                    <select
                      id="genre"
                      name="genre"
                      className="w-full p-2 border rounded-md"
                      value={formValues.genre}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a genre</option>
                      <option value="action">Action</option>
                      <option value="adventure">Adventure</option>
                      <option value="rpg">RPG</option>
                      <option value="strategy">Strategy</option>
                      <option value="simulation">Simulation</option>
                      <option value="puzzle">Puzzle</option>
                      <option value="casual">Casual</option>
                      <option value="sports">Sports</option>
                      <option value="racing">Racing</option>
                      <option value="shooter">Shooter</option>
                    </select>
                    {formErrors.genre && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.genre.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="monetization" className="block text-sm font-medium mb-1">Monetization Model</label>
                    <select
                      id="monetization"
                      name="monetization"
                      className="w-full p-2 border rounded-md"
                      value={formValues.monetization}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a monetization model</option>
                      <option value="premium">Premium (Paid)</option>
                      <option value="freemium">Freemium</option>
                      <option value="subscription">Subscription</option>
                      <option value="ads">Ad-supported</option>
                      <option value="iap">In-app Purchases</option>
                    </select>
                    {formErrors.monetization && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.monetization.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="platform" className="block text-sm font-medium mb-1">Platform</label>
                    <select
                      id="platform"
                      name="platform"
                      className="w-full p-2 border rounded-md"
                      value={formValues.platform}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a platform</option>
                      <option value="mobile">Mobile</option>
                      <option value="pc">PC</option>
                      <option value="console">Console</option>
                      <option value="vr">VR</option>
                      <option value="ar">AR</option>
                      <option value="multiplatform">Multiplatform</option>
                    </select>
                    {formErrors.platform && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.platform.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium mb-1">Target Audience</label>
                    <select
                      id="audience"
                      name="audience"
                      className="w-full p-2 border rounded-md"
                      value={formValues.audience}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a target audience</option>
                      <option value="casual">Casual Gamers</option>
                      <option value="hardcore">Hardcore Gamers</option>
                      <option value="kids">Children</option>
                      <option value="teenagers">Teenagers</option>
                      <option value="adults">Adults</option>
                      <option value="seniors">Seniors</option>
                    </select>
                    {formErrors.audience && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.audience.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="referenceGames" className="block text-sm font-medium mb-1">Reference Games (Optional)</label>
                    <input
                      id="referenceGames"
                      name="referenceGames"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Minecraft, Fortnite, Candy Crush"
                      value={formValues.referenceGames}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter comma-separated game titles that can serve as inspiration
                    </p>
                    {formErrors.referenceGames && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.referenceGames.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="themeMood" className="block text-sm font-medium mb-1">Theme/Mood Description</label>
                    <textarea
                      id="themeMood"
                      name="themeMood"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Describe the theme, mood, or setting you're interested in..."
                      value={formValues.themeMood}
                      onChange={handleInputChange}
                    />
                    {formErrors.themeMood && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.themeMood.message}</p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-[#b9ff66] rounded-md disabled:opacity-50 hover:bg-primary/90"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Generating Concepts...
                      </>
                    ) : (
                      "Generate Game Concepts"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div>
            <PDFViewer pdfUrl={"https://gamepacbucket.s3.amazonaws.com/production/studioAssets/jetapult/queryPac-lite/2025_Game_Developer_Survey_Report.pdf"} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
