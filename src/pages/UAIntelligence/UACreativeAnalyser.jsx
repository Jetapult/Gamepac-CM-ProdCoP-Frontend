import React, { useState } from "react";
import "./ua-intelligence.css";
import CreativeAnalysisDashboard from "./components/CreativeAnalysisDashboard";
import BriefGenerator from "./components/BriefGenerator";


const UACreativeAnalyser = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">UA Creative Analyser</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <p
              onClick={() => setActiveTab("dashboard")}
              className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                activeTab === "dashboard"
                  ? "text-black border-b-[2px] border-black"
                  : "text-[#808080]"
              }`}
            >
              Creative Analysis
            </p>
            <p
              onClick={() => setActiveTab("brief")}
              className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                activeTab === "brief"
                  ? "text-black border-b-[2px] border-black"
                  : "text-[#808080]"
              }`}
            >
              Brief Generator
            </p>
          </nav>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <CreativeAnalysisDashboard />
        )}
        
        {/* Brief Generator Tab Content */}
        {activeTab === "brief" && (
          <BriefGenerator />
        )}
      </main>
    </div>
  );
};

export default UACreativeAnalyser;
