"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  BarChart2,
  TrendingUp,
  Award,
  Eye,
  Zap,
  ChevronDown,
  Check,
  X
} from "lucide-react";
import api from "../../../api";
import moment from 'moment';

export default function ASOCompetitorAnalysis({ studioId, selectedGame }) {
  // State for competitor games from API 
  
  const [allCompetitorGames, setAllCompetitorGames] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [competitorDetails, setCompetitorDetails] = useState({});
  const [competitorReviews, setCompetitorReviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [keywords, setKeywords] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [sentimentLoading, setSentimentLoading] = useState(false);

  // Other existing state
  const [activeTab, setActiveTab] = useState("overview");
  const [storeType, setStoreType] = useState("appStore");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isReviewFilterOpen, setIsReviewFilterOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("recent");
  const [descriptionTab, setDescriptionTab] = useState("yourApp");

  // Fetch competitor games
  useEffect(() => {
    const fetchCompetitorGames = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/v1/competitor-games?studio_id=${studioId}`);
        setAllCompetitorGames(response.data.data || []);
        
        // Select first 3 competitors by default if available
        if (response.data.data && response.data.data.length > 0) {
          const initialSelected = response.data.data.slice(0, 3);
          setSelectedCompetitors(initialSelected);
          setKeywords({});
          setSentimentData({});
          // Fetch details for initially selected competitors
          initialSelected.forEach(competitor => {
            fetchCompetitorDetails(competitor.id);
            fetchCompetitorReviews(competitor.id);
            fetchCompetitorKeyWordDetails(competitor.id);
            fetchSentimentAnalysis(competitor.id);
          });
        } 
      } catch (error) {
        console.error("Error fetching competitor games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitorGames();
  }, [studioId]);

  // Fetch competitor details
  const fetchCompetitorDetails = async (competitorId) => {
    try {
      const response = await api.get(`/v1/competitor-games/${competitorId}/data`);
      setCompetitorDetails(prev => ({
        ...prev,
        [competitorId]: response.data.data
      }));
    } catch (error) {
      console.error(`Error fetching details for competitor ${competitorId}:`, error);
    }
  };


  // Fetch competitor keywords
  const fetchCompetitorKeyWordDetails = async (competitorId) => {
    try {
      const response = await api.get(`/v1/competitor-games/${competitorId}/keywords`);
      setKeywords(prev => ({
        ...prev, [competitorId]: response.data.data
      }));
    } catch (error) {
      console.error(`Error fetching keywords for competitor ${competitorId}:`, error);
    }
  }

  // Fetch competitor reviews
  const fetchCompetitorReviews = async (competitorId) => {
    try {
      const response = await api.get(`/v1/competitor-games/${competitorId}/reviews`);
      setCompetitorReviews(prev => ({
        ...prev,
        [competitorId]: response.data.data
      }));
    } catch (error) {
      console.error(`Error fetching reviews for competitor ${competitorId}:`, error);
    }
  };

   // Function to fetch sentiment analysis data
  const fetchSentimentAnalysis = async (competitorId) => {
    try {
      setSentimentLoading(true);
      const response = await api.get(
        `/v1/competitor-games/${competitorId}/sentiment-analysis`
      );
      setSentimentData(prev => ({ ...prev, [competitorId]: response.data.data }));
    } catch (err) {
      console.error("Error fetching sentiment analysis:", err);
    } finally {
      setSentimentLoading(false);
    }
  };

const removeSentimentData = (competitorId) => {
  try {
    setSentimentData((prev) => {
      const { [competitorId]: removed, ...remaining } = prev;
      return remaining;
    });
  } catch (error) {
    console.error('Failed to remove sentiment data:', error);
  }
};

const removeKeywordData = (competitorId) => {
  try {
    setKeywords((prev) => {
      const { [competitorId]: removed, ...remaining } = prev;
      return remaining;
    });
  } catch (error) {
    console.error('Failed to remove keyword data:', error);
  }
};

  // Toggle competitor selection
  const toggleCompetitor = (competitor) => {
    const isSelected = selectedCompetitors.some(c => c.id === competitor.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedCompetitors(selectedCompetitors.filter(c => c.id !== competitor.id));
      removeSentimentData(competitor.id)
      removeKeywordData(competitor.id)
    } else {
      // Add to selection and fetch details if not already fetched
      setSelectedCompetitors([...selectedCompetitors, competitor]);
      
      if (!competitorDetails[competitor.id]) {
        fetchCompetitorDetails(competitor.id);
      }
      
      if (!competitorReviews[competitor.id]) {
        fetchCompetitorReviews(competitor.id);
      }
      if(!keywords[competitor.id]) {
        fetchCompetitorKeyWordDetails(competitor.id);
      }
      if (!sentimentData[competitor.id]) {
        fetchSentimentAnalysis(competitor.id);
      }
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

  
  return (
    <div className="w-full">
      <div className="border rounded-md p-6">
        <h2 className="text-xl font-semibold mb-6">
          App Store Competitor Analysis
          
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <button
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-sm">
                {selectedCompetitors.length > 0 
                  ? `${selectedCompetitors.length} competitors selected` 
                  : "Select competitors"}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Loading competitors...
                  </div>
                ) : allCompetitorGames.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No competitors found
                  </div>
                ) : (
                  allCompetitorGames.map((competitor) => (
                    <div
                      key={competitor.id}
                      className="px-3 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleCompetitor(competitor)}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {selectedCompetitors.some(
                            (c) => c.id === competitor.id
                          ) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                          )}
                        </div>
                        <span className="text-sm">
                          {competitor.competitor_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {competitor.package_name ? "Android" : "iOS"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center justify-between w-[180px] px-3 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
            >
              <span className="text-sm">
                {storeType === "appStore"
                  ? "App Store"
                  : storeType === "googlePlay"
                  ? "Google Play"
                  : "Both Stores"}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {isStoreDropdownOpen && (
              <div className="absolute z-10 w-[180px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setStoreType("appStore");
                    setIsStoreDropdownOpen(false);
                  }}
                >
                  App Store
                </div>
                <div
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setStoreType("googlePlay");
                    setIsStoreDropdownOpen(false);
                  }}
                >
                  Google Play
                </div>
                <div
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setStoreType("both");
                    setIsStoreDropdownOpen(false);
                  }}
                >
                  Both Stores
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {selectedCompetitors.map((competitor) => {
            const details = competitorDetails[competitor.id];
            const platformData = details
              ? storeType === "appStore"
                ? details.ios_data
                : details.android_data
              : null;

            return (
              <div
                key={competitor.id}
                className="flex items-center p-3 border rounded-md bg-primary/5 border-primary/20"
              >
                <button
                  onClick={() => toggleCompetitor(competitor)}
                  className="mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X className="h-3 w-3 text-gray-600" />
                </button>

                {platformData?.icon_url ? (
                  <img
                    src={platformData.icon_url}
                    alt={competitor.competitor_name}
                    className="w-10 h-10 rounded-md mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md mr-3 bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No icon</span>
                  </div>
                )}

                <div>
                  <div className="font-medium">
                    {competitor.competitor_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {competitor.package_name ? "Google Play" : "App Store"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 border-b">
            {["overview", "keywords", "metadata", "ratings", "visuals"].map(
              (tab) => (
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
              )
            )}
          </div>
        </div>

        <div>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                      Ratings
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedGame.game_name}
                        </span>
                        <div className="flex items-center">
                          <span className="font-bold">
                            {storeType === "appStore"
                              ? Number(selectedGame.app_store_score).toFixed(1)
                              : Number(selectedGame.play_store_score).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({storeType === "appStore"
                              ? (selectedGame.app_store_ratings / 1000).toFixed(1)
                              : (selectedGame.play_store_ratings / 1000).toFixed(1)}k)
                          </span>
                        </div>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details
                          ? storeType === "appStore"
                            ? details?.ios_data
                            : details?.android_data
                          : null;

                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {competitor.competitor_name}
                            </span>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {platformData?.score
                                  ? platformData.score.toFixed(1)
                                  : "N/A"}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                {platformData?.ratings
                                  ? `(${(platformData.ratings / 1000).toFixed(
                                      1
                                    )}k)`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Content Rating
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedGame.game_name}
                        </span>
                        <div className="flex items-center">
                          <span className="font-bold">
                            {storeType === "appStore"
                              ? selectedGame.app_store_content_rating ||"N/A"
                              : selectedGame.play_store_content_rating || "N/A"}
                          </span>
                        </div>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details
                          ? storeType === "appStore"
                            ? details.ios_data
                            : details.android_data
                          : null;

                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {competitor.competitor_name}
                            </span>
                            <div className="flex items-center">
                              <span className="font-medium ml-2">
                                {platformData ? platformData.content_rating : "N/A"}
                              </span>
                              
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-blue-500" />
                      Update Frequency
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedGame.game_name}
                        </span>
                        <span className="font-bold">
                          {storeType === "appStore" ? selectedGame?.app_store_last_updated ? moment(selectedGame.app_store_last_updated).fromNow() : "N/A"
                            : selectedGame?.play_store_last_updated ? moment(selectedGame.play_store_last_updated).fromNow() : "N/A"}
                        </span>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details
                          ? storeType === "appStore"
                            ? details.ios_data
                            : details.android_data
                          : null;
                        
                        const lastUpdated = platformData?.last_updated
                          ? moment(platformData.last_updated).fromNow()
                          : "N/A";
                        

                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {competitor.competitor_name}
                            </span>
                            <span className="font-medium ml-2">
                              {lastUpdated}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b flex flex-row items-center justify-between">
                  <h3 className="text-base font-medium">
                    Keyword Overlap Analysis
                  </h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keyword
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Device
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Traffic Score
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Competiting Apps
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(keywords).map((competitorId) =>
                          keywords[competitorId].map((keyword) => {
                            // Apply filtering based on storeType
                            const isAppStore = storeType === 'appStore' && (keyword.device === 'iPhone' || keyword.device === 'iPad');
                            const isGooglePlay = storeType === 'googlePlay' && keyword.device === 'Phone';
                            const isBoth = storeType === 'both' && (keyword.device === 'iPhone' || keyword.device === 'iPad' || keyword.device === 'Phone');
                            
                            if (isAppStore || isGooglePlay || isBoth) {
                              return (
                                <tr key={keyword.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {keyword.term}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {keyword.country}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {keyword.device}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {keyword.traffic}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {keyword.difficulty}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {keyword.competing_apps}
                                  </td>
                               </tr>
                              );
                            }       
                          return null;
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium">
                      Rating Distribution
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-6">
                      {selectedGame && (
                        <div>
                          <div className="text-sm font-medium mb-2">                  
                            {selectedGame.game_name} (
                            {storeType === "appStore" ? Number(selectedGame.app_store_score).toFixed(1) : Number(selectedGame.play_store_score).toFixed(1)} ★)
                            </div>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const totalRatings =
                                  storeType === "appStore"
                                    ? selectedGame.app_store_ratings || 0
                                    : selectedGame.play_store_ratings || 0;
                  
                                const histogram =
                                  storeType === "appStore"
                                    ? selectedGame.app_store_histogram || []
                                    : selectedGame.play_store_histogram || [];
                              

                                if (histogram.length === 0) return (
                                  rating === 1 ?
                                    <p>
                                      No ratings available for this game
                                    </p> : null
                                );
                                const ratingCount =
                                  storeType === "appStore"
                                    ? histogram[rating] || 0
                                    : histogram[rating - 1] || 0;
                  
                                const ratingPercentage =
                                  totalRatings > 0 ? (ratingCount / totalRatings) * 100 : 0;
                  
                                return (
                                  <div key={rating} className="flex items-center">
                                    <div className="w-8 text-sm">{rating} ★</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                      <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{
                                          width: `${ratingPercentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="w-8 text-sm text-right">
                                      {ratingPercentage.toFixed(1)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      
                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details
                          ? storeType === "appStore"
                            ? details.ios_data
                            : details.android_data
                          : null;
                        // Calculate total ratings from histogram
                        
                        const totalRatings = platformData?.ratings || 0;
                        if(platformData === null) return null;
                        return (
                          <div key={competitor.id}>
                            <div className="text-sm font-medium mb-2">
                              
                              {competitor.competitor_name} ({platformData?.score.toFixed(1)} ★)
                            </div>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                              
                                // Calculate percentage for each rating
                                const ratingCount = storeType === "appStore" ?  platformData.histogram[rating] || 0 : platformData.histogram[rating - 1] || 0 ;
                                const ratingPercentage = totalRatings ? (ratingCount / totalRatings) * 100 : 0;
                                
                                return (
                                  <div key={rating} className="flex items-center">
                                    <div className="w-8 text-sm">{rating} ★</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                      <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{
                                          width: `${ratingPercentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="w-8 text-sm text-right">
                                      {ratingPercentage.toFixed(1)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Review Sentiment Analysis</h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    {Object.keys(sentimentData).map((competitorId) => {
                      const competitorSentiment = sentimentData[competitorId];
                      return (
                        <div key={competitorId} className="w-full p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="text-sm font-medium mb-2">{competitorSentiment.name}</h4>
                          {renderSentimentScore(competitorSentiment.gameDesign, "Game Design")}
                          {renderSentimentScore(competitorSentiment.customerSupport, "Customer Support")}
                          {renderSentimentScore(competitorSentiment.reliability, "Reliability")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visuals" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  App Icon Comparison
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="border rounded-xl p-2 mb-2">
                      <img
                        src={storeType === "appstore" ? selectedGame.app_store_icon : selectedGame.play_store_icon}
                        alt="Your App Icon"
                        className="w-20 h-20 rounded-xl"
                      />
                    </div>

                    <span className="text-xs">
                      {selectedGame.game_name}
                    </span>
                  </div>

                  {selectedCompetitors.map((competitor) => {
                    const details = competitorDetails[competitor.id];
                    const platformData = details
                      ? storeType === "appStore"
                        ? details.ios_data
                        : details.android_data
                      : null;

                    return (
                      <div key={competitor.id} className="text-center">
                        <div className="border rounded-xl p-2 mb-2">
                          {platformData?.icon_url ? (
                            <img
                              src={platformData.icon_url}
                              alt={`${competitor.competitor_name} Icon`}
                              className="w-20 h-20 rounded-xl"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No icon
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs">
                          {competitor.competitor_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">
                  Screenshot Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-medium mb-2">
                      {selectedGame.game_name}
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedGame?.play_store_screenshot_urls?.length > 0 ? (
                        selectedGame.play_store_screenshot_urls.slice(0, 3).map((src, index) => (
                          <a key={index} href={src} target="_blank" rel="noopener noreferrer">
                          <img
                            key={index}
                            src={src}
                            alt={`App Screenshot ${index + 1}`}
                            className="w-24 h-48 object-cover rounded-md border"     
                            />
                          </a>
                        ))) : ([1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-24 h-48 bg-gray-200 flex items-center justify-center rounded-md border"
                                >
                                  <span className="text-xs text-gray-500">
                                    No screenshot
                                  </span>
                          </div>
                        )))}
                    </div>
                  </div>

                  {selectedCompetitors.map((competitor) => {
                    const details = competitorDetails[competitor.id];
                    const platformData = details
                      ? storeType === "appStore"
                        ? details.ios_data
                        : details.android_data
                      : null;

                    return (
                      <div key={competitor.id}>
                        <h4 className="text-xs font-medium mb-2">
                          {competitor.competitor_name}
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {platformData?.screenshot_urls
                            ? platformData.screenshot_urls
                                .slice(0, 3)
                              .map((screenshot, i) => (
                                  <a key={i} href={screenshot} target="_blank" rel="noopener noreferrer">
                                  <img
                                    key={i}
                                    src={screenshot}
                                    alt={`${
                                      competitor.competitor_name
                                    } Screenshot ${i + 1}`}
                                    className="w-24 h-48 object-cover rounded-md border"
                                  />
                                  </a>
                                ))
                            : [1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-24 h-48 bg-gray-200 flex items-center justify-center rounded-md border"
                                >
                                  <span className="text-xs text-gray-500">
                                    No screenshot
                                  </span>
                                </div>
                              ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">
                    App Title Comparison
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">{selectedGame.game_name}</div>
                      <div className="p-3 border rounded-md">
                        Home Design Dreams: House Games
                      </div>
                    </div>

                    {selectedCompetitors.map((competitor) => {
                      const details = competitorDetails[competitor.id];
                      const platformData = details
                        ? storeType === "appStore"
                          ? details.ios_data
                          : details.android_data
                        : null;

                      return (
                        <div key={competitor.id}>
                          <div className="text-sm font-medium mb-1">
                            {competitor.competitor_name}
                          </div>
                          <div className="p-3 border rounded-md">
                            {platformData?.title || competitor.competitor_name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">Subtitle Comparison</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">
                        {selectedGame.game_name}
                      </div>
                      <div className="p-3 border rounded-md">
                        {storeType === "appStore" ? selectedGame.app_store_summary || "No subtitle available" : selectedGame.play_store_summary || "No subtitle available"}
                      </div>
                    </div>

                    {selectedCompetitors.map((competitor) => {
                      const details = competitorDetails[competitor.id];
                      const platformData = details
                        ? storeType === "appStore"
                          ? details.ios_data
                          : details.android_data
                        : null;
                      return (
                        <div key={competitor.id}>
                          <div className="text-sm font-medium mb-1">
                            {competitor.competitor_name}
                          </div>
                          <div className="p-3 border rounded-md">
                            {platformData?.summary || "No subtitle available"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm md:col-span-2">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">
                    Description Analysis
                  </h3>
                </div>
                <div className="p-4">
                  <div>
                    <div className="flex border-b mb-4">
                      <button
                        onClick={() => setDescriptionTab("yourApp")}
                        className={`px-4 py-2 text-sm font-medium ${
                          descriptionTab === "yourApp"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {selectedGame.game_name}
                      </button>

                      {selectedCompetitors.map((competitor) => (
                        <button
                          key={competitor.id}
                          onClick={() =>
                            setDescriptionTab(`comp-${competitor.id}`)
                          }
                          className={`px-4 py-2 text-sm font-medium ${
                            descriptionTab === `comp-${competitor.id}`
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {competitor.competitor_name}
                        </button>
                      ))}
                    </div>

                    <div>
                      {descriptionTab === "yourApp" && (
                        storeType === "appStore" ? selectedGame.app_store_description ||
                          <div className="p-4 border rounded-md max-h-[300px] overflow-y-auto">
                            <p className="text-sm text-gray-500">
                              No description available
                            </p>
                          </div>
                          : selectedGame.play_store_description ||
                          <div className="p-4 border rounded-md max-h-[300px] overflow-y-auto">
                              <p className="text-sm text-gray-500">
                                No description available
                              </p>
                          </div>
                      )}

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details
                          ? storeType === "appStore"
                            ? details.ios_data
                            : details.android_data
                          : null;

                        return (
                          descriptionTab === `comp-${competitor.id}` && (
                            <div
                              key={competitor.id}
                              className="p-4 border rounded-md max-h-[300px] overflow-y-auto"
                            >
                              {platformData?.description ? (
                                <>
                                  <p className="text-sm whitespace-pre-line">
                                    {platformData.description}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No description available
                                </p>
                              )}
                            </div>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
