import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import honeycombPattern from "../assets/super-agents/Honeycomb.svg";
import {
  ChatRoundLine,
  Mailbox,
  Notebook2,
  GraphUp,
  Book2,
  Lightbulb,
  Gamepad,
} from "@solar-icons/react";
import TemplateSection from "./components/TemplateSection";
import ChatInput from "./components/ChatInput";
import { useDispatch, useSelector } from "react-redux";
import MegaphoneIcon from "../assets/super-agents/megaphone-icon.svg";
import ActiveMegaphoneIcon from "../assets/super-agents/megaphone-active.svg";
import {
  setSelectedAgent,
  setSelectedTemplate,
} from "../store/reducer/superAgent";
import api from "../api";
import GameDropdown from "./components/GameDropdown";

export const agents = [
  {
    id: "1",
    name: "CommPac",
    slug: "commpac",
    icon: (
      <img src={MegaphoneIcon} alt="Megaphone Icon" className="size-[24px]" />
    ),
    activeIcon: (
      <img
        src={ActiveMegaphoneIcon}
        alt="Active Megaphone Icon"
        className="size-[24px]"
      />
    ),
  },
  {
    id: "2",
    name: "Game Director Report",
    slug: "toyagent",
    icon: <Notebook2 weight={"Linear"} className="size-[24px]" />,
  },
  {
    id: "3",
    name: "ScalePac",
    slug: "scalepac",
    icon: <GraphUp weight={"Linear"} className="w-6 h-6" />,
  },
  {
    id: "4",
    name: "Finanacial Reporting",
    slug: "financial-reporting",
    icon: <Book2 weight={"Linear"} className="size-[24px]" />,
  },
  {
    id: "5",
    name: "UA Playbook",
    slug: "ua-playbook",
    icon: <Lightbulb weight={"Linear"} className="size-[24px]" />,
  },
  {
    id: "6",
    name: "LiveOps",
    slug: "liveops",
    icon: <Gamepad weight={"Linear"} className="size-[24px]" />,
  },
];

export const getAgentBySlug = (slug) => {
  return agents.find((agent) => agent.slug === slug) || null;
};

/**
 * Get agent data by id
 * @param {string} id - The agent id (e.g., "1", "2")
 * @returns {object|null} - The agent object with icon/activeIcon, or null if not found
 */
export const getAgentById = (id) => {
  return agents.find((agent) => agent.id === id) || null;
};

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

const SuperAgent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );
  const [activeTab, setActiveTab] = useState("chat");
  const [activeFilter, setActiveFilter] = useState("recommended");
  const selectedAgent = useSelector((state) => state.superAgent.selectedAgent);
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );

  const onSendMessage = async (query) => {
    if (!selectedGame) {
      alert("Please select a game to continue.");
      return;
    }
    try {
      const title = query?.trim().slice(0, 50) || "";
      const response = await api.post("/v1/superagent/chats", {
        data: {
          agent_slug: selectedAgent.slug,
          game_id: selectedGame?.id,
          studio_slug: ContextStudioData?.slug,
        },
      });
      if (response.data?.success && response.data?.data?.id) {
        const chatId = response.data.data.id;
        // Update chat title via PATCH
        if (title) {
          await api.patch(`/v1/superagent/chats/${chatId}`, { title });
        }
        dispatch(setSelectedTemplate({}));
        navigate(`/super-agent/chat/${chatId}`, {
          state: {
            initialQuery: query,
            agentSlug: selectedAgent.slug,
            gameId: selectedGame?.id,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-white bg-no-repeat 2xl:bg-cover 2xl:bg-center bg-[url('/src/assets/super-agents/super-agent-bg.svg')]">
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
      <div
        className={`w-full h-full pt-[65px] flex flex-col transition-all duration-300`}
      >
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
                  <span className="text-base font-medium font-urbanist">
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

        {/* Studio & Game Selector */}
        <div className="absolute top-4 left-[72px] flex items-center gap-4 z-20">
          {/* Studio Tag */}
          {ContextStudioData && (
            <div className="flex items-center gap-2">
              {(ContextStudioData?.studio_logo || ContextStudioData?.logo) && (
                <div className="w-8 h-8 rounded-[5px] border border-[#f6f6f6] bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      ContextStudioData?.studio_logo || ContextStudioData?.logo
                    }
                    alt=""
                    className="w-[26px] h-[23px] object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              <span
                className="text-[14px] text-[#141414] font-medium leading-6"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {ContextStudioData?.studio_name || ContextStudioData?.name}
              </span>
            </div>
          )}

          {/* Game Dropdown */}
          <GameDropdown />
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center py-12">
          <h1 className="text-4xl font-semibold text-[#1f6744] mb-3 font-urbanist">
            Ask GamePac to trigger in-game events
          </h1>
          <p className="text-lg text-[#b0b0b0] font-urbanist">
            where Ideas come to reality
          </p>
        </div>

        {/* Chat Input Area */}
        <div className="flex flex-col items-center px-8 w-full max-w-[800px] mx-auto w-full">
          <ChatInput onSendMessage={onSendMessage} />
        </div>
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-5 justify-center">
          {agents.map((action) => (
            <button
              key={action.id}
              className={`text-base font-medium font-urbanist border rounded-lg cursor-pointer px-2 py-0.5 flex items-center gap-2 hover:text-[#1f6744] hover:bg-[#F1FCF6] transition-all ${
                selectedAgent.id === action.id
                  ? "border-[#1f6744] bg-[#F1FCF6] text-[#1f6744]"
                  : "text-[#6d6d6d] border-[#e6e6e6] hover:border-[#1f6744] bg-white"
              }`}
              onClick={() =>
                dispatch(
                  setSelectedAgent({
                    id: action.id,
                    name: action.name,
                    slug: action.slug,
                  })
                )
              }
            >
              {action.activeIcon && selectedAgent.id === action.id
                ? action.activeIcon
                : action.icon}
              {action.name}
            </button>
          ))}
        </div>
        {selectedAgent.id && (
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
