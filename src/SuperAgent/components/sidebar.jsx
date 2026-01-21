import React, { useState, useRef, useEffect, useCallback } from "react";
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
import DeleteChatModal from "./DeleteChatModal";
import api from "@/api";

const Sidebar = () => {
  const dispatch = useDispatch();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen,
  );
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [chats, setChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatFilter, setChatFilter] = useState("all"); // "all" or "favourites"
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const filterDropdownRef = useRef(null);
  const selectedAgent = useSelector((state) => state.superAgent.selectedAgent);
  const selectedTask = useSelector((state) => state.superAgent.selectedTask);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch chats from API
  const fetchChats = useCallback(
    async (filter = chatFilter) => {
      setIsLoadingChats(true);
      try {
        const params = { limit: 10, offset: 0 };
        if (filter === "favourites") {
          params.favourite = true;
        }
        const response = await api.get("/v1/superagent/chats", { params });

        const result = response.data;
        if (result.success && result.data) {
          setChats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    },
    [chatFilter],
  );

  // Fetch chats on mount and when filter changes
  useEffect(() => {
    fetchChats(chatFilter);
  }, [chatFilter]);

  // Listen for chat-deleted event to refresh the list
  useEffect(() => {
    const handleChatDeleted = (event) => {
      const deletedChatId = event.detail?.chatId;
      // Remove the deleted chat from local state immediately
      setChats((prev) => prev.filter((chat) => chat.id !== deletedChatId));
    };

    window.addEventListener("chat-deleted", handleChatDeleted);
    return () => {
      window.removeEventListener("chat-deleted", handleChatDeleted);
    };
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Toggle favourite for a chat
  const toggleFavourite = async (chatId) => {
    try {
      const response = await api.post(
        `/v1/superagent/chats/${chatId}/favourite`,
      );

      const result = response.data;
      if (result.success) {
        // Update local state
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, is_favourite: result.data.is_favourite }
              : chat,
          ),
        );
        // If we're viewing favourites and unfavourited, remove from list
        if (chatFilter === "favourites" && !result.data.is_favourite) {
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        }
        return result.data.is_favourite;
      }
    } catch (error) {
      console.error("Failed to toggle favourite:", error);
    }
    return null;
  };

  const toggleSidebar = () => {
    dispatch(setIsSiderbarOpen(!isSiderbarOpen));
  };

  // Handle delete chat from sidebar
  const handleDeleteChat = (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  // Called after successful deletion
  const onDeleteSuccess = (deletedChatId) => {
    // Remove from local state
    setChats((prev) => prev.filter((chat) => chat.id !== deletedChatId));
    // Check if we're currently viewing this chat
    const currentPath = location.pathname;
    if (currentPath === `/super-agent/chat/${deletedChatId}`) {
      navigate("/super-agent");
    }
    setChatToDelete(null);
  };

  const handleAgentSelect = (agent) => {
    dispatch(
      setSelectedAgent({ id: agent.id, name: agent.name, slug: agent.slug }),
    );
    navigate(`/super-agent/${agent.slug}`);
  };

  return (
    <div
      className={`fixed left-0 top-0 lg:sticky h-screen bg-white border-r border-[#f6f6f6] flex flex-col z-50 transition-all duration-300 ${
        isSiderbarOpen ? "w-[290px] min-w-[290px] max-w-[290px]" : "w-[64px]"
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
              <div className="cursor-pointer size-[38px] m-1 text-[#6d6d6d] flex items-center justify-center bg-[#F1FCF6] rounded-[5px]">
                <Siderbar
                  color="#6d6d6d"
                  onClick={toggleSidebar}
                  className="cursor-pointer size-[24px]"
                />
              </div>
            ) : (
              <div
                className={`cursor-pointer size-[38px] flex items-center justify-center ${isSiderbarOpen ? "" : "m-1"}`}
              >
                <img
                  src={gamepacLogo}
                  alt="GamePac Logo"
                  className="size-[24px] shrink-0 cursor-pointer"
                  onClick={toggleSidebar}
                />
              </div>
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

        {/* Chat List - Only when expanded */}
        {isSiderbarOpen ? (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="relative mb-2" ref={filterDropdownRef}>
              <button
                className="flex items-center gap-[5px] hover:opacity-80 transition-opacity"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <span className="font-urbanist text-[13px] text-[#b0b0b0]">
                  {chatFilter === "all" ? "All chats" : "Favourites"}
                </span>
                <AltArrowDown
                  weight={"Linear"}
                  className={`w-4 h-4 text-[#6D6D6D] transition-transform ${
                    showFilterDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showFilterDropdown && (
                <div className="absolute left-0 top-full mt-1 w-[120px] bg-white border border-[#f1f1f1] rounded-lg shadow-lg z-50">
                  <button
                    className={`w-full text-left px-3 py-2 text-[13px] font-urbanist hover:bg-[#f6f6f6] rounded-t-lg ${
                      chatFilter === "all"
                        ? "text-[#1f6744] bg-[#f1fcf6]"
                        : "text-[#141414]"
                    }`}
                    onClick={() => {
                      setChatFilter("all");
                      setShowFilterDropdown(false);
                    }}
                  >
                    All chats
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-[13px] font-urbanist hover:bg-[#f6f6f6] rounded-b-lg ${
                      chatFilter === "favourites"
                        ? "text-[#1f6744] bg-[#f1fcf6]"
                        : "text-[#141414]"
                    }`}
                    onClick={() => {
                      setChatFilter("favourites");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Favourites
                  </button>
                </div>
              )}
            </div>

            {isLoadingChats ? (
              <div className="text-center py-4 text-[#b0b0b0] text-sm">
                Loading...
              </div>
            ) : chats.length > 0 ? (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <TaskItem
                    key={chat.id}
                    chatId={chat.id}
                    text={chat.title || "Untitled Chat"}
                    active={selectedTask?.id === chat.id}
                    slug={
                      chat.data?.agent_slug ||
                      chat.agent_slug ||
                      chat.data?.data?.agent_slug
                    }
                    isFavourite={chat.is_favourite}
                    onToggleFavourite={toggleFavourite}
                    onDelete={handleDeleteChat}
                    onClick={() => {
                      dispatch(setSelectedTask({ id: chat.id, ...chat }));
                      navigate(`/super-agent/chat/${chat.id}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#b0b0b0] text-sm">
                {chatFilter === "favourites" ? "No favourites" : "No chats"}
              </div>
            )}
          </div>
        ) : (
          <Dialog
            weight={"Linear"}
            className="size-[24px] text-[#6d6d6d] cursor-pointer"
            onClick={toggleSidebar}
          />
        )}

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

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setChatToDelete(null);
        }}
        chatId={chatToDelete}
        onDelete={onDeleteSuccess}
      />
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
const TaskItem = ({
  chatId,
  text,
  active = false,
  onClick,
  slug,
  isFavourite = false,
  onToggleFavourite,
  onDelete,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTogglingFavourite, setIsTogglingFavourite] = useState(false);
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

  const handleAction = async (action, e) => {
    e.stopPropagation();

    if (action === "favourite" && onToggleFavourite) {
      setIsTogglingFavourite(true);
      await onToggleFavourite(chatId);
      setIsTogglingFavourite(false);
    } else if (action === "delete" && onDelete) {
      onDelete(chatId);
    } else {
      console.log(`${action} action triggered for task: ${text}`);
    }

    setShowDropdown(false);
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
          className="absolute right-0 top-full p-1 px-1.5 mt-1 w-[160px] bg-white border border-[#f1f1f1] rounded-lg shadow-lg z-[100]"
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
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f6f6f6] transition-colors border-b border-[#f1f1f1] disabled:opacity-50"
            disabled={isTogglingFavourite}
          >
            <Star
              weight={isFavourite ? "Bold" : "Linear"}
              size={20}
              color={isFavourite ? "#f59e0b" : "#6D6D6D"}
            />
            <span className="font-urbanist font-medium text-[14px] text-[#141414]">
              {isFavourite ? "Unfavourite" : "Favourite"}
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
