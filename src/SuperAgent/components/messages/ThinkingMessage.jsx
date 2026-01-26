import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, ChevronDown } from "lucide-react";

const ThinkingMessage = ({ content, nextAction, isStreaming = false }) => {
  // Expand while streaming, collapse when done
  const [isExpanded, setIsExpanded] = useState(isStreaming);

  // Auto-collapse when streaming ends
  useEffect(() => {
    if (!isStreaming) {
      setIsExpanded(false);
    }
  }, [isStreaming]);

  // Auto-expand when streaming starts
  useEffect(() => {
    if (isStreaming) {
      setIsExpanded(true);
    }
  }, [isStreaming]);

  return (
    <div className="flex flex-col gap-2 max-w-[551px] ml-8">
      {/* Thinking Header - Clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <ChevronDown
          size={16}
          className={`text-[#6d6d6d] transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f0f0f0]">
          <Brain size={14} className="text-[#6d6d6d]" />
        </div>
        <span
          className="text-sm font-medium text-[#6d6d6d]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {isStreaming ? "Thinking..." : "Thought"}
        </span>
        {nextAction && (
          <span
            className="text-xs text-[#9d9d9d] ml-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            → {nextAction}
          </span>
        )}
      </button>

      {/* Thinking Content - Collapsible */}
      {isExpanded && content && (
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
