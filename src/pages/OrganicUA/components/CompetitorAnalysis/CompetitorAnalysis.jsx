import React, { useEffect, useState } from "react";
import api from "../../../../api";
import {
  ArrowDownRight,
  ArrowUpRight,
  Star,
  RefreshCw,
  Download,
  BarChart,
  LineChart,
  PieChart,
  Filter,
  ChevronDown,
  Search,
  Loader,
} from "lucide-react";
import { XMarkIcon } from "@heroicons/react/20/solid";

const CompetitorAnalysis = ({ studio_slug, userData, studios }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competitorGames, setCompetitorGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [gameReviews, setGameReviews] = useState([]);
  const [openScreenshot, setOpenScreenshot] = useState(null);
  

  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGamesDropdownOpen, setIsGamesDropdownOpen] = useState(false);

  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [isAddNewGamePopupOpen, setIsAddNewGamePopupOpen] = useState(false);
  const studioId = userData?.studio_type?.includes("studio_manager")
    ? studios.filter((x) => x.slug === studio_slug)[0]?.id
    : userData?.studio_id;

  const fetchCompetitorGames = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/competitor-games", {
        params: { studio_id: studioId },
      });
      setCompetitorGames(response.data.data);

      // Select the first game by default
      if (response.data.data.length > 0) {
        setSelectedGame(response.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching competitor games:", err);
      setError("Failed to load competitor games");
    } finally {
      setLoading(false);
    }
  };

  // Fetch game details
  const fetchGameDetails = async (gameId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/competitor-games/${gameId}/data`);
      setGameData(response.data.data);

      // Set default competitors based on the game data
      // This is just a placeholder - you'll need to adjust this based on your actual data structure
      setSelectedCompetitors([response.data.data.competitor_name]);
    } catch (err) {
      console.error("Error fetching game details:", err);
      setError("Failed to load game details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch game reviews
  const fetchGameReviews = async (gameId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/competitor-games/${gameId}/reviews`);
      setGameReviews(response.data.data);
    } catch (err) {
      console.error("Error fetching game reviews:", err);
      setError("Failed to load game reviews");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch sentiment analysis data
  const fetchSentimentAnalysis = async (gameId) => {
    setSentimentLoading(true);
    try {
      const response = await api.get(
        `/v1/competitor-games/${gameId}/sentiment-analysis`
      );
      setSentimentData(response.data.data);
    } catch (err) {
      console.error("Error fetching sentiment analysis:", err);
      setError("Failed to load sentiment analysis");
    } finally {
      setSentimentLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (studioId) {
      fetchCompetitorGames();
    }
  }, [studioId]);

  // Fetch game details and reviews when a game is selected
  useEffect(() => {
    if (selectedGame) {
      fetchGameDetails(selectedGame.id);
      fetchGameReviews(selectedGame.id);
    }
  }, [selectedGame]);

  // Fetch sentiment data when switching to sentiment tab
  useEffect(() => {
    if (activeTab === "sentiment" && selectedGame && !sentimentData) {
      fetchSentimentAnalysis(selectedGame.id);
    }
  }, [activeTab, selectedGame]);

  // Helper function to render star ratings - fixed version
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "fill-black text-black"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Helper function to render trend indicators
  const renderTrend = (value) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span>+{value.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          <span>{value.toFixed(1)}%</span>
        </div>
      );
    }
  };

  // Function to refresh data
  const handleRefreshData = () => {
    if (selectedGame) {
      fetchGameDetails(selectedGame.id);
      fetchGameReviews(selectedGame.id);
    }
  };

  // Helper to get platform data (Android or iOS)
  const getPlatformData = (game) => {
    return game?.android_data || game?.ios_data || null;
  };

  // Helper function to render sentiment score bars
  const renderSentimentScore = (score, label) => {
    // Calculate color based on score
    const getColor = (score) => {
      if (score >= 8) return "bg-green-500";
      if (score >= 5) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${getColor(score)}`}
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !gameData) {
    return (
      <div className="shadow-md bg-white w-full h-full p-4 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2">Loading competitor data...</span>
      </div>
    );
  }

  // Error state
  if (error && !gameData) {
    return (
      <div className="shadow-md bg-white w-full h-full p-4 flex items-center justify-center">
        <div className="text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchCompetitorGames}
            className="mt-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get the platform data for the selected game
  const platformData = gameData ? getPlatformData(gameData) : null;

  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold">Competitor Analysis</h1>
            <p className="text-muted-foreground">
              Compare your app's performance with competitors
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Game selector dropdown with label */}
            <div className="flex flex-col">
              <label
                htmlFor="game-selector"
                className="text-sm font-medium mb-1 text-gray-600"
              >
                Select a game to analyze
              </label>
              <div className="relative">
                <button
                  id="game-selector"
                  className="flex items-center justify-between w-[220px] h-9 px-3 py-2 border rounded-md text-sm"
                  onClick={() => setIsGamesDropdownOpen(!isGamesDropdownOpen)}
                >
                  <span className="truncate">
                    {selectedGame?.competitor_name || "Select a game"}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </button>
                {isGamesDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="py-1">
                      <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 truncate"
                        onClick={() => {
                          setIsAddNewGamePopupOpen(true);
                          setIsGamesDropdownOpen(false);
                        }}
                      >
                        Add New Game
                      </button>
                      {competitorGames.map((game) => (
                        <button
                          key={game.id}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 truncate"
                          onClick={() => {
                            setSelectedGame(game);
                            setIsGamesDropdownOpen(false);
                          }}
                        >
                          {game.competitor_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time Range:</span>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-[120px] h-9 px-3 py-2 border rounded-md text-sm"
                  onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                >
                  <span>{timeRange === "7" ? "Last 7 days" : 
                         timeRange === "30" ? "Last 30 days" :
                         timeRange === "90" ? "Last 90 days" : "Custom"}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {isTimeRangeOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                    <div className="py-1">
                      <button 
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100" 
                        onClick={() => {setTimeRange("7"); setIsTimeRangeOpen(false);}}
                      >
                        Last 7 days
                      </button>
                      <button 
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {setTimeRange("30"); setIsTimeRangeOpen(false);}}
                      >
                        Last 30 days
                      </button>
                      <button 
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {setTimeRange("90"); setIsTimeRangeOpen(false);}}
                      >
                        Last 90 days
                      </button>
                      <button 
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {setTimeRange("custom"); setIsTimeRangeOpen(false);}}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            {/* <button 
              className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-100"
              onClick={handleRefreshData}
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Data
            </button>
            
            <button className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-100">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button> */}
          </div>
        </div>

        {/* Metrics summary cards */}
        {platformData && (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Rating card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">Average Rating</h3>
                <BarChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {platformData.score ? platformData.score.toFixed(1) : "N/A"}
                </div>
                <div className="mt-4">
                  {selectedCompetitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between mt-2"
                    >
                      <span className="text-sm">{competitor}</span>
                      {platformData.score && renderStars(platformData.score)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Reviews card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">Total Reviews</h3>
                <LineChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {platformData.reviews
                    ? platformData.reviews.toLocaleString()
                    : "N/A"}
                </div>
                <div className="mt-4">
                  {selectedCompetitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between mt-2"
                    >
                      <span className="text-sm">{competitor}</span>
                      <span className="font-medium">
                        {platformData.reviews
                          ? platformData.reviews.toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratings distribution card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">Ratings Distribution</h3>
                <PieChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {platformData.ratings
                    ? platformData.ratings.toLocaleString()
                    : "N/A"}{" "}
                  ratings
                </div>
                <div className="mt-4">
                  {platformData.histogram && (
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star, index) => (
                        <div key={star} className="flex items-center text-sm">
                          <div className="flex w-14 justify-end items-center gap-1">
                            <span>{star} ⭐</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full"
                              style={{
                                width: `${
                                  platformData.ratings
                                    ? (platformData.histogram[star - 1] /
                                        platformData.ratings) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-16 ml-2 text-gray-500">
                            {platformData.histogram[star - 1].toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Install data card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">Installs</h3>
                <LineChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {platformData.installs || "N/A"}
                </div>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between mt-2">
                    <span>Last Updated</span>
                    <span className="font-medium">
                      {platformData.last_updated
                        ? new Date(
                            platformData.last_updated
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Released</span>
                    <span className="font-medium">
                      {platformData.released
                        ? new Date(platformData.released).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Version</span>
                    <span className="font-medium">
                      {platformData.version || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and content */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="border rounded-md inline-flex">
              <button
                className={`px-4 py-2 text-sm ${
                  activeTab === "overview" ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 text-sm ${
                  activeTab === "reviews" ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
              <button
                className={`px-4 py-2 text-sm ${
                  activeTab === "sentiment" ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => setActiveTab("sentiment")}
              >
                Sentiment Analysis
              </button>
              {/* <button 
                className={`px-4 py-2 text-sm ${activeTab === "keywords" ? "bg-gray-100 font-medium" : ""}`}
                onClick={() => setActiveTab("keywords")}
              >
                Keywords
              </button> */}
            </div>

            {/* <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search reviews..."
                  className="w-[200px] pl-8 h-9 px-3 py-2 border rounded-md"
                />
              </div>
            </div> */}
          </div>

          {activeTab === "overview" && platformData && (
            <div className="border rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold">App Details</h3>
                <p className="text-sm text-gray-500">
                  Information about {gameData?.competitor_name}
                </p>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {platformData.icon_url && (
                      <img
                        src={platformData.icon_url}
                        alt={gameData?.competitor_name}
                        className="w-20 h-20 rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">
                        {gameData?.competitor_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {platformData.developer || "Unknown Developer"}
                      </p>
                      <p className="text-sm mt-1">
                        Package: {gameData?.package_name}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-1">Summary</h5>
                    <p className="text-sm">{platformData.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Content Rating</h5>
                      <p>{platformData.content_rating || "N/A"}</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Price</h5>
                      <p>
                        {platformData.free
                          ? "Free"
                          : `${platformData.price} ${platformData.currency}`}
                      </p>
                    </div>
                    {platformData.in_app_purchases && (
                      <div className="col-span-2">
                        <h5 className="font-medium mb-1">In-App Purchases</h5>
                        <p>{platformData.in_app_purchase_price}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Screenshots</h5>
                  {platformData.screenshot_urls &&
                  platformData.screenshot_urls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {platformData.screenshot_urls
                        .slice(0, 4)
                        .map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded cursor-pointer"
                            onClick={() =>
                              setOpenScreenshot({
                                list: platformData.screenshot_urls,
                                index: index + 1,
                              })
                            }
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No screenshots available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="border rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold">Latest Reviews</h3>
                <p className="text-sm text-gray-500">
                  Recent reviews for {gameData?.competitor_name}
                </p>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : gameReviews.length > 0 ? (
                  <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom">
                      <thead>
                        <tr className="border-b">
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            User
                          </th>
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            Rating
                          </th>
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            Review
                          </th>
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameReviews.map((review) => (
                          <tr key={review.review_id} className="border-b">
                            <td className="p-2 align-middle font-medium">
                              <div className="flex items-center">
                                {review.user_image ? (
                                  <img
                                    src={review.user_image}
                                    alt=""
                                    className="w-8 h-8 rounded-full mr-2"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                    {review.user_name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-sm truncate max-w-32">
                                  {review.user_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 align-middle">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.score
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-muted text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-2 align-middle max-w-md">
                              <p className="text-sm line-clamp-2">
                                {review.content}
                              </p>
                            </td>
                            <td className="p-2 align-middle whitespace-nowrap">
                              {new Date(review.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews available for this app.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "sentiment" && (
            <div className="border rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
                <p className="text-sm text-gray-500">
                  Analysis of review sentiment for {gameData?.competitor_name}
                </p>
              </div>
              <div className="p-4">
                {sentimentLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : sentimentData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="text-base font-medium mb-4">
                        Sentiment Overview
                      </h4>

                      {renderSentimentScore(
                        sentimentData.gameDesign,
                        "Game Design"
                      )}
                      {renderSentimentScore(
                        sentimentData.customerSupport,
                        "Customer Support"
                      )}
                      {renderSentimentScore(
                        sentimentData.reliability,
                        "Reliability"
                      )}

                      <div className="mt-4 text-sm text-gray-500">
                        Based on analysis of {sentimentData.reviewCount} reviews
                      </div>
                    </div>

                    {/* <div className="border rounded-lg p-4">
                      <h4 className="text-base font-medium mb-4">Sentiment Distribution</h4>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex justify-center">
                            <div className="relative w-40 h-40 rounded-full">
                              <div 
                                className="absolute inset-0 bg-green-500 rounded-full" 
                                style={{ 
                                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * sentimentData.gameDesign/30)}% ${50 - 50 * Math.sin(2 * Math.PI * sentimentData.gameDesign/30)}%, 50% 50%)` 
                                }}
                              ></div>
                              <div 
                                className="absolute inset-0 bg-red-500 rounded-full" 
                                style={{ 
                                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * sentimentData.gameDesign/30)}% ${50 - 50 * Math.sin(2 * Math.PI * sentimentData.gameDesign/30)}%, ${50 + 50 * Math.cos(2 * Math.PI * (sentimentData.gameDesign + sentimentData.customerSupport)/30)}% ${50 - 50 * Math.sin(2 * Math.PI * (sentimentData.gameDesign + sentimentData.customerSupport)/30)}%, 50% 50%)` 
                                }}
                              ></div>
                              <div 
                                className="absolute inset-0 bg-blue-500 rounded-full" 
                                style={{ 
                                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * (sentimentData.gameDesign + sentimentData.customerSupport)/30)}% ${50 - 50 * Math.sin(2 * Math.PI * (sentimentData.gameDesign + sentimentData.customerSupport)/30)}%, ${50 + 50 * Math.cos(0)}% ${50 - 50 * Math.sin(0)}%, 50% 50%)` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-center mt-4 space-x-4">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-sm">Game Design</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-sm">Customer Support</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-sm">Reliability</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {/* <div className="border rounded-lg p-4 md:col-span-2">
                      <h4 className="text-base font-medium mb-4">Sentiment Over Time</h4>
                      <div className="h-64 flex items-center justify-center border rounded-md bg-muted/10">
                        <p className="text-muted-foreground">
                          Sentiment trend chart would appear here
                        </p>
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No sentiment analysis data available for this app.</p>
                    <button
                      onClick={() => fetchSentimentAnalysis(selectedGame.id)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Load Sentiment Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {isAddNewGamePopupOpen && (
        <AddNewGamePopup
          onClose={() => setIsAddNewGamePopupOpen(false)}
          studioId={studioId}
          setCompetitorGames={setCompetitorGames}
          setSelectedGame={setSelectedGame}
        />
      )}
      {openScreenshot && (
        <ImagePreviewPopup
          screenshots={openScreenshot.list}
          initialIndex={openScreenshot.index}
          onClose={() => setOpenScreenshot(null)}
        />
      )}
    </div>
  );
};

const AddNewGamePopup = ({ onClose, studioId, setCompetitorGames, setSelectedGame }) => {
  const [gameName, setGameName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [appStoreId, setAppStoreId] = useState("");
  const [loading, setLoading] = useState(false);
 

  const onSubmit = async () => {
    try{
      setLoading(true);
      const response = await api.post('/v1/competitor-games',{
        studio_id: studioId,
        competitor_name: gameName,
        package_name: packageName,
        app_id: appStoreId
      });
      setCompetitorGames(prev => [response.data.data, ...prev]);
      setSelectedGame(response.data.data);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold whitespace-pre-line">
              Add New Game
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="game-name" className="text-sm font-medium">
                Game Name
              </label>
              <input
                type="text"
                id="game-name"
                className="w-full p-2 border rounded-md"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="game-name" className="text-sm font-medium">
                Package Name
              </label>
              <input
                type="text"
                id="game-name"
                className="w-full p-2 border rounded-md"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="game-name" className="text-sm font-medium">
                App Store ID
              </label>
              <input
                type="text"
                id="game-name"
                className="w-full p-2 border rounded-md"
                value={appStoreId}
                onChange={(e) => setAppStoreId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 border-t border-solid border-blueGray-200 p-4">
            <button
              className="bg-[#f3f3f3] text-[#000] px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            {(gameName && (packageName || appStoreId)) ? (
              <>
              {loading ? <Loader className="w-6 h-6 animate-spin text-gray-400" /> : <button
                className="bg-[#B9FF66] text-[#000] px-4 py-2 rounded-md hover:bg-[#000] hover:text-[#B9FF66]"
                onClick={onSubmit}
              >
                Create
              </button>}
              </>
            ) : (
              <button
                className="bg-[#B9FF66] text-[#000] px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
                disabled
              >
                Create
              </button>
            )}
          </div>
        </div>
      </div>       
    </div>
  );
};

const ImagePreviewPopup = ({ screenshots, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!screenshots.length) return null;

  const prev = () =>
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  const next = () =>
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Carousel */}
        <div className="flex items-center justify-between">
          <button
            className="text-xl px-4 text-gray-700 hover:text-black"
            onClick={prev}
          >
            &#8592;
          </button>
          <img
            src={screenshots[currentIndex]}
            alt={`Screenshot ${currentIndex + 1}`}
            className="max-h-[80vh] object-contain rounded-md mx-auto"
          />
          <button
            className="text-xl px-4 text-gray-700 hover:text-black"
            onClick={next}
          >
            &#8594;
          </button>
        </div>

        {/* Indicator */}
        <div className="text-center text-xs text-gray-500 mt-2">
          {currentIndex + 1} of {screenshots.length}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
