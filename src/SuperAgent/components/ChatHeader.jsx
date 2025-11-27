import React from "react";
import { Pen, MenuDots, ForwardRight } from "@solar-icons/react";

const ChatHeader = ({ chatTitle, onEditClick }) => {
  return (
    <div className="border-b border-[#f6f6f6] flex items-center justify-between pl-[19px] pr-5 py-[15px] w-full">
      <div className="flex items-center gap-2">
        <h1
          className="text-lg font-semibold text-[#141414]"
          style={{ fontFamily: "Gilroy-SemiBold, sans-serif" }}
        >
          {chatTitle}
        </h1>
        <button
          className="text-[#6d6d6d] hover:text-[#1f6744] transition-colors"
          onClick={onEditClick}
        >
          <Pen size={24} />
        </button>
      </div>

      <div className="flex items-center gap-[17px]">
        <button className="w-8 h-8 flex items-center justify-center border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors">
          <MenuDots size={20} className="text-[#6d6d6d]" />
        </button>
        <button className="h-8 px-2 flex items-center gap-[6px] border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors min-w-[110px] justify-center">
          <ForwardRight size={20} className="text-[#6d6d6d]" />
          <span
            className="text-base text-[#141414]"
            style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
          >
            Share
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
