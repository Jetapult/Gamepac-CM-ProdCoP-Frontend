import React, { useState, useRef, useEffect } from "react";
import {
  AltArrowDown,
  Copy,
  Dialog,
  ForwardRight,
  MenuDots,
  Siderbar,
  UserRounded,
  Star,
  TrashBinTrash,
} from "@solar-icons/react";
import gamepacLogo from "../../assets/super-agents/gamepac-logo.svg";
import sidebarCloseIcon from "../../assets/super-agents/side-drawer-close-icon.svg";
import newChatIcon from "../../assets/super-agents/add-square.svg";
import libraryIcon from "../../assets/super-agents/library-icon.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsSiderbarOpen,
  setSelectedAgent,
  setSelectedTask,
} from "../../store/reducer/superAgent";
import { agents, getAgentById, getAgentBySlug } from "../index";

const tasks = [
  {
    id: 1,
    title: "Build a Tic Tac Toe Game on Web",
    description: "Build a Tic Tac Toe Game on Web",
    agentSlug: "liveops",
  },
  {
    id: 2,
    title: "Give me idea for a women specific game options",
    description: "Give me idea for a women specific game options",
    agentSlug: "ua-playbook",
  },
  {
    id: 3,
    title: "Suggest me some game mechanics for a Tower Defense game",
    description: "Suggest me some game mechanics for a Tower Defense game",
    agentSlug: "game-director-report",
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const selectedAgent = useSelector((state) => state.superAgent.selectedAgent);
  const selectedTask = useSelector((state) => state.superAgent.selectedTask);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    dispatch(setIsSiderbarOpen(!isSiderbarOpen));
  };

  const handleAgentSelect = (agent) => {
    dispatch(
      setSelectedAgent({ id: agent.id, name: agent.name, slug: agent.slug })
    );
    navigate(`/super-agent/${agent.slug}`);
  };

  return (
    <div
      className={`fixed left-0 top-0 lg:sticky h-screen bg-white border-r border-[#f6f6f6] flex flex-col z-50 transition-all duration-300 ${
        isSiderbarOpen ? "w-[290px]" : "w-[64px]"
      }`}
    >
      <div
        className={`flex flex-col h-full py-5 overflow-hidden ${
          isSiderbarOpen ? "px-4" : "items-center"
        }`}
      >
        {/* Header with Logo and Toggle */}
        <div
          className={`flex items-center mb-8 shrink-0 ${
            isSiderbarOpen ? "justify-between w-full" : ""
          }`}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <div
            className="flex items-center justify-center gap-2 overflow-hidden"
            onMouseEnter={() => setIsLogoHovered(true)}
          >
            {isLogoHovered && !isSiderbarOpen ? (
              <div className="cursor-pointer size-[30px] m-1 text-[#6d6d6d] flex items-center justify-center bg-[#F1FCF6] rounded-[5px]">
                <Siderbar
                  color="#6d6d6d"
                  onClick={toggleSidebar}
                  className="cursor-pointer size-[24px]"
                />
              </div>
            ) : (
              <img
                src={gamepacLogo}
                alt="GamePac Logo"
                className="size-[38px] shrink-0 cursor-pointer"
                onClick={toggleSidebar}
              />
            )}
            {isSiderbarOpen && (
              <span
                className="font-urbanist font-medium text-[16px] text-[#141414] whitespace-nowrap cursor-pointer"
                onClick={() => navigate("/super-agent")}
              >
                Gamepac
              </span>
            )}
          </div>
          {isSiderbarOpen && (
            <button
              onClick={toggleSidebar}
              className="size-[24px] flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors shrink-0 cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <img
                src={sidebarCloseIcon}
                alt="Sidebar Close Icon"
                className="size-[28px]"
              />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className={`mb-7 shrink-0 ${isSiderbarOpen ? "w-full" : ""}`}>
          <button
            className="flex items-center gap-2 text-[#1f6744] cursor-pointer"
            onClick={toggleSidebar}
          >
            <img
              src={newChatIcon}
              alt="New Chat Icon"
              className="size-[32px]"
            />
            {isSiderbarOpen && (
              <span className="font-urbanist font-medium text-[16px] whitespace-nowrap">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons Grid - Only when expanded */}
        {isSiderbarOpen && (
          <div className="mb-10 shrink-0 w-full">
            <div className="grid grid-cols-3 gap-4">
              {agents.map((button) => (
                <ActionButton
                  key={button.id}
                  icon={button.icon}
                  activeIcon={
                    button.activeIcon ? button.activeIcon : button.icon
                  }
                  label={button.name}
                  onClick={() => handleAgentSelect(button)}
                  selected={selectedAgent.id === button.id}
                />
              ))}
            </div>
          </div>
        )}

        {selectedAgent.id && !isSiderbarOpen && (
          <div className="flex items-center gap-2 mb-6">
            <button className="flex items-center gap-2 cursor-pointer bg-[#F1FCF6] text-[#1F6744] rounded-[5px] p-1.5 w-full">
              {getAgentById(selectedAgent.id)?.activeIcon ||
                getAgentById(selectedAgent.id)?.icon}
            </button>
          </div>
        )}

        {/* Library Section */}
        <div className="flex items-center gap-2 mb-6">
          <button
            className={`flex items-center gap-2 cursor-pointer hover:bg-[#F1FCF6] rounded-[5px] p-1.5 w-full ${
              location.pathname === "/super-agent/library" ? "bg-[#F1FCF6]" : ""
            }`}
            onClick={() => navigate("/super-agent/library")}
          >
            <img src={libraryIcon} alt="Library Icon" className="w-6 h-6" />
            {isSiderbarOpen && (
              <span className="font-urbanist text-base">Library</span>
            )}
          </button>
        </div>

        {/* Task List - Only when expanded */}
        {tasks.length > 0 &&
          (isSiderbarOpen ? (
            <div className="flex-1 overflow-y-auto w-full">
              <div className="flex items-center gap-[5px] mb-2">
                <span className="font-urbanist text-[13px] text-[#b0b0b0]">
                  All tasks
                </span>
                <AltArrowDown
                  weight={"Linear"}
                  className="w-4 h-4 text-[#6D6D6D]"
                />
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    text={task.title}
                    active={selectedTask?.id === task?.id}
                    slug={task.agentSlug}
                    onClick={() => {
                      dispatch(setSelectedTask(task));
                      navigate(`/super-agent/chat/id-slug-of-the-chat`);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Dialog
              weight={"Linear"}
              className="size-[24px] text-[#6d6d6d] cursor-pointer"
              onClick={toggleSidebar}
            />
          ))}

        {/* Account Section at Bottom */}
        <div
          className={`shrink-0 mt-auto ${
            isSiderbarOpen ? "w-full border-t border-[#f6f6f6] pt-4" : "pt-4"
          }`}
        >
          <button
            className={`flex items-center gap-2 text-[#141414] hover:opacity-80 transition-opacity ${
              isSiderbarOpen ? "" : "justify-center"
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <UserRounded weight={"Linear"} className="w-6 h-6 #1C274C" />
            </div>
            {isSiderbarOpen && (
              <span className="font-urbanist font-medium text-[16px] whitespace-nowrap">
                Account
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon, activeIcon, label, onClick, selected }) => {
  return (
    <button
      className={`border rounded-[6px] leading-none px-0.5 py-2 flex flex-col items-center justify-between h-[60px] w-[79px] transition-colors ${
        selected
          ? "border-[#1F6744] bg-[#F1FCF6] text-[#1F6744]"
          : "hover:bg-[#F6F6F6] text-[#6d6d6d] border-[#e6e6e6] bg-white"
      }`}
      onClick={onClick}
    >
      <div className="">{selected ? activeIcon : icon}</div>
      <span className="font-urbanist text-[10px] text-center">{label}</span>
    </button>
  );
};

// Task Item Component
const TaskItem = ({ text, active = false, onClick, slug }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    console.log(`${action} action triggered for task: ${text}`);
    setShowDropdown(false);
    // Add your action handlers here
  };

  return (
    <div
      className={`group flex items-center gap-[16px] p-1.5 rounded-lg w-full text-left transition-colors cursor-pointer relative ${
        active ? "bg-[#f6f6f6]" : "hover:bg-[#f6f6f6]"
      }`}
      onClick={onClick}
    >
      <span className="text-[#6D6D6D] shrink-0">
        {getAgentBySlug(slug)?.icon}
      </span>
      <span className="font-urbanist font-medium text-[14px] text-[#141414] truncate leading-[21px] flex-1 min-w-0">
        {text}
      </span>
      <span
        className={`${
          active ? "" : "hidden"
        } group-hover:block shrink-0 bg-[#DFDFDF] rounded-lg p-1 cursor-pointer`}
        onClick={handleMenuClick}
      >
        <MenuDots weight={"Bold"} size={15} color="#6D6D6D" />
      </span>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full p-1 px-1.5 mt-1 w-[160px] bg-white border border-[#f1f1f1] rounded-lg shadow-lg z-50"
        >
          <button
            onClick={(e) => handleAction("share", e)}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f6f6f6] transition-colors border-b border-[#f1f1f1] first:rounded-t-lg"
          >
            <ForwardRight weight={"Linear"} size={20} color="#6D6D6D" />
            <span className="font-urbanist font-medium text-[14px] text-[#141414]">
              Share
            </span>
          </button>
          <button
            onClick={(e) => handleAction("favourite", e)}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f6f6f6] transition-colors border-b border-[#f1f1f1]"
          >
            <Star weight={"Linear"} size={20} color="#6D6D6D" />
            <span className="font-urbanist font-medium text-[14px] text-[#141414]">
              Favourite
            </span>
          </button>
          <button
            onClick={(e) => handleAction("duplicate", e)}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f6f6f6] transition-colors border-b border-[#f1f1f1]"
          >
            <Copy weight={"Linear"} size={20} color="#6D6D6D" />
            <span className="font-urbanist font-medium text-[14px] text-[#141414]">
              Duplicate
            </span>
          </button>
          <button
            onClick={(e) => handleAction("delete", e)}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f6f6f6] transition-colors last:rounded-b-lg"
          >
            <TrashBinTrash weight={"Linear"} size={20} color="#f25a5a" />
            <span className="font-urbanist font-medium text-[14px] text-[#f25a5a]">
              Delete
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
