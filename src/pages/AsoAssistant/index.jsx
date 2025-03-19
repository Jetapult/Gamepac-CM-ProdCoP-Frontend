import React, { useState, useEffect, useMemo } from "react";
import AppIconGenerator from "./components/AppIconGenerator";
import AsoTextGenerator from "./components/AsoTextGenerator";
import AdCopyGenerator from "./components/AdCopyGenerator";
import VideoGenerator from "./components/VideoGenerator";
import PlayableGenerator from "./components/PlayableGenerator";
import StaticAdGenerator from "./components/StaticAdGenerator";
import { useSelector } from "react-redux";
import api from "../../api";
import NoData from "../../components/NoData";
import { PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { ChevronDown } from "lucide-react";
import GamesDropdown from "../OrganicUA/components/smartFeedback/GamesDropdown";
import { useNavigate, useParams } from "react-router-dom";
import ToastMessage from "../../components/ToastMessage";
import ASOCompetitorAnalysis from "./components/CompetitorAnalysis";

const tabConfig = [
  // {
  //   label: "UA Static Ads",

  //   slug: "static-ads",
  // },
  { 
    label: "App Icon", 
    slug: "app-icon", 
  },
  {
    label: "ASO Texts",
    slug: "aso-texts",
  },
  { 
    label: "Ad Copies", 
    slug: "ad-copies", 
  },
//   { 
//     label: "Videos", 
//     slug: "videos", 
//   },
  { 
    label: "Playables", 
    slug: "playables", 
  },
  {
    label: "Competitor Analysis",
    slug: "competitor-analysis",
  },
];

// Create a separate component for the tab content
const TabContent = React.memo(({ currentTab, selectedGame, toastMessage, setToastMessage, studioId }) => {
  switch (currentTab) {
    case "static-ads":
      return <StaticAdGenerator game={selectedGame} setToastMessage={setToastMessage} />;
    case "app-icon":
      return <AppIconGenerator game={selectedGame} />;
    case "aso-texts":
      return (
        <AsoTextGenerator
          selectedGame={selectedGame}
          toastMessage={toastMessage}
          setToastMessage={setToastMessage}
        />
      );
    case "ad-copies":
      return <AdCopyGenerator game={selectedGame} />;
    case "videos":
      return <VideoGenerator game={selectedGame} />;
    case "playables":
      return <PlayableGenerator />;
    case "competitor-analysis":
      return <ASOCompetitorAnalysis studioId={studioId} game={selectedGame} />;
    default:
      return <StaticAdGenerator game={selectedGame} />;
  }
});

const AsoAssistant = () => {
  const [currentTab, setCurrentTab] = useState("app-icon");
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTab, setSelectedTab] = useState("android");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const studioSlug = localStorage.getItem("selectedStudio") || userData?.slug;
  const studioId = userData?.studio_type?.includes("studio_manager")
    ? studios.filter((x) => x.slug === studioSlug)[0]?.id
    : userData?.studio_id;
  const params = useParams();
  const navigate = useNavigate();

  const tabItems = useMemo(() => tabConfig, []);

  const fetchAllgames = async () => {
    try {
      const response = await api.get(`/v1/games`);
      setGames(response.data.data);
      setSelectedGame(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/games/platform/${studioSlug}`);
      setGames(response.data.data);
      setSelectedGame(response.data.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching games:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData.id) {
      if (userData?.studio_type?.includes("studio_manager")) {
        fetchAllgames();
      } else {
        fetchGames();
      }
    }
  }, [userData]);

  const handleTabChange = (item, index) => {
    setCurrentTab(item.slug);
    navigate(`/aso-assistant/${item.slug}`);
  };

  useEffect(() => {
    if (params.studio_slug) {
      setCurrentTab(params.studio_slug);
    }
  }, [params.studio_slug]);

  return (
    <div className="mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/6">
          <GamesDropdown
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            games={games}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            setGames={setGames}
            studio_slug={studioSlug}
          />
        </div>

        <div className="w-full md:w-3/4">
          {selectedGame ? (
            <>
              <div className="flex items-start mb-6">
                {(selectedGame.play_store_icon ||
                  selectedGame.app_store_icon) &&
                  (selectedTab === "android" ? (
                    <img
                      src={selectedGame?.play_store_icon}
                      alt={selectedGame.game_name}
                      className="w-16 h-16 mr-4 rounded-lg"
                    />
                  ) : (
                    <img
                      src={selectedGame?.app_store_icon}
                      alt={selectedGame.game_name}
                      className="w-16 h-16 mr-4 rounded-lg"
                    />
                  ))}
                <h1 className="text-4xl font-bold">{selectedGame.game_name}</h1>
              </div>

              <div className="">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    {tabItems.map((item, index) => (
                      <button
                        key={index}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                          currentTab === item.slug
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => handleTabChange(item, index)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="py-6">
                  <TabContent 
                    currentTab={currentTab}
                    selectedGame={selectedGame}
                    toastMessage={toastMessage}
                    setToastMessage={setToastMessage}
                    studioId={studioId}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold mb-4">
                Welcome to ASO Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Select a game from the left panel to get started with generating
                marketing assets.
              </p>
              {games.length === 0 && !loading && (
                <NoData
                  type="game"
                  next={() => navigate(`/${studioSlug}/dashboard`)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default AsoAssistant;
