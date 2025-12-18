import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Pen2,
  MenuDots,
  ForwardRight,
  Star,
  TrashBinMinimalistic,
} from "@solar-icons/react";
import api from "../../api";
import ShareChatModal from "./ShareChatModal";
import DeleteChatModal from "./DeleteChatModal";
import GameDropdown from "./GameDropdown";

const StudioTag = () => {
  const studio = useSelector((state) => state.superAgent.studio);

  if (!studio?.name) return null;

  return (
    <div className="flex items-center gap-2">
      {studio.logo ? (
        <div className="w-8 h-8 rounded-[5px] border border-[#f6f6f6] bg-white overflow-hidden flex items-center justify-center">
          <img
            src={studio.logo}
            alt=""
            className="w-[26px] h-[23px] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      ) : null}
      <span
        className="text-[14px] text-[#141414] font-medium leading-6"
        style={{ fontFamily: "Urbanist, sans-serif" }}
      >
        {studio.name}
      </span>
    </div>
  );
};

const ChatHeader = ({
  chatId,
  chatTitle,
  onTitleChange,
  isPublic = false,
  onPublicChange,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(chatTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync local title with prop when it changes externally
  useEffect(() => {
    setTitle(chatTitle);
  }, [chatTitle]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    const newTitle = title.trim();

    if (!newTitle || newTitle === chatTitle) return;

    // Update local state immediately
    if (onTitleChange) {
      onTitleChange(newTitle);
    }

    // Call API to persist the change
    if (chatId) {
      setIsSaving(true);
      try {
        await api.patch(`/v1/superagent/chats/${chatId}`, { title: newTitle });
      } catch (error) {
        console.error("Failed to update chat title:", error);
        // Revert on error
        setTitle(chatTitle);
        if (onTitleChange) {
          onTitleChange(chatTitle);
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(chatTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className="border-b border-[#f6f6f6] flex items-center justify-between pl-[19px] pr-5 py-[15px] w-full">
      <div className="flex items-center gap-[17px]">
        {/* Studio Name Tag */}
        <StudioTag />

        {/* Game Dropdown */}
        <GameDropdown />
      </div>

      <div className="flex items-center gap-[17px]">
        <div className="relative" ref={menuRef}>
          <button
            className="w-8 h-8 flex items-center justify-center border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MenuDots weight="Bold" size={20} color="#6d6d6d" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#f1f1f1] rounded-[8px] shadow-lg z-50 py-2 min-w-[140px]">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f6f7f8] transition-colors"
                onClick={() => {
                  // Handle favourite
                  setShowMenu(false);
                }}
              >
                <Star weight="Linear" size={20} color="#6d6d6d" />
                <span className="text-[14px] text-[#141414] font-medium font-urbanist">
                  Favourite
                </span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f6f7f8] transition-colors"
                onClick={() => {
                  setShowDeleteModal(true);
                  setShowMenu(false);
                }}
              >
                <TrashBinMinimalistic
                  weight="Linear"
                  size={20}
                  color="#dc2626"
                />
                <span className="text-[14px] text-[#dc2626] font-medium font-urbanist">
                  Delete
                </span>
              </button>
            </div>
          )}
        </div>
        <button
          className="h-8 px-2 flex items-center gap-[6px] border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors min-w-[110px] justify-center"
          onClick={() => setShowShareModal(true)}
        >
          <ForwardRight weight="Linear" size={20} color="#6d6d6d" />
          <span
            className="text-[16px] text-[#141414] font-medium"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
          >
            Share
          </span>
        </button>
      </div>

      {/* Share Modal */}
      <ShareChatModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        chatId={chatId}
        isPublic={isPublic}
        onAccessChange={onPublicChange}
      />

      {/* Delete Modal */}
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        chatId={chatId}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ChatHeader;
