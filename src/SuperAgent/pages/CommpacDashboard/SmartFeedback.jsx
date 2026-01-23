import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setSelectedGame } from "../../../store/reducer/superAgent";
import { Widget2, ListCheck } from "@solar-icons/react";
import PeriodDropdown from "./components/PeriodDropdown";
import GameSelector from "./components/GameSelector";
import SmartFilterPanel from "./components/SmartFilterPanel";
import FeedbackCard from "./components/FeedbackCard";
import ReplyTemplates from "./components/ReplyTemplates";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../../api";
import moment from "moment";

const SmartFeedback = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );
  const games = useSelector((state) => state.superAgent.games);
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const [activeTab, setActiveTab] = useState("feedback");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    searchText: "",
    os: "android", // Default to Android
    ratings: [],
    languages: [],
    versions: [],
    tags: [],
    orderBy: null,
    replyState: "",
    territory: null,
    responseState: "",
  });
  const [period, setPeriod] = useState(""); // Default to lifetime (no date filter)
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [templates, setTemplates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const limit = 10;

  // Extract URL parameters for deep linking
  const reviewIds = searchParams.get("review_ids");
  const querytags = searchParams.get("tags");
  const gameIdparam = searchParams.get("gameId");
  const gameTypeparam = searchParams.get("gameType");

  // Transform API review to FeedbackCard format
  const transformReview = (review) => {
    const rating = review?.userRating || review?.rating || 0;
    const sentiment =
      rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative";

    // Extract tags from review
    const tags = review?.tags ? (Array.isArray(review.tags) ? review.tags : [review.tags]) : [];

    // Format date
    const date = review?.date || review?.createddate || review?.postedDate;
    const formattedDate = date
      ? moment(date).format("DD-MM-YYYY")
      : moment().format("DD-MM-YYYY");

    // Extract technical details - use original API field names (camelCase)
    const technicalDetails = {};
    const technicalFields = [
      "androidOsVersion",
      "appVersionCode",
      "appVersionName",
      "cpuMake",
      "cpuModel",
      "device",
      "deviceClass",
      "glEsVersion",
      "manufacturer",
      "nativePlatform",
      "originalLang",
      "originalRating",
      "postedDate",
      "postedReply",
      "productName",
      "ramMb",
      "screenDensityDpi",
      "screenHeightPx",
      "screenWidthPx",
      "thumbsDownCount",
      "thumbsUpCount",
    ];

    technicalFields.forEach((field) => {
      if (review?.[field] !== undefined && review[field] !== null) {
        technicalDetails[field] = review[field];
      }
    });

    return {
      id: review?.id,
      // Only set reviewId if it exists (Android), otherwise null
      reviewId: review?.reviewId || null, // For Android
      // Only set appstorereviewid if it exists (iOS), otherwise null
      appstorereviewid: review?.appstorereviewid || null, // For iOS
      userName: review?.userName || review?.reviewernickname || "Anonymous",
      avatar: review?.avatar || null,
      rating: parseInt(rating),
      date: formattedDate,
      version: review?.appVersionName || null,
      platform: filters.os === "android" ? "Play Store" : "App Store",
      device: review?.productName || null,
      sentiment: sentiment,
      reviewText: review?.reviewText || review?.review || review?.comment || review?.body || "",
      originalLang: review?.originalLang || null, // Android: original language text
      comment: review?.comment || null, // Android: translated review (English)
      title: review?.title || null, // iOS: review title
      body: review?.body || null, // iOS: review body
      territory: review?.territory || null, // iOS: territory/language
      reviewerLanguage: review?.reviewerLanguage || review?.territory || review?.technicalDetails?.originalLang || "en",
      // Posted reply fields
      postedReply: review?.postedReply || null, // Android
      responsebody: review?.responsebody || null, // iOS
      isPosted: !!review?.postedReply || !!review?.responsebody,
      responsestate: review?.responsestate || null,
      postedDate: review?.postedDate || review?.lastmodifieddate || null,
      translated_reply: review?.translated_reply || null,
      translated_review: review?.translated_review || null,
      tags: tags,
      hasAiReply: !!review?.aiReply,
      aiReply: review?.aiReply || "",
      showSaveTemplate: false,
      technicalDetails: technicalDetails,
    };
  };

  // Fetch reviews with filters
  const fetchReviews = async (pageNumber = 1, append = false) => {
    if (!selectedGame?.id || !ContextStudioData?.id) return;

    try {
      setIsLoading(true);
      const paramData = {
        current_page: pageNumber,
        limit: limit,
        game_id: selectedGame.id,
      };

      // Period filter
      if (period) {
        paramData.period = period;
        if (period === "custom") {
          if (
            customDates[0]?.startDate === null &&
            customDates[0]?.endDate === null
          ) {
            paramData.period = "lifetime";
          } else if (customDates[0]?.startDate && customDates[0]?.endDate) {
            paramData.startDate = moment(customDates[0].startDate).format(
              "YYYY-MM-DD"
            );
            paramData.endDate = moment(customDates[0].endDate).format(
              "YYYY-MM-DD"
            );
          }
        }
      }

      // Rating filter
      if (filters.ratings && filters.ratings.length > 0) {
        paramData.rating = filters.ratings.join(",");
      }

      // Search text
      if (filters.searchText) {
        paramData.searchText = filters.searchText;
      }

      // Language filter
      if (filters.languages && filters.languages.length > 0) {
        const languages = filters.languages.map((lang) => lang.value);
        paramData.language = languages.join(",");
      }

      // Version filter
      if (filters.versions && filters.versions.length > 0) {
        const versions = filters.versions.map((ver) => ver.value);
        paramData.version = versions.join(",");
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const tags = filters.tags.map((tag) => tag.value);
        paramData.tags = tags.join(",");
      }

      // Reply state filter
      if (filters.replyState) {
        paramData.replyState = filters.replyState;
      }

      // Territory filter (iOS only)
      if (filters.territory && filters.os === "ios") {
        paramData.territory = filters.territory.value;
      }

      // Response state filter (iOS only)
      if (filters.responseState && filters.os === "ios") {
        paramData.responseState = filters.responseState;
      }

      // Order by filter
      if (filters.orderBy) {
        const sort_by = filters.orderBy.value.split(" ");
        paramData.sortBy = sort_by[0];
        if (sort_by.length > 1) {
          paramData.sortOrder = "desc";
        }
      }

      // Review IDs from URL parameter (for deep linking to specific reviews)
      if (reviewIds) {
        paramData.reviewIds = reviewIds;
      }

      // OS filter
      if (filters.os) {
        // This is handled by the API endpoint selection
      }

      // Determine API endpoint based on OS filter
      const url =
        filters.os === "android"
          ? `/v1/organic-ua/google-reviews/${ContextStudioData.id}`
          : `/v1/organic-ua/fetch-app-store-reviews/${ContextStudioData.id}`;

      const reviewsResponse = await api.get(url, { params: paramData });
      const transformedReviews = (reviewsResponse.data.data || []).map(
        transformReview
      );
      
      const totalReviewsCount = reviewsResponse.data.totalReviews || 0;
      setTotalReviews(totalReviewsCount);
      
      if (append) {
        setReviews((prev) => {
          const newReviews = [...prev, ...transformedReviews];
          // Check if there are more reviews to load
          setHasMore(newReviews.length < totalReviewsCount);
          return newReviews;
        });
      } else {
        setReviews(transformedReviews);
        // Check if there are more reviews to load
        setHasMore(transformedReviews.length < totalReviewsCount);
      }
      
      setCurrentPage(pageNumber);
      setIsLoading(false);
    } catch (err) {
      console.log("Error fetching reviews:", err);
      if (!append) {
        setReviews([]);
        setTotalReviews(0);
      }
      setHasMore(false);
      setIsLoading(false);
    }
  };

  // Load more reviews for infinite scroll
  const loadMoreReviews = () => {
    if (!isLoading && hasMore) {
      fetchReviews(currentPage + 1, true);
    }
  };

  // Fetch templates
  const getAllReplyTemplates = async () => {
    if (ContextStudioData?.id) {
      try {
        const templatesResponse = await api.get(
          `/v1/organic-ua/reply-templates/${ContextStudioData.id}?template_type=manual`
        );
        setTemplates(templatesResponse.data.data || []);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    getAllReplyTemplates();
  }, [ContextStudioData?.id]);

  // Handle URL parameter for tags (deep linking)
  useEffect(() => {
    if (querytags) {
      const tagsArr = querytags.split(",");
      const tagsArrObj = tagsArr.map((x, index) => ({
        id: index,
        label: x,
        value: x,
      }));
      setFilters((prev) => ({ ...prev, tags: tagsArrObj }));
    }
  }, [querytags]);

  // Handle URL parameters for game selection (deep linking)
  useEffect(() => {
    if (games.length > 0 && gameIdparam && gameTypeparam) {
      const game = games.find((x) => parseInt(x.id) === parseInt(gameIdparam));
      if (game) {
        dispatch(setSelectedGame({ ...game, platform: gameTypeparam }));
        // Also update the OS filter to match the game type
        setFilters((prev) => ({
          ...prev,
          os: gameTypeparam === "ios" ? "ios" : "android",
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games.length, gameIdparam, gameTypeparam]);

  // Reset and auto-select game when platform filter changes
  useEffect(() => {
    if (games.length > 0) {
      const isAndroidGame = selectedGame?.package_name && selectedGame.package_name.trim().length > 0;
      const isIOSGame = selectedGame?.app_id;
      
      if (filters.os === "android") {
        if (!isAndroidGame) {
          // Find first Android game
          const androidGame = games.find(
            (game) => game.package_name && game.package_name.trim().length > 0
          );
          if (androidGame) {
            dispatch(setSelectedGame({ ...androidGame, platform: "android" }));
          } else {
            dispatch(setSelectedGame({}));
          }
        }
      } else if (filters.os === "ios") {
        if (!isIOSGame) {
          // Find first iOS game
          const iosGame = games.find((game) => game.app_id);
          if (iosGame) {
            dispatch(setSelectedGame({ ...iosGame, platform: "ios" }));
          } else {
            dispatch(setSelectedGame({}));
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.os, games.length]);

  // Clear platform-specific filters when OS changes
  useEffect(() => {
    setFilters((prev) => {
      if (prev.os === "android") {
        // Clear iOS-specific filters when switching to Android
        return {
          ...prev,
          territory: null,
          responseState: "",
        };
      } else if (prev.os === "ios") {
        // Clear Android-specific filters when switching to iOS
        return {
          ...prev,
          languages: [],
          versions: [],
        };
      }
      return prev;
    });
  }, [filters.os]);

  // Fetch reviews when game, platform filter, or period changes
  useEffect(() => {
    if (selectedGame?.id && ContextStudioData?.id) {
      setCurrentPage(1);
      setHasMore(true);
      fetchReviews(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame?.id, filters.os, period]);

  // Auto-apply filters with debouncing when filters change
  useEffect(() => {
    if (!selectedGame?.id || !ContextStudioData?.id) return;

    // Debounce filter changes to avoid excessive API calls
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      setHasMore(true);
      setReviews([]); // Clear reviews to show skeleton loader
      fetchReviews(1, false);
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.ratings,
    filters.searchText,
    filters.languages,
    filters.versions,
    filters.tags,
    filters.orderBy,
    filters.replyState,
    filters.territory,
    filters.responseState,
  ]);

  return (
    <div className="relative flex w-full h-screen bg-[#f6f7f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#f6f6f6] px-[30px] py-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5 w-[264px]">
              <h1 className="font-urbanist font-medium text-2xl text-[#30333b] tracking-[-0.96px]">
                Smart Feedback
              </h1>
              <p className="font-urbanist font-medium text-[13px] text-[#8894a9] tracking-[-0.39px]">
                AI-powered feedback analysis and clustering
              </p>
            </div>
            <div className="flex items-center gap-5">
              {/* Period Dropdown */}
              <PeriodDropdown
                period={period}
                setPeriod={setPeriod}
                customDates={customDates}
                setCustomDates={setCustomDates}
                onPeriodChange={() => {
                  setCurrentPage(1);
                  setHasMore(true);
                  fetchReviews(1, false);
                }}
              />
              {/* Game Selector */}
              <GameSelector
                game={selectedGame}
                ContextStudioData={ContextStudioData}
                games={games}
                platform={filters.os}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 p-6 flex-1 overflow-hidden">
          {/* Smart Filter Panel */}
          <SmartFilterPanel
            filters={filters}
            setFilters={setFilters}
            selectedGame={selectedGame}
            ContextStudioData={ContextStudioData}
          />

          {/* Feedback Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs and View Toggle */}
            <div className="flex items-center justify-between pb-6 flex-shrink-0">
              {/* Tabs */}
              <div className="bg-[#f6f6f6] border border-[#e7eaee] rounded-lg p-1 flex">
                <button
                  className={`h-[34px] px-3 py-2 rounded-lg font-urbanist font-medium text-base transition-colors ${
                    activeTab === "feedback"
                      ? "bg-white text-[#141414]"
                      : "text-[#b0b0b0]"
                  }`}
                  onClick={() => setActiveTab("feedback")}
                >
                  Feedback
                </button>
                <button
                  className={`h-[34px] px-3 py-2 rounded-lg font-urbanist font-medium text-base transition-colors ${
                    activeTab === "templates"
                      ? "bg-white text-[#141414]"
                      : "text-[#b0b0b0]"
                  }`}
                  onClick={() => setActiveTab("templates")}
                >
                  Reply Templates
                </button>
              </div>

              {/* View Toggle */}
              {/* <div className="bg-[#f6f6f6] border border-[#e7eaee] rounded-lg p-1 flex gap-1.5">
                <button
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white border border-[#e7eaee]"
                      : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Widget2 size={20} color="#6d6d6d" weight="Linear" />
                </button>
                <button
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white border border-[#e7eaee]"
                      : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <ListCheck size={20} color="#6d6d6d" weight="Linear" />
                </button>
              </div> */}
            </div>

            {/* Content Container */}
            {activeTab === "feedback" ? (
              <>
                {/* Feedback Cards Container with Infinite Scroll */}
                <div
                  id="scrollableDiv"
                  className="bg-white border border-[#e7eaee] rounded-[10px] p-4 flex-1 min-h-0"
                  style={{
                    overflow: "auto",
                  }}
                >
                  {isLoading && reviews.length === 0 ? (
                    <div className="flex flex-col gap-5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#e7eaee] rounded-xl px-4 py-4 flex flex-col gap-4 w-full"
                        >
                          <div className="animate-pulse">
                            {/* Header skeleton */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-center gap-2.5 flex-1">
                                <div className="flex flex-col gap-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 bg-slate-200 rounded w-20"></div>
                                    <div className="h-2 bg-slate-200 rounded w-20"></div>
                                    <div className="h-2 bg-slate-200 rounded w-24"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                              </div>
                            </div>

                            {/* Tags skeleton */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                              <div className="h-6 bg-slate-200 rounded-full w-14"></div>
                            </div>

                            {/* Review text skeleton */}
                            <div className="border-b border-b-[#E8EEF5] pb-3 mb-4">
                              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                            </div>

                            {/* Action buttons skeleton */}
                            <div className="flex items-center gap-2">
                              <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
                              <div className="h-10 bg-slate-200 rounded-lg w-40"></div>
                              <div className="h-10 bg-slate-200 rounded-lg w-36"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center">
                        <p className="font-urbanist text-lg text-[#6d6d6d] mb-2">
                          No reviews found
                        </p>
                        <p className="font-urbanist text-sm text-[#b0b0b0]">
                          Try adjusting your filters
                        </p>
                      </div>
                    </div>
                  ) : (
                    <InfiniteScroll
                      dataLength={reviews.length}
                      next={loadMoreReviews}
                      hasMore={hasMore}
                      loader={
                        <div className="flex justify-center items-center py-8">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1F6744]"></div>
                            <span className="font-urbanist text-sm text-[#6d6d6d]">
                              Loading more reviews...
                            </span>
                          </div>
                        </div>
                      }
                      endMessage={
                        <div className="flex justify-center items-center py-8">
                          <div className="text-center">
                            <p className="font-urbanist text-sm text-[#b0b0b0]">
                              {reviews.length > 0
                                ? `You've seen all ${totalReviews} reviews`
                                : ""}
                            </p>
                          </div>
                        </div>
                      }
                      scrollableTarget="scrollableDiv"
                    >
                      <div className="flex flex-col gap-5 w-full">
                        {reviews.map((feedback) => (
                          <FeedbackCard
                            key={feedback.id}
                            feedback={feedback}
                            templates={templates}
                            selectedGame={selectedGame}
                            ContextStudioData={ContextStudioData}
                            onTagUpdate={(reviewId, updatedTags) => {
                              // Update the review in the reviews state
                              setReviews((prev) =>
                                prev.map((review) =>
                                  review.id === reviewId
                                    ? { ...review, tags: updatedTags }
                                    : review
                                )
                              );
                            }}
                            onReplyUpdate={(reviewId, replyData) => {
                              // Refresh templates if needed
                              if (replyData === undefined) {
                                getAllReplyTemplates();
                                return;
                              }
                              // Update the review in the reviews state after reply is posted
                              setReviews((prev) =>
                                prev.map((review) =>
                                  review.id === reviewId
                                    ? { ...review, ...replyData }
                                    : review
                                )
                              );
                            }}
                          />
                        ))}
              </div>
                    </InfiniteScroll>
                  )}
            </div>
              </>
            ) : (
              <ReplyTemplates
                templates={templates}
                setTemplates={setTemplates}
                ContextStudioData={ContextStudioData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFeedback;
