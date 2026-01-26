import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import {
  Like,
  Dislike,
  Copy,
  Restart,
  Unread,
  AltArrowLeft,
  AltArrowRight,
} from "@solar-icons/react";
import { CornerDownLeft, ChevronDown } from "lucide-react";
import gamepacLogo from "../../../assets/super-agents/gamepac-logo.svg";

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setShow(true);
  };

  return (
    <div
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        ReactDOM.createPortal(
          <div
            className="fixed px-[10px] py-[10px] bg-[#021108] text-white text-xs rounded-[6px] whitespace-nowrap pointer-events-none"
            style={{
              fontFamily: "Urbanist, sans-serif",
              zIndex: 99999,
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
};

const LLMMessage = ({
  content,
  thinking,
  isLatest = false,
  isStreaming = false,
  relatedActions = [],
  onSendMessage,
  onRegenerate,
  onFeedback,
  versionInfo,
  canRegenerate = true,
  initialFeedback = null,
}) => {
  const [copiedTooltip, setCopiedTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback); // 'like' | 'dislike' | null
  // Expand thinking by default while streaming, collapse when done
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(isStreaming);
  const [wasStreaming, setWasStreaming] = useState(isStreaming);

  // Auto-collapse thinking when streaming completes
  React.useEffect(() => {
    if (wasStreaming && !isStreaming) {
      // Streaming just finished, collapse thinking
      setIsThinkingExpanded(false);
    }
    setWasStreaming(isStreaming);
  }, [isStreaming, wasStreaming]);

  // Expand thinking when streaming starts
  React.useEffect(() => {
    if (isStreaming && thinking) {
      setIsThinkingExpanded(true);
    }
  }, [isStreaming, thinking]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTooltip(true);
      setTimeout(() => setCopiedTooltip(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLike = () => {
    const newFeedback = feedback === "like" ? null : "like";
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
  };

  const handleDislike = () => {
    const newFeedback = feedback === "dislike" ? null : "dislike";
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
  };

  const ActionIcon = ({ icon: Icon, tooltip, onClick }) => (
    <Tooltip text={tooltip}>
      <button
        onClick={onClick}
        className="p-[4px] text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-[8px] transition-all"
      >
        <Icon weight="Linear" size={20} />
      </button>
    </Tooltip>
  );

  return (
    <div
      className="flex flex-col gap-3 max-w-[551px] group ml-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thinking Section - Collapsible */}
      {thinking && (
        <div className="mb-2">
          <button
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-1 text-sm text-[#6d6d6d] hover:text-[#141414] transition-colors"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isThinkingExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span>Thinking</span>
          </button>
          {isThinkingExpanded && (
            <div
              className="mt-2 p-3 bg-[#f9f9f9] rounded-lg text-sm text-[#6d6d6d] prose prose-sm max-w-none"
              style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "20px" }}
            >
              <ReactMarkdown>{thinking}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Response Text */}
      <div
        className="text-base text-black prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-semibold"
        style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
      >
        {(() => {
          // Strip XML-like tags (e.g., <final_answer>, </final_answer>, etc.)
          const stripXmlTags = (text) => {
            if (!text) return "";
            return text.replace(/<\/?[a-zA-Z_][a-zA-Z0-9_]*>/g, "").trim();
          };

          // Check if content is JSON
          const strippedContent = stripXmlTags(content);
          const trimmedContent = strippedContent?.trim() || "";
          if (trimmedContent.startsWith("{") || trimmedContent.startsWith("[")) {
            try {
              const parsed = JSON.parse(trimmedContent);
              
              // Render JSON as user-friendly key-value pairs
              const renderValue = (value, depth = 0) => {
                if (value === null || value === undefined) return <span className="text-[#6d6d6d]">—</span>;
                if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
                if (typeof value === "number") return <span>{value}</span>;
                if (typeof value === "string") return <span>{value}</span>;
                if (Array.isArray(value)) {
                  if (value.length === 0) return <span className="text-[#6d6d6d]">None</span>;
                  return (
                    <ul className="list-disc list-inside ml-2">
                      {value.map((item, i) => (
                        <li key={i}>{renderValue(item, depth + 1)}</li>
                      ))}
                    </ul>
                  );
                }
                if (typeof value === "object") {
                  return (
                    <div className={depth > 0 ? "ml-4 mt-1" : ""}>
                      {Object.entries(value).map(([k, v]) => (
                        <div key={k} className="mb-2">
                          <span className="font-semibold text-[#141414]">
                            {k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:
                          </span>{" "}
                          {renderValue(v, depth + 1)}
                        </div>
                      ))}
                    </div>
                  );
                }
                return <span>{String(value)}</span>;
              };

              return (
                <div className="bg-[#f9f9f9] p-4 rounded-lg">
                  {renderValue(parsed)}
                </div>
              );
            } catch (e) {
              // Not valid JSON, render as markdown
              return <ReactMarkdown>{strippedContent}</ReactMarkdown>;
            }
          }
          return <ReactMarkdown>{strippedContent}</ReactMarkdown>;
        })()}
      </div>

      {/* Related Actions - Only show for latest LLM message */}
      {isLatest && relatedActions.length > 0 && (
        <div className="flex flex-col w-full mt-4">
          <p
            className="text-[18px] font-semibold text-[#141414] leading-[32px]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Related
          </p>
          <div className="flex flex-col">
            {relatedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onSendMessage && onSendMessage(action)}
                className="flex items-center gap-[10px] px-2 py-[10px] border-b border-[#f6f6f6] hover:bg-[#f6f6f6] transition-colors rounded-[8px] cursor-pointer -mx-2"
              >
                <div className="rotate-180">
                  <CornerDownLeft size={20} color="#141414" />
                </div>
                <span
                  className="text-base font-medium text-[#141414]"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    lineHeight: "32px",
                  }}
                >
                  {action}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Icons - Always visible for latest, hover for others */}
      <div
        className={`flex items-center gap-1 transition-opacity duration-200 ${
          isLatest || isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <Tooltip text="Good response">
          <button
            onClick={handleLike}
            className={`p-[4px] rounded-[8px] transition-all ${
              feedback === "like"
                ? "bg-[#f1fcf6] border border-[#1f6744] text-[#1f6744]"
                : "text-[#6d6d6d] hover:bg-[#f6f6f6]"
            }`}
          >
            <Like weight="Linear" size={20} />
          </button>
        </Tooltip>
        <Tooltip text="Bad response">
          <button
            onClick={handleDislike}
            className={`p-[4px] rounded-[8px] transition-all ${
              feedback === "dislike"
                ? "bg-[#fef1f1] border border-[#dc2626] text-[#dc2626]"
                : "text-[#6d6d6d] hover:bg-[#f6f6f6]"
            }`}
          >
            <Dislike weight="Linear" size={20} />
          </button>
        </Tooltip>
        <Tooltip text={copiedTooltip ? "Copied!" : "Copy to clipboard"}>
          <button
            onClick={handleCopy}
            className={`p-[4px] rounded-[8px] transition-all ${
              copiedTooltip
                ? "text-[#1f6744]"
                : "text-[#6d6d6d] hover:bg-[#f6f6f6]"
            }`}
          >
            {copiedTooltip ? (
              <Unread weight="Linear" size={20} />
            ) : (
              <Copy weight="Linear" size={20} />
            )}
          </button>
        </Tooltip>
        {/* Version Navigation */}
        {versionInfo && versionInfo.total > 1 && (
          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={versionInfo.onPrevious}
              disabled={versionInfo.current === 1}
              className={`p-[4px] rounded-[8px] transition-all ${
                versionInfo.current === 1
                  ? "text-[#d0d0d0] cursor-not-allowed"
                  : "text-[#6d6d6d] hover:bg-[#f6f6f6]"
              }`}
            >
              <AltArrowLeft weight="Linear" size={16} />
            </button>
            <span
              className="text-xs text-[#6d6d6d] min-w-[32px] text-center"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {versionInfo.current}/{versionInfo.total}
            </span>
            <button
              onClick={versionInfo.onNext}
              disabled={versionInfo.current === versionInfo.total}
              className={`p-[4px] rounded-[8px] transition-all ${
                versionInfo.current === versionInfo.total
                  ? "text-[#d0d0d0] cursor-not-allowed"
                  : "text-[#6d6d6d] hover:bg-[#f6f6f6]"
              }`}
            >
              <AltArrowRight weight="Linear" size={16} />
            </button>
          </div>
        )}
        {canRegenerate && (
          <ActionIcon
            icon={Restart}
            tooltip="Regenerate"
            onClick={onRegenerate}
          />
        )}
      </div>

    </div>
  );
};

export default LLMMessage;
