import { useState } from "react";
import { Loader2 } from "lucide-react";
import Layout from "../Layout";
import { PDFViewer } from "./PDFViewer";

const generateMockConcepts = (values) => {
  const templates = {
    action: {
      title: `${
        values.platform === "mobile" ? "Tap" : "Battle"
      } Heroes: Ultimate ${
        values.genre.charAt(0).toUpperCase() + values.genre.slice(1)
      }`,
      coreGameplay: [
        "Fast-paced combat with combo system",
        "Character progression through equipment and skills",
        "PvE campaign with boss battles",
        "Optional PvP arenas for competitive play",
      ],
      uniqueSellingPoints: [
        "Innovative combo system that rewards skill",
        "Deep customization options for character builds",
        "Cross-platform play between mobile and PC",
      ],
      monetizationSummary:
        values.monetization === "premium"
          ? "Premium title with optional cosmetic DLC packages"
          : "Free-to-play with battle pass seasons and cosmetic items",
      marketFitRationale: `Appeals to ${values.audience} gamers looking for quick sessions with depth`,
    },
    rpg: {
      title: values.themeMood.includes("fantasy")
        ? "Ethereal Realms: Legacy"
        : "Cosmic Odyssey: New Dawn",
      coreGameplay: [
        "Character creation with multiple class options",
        "Open world exploration with side quests",
        "Narrative-driven main storyline with choices",
        "Crafting and economy system",
      ],
      uniqueSellingPoints: [
        "Branching storyline with meaningful consequences",
        "Dynamic world that evolves based on player actions",
        "Innovative companion system with deep relationships",
      ],
      monetizationSummary:
        values.monetization === "subscription"
          ? "Monthly subscription with regular content updates"
          : "Base game purchase with expansion packs",
      marketFitRationale: `Deep storytelling and progression systems appeal to ${values.audience} audience`,
    },
    puzzle: {
      title: `Mind Maze: ${
        values.platform === "mobile" ? "Pocket" : "Ultimate"
      } Edition`,
      coreGameplay: [
        "Progressive puzzle difficulty with tutorials",
        "Daily challenges with leaderboards",
        "Unlockable puzzle types and themes",
        "Time-based challenge modes",
      ],
      uniqueSellingPoints: [
        "Unique puzzle mechanics not seen in other games",
        "Adaptive difficulty system that matches player skill",
        "Social sharing features for puzzle solutions",
      ],
      monetizationSummary:
        values.monetization === "ads"
          ? "Ad-supported free game with premium ad-free option"
          : "Free-to-play with hint packs and theme bundles",
      marketFitRationale: `Perfect for ${values.audience} looking for mental challenges in short sessions`,
    },
  };

  const concepts = [];

  const baseTemplate = templates[values.genre] || templates.action;

  concepts.push({
    ...baseTemplate,
    title: baseTemplate.title,
  });

  concepts.push({
    ...baseTemplate,
    title:
      values.themeMood.split(" ").slice(0, 2).join(" ") +
      ": " +
      baseTemplate.title.split(":")[1],
    coreGameplay: [...baseTemplate.coreGameplay].reverse(),
    uniqueSellingPoints: [
      ...baseTemplate.uniqueSellingPoints.slice(1),
      "Revolutionary social features for community building",
    ],
  });

  concepts.push({
    ...baseTemplate,
    title: `${values.audience === "kids" ? "Fun" : "Epic"} ${
      values.genre.charAt(0).toUpperCase() + values.genre.slice(1)
    }: ${
      values.platform.charAt(0).toUpperCase() + values.platform.slice(1)
    } Adventures`,
    coreGameplay: [
      ...baseTemplate.coreGameplay.slice(0, 2),
      "Unique progression system tied to player skill",
      "Seasonal events with exclusive rewards",
    ],
    uniqueSellingPoints: [
      "Accessibility features for all player types",
      ...baseTemplate.uniqueSellingPoints.slice(0, 2),
    ],
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

  return errors;
};

export default function ConceptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameConcepts, setGameConcepts] = useState([]);
  const [formValues, setFormValues] = useState({
    genre: "puzzle",
    monetization: "freemium",
    platform: "mobile",
    audience: "casual",
    referenceGames: "",
    themeMood: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const concepts = generateMockConcepts(formValues);
      setGameConcepts(concepts);
      setPdfUrl(
        "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/queryPac-lite/%5BHC%5D%5BTM%5D+Feature+Spec_+Lucky+Shovel.pdf"
      );
    } catch (error) {
      console.error("Error generating game concepts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-8">
        {
          <div
            className={`mb-8 flex flex-col ${
              pdfUrl ? "" : "items-center align-center"
            }`}
          >
            <h1 className="text-3xl font-bold mb-2">Game Concept Generator</h1>
            <p className="text-muted-foreground">
              Generate game concepts based on your preferences and requirements
            </p>
          </div>
        }

        <div
          className={`${
            pdfUrl ? "grid gap-8 grid-cols-2 lg:grid-cols-2" : "w-[800px] mx-auto"
          }`}
        >
          <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Input Parameters</h3>
              <p className="text-sm text-muted-foreground">
                Fill in the form to generate game concepts
              </p>
            </div>

            <div className="px-6 pb-4">
              <div className="p-4 bg-gray-50 rounded-md border">
                <h4 className="font-medium text-sm mb-2">
                  Deep Research Resources
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Explore these resources to enhance your game concept
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href="https://www.deconstructoroffun.com/blog/2023/9/30/tile-match-the-new-match-3-or-the-new-merge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black text-white rounded-md hover:opacity-90 overflow-hidden"
                  >
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3v18h18" />
                            <path d="m19 9-5 5-4-4-3 3" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">
                          Tile Match: The new Match-3 or the new Merge?
                        </h5>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://www.deconstructoroffun.com/blog/2023/12/1/tile-busters-leaving-the-reddest-ocean-to-find-a-blue-spot?rq=tile%20match"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black text-white rounded-md hover:opacity-90 overflow-hidden"
                  >
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12h5" />
                            <path d="M17 12h5" />
                            <path d="M9 7v10" />
                            <path d="M15 7v10" />
                            <path d="M12 22v-6" />
                            <path d="M12 8V2" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">
                          Tile Busters: Leaving The Reddest Ocean To Find A Blue
                          Spot
                        </h5>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://www.deconstructoroffun.com/blog/2023/10/15/zen-match-how-a-first-mover-falls-behind?rq=tile%20match"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black text-white rounded-md hover:opacity-90 overflow-hidden"
                  >
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19.5 8.5V2h-7v11" />
                            <path d="M19.5 11.5v-3h-7v11h7v-4" />
                            <path d="M12.5 13v4h-3" />
                            <path d="M9.5 13v2h3" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">
                          The Zen Match Case: How a First Mover Fell Behind
                        </h5>
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://www.pocketgamer.biz/game-analysis-deconstructing-spyke-games-tile-busters/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black text-white rounded-md hover:opacity-90 overflow-hidden"
                  >
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
                            <path d="M12 14H9v3h6v-3h-3z" />
                            <path d="M9 5v8" />
                            <path d="M15 5v8" />
                            <path d="M12 5v3" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">
                          Deconstructing Spyke Games' Tile Busters |
                          PocketGamer.biz
                        </h5>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-sm font-medium mb-1"
                  >
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    className="w-full p-2 border rounded-md"
                    value={formValues.genre}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select a genre
                    </option>
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
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.genre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="monetization"
                    className="block text-sm font-medium mb-1"
                  >
                    Monetization Model
                  </label>
                  <select
                    id="monetization"
                    name="monetization"
                    className="w-full p-2 border rounded-md"
                    value={formValues.monetization}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select a monetization model
                    </option>
                    <option value="premium">Premium (Paid)</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="ads">Ad-supported</option>
                    <option value="iap">In-app Purchases</option>
                  </select>
                  {formErrors.monetization && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.monetization.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="platform"
                    className="block text-sm font-medium mb-1"
                  >
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    className="w-full p-2 border rounded-md"
                    value={formValues.platform}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select a platform
                    </option>
                    <option value="mobile">Mobile</option>
                    <option value="pc">PC</option>
                    <option value="console">Console</option>
                    <option value="vr">VR</option>
                    <option value="ar">AR</option>
                    <option value="multiplatform">Multiplatform</option>
                  </select>
                  {formErrors.platform && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.platform.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="audience"
                    className="block text-sm font-medium mb-1"
                  >
                    Target Audience
                  </label>
                  <select
                    id="audience"
                    name="audience"
                    className="w-full p-2 border rounded-md"
                    value={formValues.audience}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select a target audience
                    </option>
                    <option value="casual">Casual Gamers</option>
                    <option value="hardcore">Hardcore Gamers</option>
                    <option value="kids">Children</option>
                    <option value="teenagers">Teenagers</option>
                    <option value="adults">Adults</option>
                    <option value="seniors">Seniors</option>
                  </select>
                  {formErrors.audience && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.audience.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="referenceGames"
                    className="block text-sm font-medium mb-1"
                  >
                    Reference Games (Optional)
                  </label>
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
                    Enter comma-separated game titles that can serve as
                    inspiration
                  </p>
                  {formErrors.referenceGames && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.referenceGames.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="themeMood"
                    className="block text-sm font-medium mb-1"
                  >
                    Theme/Mood Description (optional)
                  </label>
                  <textarea
                    id="themeMood"
                    name="themeMood"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Describe the theme, mood, or setting you're interested in..."
                    value={formValues.themeMood}
                    onChange={handleInputChange}
                  />
                  {formErrors.themeMood && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.themeMood.message}
                    </p>
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

          {pdfUrl && <PDFViewer pdfUrl={pdfUrl} />}
        </div>
      </div>
    </Layout>
  );
}
