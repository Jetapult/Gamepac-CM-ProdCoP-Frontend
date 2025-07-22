import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ua-intelligence.css";
import CreativeAnalysisDashboard from "./components/CreativeAnalysisDashboard";
import BriefGenerator from "./components/BriefGenerator";
import HistorySidebar from "./components/HistorySidebar";
import { useSelector } from "react-redux";

const UACreativeAnalyser = () => {
  const userData = useSelector((state) => state.user.user);
  const ContextStudioData = useSelector((state) => state.admin.ContextStudioData);
  const [activeTab, setActiveTab] = useState("analysis");
  const [analysisData, setAnalysisData] = useState(null);
  const { ad_id } = useParams();

  const handleAnalysisDataChange = (data) => {
    setAnalysisData(data);
  };

  return (
    <div className="h-[calc(100vh - 60px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-black rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UA Creative Analyser</h1>
                <p className="text-sm text-gray-500 mt-1">Analyze creatives and generate optimized briefs with storyboards</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <HistorySidebar currentAnalysisId={ad_id} studioId={ContextStudioData?.id} />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`relative py-4 px-1 text-sm font-medium transition-all duration-200 ${
                    activeTab === "analysis"
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    <span>Creative Analysis</span>
                  </div>
                  {activeTab === "analysis" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"></div>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab("brief")}
                  className={`relative py-4 px-1 text-sm font-medium transition-all duration-200 ${
                    activeTab === "brief"
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    <span>Brief & Storyboard</span>
                  </div>
                  {activeTab === "brief" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"></div>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {analysisData && activeTab === "analysis" && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Ready to generate AI-powered brief and storyboard
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Use your creative analysis to generate compelling briefs and visual storyboards
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("brief")}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Generate Brief & Storyboard
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {activeTab === "analysis" && (
                <CreativeAnalysisDashboard 
                  analysisId={ad_id} 
                  userData={userData} 
                  ContextStudioData={ContextStudioData}
                  onAnalysisDataChange={handleAnalysisDataChange}
                  hideHistorySidebar={true}
                />
              )}
              
              {activeTab === "brief" && (
                <BriefGenerator 
                  ad_id={ad_id}
                  analysisData={analysisData}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UACreativeAnalyser;
