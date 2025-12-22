import React from "react";
import ReactMarkdown from "react-markdown";
import { Brain } from "lucide-react";

const ThinkingMessage = ({ content, nextAction }) => {
  return (
    <div className="flex flex-col gap-2 max-w-[551px] ml-8">
      {/* Thinking Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f0f0f0]">
          <Brain size={14} className="text-[#6d6d6d]" />
        </div>
        <span
          className="text-sm font-medium text-[#6d6d6d]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Thinking...
        </span>
        {nextAction && (
          <span
            className="text-xs text-[#9d9d9d] ml-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            → {nextAction}
          </span>
        )}
      </div>

      {/* Thinking Content */}
      {content && (
        <div
          className="text-sm text-[#6d6d6d] ml-8 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "20px" }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ThinkingMessage;
