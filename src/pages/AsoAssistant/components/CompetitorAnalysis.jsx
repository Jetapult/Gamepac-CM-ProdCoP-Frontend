"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Eye,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Star,
  BarChart,
  LineChart,
  PieChart,
  Loader,
  ArrowLeft,
} from "lucide-react";
import api from "../../../api";

export default function ASOCompetitorAnalysis({ studioId, selectedGame: propSelectedGame }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competitorGames, setCompetitorGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameReviews, setGameReviews] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [openScreenshot, setOpenScreenshot] = useState(null);

  const [currentView, setCurrentView] = useState("list");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlatform, setSelectedPlatform] = useState("ios");
  const [descriptionTab, setDescriptionTab] = useState("selectedApp");

  // Fetch competitor games
  const fetchCompetitorGames = async () => {
    setLoading(true);
    try {
      const [iosResponse, androidResponse] = await Promise.all([
        api.get(`/v1/app-overview/${studioId}/ios`),
        api.get(`/v1/app-overview/${studioId}/android`),
      ]);

      const allGames = [...iosResponse.data.data, ...androidResponse.data.data];
      setCompetitorGames(allGames);

      // If propSelectedGame is provided, use it; otherwise select the first game
      if (propSelectedGame) {
        const matchingGame = allGames.find(game => 
          game.app_id === propSelectedGame.app_id || 
          game.name === propSelectedGame.game_name
        );
        if (matchingGame) {
          setSelectedGame(matchingGame);
          setCurrentView("detail");
        }
      }
    } catch (err) {
      console.error("Error fetching competitor games:", err);
      setError("Failed to load competitor games");
    } finally {
      setLoading(false);
    }
  };

  const fetchGameReviews = async () => {
    if (!selectedGame) return;
    
    setLoading(true);
    try {
      const response = await api.get(
        `/v1/app-overview/reviews/${studioId}/${selectedGame.app_id}`
      );
      setGameReviews(response.data.data || []);
    } catch (err) {
      console.error("Error fetching game reviews:", err);
      setGameReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentimentAnalysis = async () => {
    if (!selectedGame) return;
    
    setSentimentLoading(true);
    try {
      const response = await api.get(
        `/v1/app-overview/sentiment/${studioId}/${selectedGame.app_id}`
      );
      setSentimentData(response.data.data);
    } catch (err) {
      console.error("Error fetching sentiment analysis:", err);
      setSentimentData(null);
    } finally {
      setSentimentLoading(false);
    }
  };

  const handleGameCardClick = (game) => {
    setSelectedGame(game);
    setCurrentView("detail");
    setActiveTab("overview");
    setSentimentData(null);
    setGameReviews([]);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGame(null);
    setGameReviews([]);
    setSentimentData(null);
  };

  // Initial load
  useEffect(() => {
    if (studioId) {
      fetchCompetitorGames();
    }
  }, [studioId, propSelectedGame]);

  // Fetch game reviews when a game is selected
  useEffect(() => {
    if (selectedGame && currentView === "detail") {
      fetchGameReviews();
    }
  }, [selectedGame, currentView]);

  // Fetch sentiment data when switching to sentiment tab
  useEffect(() => {
    if (activeTab === "ratings" && selectedGame && !sentimentData) {
      fetchSentimentAnalysis();
    }
  }, [activeTab, selectedGame]);

  // Helper function to render sentiment score bars
  const renderSentimentScore = (score, label) => {
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
  if (loading && competitorGames.length === 0) {
    return (
      <div className="w-full">
        <div className="border rounded-md p-6 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2">Loading app data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && competitorGames.length === 0) {
    return (
      <div className="w-full">
        <div className="border rounded-md p-6 flex items-center justify-center">
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
      </div>
    );
  }

  // Filter games by platform for display
  const filteredGames = competitorGames.filter(
    (game) => selectedPlatform === "all" || game.os === selectedPlatform
  );

  // Game Card Component
  const GameCard = ({ game, onClick }) => (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-start space-x-3">
        {game.icon_url ? (
          <img
            src={game.icon_url}
            alt={game.name}
            className="w-12 h-12 rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No icon</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium text-sm">{game.name}</h3>
          <p className="text-xs text-gray-500">{game.publisher_name}</p>
          <p className="text-xs text-gray-400 uppercase">{game.os}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <div className="flex items-center">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
          <span>{game.rating ? game.rating.toFixed(1) : "N/A"}</span>
        </div>
        <div>
          {game.global_rating_count
            ? game.global_rating_count.toLocaleString()
            : game.rating_count?.toLocaleString() || "N/A"} reviews
        </div>
      </div>
    </div>
  );

  // Render list view
  if (currentView === "list") {
    return (
      <div className="w-full">
        <div className="border rounded-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">App Store Competitor Analysis</h2>
              <p className="text-gray-600">Analyze your studio's app performance and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Platform:</span>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                </select>
              </div>
            </div>
          </div>

          {filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Apps Found</h3>
              <p className="text-gray-500 mb-4">
                {selectedPlatform === "all"
                  ? "No apps found for your studio. Make sure your studio has apps published on the app stores."
                  : `No apps found for ${selectedPlatform.toUpperCase()}. Try switching to a different platform.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={`${game.id}-${game.os}`}
                  game={game}
                  onClick={() => handleGameCardClick(game)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render detail view with original ASO design
  return (
    <div className="w-full">
      <div className="border rounded-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-100 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">App Store Competitor Analysis</h2>
              <p className="text-gray-600">Detailed analysis for {selectedGame?.name}</p>
            </div>
          </div>
        </div>

        {/* Selected App Info */}
        <div className="flex items-center p-3 border rounded-md bg-primary/5 border-primary/20 mb-6">
          {selectedGame?.icon_url ? (
            <img
              src={selectedGame.icon_url}
              alt={selectedGame.name}
              className="w-10 h-10 rounded-md mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-md mr-3 bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">No icon</span>
            </div>
          )}
          <div>
            <div className="font-medium">{selectedGame?.name}</div>
            <div className="text-xs text-gray-500">{selectedGame?.publisher_name}</div>
            <div className="text-xs text-gray-500 uppercase">{selectedGame?.os}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b">
            {["overview", "keywords", "metadata", "ratings", "visuals"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rating Card */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                      Rating
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl font-bold">
                      {selectedGame?.rating ? selectedGame.rating.toFixed(1) : "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedGame?.global_rating_count
                        ? selectedGame.global_rating_count.toLocaleString()
                        : selectedGame?.rating_count?.toLocaleString() || "N/A"} reviews
                    </div>
                  </div>
                </div>

                {/* Content Rating Card */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Content Rating
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl font-bold">
                      {selectedGame?.content_rating || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Update Frequency Card */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-blue-500" />
                      Last Updated
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-bold">
                      {selectedGame?.updated_date
                        ? new Date(selectedGame.updated_date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Downloads/Revenue Card */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                      Performance
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-bold">
                      {selectedGame?.last_month_downloads_string || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Downloads</div>
                    <div className="text-lg font-bold">
                      {selectedGame?.last_month_revenue_string || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">Keyword Analysis</h3>
                  <p className="text-sm text-gray-500">
                    Keyword data not available with current API endpoints
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <p>Keyword analysis requires additional API endpoints.</p>
                    <p>Contact your administrator to enable keyword tracking.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* App Title */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">App Title</h3>
                </div>
                <div className="p-4">
                  <div className="p-3 border rounded-md">
                    {selectedGame?.name || "No title available"}
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">Subtitle</h3>
                </div>
                <div className="p-4">
                  <div className="p-3 border rounded-md">
                    {selectedGame?.subtitle || "No subtitle available"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm md:col-span-2">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">Description</h3>
                </div>
                <div className="p-4">
                  <div className="p-4 border rounded-md max-h-[300px] overflow-y-auto text-sm space-y-2">
                    {selectedGame?.description ? (
                      selectedGame.description.split("\n").map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;

                        const isHeading = trimmed === trimmed.toUpperCase() && !trimmed.startsWith("●");
                        const isBullet = trimmed.startsWith("●");

                        const html = {
                          __html: isBullet ? trimmed.replace(/^●\s*/, "") : trimmed,
                        };

                        return isBullet ? (
                          <li
                            key={idx}
                            className="ml-4 list-disc"
                            dangerouslySetInnerHTML={html}
                          />
                        ) : (
                          <p
                            key={idx}
                            className={`whitespace-pre-wrap ${
                              isHeading ? "font-semibold text-base mt-2" : ""
                            }`}
                            dangerouslySetInnerHTML={html}
                          />
                        );
                      })
                    ) : (
                      <p className="text-gray-500">No description available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating Overview */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Rating Overview</h3>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium mb-4">
                      {selectedGame?.name}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Rating</span>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold mr-2">
                            {selectedGame?.rating ? selectedGame.rating.toFixed(1) : "N/A"}
                          </span>
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Reviews</span>
                        <span className="font-medium">
                          {selectedGame?.global_rating_count
                            ? selectedGame.global_rating_count.toLocaleString()
                            : selectedGame?.rating_count?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                      
                      {selectedGame?.rating_for_current_version && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current Version Rating</span>
                          <span className="font-medium">
                            {selectedGame.rating_for_current_version.toFixed(1)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Version</span>
                        <span className="font-medium">
                          {selectedGame?.version || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    {/* <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">
                        Detailed rating distribution breakdown is not available with current API endpoints.
                      </p>
                    </div> */}
                  </div>
                </div>

                {/* Sentiment Analysis */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Review Sentiment Analysis</h3>
                  </div>
                  <div className="p-4">
                    {sentimentLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : sentimentData ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">{selectedGame?.name}</h4>
                        {renderSentimentScore(sentimentData.gameDesign || 0, "Game Design")}
                        {renderSentimentScore(sentimentData.customerSupport || 0, "Customer Support")}
                        {renderSentimentScore(sentimentData.reliability || 0, "Reliability")}
                        <div className="mt-4 text-xs text-gray-500">
                          Based on analysis of {sentimentData.reviewCount || 0} reviews
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No sentiment analysis data available.</p>
                        <button
                          onClick={() => fetchSentimentAnalysis()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Load Sentiment Data
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Table */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">Latest Reviews</h3>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : gameReviews.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Review
                            </th>
                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sentiment
                            </th>
                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {gameReviews.slice(0, 10).map((review, index) => (
                            <tr key={review.review_id || index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {review.username || "Anonymous"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (review.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-gray-200 text-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                                <div className="font-medium">{review.title}</div>
                                <div className="truncate">{review.content}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    review.sentiment === "happy"
                                      ? "bg-green-100 text-green-800"
                                      : review.sentiment === "unhappy"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {review.sentiment}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {review.review_date
                                  ? new Date(review.review_date).toLocaleDateString()
                                  : "N/A"}
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
            </div>
          )}

          {activeTab === "visuals" && (
            <div className="space-y-6">
              {/* App Icon */}
              <div>
                <h3 className="font-medium mb-3">App Icon</h3>
                <div className="flex items-center">
                  <div className="text-center w-24">
                    <div className="mb-1">
                      {selectedGame?.icon_url ? (
                        <img
                          src={selectedGame.icon_url}
                          alt="App Icon"
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No icon</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs block leading-tight break-words">
                      {selectedGame?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <h3 className="font-medium mb-3">Screenshots</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h4 className="text-xs font-medium mb-2">{selectedGame?.name}</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedGame?.screenshot_urls?.length > 0 ? (
                        selectedGame.screenshot_urls.slice(0, 5).map((src, index) => (
                          <img
                            key={index}
                            src={src}
                            alt={`Screenshot ${index + 1}`}
                            className="w-24 h-48 object-cover rounded-md border cursor-pointer flex-shrink-0"
                            onClick={() =>
                              setOpenScreenshot({
                                list: selectedGame.screenshot_urls,
                                index: index,
                              })
                            }
                          />
                        ))
                      ) : (
                        [1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-24 h-48 bg-gray-200 flex items-center justify-center rounded-md border flex-shrink-0"
                          >
                            <span className="text-xs text-gray-500">No screenshot</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {openScreenshot && (
        <ImagePreviewPopup
          screenshots={openScreenshot.list}
          initialIndex={openScreenshot.index}
          onClose={() => setOpenScreenshot(null)}
        />
      )}
    </div>
  );
}

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
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>

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

        <div className="text-center text-xs text-gray-500 mt-2">
          {currentIndex + 1} of {screenshots.length}
        </div>
      </div>
    </div>
  );
};
