import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Paperclip,
  Plain,
  PlugCircle,
  SsdRound,
} from "@solar-icons/react";

const ChatInput = ({ onSendMessage, isThinking = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const userRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage && !isThinking) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAttachmentDropdown(false);
      }
    };

    if (showAttachmentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachmentDropdown]);

  return (
    <div className="w-full bg-[#f6f6f6] border border-[#f6f6f6] rounded-2xl p-2 px-4 pt-3 relative max-h-[190px]">
      <div className="flex items-center justify-between mb-1">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Generate a professional sentiment analysis report"
          className="flex-1 bg-transparent border-none outline-none text-lg text-[#141414] placeholder:text-[#b0b0b0] font-urbanist "
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-9 h-9 bg-white border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] hover:bg-[#E6E6E6] transition-colors"
              onClick={() => setShowAttachmentDropdown(!showAttachmentDropdown)}
            >
              <Paperclip weight={"Linear"} size={16} color="#6D6D6D" />
            </button>

            {showAttachmentDropdown && (
              <div className="absolute top-full left-0 mt-2 w-[250px] bg-white border border-[#f1f1f1] rounded-[8px] shadow-lg z-50 p-2">
                <div className="relative overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#f6f7f8] hover:rounded-[8px] transition-colors"
                    onClick={() => userRef.current?.click()}
                  >
                    <FileText weight="Linear" size={20} color="#6D6D6D" />
                    <span className="text-[14px] text-[#141414] font-urbanist font-medium">
                      Add from local files
                    </span>
                    <input type="file" ref={userRef} className="hidden" />
                  </button>
                  <hr className="my-1 bg-[#f1f1f1]" />

                  <button className="w-full flex items-center gap-3 p-2 hover:bg-[#f6f7f8] rounded-[8px] transition-colors">
                    <SsdRound weight="Linear" size={20} color="#6D6D6D" />
                    <span className="text-[14px] text-[#141414] font-urbanist font-medium">
                      Choose from GamePac Drive
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="w-9 h-9 bg-white border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] hover:bg-[#E6E6E6] transition-colors">
            <PlugCircle weight={"Linear"} size={16} color="#6D6D6D" />
          </button>
        </div>

        <button
          onClick={handleSend}
          className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all relative overflow-hidden cursor-pointer disabled:cursor-not-allowed border border-[rgba(255,255,255,0.3)] ${
            !inputValue.trim() || isThinking
              ? "bg-[#E6E6E6]"
              : "bg-[linear-gradient(333deg,#11A85F_13.46%,#1F6744_103.63%)]"
          }`}
          disabled={!inputValue.trim() || isThinking}
        >
          <Plain
            weight={"Linear"}
            size={20}
            color={!inputValue.trim() || isThinking ? "#B0B0B0" : "#FFFFFF"}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
