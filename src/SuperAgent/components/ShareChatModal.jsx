import React, { useState, useEffect } from "react";
import { X, Lock, Globe, Link2, Loader2 } from "lucide-react";
import api from "@/api";

const ShareChatModal = ({
  isOpen,
  onClose,
  chatId,
  isPublic: initialIsPublic = false,
  onAccessChange,
}) => {
  const [activeTab, setActiveTab] = useState("view");
  const [accessType, setAccessType] = useState(
    initialIsPublic ? "public" : "private"
  );
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Sync accessType when modal opens or initialIsPublic changes
  useEffect(() => {
    if (isOpen) {
      setAccessType(initialIsPublic ? "public" : "private");
      setError(null);
    }
  }, [isOpen, initialIsPublic]);

  const updateChatAccess = async (newAccessType) => {
    if (isUpdating) return;

    const isPublic = newAccessType === "public";
    setIsUpdating(true);
    setError(null);

    try {
      await api.patch(`/v1/superagent/chats/${chatId}`, {
        is_public: isPublic,
      });

      setAccessType(newAccessType);
      if (onAccessChange) {
        onAccessChange(isPublic);
      }
    } catch (err) {
      console.error("Failed to update chat access:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update access"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccessTypeChange = (newAccessType) => {
    if (newAccessType !== accessType) {
      updateChatAccess(newAccessType);
    }
  };

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/super-agent/chat/${chatId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.16)] to-[rgba(102,102,102,0.48)]" />

      {/* Modal Content - 499px width, 20px padding, flex between for spacing */}
      <div
        className="relative bg-white rounded-[12px] w-[499px] p-5 flex flex-col justify-between"
        style={{ minHeight: "372px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Section - Header + Tabs */}
        <div className="flex flex-col gap-4 w-full">
          {/* Header Row */}
          <div className="flex items-center justify-between w-full">
            <h2
              className="text-[16px] text-[#141414] font-medium tracking-[-0.48px]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Share chat
            </h2>
            <button
              onClick={onClose}
              className="size-5 flex items-center justify-center text-[#6d6d6d] hover:text-[#141414] transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Tabs Section */}
          <div className="relative w-full h-8">
            {/* Bottom border line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#f6f6f6]" />

            {/* Tabs */}
            <div className="flex gap-1 items-start h-full">
              <button
                className="relative flex items-center justify-center h-full w-[59px]"
                onClick={() => setActiveTab("view")}
              >
                <span
                  className={`text-[16px] font-medium ${
                    activeTab === "view" ? "text-[#141414]" : "text-[#b0b0b0]"
                  }`}
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  View
                </span>
                {activeTab === "view" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1f6744]" />
                )}
              </button>
              {/* <button
                className="relative flex items-center justify-center h-full px-0"
                onClick={() => setActiveTab("collaborate")}
              >
                <span
                  className={`text-[16px] font-medium ${
                    activeTab === "collaborate"
                      ? "text-[#141414]"
                      : "text-[#b0b0b0]"
                  }`}
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Collaborate
                </span>
                {activeTab === "collaborate" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1f6744]" />
                )}
              </button> */}
            </div>
          </div>
        </div>

        {/* Access Options - gap-[7px] between items */}
        <div className="flex flex-col gap-[7px] w-full">
          {/* Error Message */}
          {error && (
            <div className="p-2 mb-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* Private Option - p-[10px], border-bottom 1px */}
          <button
            className="flex items-center justify-between p-[10px] border-b border-[#f6f6f6] w-full text-left rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
            onClick={() => handleAccessTypeChange("private")}
            disabled={isUpdating}
          >
            <div className="flex items-center gap-3">
              <div className="size-6 flex items-center justify-center">
                <Lock size={20} strokeWidth={1.5} className="text-[#6d6d6d]" />
              </div>
              <div className="flex flex-col gap-[9px] items-start">
                <span
                  className="text-[14px] text-[#141414] font-medium leading-[21px]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Private
                </span>
                <span
                  className="text-[14px] text-[#b0b0b0] leading-[21px]"
                  style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
                >
                  Only you have access
                </span>
              </div>
            </div>
            {isUpdating && accessType !== "private" ? (
              <Loader2 size={20} className="animate-spin text-[#6d6d6d]" />
            ) : accessType === "private" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10L8 14L16 6"
                  stroke="#1f6744"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>

          {/* Public Access Option - p-[10px], gap-[12px] for icon+text */}
          <button
            className="flex items-center justify-between p-[10px] border-b border-[#f6f6f6] w-full text-left rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
            onClick={() => handleAccessTypeChange("public")}
            disabled={isUpdating}
          >
            <div className="flex items-center gap-3">
              <div className="size-5 flex items-center justify-center">
                <Globe size={20} strokeWidth={1.5} className="text-[#6d6d6d]" />
              </div>
              <div className="flex flex-col gap-[9px] items-start">
                <span
                  className="text-[14px] text-[#141414] font-medium leading-[21px]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Public Access
                </span>
                <span
                  className="text-[14px] text-[#b0b0b0] leading-[21px]"
                  style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
                >
                  Anyone with the link can view chat till now
                </span>
              </div>
            </div>
            {isUpdating && accessType !== "public" ? (
              <Loader2 size={20} className="animate-spin text-[#6d6d6d]" />
            ) : accessType === "public" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10L8 14L16 6"
                  stroke="#1f6744"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>
        </div>

        {/* Copy Link Button - pt-[20px], aligned right, h-[36px] */}
        <div className="flex justify-end pt-5 w-full">
          <button
            onClick={handleCopyLink}
            className="h-9 px-2 flex items-center gap-[6px] bg-[#1f6744] rounded-lg border border-[rgba(255,255,255,0.3)] shadow-[0_0_0_1px_#1f6744] hover:opacity-90 transition-opacity"
          >
            <Link2 size={16} strokeWidth={1.5} className="text-[#f6f6f6]" />
            <span
              className="text-[16px] text-[#f6f6f6] font-medium leading-6"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareChatModal;
