import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AltArrowDown,
  CloseCircle,
  UploadMinimalistic,
} from "@solar-icons/react";
import { X } from "lucide-react";
import api from "../../../../api";

// File upload component with drag and drop support
const FileUploadArea = ({
  label,
  file,
  onFileChange,
  onRemoveFile,
  accept,
  supportedFormats,
  maxSize,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
        {label}
      </label>
      {file ? (
        // File selected state
        <div className="border border-[#E7EAEE] rounded-xl p-4 bg-[#F6F6F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-[#eaecf0] rounded-lg flex items-center justify-center">
                <UploadMinimalistic weight={"Linear"} size={20} color="#000" />
              </div>
              <div>
                <p className="font-urbanist text-sm font-medium text-[#141414] truncate max-w-[300px]">
                  {file.name}
                </p>
                <p className="font-urbanist text-xs text-[#b0b0b0]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveFile}
              className="p-1 hover:bg-[#E7EAEE] rounded transition-colors"
            >
              <X size={20} color="#6d6d6d" />
            </button>
          </div>
        </div>
      ) : (
        // Upload prompt state
        <div
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
            isDragging
              ? "border-[#1f6744] bg-[#f0fdf4]"
              : "border-[#d0d0d0] hover:border-[#1f6744]"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-10 h-10 bg-white border border-[#eaecf0] rounded-lg shadow-sm flex items-center justify-center">
            <UploadMinimalistic weight={"Linear"} size={20} color="#000" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="font-urbanist font-semibold text-[14px] text-[#1f6744]">
                Click to upload
              </span>
              <span className="font-urbanist text-[14px] text-[#475467]">
                or drag and drop
              </span>
            </div>
            <p className="font-urbanist text-[12px] text-[#475467] text-center">
              Supported file formats: {supportedFormats} (max. {maxSize}) -
              Upload up-to 1 File
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => onFileChange(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

const StudioOnboardingSettings = ({ studioData, studios: propStudios }) => {
  // State
  const [externalStudios, setExternalStudios] = useState([]);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [showStudioSelector, setShowStudioSelector] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Drag states
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [isTranscriptDragging, setIsTranscriptDragging] = useState(false);

  // Refs
  const selectorRef = useRef(null);
  const videoInputRef = useRef(null);
  const transcriptInputRef = useRef(null);

  // Fetch external studios
  useEffect(() => {
    const fetchExternalStudios = async () => {
      try {
        const response = await api.get("/v1/game-studios/external-studios");
        setExternalStudios(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch external studios:", err);
        // Fallback to prop studios if API fails
        if (propStudios?.length > 0) {
          setExternalStudios(propStudios);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExternalStudios();
  }, [propStudios]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowStudioSelector(false);
      }
    };
    if (showStudioSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStudioSelector]);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage?.show) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectStudio = (studio) => {
    setSelectedStudio(studio);
    setShowStudioSelector(false);
    setErrors((prev) => ({ ...prev, studio: "" }));
  };

  const handleRemoveStudio = () => {
    setSelectedStudio(null);
  };

  // Video drag handlers
  const handleVideoDragOver = useCallback((e) => {
    e.preventDefault();
    setIsVideoDragging(true);
  }, []);

  const handleVideoDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsVideoDragging(false);
  }, []);

  const handleVideoDrop = useCallback((e) => {
    e.preventDefault();
    setIsVideoDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.includes("video") ||
        file.name.match(/\.(mp4|mkv|avi|mov|webm|m4v)$/i))
    ) {
      setVideoFile(file);
      setErrors((prev) => ({ ...prev, video: "" }));
    }
  }, []);

  // Transcript drag handlers
  const handleTranscriptDragOver = useCallback((e) => {
    e.preventDefault();
    setIsTranscriptDragging(true);
  }, []);

  const handleTranscriptDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsTranscriptDragging(false);
  }, []);

  const handleTranscriptDrop = useCallback((e) => {
    e.preventDefault();
    setIsTranscriptDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.match(/\.(txt|doc|docx|pdf)$/i)) {
      setTranscriptFile(file);
      setErrors((prev) => ({ ...prev, transcript: "" }));
    }
  }, []);

  const handleVideoChange = (file) => {
    if (file) {
      setVideoFile(file);
      setErrors((prev) => ({ ...prev, video: "" }));
    }
  };

  const handleTranscriptChange = (file) => {
    if (file) {
      setTranscriptFile(file);
      setErrors((prev) => ({ ...prev, transcript: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedStudio) {
      newErrors.studio = "Please select a studio";
    }
    if (!videoFile) {
      newErrors.video = "Please upload a recorded video";
    }
    if (!transcriptFile) {
      newErrors.transcript = "Please upload a transcript file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studio_id", selectedStudio.id);
      formData.append("recorded_video", videoFile);
      formData.append("transcript", transcriptFile);

      const response = await api.post(
        "/v1/game-studios/external-studio/onboarding",
        formData
      );

      if (response.status === 200) {
        setToastMessage({
          show: true,
          message:
            response.data.message ||
            "Onboarding materials submitted successfully",
          type: "success",
        });

        // Reset form
        setSelectedStudio(null);
        setVideoFile(null);
        setTranscriptFile(null);

        // Clear file inputs
        if (videoInputRef.current) {
          videoInputRef.current.value = "";
        }
        if (transcriptInputRef.current) {
          transcriptInputRef.current.value = "";
        }

        // Refresh studios list
        const studiosResponse = await api.get(
          "/v1/game-studios/external-studios"
        );
        setExternalStudios(studiosResponse.data.data || []);
      }
    } catch (error) {
      console.error("Failed to submit onboarding:", error);
      setToastMessage({
        show: true,
        message:
          error.response?.data?.message ||
          "An error occurred while submitting the form",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
            Studio onboarding
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <span className="font-urbanist text-sm text-[#6d6d6d]">
            Loading studios...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header with Save button */}
      <div className="flex items-center justify-between">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Studio onboarding
        </h3>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-10 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Team Information Card */}
      <div className="border border-[#f6f6f6] rounded-xl p-6 bg-white flex flex-col gap-5">
        <h4 className="font-urbanist font-semibold text-[16px] text-[#141414]">
          Team information
        </h4>

        {/* Select Studio - Single selection */}
        <div className="flex flex-col gap-2">
          <label className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
            Select studio
          </label>
          <div className="relative" ref={selectorRef}>
            <button
              onClick={() => setShowStudioSelector(!showStudioSelector)}
              className={`flex items-center justify-between w-full max-w-[418px] min-h-[44px] px-3 py-2 bg-white border rounded-lg transition-colors ${
                errors.studio
                  ? "border-[#f25a5a]"
                  : showStudioSelector
                  ? "border-[#1f6744]"
                  : "border-[#E7EAEE]"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {selectedStudio ? (
                  <span className="flex items-center gap-1 bg-[#edfbff] px-3 py-1 rounded-full">
                    <span className="font-urbanist font-medium text-[14px] text-[#0b99ff]">
                      {selectedStudio.studio_name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStudio();
                      }}
                    >
                      <X size={10} color="#6d6d6d" />
                    </button>
                  </span>
                ) : (
                  <span className="font-urbanist text-[14px] text-[#b0b0b0]">
                    Select studio...
                  </span>
                )}
              </div>
              <AltArrowDown
                weight="Linear"
                size={16}
                color="#6D6D6D"
                className={`shrink-0 transition-transform ${
                  showStudioSelector ? "rotate-180" : ""
                }`}
              />
            </button>

            {showStudioSelector && (
              <div className="absolute left-0 top-full mt-1 w-full max-w-[418px] bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {externalStudios.length > 0 ? (
                  externalStudios
                    .filter((s) => s.id !== selectedStudio?.id)
                    .map((studio) => (
                      <button
                        key={studio.id}
                        onClick={() => handleSelectStudio(studio)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-[#f6f6f6] transition-colors text-left"
                      >
                        {studio.studio_logo && (
                          <img
                            src={studio.studio_logo}
                            alt={studio.studio_name}
                            className="w-5 h-5 rounded object-cover"
                          />
                        )}
                        <span className="font-urbanist text-[14px] text-[#141414]">
                          {studio.studio_name}
                        </span>
                      </button>
                    ))
                ) : (
                  <div className="px-3 py-4 text-center">
                    <span className="font-urbanist text-[14px] text-[#b0b0b0]">
                      No studios available
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.studio && (
            <span className="text-xs text-[#f25a5a]">{errors.studio}</span>
          )}
        </div>

        {/* Upload recorded video */}
        <FileUploadArea
          label="Upload recorded video"
          file={videoFile}
          onFileChange={handleVideoChange}
          onRemoveFile={() => setVideoFile(null)}
          accept="video/*,.mp4,.mkv,.avi,.mov,.webm,.m4v"
          supportedFormats="MP4, MKV or AVI"
          maxSize="1 GB"
          isDragging={isVideoDragging}
          onDragOver={handleVideoDragOver}
          onDragLeave={handleVideoDragLeave}
          onDrop={handleVideoDrop}
        />
        {errors.video && (
          <span className="text-xs text-[#f25a5a] -mt-3">{errors.video}</span>
        )}

        {/* Upload transcript */}
        <FileUploadArea
          label="Upload transcript"
          file={transcriptFile}
          onFileChange={handleTranscriptChange}
          onRemoveFile={() => setTranscriptFile(null)}
          accept=".txt,.doc,.docx,.pdf"
          supportedFormats="txt"
          maxSize="10 MB"
          isDragging={isTranscriptDragging}
          onDragOver={handleTranscriptDragOver}
          onDragLeave={handleTranscriptDragLeave}
          onDrop={handleTranscriptDrop}
        />
        {errors.transcript && (
          <span className="text-xs text-[#f25a5a] -mt-3">
            {errors.transcript}
          </span>
        )}
      </div>

      {/* Toast Message */}
      {toastMessage?.show && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toastMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <p className="font-urbanist text-[14px]">{toastMessage.message}</p>
        </div>
      )}
    </div>
  );
};

export default StudioOnboardingSettings;
