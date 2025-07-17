import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ua-intelligence.css";
import CreativeAnalysisDashboard from "./components/CreativeAnalysisDashboard";
import BriefGenerator from "./components/BriefGenerator";
import { useSelector } from "react-redux";

const UACreativeAnalyser = () => {
  const userData = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { ad_id } = useParams();

  return (
    <div className="h-[calc(100vh - 60px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-8 bg-gradient-to-b from-gray-800 to-black rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UA Creative Analyser</h1>
                <p className="text-sm text-gray-500 mt-1">Analyze and optimize your creative performance</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Analysis Ready</span>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`relative py-4 px-1 text-sm font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
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
                {activeTab === "dashboard" && (
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
                  <span>Brief Generator</span>
                </div>
                {activeTab === "brief" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"></div>
                )}
              </button>
            </nav>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "dashboard" && (
            <CreativeAnalysisDashboard analysisId={ad_id} userData={userData} />
          )}
          
          {activeTab === "brief" && (
            <BriefGenerator />
          )}
        </div>
      </main>
    </div>
  );
};

export default UACreativeAnalyser;
