import React, { useEffect, useState } from "react";
import api from "../../../../api";
import {
  ArrowDownRight,
  ArrowUpRight,
  Star,
  BarChart,
  LineChart,
  PieChart,
  Loader,
  ArrowLeft,
} from "lucide-react";
import GameCard from "./GameCard";

const CompetitorAnalysis = ({ studio_slug, userData, studios }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competitorGames, setCompetitorGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [gameReviews, setGameReviews] = useState([]);
  const [openScreenshot, setOpenScreenshot] = useState(null);

  const [currentView, setCurrentView] = useState("list");

  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState("ios");

  const studioId = userData?.studio_type?.includes("studio_manager")
    ? studios.filter((x) => x.slug === studio_slug)[0]?.id
    : userData?.studio_id;

  const fetchCompetitorGames = async () => {
    setLoading(true);
    try {
      const [iosResponse, androidResponse] = await Promise.all([
        api.get(`/v1/app-overview/${studioId}/ios`),
        api.get(`/v1/app-overview/${studioId}/android`),
      ]);

      const allGames = [...iosResponse.data.data, ...androidResponse.data.data];

      setCompetitorGames(allGames);

      // Select the first game by default
      if (allGames.length > 0) {
        setSelectedGame(allGames[0]);
      }
    } catch (err) {
      console.error("Error fetching competitor games:", err);
      setError("Failed to load competitor games");
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async () => {
    setLoading(true);
    try {
      setGameData(selectedGame);
      setSelectedCompetitors([selectedGame.name]);
    } catch (err) {
      console.error("Error fetching game details:", err);
      setError("Failed to load game details");
    } finally {
      setLoading(false);
    }
  };

  const fetchGameReviews = async () => {
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

  const fetchSentimentAnalysis = async (gameId) => {
    setSentimentLoading(true);
    try {
      const response = await api.get(`/v1/app-overview/sentiment/${studioId}/${selectedGame.app_id}`);
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
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGame(null);
    setGameData(null);
    setGameReviews([]);
    setSentimentData(null);
  };

  // Initial load
  useEffect(() => {
    if (studioId) {
      fetchCompetitorGames();
    }
  }, [studioId]);

  // Fetch game details and reviews when a game is selected
  useEffect(() => {
    if (selectedGame && currentView === "detail") {
      fetchGameDetails();
      fetchGameReviews();
    }
  }, [selectedGame, currentView]);

  // Fetch sentiment data when switching to sentiment tab
  useEffect(() => {
    if (activeTab === "sentiment" && selectedGame && !sentimentData) {
      fetchSentimentAnalysis(selectedGame.id);
    }
  }, [activeTab, selectedGame]);

  // Helper function to render star ratings
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
  if (loading && competitorGames.length === 0) {
    return (
      <div className="shadow-md bg-white w-full h-full p-4 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2">Loading app data...</span>
      </div>
    );
  }

  // Error state
  if (error && competitorGames.length === 0) {
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

  // Filter games by platform for display
  const filteredGames = competitorGames.filter(
    (game) => selectedPlatform === "all" || game.os === selectedPlatform
  );

  // Render list view
  if (currentView === "list") {
    return (
      <div className="shadow-md bg-white w-full h-full p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h1 className="text-2xl font-bold">App Performance Analysis</h1>
              <p className="text-muted-foreground">
                Analyze your studio's app performance and insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Platform filter */}
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

          <div className="flex-1 p-4 overflow-auto">
            {filteredGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4">
                  <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Apps Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedPlatform === "all"
                      ? "No apps found for your studio. Make sure your studio has apps published on the app stores."
                      : `No apps found for ${selectedPlatform.toUpperCase()}. Try switching to a different platform.`}
                  </p>
                </div>
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
      </div>
    );
  }

  const platformData = selectedGame;

  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-100 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedGame?.name || "App Performance Analysis"}
              </h1>
              <p className="text-muted-foreground">
                Detailed analysis and insights
              </p>
            </div>
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
                  {platformData.rating ? platformData.rating.toFixed(1) : "N/A"}
                </div>
                <div className="mt-4">
                  {selectedCompetitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between mt-2"
                    >
                      <span className="text-sm">{competitor}</span>
                      {platformData.rating && renderStars(platformData.rating)}
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
                  {platformData.global_rating_count
                    ? platformData.global_rating_count.toLocaleString()
                    : platformData.rating_count?.toLocaleString() || "N/A"}
                </div>
                <div className="mt-4">
                  {selectedCompetitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between mt-2"
                    >
                      <span className="text-sm">{competitor}</span>
                      <span className="font-medium">
                        {platformData.global_rating_count
                          ? platformData.global_rating_count.toLocaleString()
                          : platformData.rating_count?.toLocaleString() ||
                            "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Downloads/Revenue card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">Monthly Performance</h3>
                <PieChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-lg font-bold">
                  {platformData.last_month_downloads_string || "N/A"}
                </div>
                <div className="text-sm text-gray-500 mb-2">Downloads</div>
                <div className="text-lg font-bold">
                  {platformData.last_month_revenue_string || "N/A"}
                </div>
                <div className="text-sm text-gray-500">Revenue</div>
              </div>
            </div>

            {/* App Info card */}
            <div className="border rounded-lg shadow-sm">
              <div className="flex flex-row items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-medium">App Info</h3>
                <LineChart className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <span className="font-medium uppercase">
                      {platformData.os}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">
                      {platformData.version || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Released</span>
                    <span className="font-medium">
                      {platformData.release_date
                        ? new Date(
                            platformData.release_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="font-medium">
                      {platformData.updated_date
                        ? new Date(
                            platformData.updated_date
                          ).toLocaleDateString()
                        : "N/A"}
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
            </div>
          </div>

          {activeTab === "overview" && platformData && (
            <div className="border rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold">App Details</h3>
                <p className="text-sm text-gray-500">
                  Information about {platformData?.name}
                </p>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {platformData.icon_url && (
                      <img
                        src={platformData.icon_url}
                        alt={platformData?.name}
                        className="w-20 h-20 rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{platformData?.name}</h4>
                      <p className="text-sm text-gray-500">
                        {platformData.publisher_name || "Unknown Developer"}
                      </p>
                      <p className="text-sm mt-1">
                        {platformData.os === "ios" ? "Bundle ID" : "Package"}:{" "}
                        {platformData.bundle_id || platformData.package_name}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-1">Description</h5>
                    <p className="text-sm line-clamp-4">
                      {platformData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Content Rating</h5>
                      <p>{platformData.content_rating || "N/A"}</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Price</h5>
                      <p>
                        {platformData.price === 0
                          ? "Free"
                          : `$${platformData.price}`}
                      </p>
                    </div>
                    {platformData.in_app_purchases && (
                      <div className="col-span-2">
                        <h5 className="font-medium mb-1">In-App Purchases</h5>
                        <p>Available</p>
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
                  Recent reviews for {platformData?.name}
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
                            Title & Content
                          </th>
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            Tags & Sentiment
                          </th>
                          <th className="h-10 px-2 text-left align-middle font-medium">
                            Version & Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameReviews.map((review, index) => (
                          <tr
                            key={review.review_id || index}
                            className="border-b"
                          >
                            <td className="p-2 align-middle font-medium">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                  {review.username?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <span className="text-sm font-semibold">{review.username || "Anonymous"}</span>
                                  <div className="text-xs text-gray-400">{review.country}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 align-middle">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= (review.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-muted text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-2 align-middle max-w-md">
                              <div className="font-bold">{review.title}</div>
                              <div className="text-sm">{review.content || "No review text"}</div>
                              {review.parsed_content && review.parsed_content.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {review.parsed_content.flat().map((word, i) => (
                                    <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                      {word}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-2 align-middle">
                              <div className="flex flex-wrap gap-1">
                                {review.tags && review.tags.map((tag, i) => (
                                  <span key={i} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                    {tag.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                  review.sentiment === "happy"
                                    ? "bg-green-100 text-green-800"
                                    : review.sentiment === "unhappy"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {review.sentiment}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 align-middle text-xs">
                              <div>v{review.version}</div>
                              <div>{review.review_date ? new Date(review.review_date).toLocaleDateString() : "N/A"}</div>
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
                  Analysis of review sentiment for {platformData?.name}
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
                        sentimentData.gameDesign || 0,
                        "Game Design"
                      )}
                      {renderSentimentScore(
                        sentimentData.customerSupport || 0,
                        "Customer Support"
                      )}
                      {renderSentimentScore(
                        sentimentData.reliability || 0,
                        "Reliability"
                      )}

                      <div className="mt-4 text-sm text-gray-500">
                        Based on analysis of {sentimentData.reviewCount || 0}{" "}
                        reviews
                      </div>
                    </div>
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
