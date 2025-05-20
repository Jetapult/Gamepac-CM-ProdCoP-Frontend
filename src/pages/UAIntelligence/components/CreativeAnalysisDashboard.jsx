import React, { useState, useRef, useCallback } from "react";
import PlaceholderImg from "../../../assets/placeholder.svg";

const CreativeAnalysisDashboard = () => {
  const [uploadMethod, setUploadMethod] = useState("link"); // "link" or "file"
  const [videoUrl, setVideoUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // File input ref
  const inputRef = useRef(null);

  // Sample analysis data (will be replaced with actual API response)
  const sampleAnalysisData = {
    meta_tags: ["Animated"],
    creative_type: "Gameplay Footage",
    messaging_theme: "Fail",
    call_to_action: ["Try Now"],
    primary_colors: ["Blue", "Yellow", "Red"],
    audio_profile: "Music + SFX Only",
    opening_hook: "Unexpected Humor",
    duration_category: "≤60s",
    game_mechanic: "Other (Pull the pin)",
    language_used: "English",
    script_summary:
      "The ad shows a scene of a cold house with a mother and daughter. The puzzle is to pull the correct pins to get coins for the house so they aren't cold anymore. The demonstration in the ad causes the gold to go into a fire which makes the characters cry. The game shows different scenarios. The ad ends with 'Try Again'.",
  };

  // Handle file drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/mov",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      setError(
        "Please upload a valid video (MP4, MOV) or image (JPEG, PNG, GIF) file"
      );
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);

    // Basic URL validation
    const url = e.target.value.trim();
    const validTypes = [".mp4", ".mov", ".jpeg", ".jpg", ".png", ".gif"];
    const isValidUrl = validTypes.some((type) =>
      url.toLowerCase().endsWith(type)
    );

    if (url && !isValidUrl) {
      setError(
        "Please enter a valid URL for video (MP4, MOV) or image (JPEG, PNG, GIF) files"
      );
    } else {
      setError("");
      if (url) {
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Handle analysis
  const analyzeCreative = () => {
    if (!previewUrl) {
      setError("Please upload a file or enter a URL first");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call with timeout
    setTimeout(() => {
      setAnalysisResult(sampleAnalysisData);
      setLoading(false);
    }, 1500);
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Left panel - History */}
      <div className="md:col-span-3 border rounded-lg p-4 h-min">
        <h3 className="text-lg font-medium mb-4">History</h3>
        <div className="text-sm text-gray-500">
          {analysisResult ? (
            <div className="p-3 border rounded-md mb-2 cursor-pointer hover:bg-gray-50">
              <div className="font-medium text-black">
                {analysisResult.creative_type}
              </div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleString()}
              </div>
            </div>
          ) : (
            <p>No analysis history yet</p>
          )}
        </div>
      </div>

      {/* Right panel - Upload and Analysis */}
      <div className="md:col-span-9">
        {!analysisResult ? (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Upload Creative</h2>

            {/* Upload method toggle */}
            <div className="flex mb-6">
              <button
                onClick={() => setUploadMethod("link")}
                className={`px-4 py-2 rounded-l-md border ${
                  uploadMethod === "link"
                    ? "bg-white border-gray-200"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                Enter Link
              </button>
              <button
                onClick={() => setUploadMethod("file")}
                className={`px-4 py-2 rounded-r-md border-t border-r border-b ${
                  uploadMethod === "file"
                    ? "bg-white border-gray-200"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                Upload File
              </button>
            </div>

            {/* URL input method */}
            {uploadMethod === "link" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter video or image URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  className="w-full border border-gray-300 rounded-md p-3"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}

            {/* File upload method */}
            {uploadMethod === "file" && (
              <div
                className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center 
                      ${
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/mp4,video/mov,image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, MOV, JPEG, PNG or GIF
                  </p>
                  <button
                    type="button"
                    onClick={() => inputRef.current.click()}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Preview */}
            {previewUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview
                </h3>
                <div className="border rounded-lg overflow-hidden w-[30%] h-[400px] relative">
                  {previewUrl.toLowerCase().endsWith(".mp4") ||
                  previewUrl.toLowerCase().endsWith(".mov") ||
                  (selectedFile && selectedFile.type.startsWith("video/")) ? (
                    <div className="h-full w-full relative overflow-hidden">
                      {/* Video with blurred background */}
                      <video
                        src={previewUrl}
                        className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                      />

                      {/* Clear center video */}
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-[70%] h-full overflow-hidden shadow-md">
                          <video
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            controls
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full relative overflow-hidden">
                      {/* Image with blurred background */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                      />

                      {/* Clear center image */}
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-[70%] h-full overflow-hidden shadow-md">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={analyzeCreative}
              disabled={!previewUrl || loading}
              className={`w-full bg-[#B9FF66] text-black py-3 px-6 rounded-md font-medium
                    ${
                      !previewUrl || loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#a1ff33]"
                    }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Creative"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis result */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Preview panel - Left side */}
                <div className="md:col-span-5 bg-gray-100">
                  <div className="h-[700px] w-full relative overflow-hidden">
                    {previewUrl.toLowerCase().endsWith(".mp4") ||
                    previewUrl.toLowerCase().endsWith(".mov") ||
                    (selectedFile && selectedFile.type.startsWith("video/")) ? (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Analysis panel - Right side */}
                <div className="md:col-span-7 p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Creative Analysis
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Creative Type
                      </div>
                      <div className="font-medium">
                        {analysisResult.creative_type}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Messaging Theme
                      </div>
                      <div className="font-medium">
                        {analysisResult.messaging_theme}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Opening Hook
                      </div>
                      <div className="font-medium">
                        {analysisResult.opening_hook}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Duration</div>
                      <div className="font-medium">
                        {analysisResult.duration_category}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Game Mechanic
                      </div>
                      <div className="font-medium">
                        {analysisResult.game_mechanic}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Audio Profile
                      </div>
                      <div className="font-medium">
                        {analysisResult.audio_profile}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Language</div>
                      <div className="font-medium">
                        {analysisResult.language_used}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-2">
                      Call to Action
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.call_to_action.map((cta, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-2">
                      Primary Colors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.primary_colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-2">Meta Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.meta_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-sm mb-2">
                      Script Summary
                    </div>
                    <p className="text-sm">{analysisResult.script_summary}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Analyze Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeAnalysisDashboard;
