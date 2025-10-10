import React, { useEffect, useState, useRef } from "react";
import { papi } from "../../../api";

const formatAdType = (adType) => {
  if (!adType) return "";
  return adType
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const scrollbarStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const BriefGenerator = ({ ad_id }) => {
  const [briefData, setBriefData] = useState(null);
  const [storyboardData, setStoryboardData] = useState([]);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [error, setError] = useState("");
  const [activeStoryboardFrame, setActiveStoryboardFrame] = useState(0);
  const hasGenerated = useRef(false);

  const generateBrief = async () => {
    if (!ad_id) {
      setError("No analysis ID available. Please analyze a creative first.");
      return;
    }

    try {
      setIsGeneratingBrief(true);
      setError("");
      
      const briefResponse = await papi.post("/api/v1/generate-ad-brief", {
        media_analysis_id: ad_id,
      });
      
      setBriefData(briefResponse.data);
      
      if (briefResponse.data?.id) {
        generateStoryboard(briefResponse.data.id);
      }
    } catch (error) {
      console.error("Error generating brief:", error);
      setError("Failed to generate brief. Please try again.");
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const generateStoryboard = async (briefId) => {
    try {
      setIsGeneratingStoryboard(true);
      setError("");
      
      const storyboardResponse = await papi.post(
        `/api/v1/generate-ad-storyboard?creative_brief_id=${briefId}`
      );
      
      setStoryboardData(storyboardResponse.data);
      setActiveStoryboardFrame(0);
    } catch (error) {
      console.error("Error generating storyboard:", error);
      setError("Failed to generate storyboard. Please try again.");
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  useEffect(() => {
    if (ad_id && !hasGenerated.current) {
      hasGenerated.current = true;
      generateBrief();
    }
  }, [ad_id]);

  const formatText = (text) => {
    if (!text) return "";
    return text.length > 300 ? text.substring(0, 300) + "..." : text;
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Creative Brief & Storyboard Generator
        </h1>
        <p className="text-gray-600">
          AI-powered creative briefs and visual storyboards based on your analysis
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(isGeneratingBrief || isGeneratingStoryboard) && !briefData && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isGeneratingBrief ? "Generating Creative Brief..." : "Generating Storyboard..."}
            </h3>
            <p className="text-gray-600">
              {isGeneratingBrief ? "Analyzing your creative and generating optimized brief" : "Creating visual storyboard frames"}
            </p>
          </div>
        </div>
      )}

      {briefData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Creative Brief</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-generated brief based on your creative analysis
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Generated
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Ad Type</div>
                    <div className="font-medium text-gray-900">{formatAdType(briefData.ad_type)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Campaign Goal</div>
                    <div className="font-medium text-gray-900">{briefData.campaign_goal || "Not specified"}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Brief Overview</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800 leading-relaxed text-sm">
                      {formatText(briefData.brief_text)}
                    </p>
                  </div>
                </div>

                {briefData.concept_overview && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Concept Overview</h3>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-800 leading-relaxed text-sm">
                        {formatText(briefData.concept_overview)}
                      </p>
                    </div>
                  </div>
                )}

                {briefData.target_audience && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-gray-800 leading-relaxed text-sm">
                        {formatText(briefData.target_audience)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {briefData.hook_description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Hook Strategy</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formatText(briefData.hook_description)}
                      </p>
                    </div>
                  )}
                  
                  {briefData.main_demo_description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Main Demo</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formatText(briefData.main_demo_description)}
                      </p>
                    </div>
                  )}
                  
                  {briefData.call_to_action && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Call to Action</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formatText(briefData.call_to_action)}
                      </p>
                    </div>
                  )}

                  {briefData.game_feature && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Game Feature</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formatText(briefData.game_feature)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Storyboard</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Visual storyboard generated from your brief
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isGeneratingStoryboard && (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="text-sm text-purple-600">Generating...</span>
                      </div>
                    )}
                    {storyboardData.length > 0 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {storyboardData.length} Frames
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {storyboardData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isGeneratingStoryboard ? "Generating Storyboard..." : "Storyboard Coming Soon"}
                    </h3>
                    <p className="text-gray-600">
                      {isGeneratingStoryboard ? "Creating visual frames for your brief" : "Storyboard will appear here once generated"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 overflow-hidden">
                        <span className="text-sm text-gray-600 flex-shrink-0">Frame</span>
                        {storyboardData.length > 8 && (
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full flex-shrink-0">
                            {activeStoryboardFrame + 1} / {storyboardData.length}
                          </span>
                        )}
                        <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {storyboardData.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveStoryboardFrame(index)}
                              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                                activeStoryboardFrame === index
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => setActiveStoryboardFrame(Math.max(0, activeStoryboardFrame - 1))}
                          disabled={activeStoryboardFrame === 0}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Previous frame"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setActiveStoryboardFrame(Math.min(storyboardData.length - 1, activeStoryboardFrame + 1))}
                          disabled={activeStoryboardFrame === storyboardData.length - 1}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Next frame"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {storyboardData[activeStoryboardFrame] && (
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden frame-transition">
                          <img
                            src={storyboardData[activeStoryboardFrame].image_url}
                            alt={`Storyboard frame ${activeStoryboardFrame + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE2MCA4MEwyMDAgNjBMMjQwIDgwTDIwMCAxMDBaIiBmaWxsPSIjOUI5OUEwIi8+PC9zdmc+";
                            }}
                          />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Frame {activeStoryboardFrame + 1} Description
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {storyboardData[activeStoryboardFrame].frame_description}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">All Frames</h4>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-3 gap-3 pr-2">
                          {storyboardData.map((frame, index) => (
                            <div
                              key={frame.id}
                              onClick={() => setActiveStoryboardFrame(index)}
                              className={`aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all storyboard-frame ${
                                activeStoryboardFrame === index
                                  ? 'ring-2 ring-purple-500 ring-offset-2'
                                  : 'hover:ring-2 hover:ring-gray-300'
                              }`}
                            >
                              <img
                                src={frame.image_url}
                                alt={`Frame ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE2MCA4MEwyMDAgNjBMMjQwIDgwTDIwMCAxMDBaIiBmaWxsPSIjOUI5OUEwIi8+PC9zdmc+";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BriefGenerator;
