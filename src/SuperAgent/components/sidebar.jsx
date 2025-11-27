import React, { useState } from "react";
import { Code, BookOpen } from "lucide-react";
import {
  AltArrowDown,
  Gamepad,
  GraphUp,
  Lightbulb,
  Notebook2,
  Siderbar,
  UserRounded,
} from "@solar-icons/react";
import gamepacLogo from "../../assets/super-agents/gamepac-logo.svg";
import sidebarCloseIcon from "../../assets/super-agents/side-drawer-close-icon.svg";
import newChatIcon from "../../assets/super-agents/add-square.svg";
import libraryIcon from "../../assets/super-agents/library-icon.svg";
import MegaphoneIcon from "../../assets/super-agents/megaphone-icon.svg";
import ActiveMegaphoneIcon from "../../assets/super-agents/megaphone-active.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setIsSiderbarOpen } from "../../store/reducer/superAgent";

const actionButtons = [
  {
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
    label: "CommPac",
    slug: "commpac",
  },
  {
    icon: <Lightbulb weight={"Linear"} className="size-[24px]" />,
    label: "IdeaPac",
    slug: "ideapac",
  },
  {
    icon: <Gamepad weight={"Linear"} className="size-[24px]" />,
    label: "DevPac",
    slug: "devpac",
  },
  {
    icon: <Notebook2 weight={"Linear"} className="size-[24px]" />,
    label: "StoryPac",
    slug: "storypac",
  },
  {
    icon: <GraphUp weight={"Linear"} className="w-6 h-6" />,
    label: "ScalePac",
    slug: "scalepac",
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    dispatch(setIsSiderbarOpen(!isSiderbarOpen));
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
              {actionButtons.map((button) => (
                <ActionButton
                  key={button.label}
                  icon={button.icon}
                  activeIcon={
                    button.activeIcon ? button.activeIcon : button.icon
                  }
                  label={button.label}
                  onClick={() => setActiveAction(button.slug)}
                  selected={activeAction === button.slug}
                />
              ))}
            </div>
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
              <span className="font-urbanist text-sm">Library</span>
            )}
          </button>
        </div>

        {/* Task List - Only when expanded */}
        {isSiderbarOpen && (
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
              <TaskItem
                icon={<Code size={20} />}
                text="Build a Tic Tac Toe Game on Web"
                active
              />
              <TaskItem
                icon={<Lightbulb size={20} />}
                text="Give me idea for a women specific game options"
              />
              <TaskItem
                icon={<BookOpen size={20} />}
                text="Suggest me some game mechanics for a Tower Defense game"
              />
            </div>
          </div>
        )}

        {/* Spacer for collapsed state */}
        {!isSiderbarOpen && <div className="flex-1" />}

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
      className={`bg-white border border-[#e6e6e6] rounded-[6px] px-1.5 py-2 flex flex-col items-center justify-between h-[60px] w-[79px] transition-colors ${
        selected
          ? "border-[#1F6744] bg-[#F1FCF6] text-[#1F6744]"
          : "hover:bg-[#F6F6F6] text-[#6d6d6d]"
      }`}
      onClick={onClick}
    >
      <div className="">{selected ? activeIcon : icon}</div>
      <span className="font-urbanist text-[11px] text-center">{label}</span>
    </button>
  );
};

// Task Item Component
const TaskItem = ({ icon, text, active = false }) => {
  return (
    <button
      className={`flex items-center gap-[16px] p-1.5 rounded-lg w-full text-left transition-colors ${
        active ? "bg-[#f6f6f6]" : "hover:bg-[#f6f6f6]"
      }`}
    >
      <div className="text-[#6d6d6d] shrink-0">{icon}</div>
      <span className="font-urbanist font-medium text-[14px] text-[#141414] truncate leading-[21px]">
        {text}
      </span>
    </button>
  );
};

export default Sidebar;
