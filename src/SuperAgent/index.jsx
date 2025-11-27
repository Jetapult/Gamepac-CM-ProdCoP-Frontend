import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import honeycombPattern from "../assets/super-agents/Honeycomb.svg";
import {
  ChatRoundLine,
  ChatSquare2,
  Mailbox,
  Notebook2,
  SmileCircle,
} from "@solar-icons/react";
import PuzzleIcon from "../assets/super-agents/puzzle-icon.svg";
import TemplateSection from "./components/TemplateSection";
import ChatInput from "./components/ChatInput";
import { useSelector } from "react-redux";

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
  const isSiderbarOpen = useSelector((state) => state.superAgent.isSiderbarOpen);
  const [activeTab, setActiveTab] = useState("chat");
  const [activeFilter, setActiveFilter] = useState("recommended");
  const [selectedAgent, setSelectedAgent] = useState("");

  const handleStartChat = () => {
    navigate("/super-agent/chat");
  };

  return (
    <div className="relative flex  min-h-screen bg-white bg-no-repeat 2xl:bg-cover 2xl:bg-center bg-[url('/src/assets/super-agents/super-agent-bg.svg')]">
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
      <div className={`ml-[64px] w-full h-full pt-[80px] flex flex-col transition-all duration-300`}>
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
                    className="text-base font-medium font-urbanist"
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
            className="text-4xl font-semibold text-[#1f6744] mb-3 font-urbanist"
          >
            Ask GamePac to trigger in-game events
          </h1>
          <p
            className="text-lg text-[#b0b0b0] font-urbanist"
          >
            where Ideas come to reality
          </p>
        </div>

        {/* Chat Input Area */}
        <div className="flex flex-col items-center px-8 w-full max-w-[800px] mx-auto w-full">
          <ChatInput handleStartChat={handleStartChat} />

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-5 justify-center">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`bg-white border border-[#e6e6e6] rounded-lg cursor-pointer px-2 py-0.5 flex items-center gap-2 text-[#6d6d6d] hover:text-[#1f6744] hover:border-[#1f6744] hover:bg-[#F1FCF6] transition-all ${selectedAgent === action.slug ? "border-[#1f6744] bg-[#F1FCF6] text-[#1f6744]" : ""}`}
                onClick={() => setSelectedAgent(action.slug)}
              >
                {action.icon}
                <span
                  className="text-base font-medium font-urbanist"
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
