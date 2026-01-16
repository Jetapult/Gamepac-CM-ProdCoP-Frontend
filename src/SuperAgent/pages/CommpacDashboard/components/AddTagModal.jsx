import { X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { AltArrowDown, CloseCircle } from "@solar-icons/react";
import api from "../../../../api";
import { TagsList } from "../../../../constants/organicUA";
import { tagDistributionlabelData } from "../../../../pages/OrganicUA/components/ReviewInsights/ReviewInsights";

const AddTagModal = ({
  isOpen,
  onClose,
  feedback,
  selectedGame,
  ContextStudioData,
  onSuccess,
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Transform TagsList for dropdown
  const tagOptions = TagsList.map((tag) => ({
    id: tag.id,
    label: tag.label,
    value: tag.value,
  }));

  // Initialize selected tags when modal opens
  useEffect(() => {
    if (isOpen && feedback?.tags) {
      const selectedReviewTags = feedback.tags.map((tag) => {
        const tagOption = tagOptions.find((opt) => opt.value === tag);
        return tagOption || { label: tag, value: tag };
      });
      setSelectedTags(selectedReviewTags);
    } else if (isOpen) {
      setSelectedTags([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feedback?.tags]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4, // Fixed positioning uses viewport coordinates
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleTagSelect = (option) => {
    const isSelected = selectedTags.some((tag) => tag.value === option.value);
    if (isSelected) {
      setSelectedTags((prev) => prev.filter((tag) => tag.value !== option.value));
    } else {
      setSelectedTags((prev) => [...prev, option]);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.value !== tagToRemove.value));
  };

  const handleSave = async () => {
    if (!selectedTags.length || !feedback?.id || !selectedGame?.id) {
      return;
    }

    try {
      setIsLoading(true);
      const tags = selectedTags.map((tag) => tag.value);
      const requestBody = {
        tags: tags,
        reviewId: feedback.id,
        studioId: ContextStudioData?.id,
        gameId: selectedGame.id,
      };

      // Determine API endpoint based on platform
      // Use review data to determine platform (Android has reviewId, iOS has appstorereviewid)
      const isAndroid = !!feedback.reviewId; // Android has reviewId
      const isIOS = !!feedback.appstorereviewid; // iOS has appstorereviewid
      const url = isAndroid
        ? `v1/organic-ua/play-store/add-tags`
        : `v1/organic-ua/app-store/add-tags`;

      await api.put(url, requestBody);

      // Call onSuccess callback with updated tags
      if (onSuccess) {
        onSuccess(tags);
      }

      onClose();
    } catch (err) {
      console.log(err);
      // You can add toast message here if needed
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between py-6 mx-6 border-b border-[#e7eaee] flex-shrink-0">
          <h2 className="font-urbanist font-semibold text-lg text-[#141414]">
            Add Tags
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f6f7f8] rounded transition-colors"
          >
            <X size={16} color="#6d6d6d" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0">
          <div className="flex flex-col gap-3" ref={dropdownRef}>
            <label className="font-urbanist font-medium text-sm text-[#141414]">
              Tags
            </label>
            <div className="relative">
              <div
                ref={inputRef}
                className={`bg-[#f6f6f6] border flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                  isDropdownOpen
                    ? "border-[#1f6744] bg-white"
                    : selectedTags.length > 0
                    ? "border-[#f6f6f6]"
                    : "border-[#f6f6f6] hover:border-[#e7eaee]"
                }`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span
                  className={`font-urbanist text-base ${
                    selectedTags.length > 0 ? "text-[#141414]" : "text-[#b0b0b0]"
                  }`}
                >
                  {selectedTags.length > 0
                    ? selectedTags.length === 1
                      ? selectedTags[0].label
                      : `${selectedTags.length} selected`
                    : "Select Tags"}
                </span>
                <AltArrowDown
                  size={16}
                  color="#6d6d6d"
                  weight="Linear"
                  className={`transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
            {/* Dropdown Menu - Rendered outside modal using Portal */}
            {isDropdownOpen &&
              ReactDOM.createPortal(
                <div
                  ref={dropdownRef}
                  className="fixed bg-white border border-[#e7eaee] rounded-lg shadow-lg z-[9999] max-h-[300px] overflow-y-auto"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                  }}
                >
                  <div className="py-1">
                    {tagOptions.length > 0 ? (
                      tagOptions.map((option) => {
                        const isSelected = selectedTags.some(
                          (tag) => tag.value === option.value
                        );
                        const tagColor =
                          tagDistributionlabelData[option.value] || "#6d6d6d";
                        return (
                          <div
                            key={option.id || option.value}
                            className="px-4 py-2 hover:bg-[#f6f7f8] cursor-pointer transition-colors flex items-center gap-2"
                            onClick={() => handleTagSelect(option)}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex items-center justify-center ${
                                isSelected
                                  ? "bg-[#1f6744] border-[#1f6744]"
                                  : "border-[#d9dee4] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  width="10"
                                  height="8"
                                  viewBox="0 0 10 8"
                                  fill="none"
                                >
                                  <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="font-urbanist text-sm text-[#141414]">
                              {option.label}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2 text-sm text-[#b0b0b0] text-center">
                        No tags available
                      </div>
                    )}
                  </div>
                </div>,
                document.body
              )}
            {/* Selected Tags with Color Coding */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => {
                  const tagColor =
                    tagDistributionlabelData[tag.value] || "#6d6d6d";
                  return (
                    <div
                      key={tag.value}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-urbanist border"
                      style={{
                        backgroundColor: tagColor + "33",
                        borderColor: tagColor,
                        color: tagColor,
                      }}
                    >
                      <span>{tag.label}</span>
                      <CloseCircle
                        weight={"Linear"}
                        size={14}
                        color={tagColor}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagRemove(tag);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e7eaee] bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e7eaee] rounded-lg font-urbanist text-sm text-[#141414] hover:bg-[#f6f7f8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedTags.length || isLoading}
            className="px-4 py-2 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagModal;

