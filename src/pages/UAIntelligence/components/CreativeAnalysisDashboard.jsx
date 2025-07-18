import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { papi } from "../../../api";
import HistorySidebar from "./HistorySidebar";
import moment from "moment";

const CreativeAnalysisDashboard = ({ analysisId, userData, ContextStudioData }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uploadMethod, setUploadMethod] = useState("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [fetchingAnalysis, setFetchingAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [creativeGalleryAdId, setCreativeGalleryAdId] = useState(null);

  const inputRef = useRef(null);
  const hasProcessedUrlParams = useRef(false);
  const STUDIO_ID = ContextStudioData?.id;

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisById(analysisId);
    }
  }, [analysisId]);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    const adId = searchParams.get("ad_id");
    if (
      urlParam &&
      adId &&
      !hasProcessedUrlParams.current &&
      STUDIO_ID &&
      userData.id
    ) {
      hasProcessedUrlParams.current = true;
      setCreativeGalleryAdId(adId);
      setUploadMethod("link");
      setVideoUrl(urlParam);
      setPreviewUrl(urlParam);
      setError("");
      setTimeout(() => {
        analyzeCreative(urlParam, "link", adId);
      }, 500);
    }
  }, [
    searchParams.get("url"),
    searchParams.get("ad_id"),
    STUDIO_ID,
    userData.id,
  ]);

  const mapApiResponseToUI = (apiResponse, isFromFetch = false) => {
    let analysis;
    let baseData;

    if (isFromFetch) {
      analysis = apiResponse.analysis_data;
      baseData = {
        id: apiResponse.id,
        media_url: apiResponse.media_url || "",
        media_type: apiResponse.media_type || "",
        original_filename: apiResponse.original_filename || "",
        file_size_bytes: apiResponse.file_size_bytes || 0,
        response: apiResponse.response_synopsis || "",
        created_at: apiResponse.created_at || "",
        updated_at: apiResponse.updated_at || "",
        analysis_id: apiResponse.id,
      };
    } else {
      // Data structure from upload API
      analysis = apiResponse.analysis;
      baseData = {
        media_url: apiResponse.media_url || "",
        analysis_id: apiResponse.analysis_id || null,
        response: apiResponse.response || "",
      };
    }

    return {
      ...baseData,
      meta_tags:
        analysis["meta_tags"] || analysis["Meta Tags and Sub Tags"] || [],
      creative_type:
        analysis["creative_type"] || analysis["Type of Creative"] || "",
      messaging_theme:
        analysis["messaging"] || analysis["Messaging on Creative"] || "",
      call_to_action: Array.isArray(analysis["call_to_action"])
        ? analysis["call_to_action"]
        : Array.isArray(analysis["Call to Action on Creative"])
        ? analysis["Call to Action on Creative"]
        : [
            analysis["call_to_action"] ||
              analysis["Call to Action on Creative"],
          ].filter(Boolean),
      primary_colors:
        analysis["primary_colors"] ||
        analysis["3 Primary Colors on Creative"] ||
        [],
      audio_profile: analysis["audio"] || analysis["Audio"] || "",
      opening_hook: analysis["opening_hook"] || analysis["Opening Hook"] || "",
      duration_category: analysis["Duration"] || "",
      game_mechanic:
        analysis["game_mechanic"] || analysis["Game Mechanic"] || "",
      language_used:
        analysis["language"] || analysis["Language Used in the Video"] || "",
      script_summary:
        analysis["summary"] || analysis["Summary of the Video Script"] || "",
      scenes: analysis.scenes || [],
    };
  };

  const fetchAnalysisById = async (id) => {
    try {
      setFetchingAnalysis(true);
      setError("");

      const response = await api.get(`/v1/ua-intel/media-analysis/${id}`);

      if (response.data && response.data.data) {
        const mappedResult = mapApiResponseToUI(response.data.data, true);
        setAnalysisData(mappedResult);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Fetch analysis error:", error);

      if (error.response) {
        if (error.response.status === 404) {
          setError("Analysis not found. Please check the ID and try again.");
        } else {
          const errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
          setError(errorMessage);
        }
      } else if (error.request) {
        setError(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      } else {
        setError(error.message || "Failed to load analysis. Please try again.");
      }
    } finally {
      setFetchingAnalysis(false);
    }
  };

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
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

    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);

    const url = e.target.value.trim();
    // const validTypes = [".mp4", ".mov", ".jpeg", ".jpg", ".png", ".gif"];
    // const isValidUrl = validTypes.some((type) =>
    //   url?.toLowerCase()?.endsWith(type)
    // );

    if (url) {
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

  const analyzeCreative = async (url, method, adId) => {
    if (!previewUrl && !url) {
      setError("Please upload a file or enter a URL first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("studio_id", STUDIO_ID);
      formData.append("user_id", userData.id);

      if ((uploadMethod === "file" || method === "file") && selectedFile) {
        formData.append("media_file", selectedFile);
      } else if (
        (uploadMethod === "link" || method === "link") &&
        (videoUrl || url)
      ) {
        formData.append("media_url", videoUrl || url);
      } else {
        throw new Error("Please provide either a file or a URL");
      }

      if (creativeGalleryAdId || adId) {
        formData.append("creative_gallery_id", creativeGalleryAdId || adId);
      }

      const response = await papi.post(`/api/agent/media-analysis`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.analysis_id) {
        setError("");
        setRedirecting(true);
        setTimeout(() => {
          navigate(`/ua-intelligence/analyse/${response.data.analysis_id}`);
        }, 1000);
      } else {
        const mappedResult = mapApiResponseToUI(response.data, false);
        setAnalysisData(mappedResult);
      }
    } catch (error) {
      console.error("Analysis error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        setError(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      } else {
        setError(
          error.message || "Failed to analyze creative. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRedirecting(false);
    }
  };

  if (fetchingAnalysis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <HistorySidebar currentAnalysisId={analysisId} studioId={STUDIO_ID} />
        <div className="md:col-span-9 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-8 w-8 text-gray-600"
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
            <span className="text-gray-600">Loading analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (analysisId && error && !analysisData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <HistorySidebar currentAnalysisId={analysisId} studioId={STUDIO_ID} />
        <div className="md:col-span-9 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => fetchAnalysisById(analysisId)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/ua-intelligence/analyse")}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back to Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <HistorySidebar currentAnalysisId={analysisId} studioId={STUDIO_ID} />
      <div className="md:col-span-9">
        {analysisData && Object.keys(analysisData).length > 0 ? (
          <div className="space-y-6">
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 bg-gray-100">
                  <div className="h-[700px] w-full relative overflow-hidden">
                    {analysisData?.media_type === "video" ||
                    analysisData?.media_url?.toLowerCase()?.endsWith(".mp4") ||
                    analysisData?.media_url?.toLowerCase()?.endsWith(".mov") ||
                    (selectedFile && selectedFile.type.startsWith("video/")) ? (
                      <video
                        src={analysisData?.media_url || previewUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={analysisData?.media_url || previewUrl}
                        alt="Creative Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="md:col-span-7 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Creative Analysis</h3>
                    <div className="text-right">
                      {analysisData?.analysis_id && (
                        <div className="text-sm text-gray-500">
                          ID: {analysisData?.analysis_id}
                        </div>
                      )}
                      {analysisData?.created_at && (
                        <div className="text-sm text-gray-500">
                          Created:{" "}
                          {moment(analysisData?.created_at).format(
                            "Do MM YYYY h:m"
                          )}
                        </div>
                      )}
                      {analysisData?.file_size_bytes && (
                        <div className="text-sm text-gray-500">
                          Size:{" "}
                          {(
                            analysisData?.file_size_bytes /
                            (1024 * 1024)
                          ).toFixed(2)}{" "}
                          MB
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Creative Type
                      </div>
                      <div className="font-medium">
                        {analysisData?.creative_type}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Messaging Theme
                      </div>
                      <div className="font-medium">
                        {analysisData?.messaging_theme}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Opening Hook
                      </div>
                      <div className="font-medium">
                        {analysisData?.opening_hook}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Duration</div>
                      <div className="font-medium">
                        {analysisData?.duration_category}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Game Mechanic
                      </div>
                      <div className="font-medium">
                        {analysisData?.game_mechanic}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">
                        Audio Profile
                      </div>
                      <div className="font-medium">
                        {analysisData?.audio_profile}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Language</div>
                      <div className="font-medium">
                        {analysisData?.language_used}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-2">
                      Call to Action
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisData?.call_to_action?.map((cta, index) => (
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
                      {analysisData?.primary_colors?.map((color, index) => (
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
                      {analysisData?.meta_tags?.map((tag, index) => (
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
                    <p className="text-sm">{analysisData?.script_summary}</p>
                  </div>

                  {/* {analysisData?.response && (
                    <div className="mt-4">
                      <div className="text-gray-500 text-sm mb-2">
                        Analysis Summary
                      </div>
                      <p className="text-sm text-gray-600">
                        {analysisData?.response}
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {analysisData?.scenes && analysisData?.scenes?.length > 0 && (
              <div className="border rounded-lg overflow-hidden bg-white p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Scene by Scene Analysis
                </h3>

                <div className="space-y-4">
                  {analysisData?.scenes?.map((scene, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-lg">
                          Scene {scene.scene_number}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {scene.start_time?.toFixed
                            ? scene.start_time.toFixed(1)
                            : scene.start_time}
                          s -{" "}
                          {scene.end_time?.toFixed
                            ? scene.end_time.toFixed(1)
                            : scene.end_time}
                          s (
                          {scene.duration?.toFixed
                            ? scene.duration.toFixed(1)
                            : scene.duration}
                          s)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-2">
                            Description
                          </div>
                          <p className="mb-4">{scene.scene_description}</p>

                          {scene.visual_elements && (
                            <>
                              <div className="text-sm font-medium text-gray-500 mb-2">
                                Visual Elements
                              </div>
                              <p>{scene.visual_elements}</p>
                            </>
                          )}
                        </div>

                        <div>
                          {scene.mood && (
                            <>
                              <div className="text-sm font-medium text-gray-500 mb-2">
                                Mood
                              </div>
                              <p className="mb-4">{scene.mood}</p>
                            </>
                          )}

                          <div className="text-sm font-medium text-gray-500 mb-2">
                            Engagement Elements
                          </div>
                          <p>{scene.engagement_elements}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setAnalysisData({});
                  navigate("/ua-intelligence/analyse");
                }}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Analyze New Creative
              </button>
              <div className="flex gap-2">
                {analysisId && (
                  <button
                    onClick={() => fetchAnalysisById(analysisId)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Refresh Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-6">Upload Creative</h2>

            <div className="flex mb-6">
              <button
                onClick={() => setUploadMethod("file")}
                className={`px-4 py-2 rounded-l-md border ${
                  uploadMethod === "file"
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadMethod("link")}
                className={`px-4 py-2 rounded-r-md border-t border-r border-b ${
                  uploadMethod === "link"
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                Enter Link
              </button>
            </div>

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

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {previewUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview
                </h3>
                <div className="border rounded-lg overflow-hidden w-[30%] h-[400px] relative">
                  {previewUrl?.toLowerCase()?.endsWith(".mp4") ||
                  previewUrl?.toLowerCase()?.endsWith(".mov") ||
                  (selectedFile && selectedFile.type.startsWith("video/")) ? (
                    <div className="h-full w-full relative overflow-hidden">
                      <video
                        src={previewUrl}
                        className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                      />
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
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                      />
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
              disabled={!previewUrl || loading || redirecting}
              className={`w-full bg-[#B9FF66] text-black py-3 px-6 rounded-md font-medium
                    ${
                      !previewUrl || loading || redirecting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#a1ff33]"
                    }`}
            >
              {redirecting ? (
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
                  Analysis Complete! Redirecting...
                </span>
              ) : loading ? (
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
        )}
      </div>
    </div>
  );
};

export default CreativeAnalysisDashboard;
