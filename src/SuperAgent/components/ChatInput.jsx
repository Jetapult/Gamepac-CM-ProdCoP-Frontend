import React from "react";
import { Paperclip, Plug, Send } from "lucide-react";

const ChatInput = ({
  placeholder = "Generate a professional sentiment analysis report",
}) => {
  return (
    <div className="p-3">
      <div className="bg-[#f6f6f6] border border-[#f6f6f6] rounded-2xl p-3 relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-base text-[#b0b0b0] placeholder:text-[#b0b0b0] py-3 pr-12"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between mt-16">
          <div className="flex gap-4">
            <button className="w-9 h-9 bg-white border-0 rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors">
              <Paperclip size={16} />
            </button>
            <button className="w-9 h-9 bg-white border-0 rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors">
              <Plug size={16} />
            </button>
          </div>

          <button className="w-9 h-9 bg-[#e6e6e6] rounded-lg flex items-center justify-center text-[#b0b0b0] hover:bg-[#1f6744] hover:text-white transition-all">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
