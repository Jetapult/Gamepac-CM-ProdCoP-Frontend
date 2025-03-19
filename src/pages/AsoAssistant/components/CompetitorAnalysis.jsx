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

export default function ASOCompetitorAnalysis({ studioId = 2 }) {
  // State for competitor games from API
  const [allCompetitorGames, setAllCompetitorGames] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [competitorDetails, setCompetitorDetails] = useState({});
  const [competitorReviews, setCompetitorReviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setIsLoading(true);
      try {
        const response = await api.get(`/v1/competitor-games?studio_id=${studioId}`);
        setAllCompetitorGames(response.data.data || []);
        
        // Select first 3 competitors by default if available
        if (response.data.data && response.data.data.length > 0) {
          const initialSelected = response.data.data.slice(0, 3);
          setSelectedCompetitors(initialSelected);
          
          // Fetch details for initially selected competitors
          initialSelected.forEach(competitor => {
            fetchCompetitorDetails(competitor.id);
            fetchCompetitorReviews(competitor.id);
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

  // Toggle competitor selection
  const toggleCompetitor = (competitor) => {
    const isSelected = selectedCompetitors.some(c => c.id === competitor.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedCompetitors(selectedCompetitors.filter(c => c.id !== competitor.id));
    } else {
      // Add to selection and fetch details if not already fetched
      setSelectedCompetitors([...selectedCompetitors, competitor]);
      
      if (!competitorDetails[competitor.id]) {
        fetchCompetitorDetails(competitor.id);
      }
      
      if (!competitorReviews[competitor.id]) {
        fetchCompetitorReviews(competitor.id);
      }
    }
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
                  <div className="px-3 py-2 text-sm text-gray-500">Loading competitors...</div>
                ) : allCompetitorGames.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No competitors found</div>
                ) : (
                  allCompetitorGames.map(competitor => (
                    <div
                      key={competitor.id}
                      className="px-3 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleCompetitor(competitor)}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {selectedCompetitors.some(c => c.id === competitor.id) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                          )}
                        </div>
                        <span className="text-sm">{competitor.competitor_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {competitor.package_name ? 'Android' : 'iOS'}
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
            const platformData = details ? 
              (storeType === "appStore" ? details.ios_data : details.android_data) : null;
            
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
                  <div className="font-medium">{competitor.competitor_name}</div>
                  <div className="text-xs text-gray-500">
                    {competitor.package_name ? 'Google Play' : 'App Store'}
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
                      <Award className="h-4 w-4 mr-2 text-blue-500" />
                      App Store Rank
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your App</span>
                        <div className="flex items-center">
                          <span className="font-bold">#142</span>
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            +12
                          </span>
                        </div>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details ? 
                          (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                        
                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{competitor.competitor_name}</span>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {platformData ? `#${Math.floor(Math.random() * 200) + 1}` : "N/A"}
                              </span>
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                -5
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
                      <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                      Ratings
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your App</span>
                        <div className="flex items-center">
                          <span className="font-bold">4.7</span>
                          <span className="text-xs text-gray-500 ml-1">
                            (2.3k)
                          </span>
                        </div>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details ? 
                          (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                        
                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{competitor.competitor_name}</span>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {platformData?.score ? platformData.score.toFixed(1) : "N/A"}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                {platformData?.ratings ? `(${(platformData.ratings / 1000).toFixed(1)}k)` : ""}
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
                      Visibility Score
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your App</span>
                        <div className="flex items-center">
                          <span className="font-bold">68</span>
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            +5
                          </span>
                        </div>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details ? 
                          (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                        
                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{competitor.competitor_name}</span>
                            <div className="flex items-center">
                              <span className="font-medium">72</span>
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                +3
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
                        <span className="text-sm font-medium">Your App</span>
                        <span className="font-bold">14 days</span>
                      </div>

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details ? 
                          (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                        
                        return (
                          <div
                            key={competitor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{competitor.competitor_name}</span>
                            <span className="font-medium">21 days</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">
                    Competitive Positioning
                  </h3>
                </div>
                <div className="p-4">
                  <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50">
                    <BarChart2 className="h-16 w-16 text-gray-400" />
                    <p className="ml-4 text-gray-500">
                      Competitive positioning chart would appear here
                    </p>
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
                  <button className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
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
                            Your App Rank
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Traffic Score
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Difficulty
                          </th>
                          {selectedCompetitors.map((competitor) => (
                            <th
                              key={competitor.id}
                              className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {competitor.competitor_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          {
                            keyword: "home design",
                            yourRank: 12,
                            traffic: 89,
                            difficulty: 76,
                          },
                          {
                            keyword: "interior design",
                            yourRank: 24,
                            traffic: 72,
                            difficulty: 65,
                          },
                          {
                            keyword: "house decoration",
                            yourRank: 8,
                            traffic: 65,
                            difficulty: 58,
                          },
                          {
                            keyword: "room planner",
                            yourRank: 15,
                            traffic: 61,
                            difficulty: 52,
                          },
                          {
                            keyword: "home makeover",
                            yourRank: 31,
                            traffic: 58,
                            difficulty: 67,
                          },
                        ].map((keyword) => (
                          <tr
                            key={keyword.keyword}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {keyword.keyword}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              #{keyword.yourRank}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {keyword.traffic}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {keyword.difficulty}
                            </td>
                            {selectedCompetitors.map((competitor) => (
                              <td
                                key={competitor.id}
                                className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                              >
                                #{Math.floor(Math.random() * 50) + 1}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">
                    Keyword Gap Analysis
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Keywords your competitors are ranking for that you're not:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "3d home design",
                        "virtual room designer",
                        "dream house creator",
                        "furniture placement",
                        "interior decoration",
                        "home stylist",
                        "house design games",
                        "room makeover",
                        "design challenge",
                      ].map((keyword) => (
                        <div
                          key={keyword}
                          className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-full"
                        >
                          {keyword}
                          <button className="ml-2 p-0.5 rounded-full hover:bg-gray-100">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Your App (4.7 ★)
                        </div>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center">
                              <div className="w-8 text-sm">{rating} ★</div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                <div
                                  className="bg-blue-500 h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      rating === 5
                                        ? 75
                                        : rating === 4
                                        ? 18
                                        : rating === 3
                                        ? 5
                                        : rating === 2
                                        ? 1
                                        : 1
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-8 text-sm text-right">
                                {rating === 5
                                  ? 75
                                  : rating === 4
                                  ? 18
                                  : rating === 3
                                  ? 5
                                  : rating === 2
                                  ? 1
                                  : 1}
                                %
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedCompetitors.slice(0, 1).map((competitor) => (
                        <div key={competitor.id}>
                          <div className="text-sm font-medium mb-2">
                            {competitor.competitor_name} (4.2 ★)
                          </div>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center">
                                <div className="w-8 text-sm">{rating} ★</div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                  <div
                                    className="bg-blue-500 h-2.5 rounded-full"
                                    style={{
                                      width: `${
                                        rating === 5
                                          ? 60
                                          : rating === 4
                                          ? 20
                                          : rating === 3
                                          ? 10
                                          : rating === 2
                                          ? 5
                                          : 5
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-8 text-sm text-right">
                                  {rating === 5
                                    ? 60
                                    : rating === 4
                                    ? 20
                                    : rating === 3
                                    ? 10
                                    : rating === 2
                                    ? 5
                                    : 5}
                                  %
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Rating Trends</h3>
                  </div>
                  <div className="p-4">
                    <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50">
                      <TrendingUp className="h-16 w-16 text-gray-400" />
                      <p className="ml-4 text-gray-500">
                        Rating trend chart would appear here
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="text-base font-medium">
                    Review Sentiment Analysis
                  </h3>

                  <div className="relative">
                    <button
                      className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white w-[180px]"
                      onClick={() => setIsReviewFilterOpen(!isReviewFilterOpen)}
                    >
                      <span className="text-sm">
                        {reviewFilter === "recent"
                          ? "Most Recent"
                          : reviewFilter === "positive"
                          ? "Most Positive"
                          : reviewFilter === "negative"
                          ? "Most Critical"
                          : "Most Mentioned"}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {isReviewFilterOpen && (
                      <div className="absolute z-10 w-[180px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setReviewFilter("recent");
                            setIsReviewFilterOpen(false);
                          }}
                        >
                          Most Recent
                        </div>
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setReviewFilter("positive");
                            setIsReviewFilterOpen(false);
                          }}
                        >
                          Most Positive
                        </div>
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setReviewFilter("negative");
                            setIsReviewFilterOpen(false);
                          }}
                        >
                          Most Critical
                        </div>
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setReviewFilter("mentioned");
                            setIsReviewFilterOpen(false);
                          }}
                        >
                          Most Mentioned
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">{/* Review sentiment content */}</div>
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
                        src="/placeholder.svg?height=80&width=80"
                        alt="Your App Icon"
                        className="w-20 h-20 rounded-xl"
                      />
                    </div>
                    <span className="text-xs">Your App</span>
                  </div>

                  {selectedCompetitors.map((competitor) => {
                    const details = competitorDetails[competitor.id];
                    const platformData = details ? 
                      (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                    
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
                              <span className="text-xs text-gray-500">No icon</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs">{competitor.competitor_name}</span>
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
                    <h4 className="text-xs font-medium mb-2">Your App</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[1, 2, 3].map((i) => (
                        <img
                          key={i}
                          src="/placeholder.svg?height=400&width=200"
                          alt={`Your App Screenshot ${i}`}
                          className="w-24 h-48 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  </div>

                  {selectedCompetitors.slice(0, 1).map((competitor) => {
                    const details = competitorDetails[competitor.id];
                    const platformData = details ? 
                      (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                    
                    return (
                      <div key={competitor.id}>
                        <h4 className="text-xs font-medium mb-2">
                          {competitor.competitor_name}
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {platformData?.screenshot_urls ? (
                            platformData.screenshot_urls.slice(0, 5).map((screenshot, i) => (
                              <img
                                key={i}
                                src={screenshot}
                                alt={`${competitor.competitor_name} Screenshot ${i+1}`}
                                className="w-24 h-48 object-cover rounded-md border"
                              />
                            ))
                          ) : (
                            [1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-24 h-48 bg-gray-200 flex items-center justify-center rounded-md border"
                              >
                                <span className="text-xs text-gray-500">No screenshot</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">
                  Feature Visualization
                </h3>
                <div className="border rounded-md p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your App</th>
                        {selectedCompetitors.map((competitor) => (
                          <th key={competitor.id} className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {competitor.competitor_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        "3D Room View",
                        "AR Visualization",
                        "Social Sharing",
                        "Design Challenges",
                        "In-app Purchases",
                      ].map((feature) => (
                        <tr key={feature} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {Math.random() > 0.3 ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-600">
                                No
                              </span>
                            )}
                          </td>
                          {selectedCompetitors.map((competitor) => {
                            const details = competitorDetails[competitor.id];
                            const platformData = details ? 
                              (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                            
                            // Check if this feature is mentioned in the description
                            const hasFeature = platformData?.description ? 
                              platformData.description.toLowerCase().includes(feature.toLowerCase()) : 
                              Math.random() > 0.4;
                            
                            return (
                              <td key={competitor.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {hasFeature ? (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-600">
                                    No
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-base font-medium">App Title Comparison</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Your App</div>
                      <div className="p-3 border rounded-md">Home Design Dreams: House Games</div>
                    </div>

                    {selectedCompetitors.map((competitor) => {
                      const details = competitorDetails[competitor.id];
                      const platformData = details ? 
                        (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                      
                      return (
                        <div key={competitor.id}>
                          <div className="text-sm font-medium mb-1">{competitor.competitor_name}</div>
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
                      <div className="text-sm font-medium mb-1">Your App</div>
                      <div className="p-3 border rounded-md">Design Your Perfect Sanctuary</div>
                    </div>

                    {selectedCompetitors.map((competitor) => {
                      const details = competitorDetails[competitor.id];
                      const platformData = details ? 
                        (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                      
                      return (
                        <div key={competitor.id}>
                          <div className="text-sm font-medium mb-1">{competitor.competitor_name}</div>
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
                  <h3 className="text-base font-medium">Description Analysis</h3>
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
                        Your App
                      </button>
                      
                      {selectedCompetitors.map((competitor) => (
                        <button
                          key={competitor.id}
                          onClick={() => setDescriptionTab(`comp-${competitor.id}`)}
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
                        <div className="p-4 border rounded-md max-h-[300px] overflow-y-auto">
                          <p className="text-sm">
                            Welcome to "Home Design Dreams," the ultimate mobile game that allows you to transform your
                            design fantasies into reality! If you dream of creating stunning interiors and stylish spaces,
                            this is the game for you! Dive into a world of creativity and imagination as you renovate and
                            design beautiful homes, one room at a time.
                          </p>
                          <p className="text-sm mt-4">Key Features:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                            <li>
                              <strong>Unlimited Creativity:</strong> Explore endless customization options with a wide
                              variety of furniture, decor, and color palettes. From chic living rooms to cozy bedrooms,
                              the possibilities are limitless!
                            </li>
                            <li>
                              <strong>Exciting Challenges:</strong> Take part in engaging design challenges and solve
                              puzzles to earn rewards. Use your design skills to impress clients and unlock new levels!
                            </li>
                            <li>
                              <strong>Renovate & Customize:</strong> Regularly update and improve your houses as you
                              progress. Collect unique items and style them in ways that reflect your personal design
                              flair!
                            </li>
                          </ul>
                        </div>
                      )}

                      {selectedCompetitors.map((competitor) => {
                        const details = competitorDetails[competitor.id];
                        const platformData = details ? 
                          (storeType === "appStore" ? details.ios_data : details.android_data) : null;
                        
                        return descriptionTab === `comp-${competitor.id}` && (
                          <div key={competitor.id} className="p-4 border rounded-md max-h-[300px] overflow-y-auto">
                            {platformData?.description ? (
                              <>
                                <p className="text-sm whitespace-pre-line">
                                  {platformData.description}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">No description available</p>
                            )}
                          </div>
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
