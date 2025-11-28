import React, { useState, useRef, useEffect } from "react";
import {
  Pen2,
  MenuDots,
  ForwardRight,
  Star,
  TrashBinMinimalistic,
} from "@solar-icons/react";

const ChatHeader = ({ chatTitle, onTitleChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(chatTitle);
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onTitleChange && title.trim()) {
      onTitleChange(title.trim());
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
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-[18px] text-[#141414] leading-normal font-semibold bg-transparent border-b-2 border-[#1f6744] outline-none"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        ) : (
          <h1
            className="text-[18px] text-[#141414] leading-normal font-semibold"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {title}
          </h1>
        )}
        <button
          className="text-[#6d6d6d] hover:text-[#1f6744] transition-colors"
          onClick={handleEditClick}
        >
          <Pen2 weight="Linear" size={16} color="#6d6d6d" />
        </button>
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
                <span
                  className="text-[14px] text-[#141414] font-medium"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Favourite
                </span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f6f7f8] transition-colors"
                onClick={() => {
                  // Handle delete
                  setShowMenu(false);
                }}
              >
                <TrashBinMinimalistic
                  weight="Linear"
                  size={20}
                  color="#dc2626"
                />
                <span
                  className="text-[14px] text-[#dc2626] font-medium"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Delete
                </span>
              </button>
            </div>
          )}
        </div>
        <button className="h-8 px-2 flex items-center gap-[6px] border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors min-w-[110px] justify-center">
          <ForwardRight weight="Linear" size={20} color="#6d6d6d" />
          <span
            className="text-[16px] text-[#141414] font-medium"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
          >
            Share
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
