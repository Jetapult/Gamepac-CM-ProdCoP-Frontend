import React, { useState, useRef, useEffect } from "react";
import {
  ChatLine,
  Documents,
  MenuDots,
  AltArrowDown,
  Pen2,
} from "@solar-icons/react";
import StarRating from "./StarRating";
import SentimentBadge from "./SentimentBadge";
import { Plus } from "lucide-react";
import Sparkle from "../../../../assets/sparkle.svg";
import Languageicon from "../../../../assets/language-icon.svg";
import Replyicon from "../../../../assets/paperplain-icon.svg";
import AddTagModal from "./AddTagModal";
import AddReplyTemplateModal from "./AddReplyTemplateModal";
import ToastMessage from "../../../../components/ToastMessage";
import api from "../../../../api";
import moment from "moment";

const FeedbackCard = ({
  feedback,
  templates = [],
  selectedGame,
  ContextStudioData,
  onTagUpdate,
  onReplyUpdate,
}) => {
  const [replyText, setReplyText] = useState("");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [currentTags, setCurrentTags] = useState(feedback.tags || []);
  const [isAIReply, setIsAIReply] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showReviewTranslation, setShowReviewTranslation] = useState(false);
  const [isTranslatingReview, setIsTranslatingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    title: "",
    subtitle: "",
    type: "success",
  });
  const templateDropdownRef = useRef(null);
  const techDetailsRef = useRef(null);
  const menuDotsRef = useRef(null);

  // Transform templates for dropdown display
  const templateOptions = templates.map((template) => ({
    id: template.id,
    label: template.review_type || "",
    value: template.review_reply || "",
  }));

  const handleTemplateSelect = (template) => {
    // Replace "user" placeholder with actual username if needed
    const reply = template.value.replace(/user/gi, feedback.userName || "user");
    setReplyText(reply);
    setIsAIReply(false); // Template is not AI reply
    setShowTemplateDropdown(false);
  };

  // Generate AI Reply
  const handleGenerateAIReply = async () => {
    if (!feedback.reviewText && !feedback.originalLang) {
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Review text is required to generate AI reply",
        type: "error",
      });
      return;
    }

    try {
      setIsGeneratingAI(true);
      // Determine platform based on review data
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const isIOS = !!feedback.appstorereviewid; // iOS has appstorereviewid

      // Use originalLang for Android, body for iOS (matching old implementation)
      const comment = isAndroid
        ? feedback.originalLang || feedback.comment
        : feedback.body;

      const response = await api.post("/replyAssistant", {
        comment: comment,
      });
      const reply = response.data.reply;
      setReplyText(reply);
      setIsAIReply(true); // Mark as AI reply
    } catch (error) {
      console.error("Error generating AI reply:", error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          error?.response?.data?.message ||
          error?.response?.message ||
          "Failed to generate AI reply",
        type: "error",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Translate Reply
  const handleTranslate = async () => {
    if (!replyText.trim()) {
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Reply to review should not be empty",
        type: "error",
      });
      return;
    }

    try {
      setIsTranslating(true);
      // Determine platform based on review data
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const isIOS = !!feedback.appstorereviewid; // iOS has appstorereviewid

      // Use originalLang for Android, body for iOS (matching old implementation)
      const reviewText = isAndroid
        ? feedback.originalLang || feedback.comment
        : feedback.body;

      const response = await api.post("/translateTemplate", {
        review: reviewText,
        template: replyText,
        reviewerLanguage:
          feedback?.reviewerLanguage || feedback?.territory || "en",
      });
      const translatedReply = response.data.translatedReply;
      setReplyText(translatedReply);
    } catch (error) {
      console.error("Error translating reply:", error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          error?.response?.data?.message ||
          error?.response?.message ||
          "Failed to translate reply",
        type: "error",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Save as Template
  const handleSaveAsTemplate = () => {
    if (!replyText.trim()) {
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Reply text is required to save as template",
        type: "error",
      });
      return;
    }
    setShowSaveTemplateModal(true);
  };

  // Handle template save
  const handleTemplateSave = async (templateData) => {
    try {
      const requestBody = {
        review_type: templateData.category || "",
        review_reply: templateData.text || replyText,
        template_type: "manual",
        studio_id: ContextStudioData?.id,
      };

      await api.post(`v1/organic-ua/reply-template/create`, requestBody);

      setToastMessage({
        show: true,
        title: "Template Created",
        subtitle: "Template created successfully",
        type: "success",
      });
      setShowSaveTemplateModal(false);

      // Refresh templates if callback provided
      if (onReplyUpdate) {
        onReplyUpdate();
      }
    } catch (err) {
      console.log(err);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          err.response?.data?.message ||
          err.response?.message ||
          "Failed to save template",
        type: "error",
      });
    }
  };

  // Post Reply
  const handlePostReply = async () => {
    if (!replyText.trim()) {
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Reply to review should not be empty",
        type: "error",
      });
      return;
    }

    if (replyText.length > 350) {
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Reply to review limit is 350 characters",
        type: "error",
      });
      return;
    }

    try {
      setIsPostingReply(true);
      // Determine platform based on review data
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const isIOS = !!feedback.appstorereviewid; // iOS has appstorereviewid

      // Use reviewId for Android, appstorereviewid for iOS
      const reviewId = isAndroid
        ? feedback.reviewId
        : feedback.appstorereviewid;

      const url = isAndroid ? "/postReply" : "/postAppleReply";
      const requestBody = isAndroid
        ? {
            reviewId: reviewId,
            packageName: selectedGame.package_name,
            reply: replyText,
          }
        : {
            reviewId: reviewId,
            reply: replyText,
            studio_id: ContextStudioData?.id,
          };

      const response = await api.post(url, requestBody);

      if (response.status === 200) {
        setToastMessage({
          show: true,
          title: "Reply Posted",
          subtitle: "Reply posted successfully",
          type: "success",
        });

        // Clear reply text and exit edit mode
        setReplyText("");
        setIsAIReply(false);
        setIsEditMode(false);

        // Update feedback if callback provided
        if (onReplyUpdate) {
          onReplyUpdate(feedback.id, {
            postedReply: isAndroid ? replyText : null,
            responsebody: isIOS ? replyText : null,
            isPosted: true,
            postedDate: new Date().toISOString(),
            responsestate: isIOS ? "PENDING_PUBLISH" : null,
          });
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          error?.response?.data?.message ||
          error?.response?.message ||
          "Failed to post reply",
        type: "error",
      });
    } finally {
      setIsPostingReply(false);
    }
  };

  // Update tags when feedback changes
  useEffect(() => {
    setCurrentTags(feedback.tags || []);
  }, [feedback.tags]);

  // Initialize reply text if in edit mode or if there's a posted reply
  useEffect(() => {
    if (isEditMode && feedback.postedReply) {
      // Determine platform based on review data
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const existingReply = isAndroid
        ? feedback.postedReply
        : feedback.responsebody;
      if (existingReply) {
        setReplyText(existingReply);
      }
    } else if (!isEditMode) {
      // Clear reply text when exiting edit mode
      setReplyText("");
      setIsAIReply(false);
    }
  }, [
    isEditMode,
    feedback.postedReply,
    feedback.responsebody,
    feedback.reviewId,
  ]);

  // Reset translation state when feedback changes or when entering/exiting edit mode
  useEffect(() => {
    if (isEditMode || !feedback.isPosted) {
      setShowTranslation(false);
    }
  }, [isEditMode, feedback.isPosted, feedback.id]);

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
    // Determine platform based on review data
    const isAndroid = !!feedback.reviewId; // Android has reviewId
    const existingReply = isAndroid
      ? feedback.postedReply
      : feedback.responsebody;
    if (existingReply) {
      setReplyText(existingReply);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setReplyText("");
    setIsAIReply(false);
  };

  // Handle translate posted reply
  const handleTranslatePostedReply = async () => {
    // If translation already exists in feedback, just toggle the display
    if (feedback.translated_reply) {
      setShowTranslation((prev) => !prev);
      return;
    }

    // If we don't have translation yet, fetch it
    try {
      // Determine platform based on review data
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const postedReplyText = isAndroid
        ? feedback.postedReply
        : feedback.responsebody;

      if (!postedReplyText) return;

      const requestBody = {
        review: postedReplyText,
        reviewId: feedback.id,
        gameId: selectedGame?.id,
        studioId: ContextStudioData?.id,
        platform: isAndroid ? "android" : "apple",
        contentType: "reply",
      };

      const response = await api.put(
        `/v1/organic-ua/translate-reply`,
        requestBody
      );
      const translated = response.data.data.translated_reply;

      // Update feedback with translated reply
      if (onReplyUpdate) {
        onReplyUpdate(feedback.id, {
          translated_reply: translated,
        });
      }

      setShowTranslation(true);
    } catch (error) {
      console.error("Error translating posted reply:", error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          error?.response?.data?.message ||
          error?.response?.message ||
          "Failed to translate reply",
        type: "error",
      });
    }
  };

  // Handle translate review text
  const handleTranslateReview = async () => {
    // Determine platform based on review data
    const isAndroid = !!feedback.reviewId; // Android has reviewId
    const isIOS = !!feedback.appstorereviewid; // iOS has appstorereviewid

    // If already showing translation, toggle back to original
    if (showReviewTranslation) {
      setShowReviewTranslation(false);
      return;
    }

    // For Android: Play Store provides translation in 'comment' field
    // Just toggle to show it, no API call needed
    if (isAndroid) {
      setShowReviewTranslation(true);
      return;
    }

    // For iOS: Need to fetch translation from API if not already available
    if (isIOS) {
      // If translation already exists, just show it
      if (feedback.translated_review) {
        setShowReviewTranslation(true);
        return;
      }

      // Fetch translation from API
      try {
        setIsTranslatingReview(true);
        const requestBody = {
          review: `${feedback.title || ""}\n${feedback.body || ""}`,
          reviewId: feedback.id,
          gameId: selectedGame?.id,
          studioId: ContextStudioData?.id,
          platform: "apple",
          contentType: "review",
        };

        const response = await api.put(
          `/v1/organic-ua/translate-reply`,
          requestBody
        );
        const translated = response.data.data.translated_review;

        // Update feedback with translated review
        if (onReplyUpdate) {
          onReplyUpdate(feedback.id, {
            translated_review: translated,
          });
        }

        setShowReviewTranslation(true);
      } catch (error) {
        console.error("Error translating review:", error);
        setToastMessage({
          show: true,
          title: "Error",
          subtitle:
            error?.response?.data?.message ||
            error?.response?.message ||
            "Failed to translate review",
          type: "error",
        });
      } finally {
        setIsTranslatingReview(false);
      }
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target)
      ) {
        setShowTemplateDropdown(false);
      }
      if (
        techDetailsRef.current &&
        !techDetailsRef.current.contains(event.target) &&
        menuDotsRef.current &&
        !menuDotsRef.current.contains(event.target)
      ) {
        setShowTechDetails(false);
      }
    };

    if (showTemplateDropdown || showTechDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTemplateDropdown, showTechDetails]);

  const handleTagUpdate = (updatedTags) => {
    setCurrentTags(updatedTags);
    if (onTagUpdate) {
      onTagUpdate(feedback.id, updatedTags);
    }
  };

  return (
    <div className="bg-white border border-[#e7eaee] rounded-xl px-4 py-4 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-urbanist text-sm text-black truncate">
                {feedback.userName}
              </span>
              <StarRating rating={feedback.rating} />
            </div>
            <div className="flex items-center gap-[11px] flex-wrap">
              <span className="font-urbanist text-xs text-[#b0b0b0] whitespace-nowrap">
                {feedback.platform || "App store"}
              </span>
              <div className="w-1 h-1 bg-[#b0b0b0] rounded-full flex-shrink-0" />
              <span className="font-urbanist text-xs text-[#b0b0b0] whitespace-nowrap">
                {feedback.date}
              </span>
              {feedback?.device && (
                <>
                  <div className="w-1 h-1 bg-[#b0b0b0] rounded-full flex-shrink-0" />
                  <span className="font-urbanist text-xs text-[#b0b0b0] truncate">
                    {feedback?.device || "iPhone 15 Pro"}
                  </span>
                </>
              )}
              {feedback?.technicalDetails?.appVersionName && (
                <>
                  <div className="w-1 h-1 bg-[#b0b0b0] rounded-full flex-shrink-0" />
                  <span className="font-urbanist text-xs text-[#b0b0b0] whitespace-nowrap">
                    v{feedback?.technicalDetails?.appVersionName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <SentimentBadge sentiment={feedback.sentiment} />
          <div className="relative">
            {feedback?.platform === "Play Store" && (
              <button
                ref={menuDotsRef}
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="p-1 hover:bg-[#f6f7f8] rounded transition-colors"
              >
                <MenuDots
                  size={20}
                  weight="Bold"
                  color="#6d6d6d"
                  className="cursor-pointer"
                />
              </button>
            )}
            {showTechDetails && feedback.technicalDetails && (
              <div
                ref={techDetailsRef}
                className="absolute top-full right-0 mt-2 w-[1000px] bg-white border border-[#e7eaee] rounded-lg shadow-lg z-50 p-6 max-h-[700px] overflow-y-auto"
              >
                <h3 className="font-urbanist font-semibold text-base text-[#141414] mb-5">
                  Technical Details
                </h3>
                <div className="grid grid-cols-4 gap-x-6 gap-y-5">
                  {Object.entries(feedback.technicalDetails).map(
                    ([key, value]) => {
                      // Format key for display (convert camelCase to Title Case)
                      const formatKey = (key) => {
                        return key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim();
                      };
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <span className="font-urbanist text-xs font-medium text-[#6d6d6d] uppercase tracking-wide">
                            {formatKey(key)}
                          </span>
                          <span className="font-urbanist text-sm text-[#141414]">
                            {value || "N/A"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex items-center gap-2 flex-wrap">
        {currentTags.map((tag, index) => (
          <span
            key={index}
            className="bg-[#E3F2FD] text-[#1976D2] px-3 py-1 rounded-full font-urbanist text-xs font-medium"
          >
            {tag}
          </span>
        ))}
        <button
          onClick={() => setShowAddTagModal(true)}
          className="flex items-center gap-1 text-[#008743] hover:text-[#11A85F] transition-colors font-urbanist text-xs font-medium"
        >
          <Plus size={14} color="#00A251" />
          Add Tag
        </button>
      </div>

      {/* Review Text */}
      <div className="border-b border-b-[#E8EEF5] pb-3">
        {/* Show title if it exists (iOS) - only when NOT showing translation */}
        {feedback.title && !showReviewTranslation && (
          <p className="font-urbanist text-sm font-semibold text-[#141414] mb-2">
            {feedback.title}
          </p>
        )}
        <p className="border-l-2 border-[#1f6744] pl-2 font-urbanist text-sm text-[#141414] leading-[21px]">
          {(() => {
            // Determine the text to display based on translation state
            if (showReviewTranslation) {
              // Show translated version
              // For both Android and iOS: show comment (Android has it from Play Store)
              // or translated_review (iOS gets it from API)
              return (
                feedback.comment ||
                feedback.translated_review ||
                feedback.reviewText
              );
            } else {
              // Show original version
              // originalLang (Android original) || comment (fallback) || body (iOS original)
              return (
                feedback.originalLang ||
                feedback.comment ||
                feedback.body ||
                feedback.reviewText
              );
            }
          })()}
        </p>

        {/* Show translation toggle button if reviewer language is not English */}
        {feedback.reviewerLanguage && feedback.reviewerLanguage !== "en" && (
          <button
            onClick={handleTranslateReview}
            disabled={isTranslatingReview}
            className={`mt-2 font-urbanist text-xs text-[#5e80e1] underline hover:text-[#4a6bc7] transition-colors ${
              isTranslatingReview ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isTranslatingReview
              ? "Translating..."
              : showReviewTranslation
              ? "Show Original"
              : "Show Translation"}
          </button>
        )}
      </div>

      {/* Posted Reply Display (when reply exists and not in edit mode) */}
      {feedback.isPosted && !isEditMode && (
        <div
          className={`p-3 border rounded-lg mt-3 relative ${
            feedback.responsestate === "PENDING_PUBLISH"
              ? "border-[#f9e9c8] bg-[#fefcf0]"
              : "border-[#50cd73] bg-[#edf9ef]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="font-urbanist text-xs text-[#6d6d6d]">
                {feedback.postedDate
                  ? moment(feedback.postedDate).format("MMM DD, YYYY, hh:mm A")
                  : "Posted"}
              </p>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
                  feedback.responsestate === "PENDING_PUBLISH"
                    ? "bg-[#fff2de]"
                    : "bg-[#dbf4e3]"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    feedback.responsestate === "PENDING_PUBLISH"
                      ? "bg-[#e4cc7e]"
                      : "bg-[#50cd73]"
                  }`}
                />
                <span
                  className={`font-urbanist text-xs ${
                    feedback.responsestate === "PENDING_PUBLISH"
                      ? "text-[#e4cc7e]"
                      : "text-[#50cd73]"
                  }`}
                >
                  {feedback.responsestate === "PENDING_PUBLISH"
                    ? "Pending"
                    : "Sent"}
                </span>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#f6f7f8] transition-colors"
            >
              <Pen2 size={14} weight="Linear" color="#5e80e1" />
              <span className="font-urbanist text-xs text-[#5e80e1]">Edit</span>
            </button>
          </div>
          <p className="font-urbanist text-sm text-[#141414] leading-[21px] mb-2">
            {showTranslation && feedback.translated_reply
              ? feedback.translated_reply
              : feedback.postedReply || feedback.responsebody}
          </p>
          <button
            onClick={handleTranslatePostedReply}
            className="font-urbanist text-xs text-[#5e80e1] underline hover:text-[#4a6bc7] transition-colors"
          >
            {showTranslation && feedback.translated_reply
              ? "Show Original"
              : "Show Translation"}
          </button>
        </div>
      )}

      {/* Reply Input and Action Buttons (when no reply posted OR in edit mode) */}
      {(!feedback.isPosted || isEditMode) && (
        <>
          {/* Reply to Review Input */}
          <div className="bg-[#f6f7f8] border border-[#e7eaee] rounded-lg p-3 relative">
            {!replyText && (
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <ChatLine weight="Outline" size={20} color="#B0B0B0" />
                <span className="font-urbanist text-sm text-[#b0b0b0]">
                  Reply to review
                </span>
              </div>
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-transparent font-urbanist text-sm text-[#141414] outline-none resize-none"
              rows={3}
              style={{ minHeight: "96px" }}
            ></textarea>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {isEditMode && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#F6F6F6] transition-colors"
                >
                  <span className="font-urbanist text-xs text-[#141414]">
                    Cancel
                  </span>
                </button>
              )}
              {isAIReply && (
                <button
                  onClick={handleSaveAsTemplate}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#F6F6F6] transition-colors"
                >
                  <span className="font-urbanist text-xs text-[#141414]">
                    Save as template
                  </span>
                </button>
              )}
              <button
                onClick={handleGenerateAIReply}
                disabled={isGeneratingAI}
                className={`flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#F6F6F6] transition-colors ${
                  isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <img src={Sparkle} alt="Sparkle" className="w-4 h-4" />
                <span className="font-urbanist text-xs text-[#141414]">
                  {isGeneratingAI ? "Generating..." : "Generate AI Reply"}
                </span>
              </button>
              <div className="relative" ref={templateDropdownRef}>
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#F6F6F6] transition-colors"
                >
                  <Documents size={16} weight="Linear" color="#6d6d6d" />
                  <span className="font-urbanist text-xs text-[#141414]">
                    Select a template
                  </span>
                  <AltArrowDown
                    size={12}
                    weight="Linear"
                    color="#6d6d6d"
                    className={`transition-transform ${
                      showTemplateDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showTemplateDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-[#e7eaee] rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    <div className="py-1">
                      {templateOptions.length > 0 ? (
                        templateOptions.map((template) => (
                          <div
                            key={template.id}
                            className="px-3 py-2 hover:bg-[#f6f7f8] cursor-pointer text-sm font-urbanist text-[#141414] transition-colors"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            {template.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm font-urbanist text-[#b0b0b0] text-center">
                          No templates available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !replyText.trim()}
                className={`flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#F6F6F6] transition-colors ${
                  isTranslating || !replyText.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <img src={Languageicon} alt="Language" className="w-4 h-4" />
                <span className="font-urbanist text-xs text-[#141414]">
                  {isTranslating ? "Translating..." : "Translate"}
                </span>
              </button>
            </div>
            <button
              onClick={handlePostReply}
              disabled={isPostingReply || !replyText.trim()}
              className={`flex items-center gap-2 px-3 py-2 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:opacity-90 transition-opacity ${
                isPostingReply || !replyText.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <img src={Replyicon} alt="Reply" className="w-4 h-4" />
              {isPostingReply
                ? "Posting..."
                : isEditMode
                ? "Update Reply"
                : "Reply"}
            </button>
          </div>
        </>
      )}

      {/* Add Tag Modal */}
      <AddTagModal
        isOpen={showAddTagModal}
        onClose={() => setShowAddTagModal(false)}
        feedback={feedback}
        selectedGame={selectedGame}
        ContextStudioData={ContextStudioData}
        onSuccess={handleTagUpdate}
      />

      {/* Save as Template Modal */}
      <AddReplyTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleTemplateSave}
        template={{
          category: "",
          text: replyText,
        }}
      />

      {/* Toast Message */}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={(value) => {
            if (typeof value === "boolean") {
              setToastMessage({
                show: false,
                title: "",
                subtitle: "",
                type: "success",
              });
            } else {
              setToastMessage(value);
            }
          }}
        />
      )}
    </div>
  );
};

export default FeedbackCard;
