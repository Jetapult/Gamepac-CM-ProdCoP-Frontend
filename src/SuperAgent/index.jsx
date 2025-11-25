import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import honeycombPattern from "../assets/super-agents/Honeycomb.svg";
import {
  ChatRoundLine,
  ChatSquare2,
  Mailbox,
  Paperclip,
  Plain,
  PlugCircle,
  Notebook2,
  SmileCircle,
  Refresh
} from "@solar-icons/react";
import PuzzleIcon from "../assets/super-agents/puzzle-icon.svg";
import TemplateSection from "./components/TemplateSection";

const tabs = [
  {
    id: 1,
    icon: <ChatRoundLine weight={"Linear"} size={18} />,
    label: "Chat",
    slug: "chat",
  },
  {
    id: 2,
    icon: <Mailbox weight={"Linear"} size={18} />,
    label: "Feed",
    slug: "feed",
  },
];

const quickActions = [
  {
    id: 1,
    icon: (
      <img src={PuzzleIcon} alt="Puzzle Icon" className="size-[16px] #6D6D6D" />
    ),
    label: "Game Assets",
    slug: "game-assets",
  },
  {
    id: 2,
    icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
    label: "Story Builder",
    slug: "story-builder",
  },
  {
    id: 3,
    icon: <ChatSquare2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
    label: "Market Research",
    slug: "market-research",
  },
  {
    id: 4,
    icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
    label: "Sentiment Analysis",
    slug: "sentiment-analysis",
  },
];

const SuperAgent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("recommended");

  // Handle sending a message or clicking quick actions - navigate to chat page
  const handleStartChat = () => {
    navigate("/super-agent/chat");
  };

  return (
    <div className="relative w-full min-h-screen bg-white pt-[80px] bg-no-repeat 2xl:bg-cover 2xl:bg-center bg-[url('/src/assets/super-agents/super-agent-bg.svg')]">
      {/* <Header /> */}
      <Sidebar />
      <div className="absolute left-0 bottom-0 w-full h-[180px] z-10">
        <img
          src={honeycombPattern}
          alt="Honeycomb Pattern"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Main Content */}
      <div className="ml-[64px] h-full flex flex-col transition-all duration-300">
        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="bg-[#f6f6f6] border border-[#e6e6e6] rounded-lg p-0.5 flex gap-1.5">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.slug)}
                  className={`px-4 py-0.5 rounded-lg flex items-center gap-2 transition-all ${
                    activeTab === tab.slug
                      ? "bg-[#1f6744] text-white"
                      : "text-[#6d6d6d] hover:text-[#1f6744]"
                  }`}
                >
                  {tab.icon}
                  <span
                    className="text-base font-medium"
                    style={{ fontFamily: "Urbanist, sans-serif" }}
                  >
                    {tab.label}
                  </span>
                </button>
                {index < tabs.length - 1 && (
                  <div className="w-px h-6 bg-[#E6E6E6] self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center py-16">
          <h1
            className="text-4xl font-semibold text-[#1f6744] mb-3"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Ask GamePac to trigger in-game events
          </h1>
          <p
            className="text-lg text-[#b0b0b0]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            where Ideas come to reality
          </p>
        </div>

        {/* Chat Input Area */}
        <div className="flex flex-col items-center px-8 max-w-[900px] mx-auto w-full">
          <div className="w-full bg-[#f6f6f6] border border-[#f6f6f6] rounded-2xl p-2 px-4 pt-3 mb-5 relative">
            <div className="flex items-center justify-between mb-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
                placeholder="Generate a professional sentiment analysis report"
                className="flex-1 bg-transparent border-none outline-none text-lg text-[#141414] placeholder:text-[#b0b0b0]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
                rows={4}
              />
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {/* Attachment button */}
                <button className="w-9 h-9 bg-white border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] hover:bg-[#E6E6E6] transition-colors">
                  <Paperclip weight={"Linear"} size={16} color="#6D6D6D" />
                </button>

                {/* Plugin button */}
                <button className="w-9 h-9 bg-white border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] hover:bg-[#E6E6E6] transition-colors">
                  <PlugCircle weight={"Linear"} size={16} color="#6D6D6D" />
                </button>
              </div>

              {/* Send button */}
              <button
                onClick={handleStartChat}
                className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all relative overflow-hidden cursor-pointer disabled:cursor-not-allowed border border-[rgba(255,255,255,0.3)] ${
                  !inputValue.trim()
                    ? "bg-[#E6E6E6]"
                    : "bg-[linear-gradient(333deg,#11A85F_13.46%,#1F6744_103.63%)]"
                }`}
                disabled={!inputValue.trim()}
              >
                <Plain
                  weight={"Linear"}
                  size={20}
                  color={!inputValue.trim() ? "#B0B0B0" : "#FFFFFF"}
                />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-5 justify-center">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={handleStartChat}
                className="bg-white border border-[#e6e6e6] rounded-lg px-2 py-0.5 flex items-center gap-2 text-[#6d6d6d] hover:text-[#1f6744] hover:border-[#1f6744] hover:bg-[#F1FCF6] transition-all"
              >
                {action.icon}
                <span
                  className="text-base font-medium"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Feed Section - Only visible when Feed tab is active */}
        {activeTab === "feed" && (
          <TemplateSection
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        )}
      </div>
    </div>
  );
};


export default SuperAgent;
