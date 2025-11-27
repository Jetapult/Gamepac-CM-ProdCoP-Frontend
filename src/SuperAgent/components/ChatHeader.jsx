import React from "react";
import { Share2, MoreHorizontal } from "lucide-react";

const ChatHeader = ({ chatTitle, onEditClick }) => {
  return (
    <div className="h-16 border-b border-[#f6f6f6] flex items-center justify-between px-5 w-full">
      <div className="flex items-center gap-2">
        <h1
          className="text-lg font-semibold text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {chatTitle}
        </h1>
        <button
          className="text-[#6d6d6d] hover:text-[#1f6744]"
          onClick={onEditClick}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-8 h-8 flex items-center justify-center border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors">
          <MoreHorizontal size={20} className="text-[#6d6d6d]" />
        </button>
        <button className="h-8 px-3 flex items-center gap-2 border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors">
          <Share2 size={16} className="text-[#6d6d6d]" />
          <span
            className="text-base text-[#141414]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Share
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
