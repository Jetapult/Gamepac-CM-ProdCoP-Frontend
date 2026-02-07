import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  artifactData = null,
  onArtifactClick,
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

          // Render JSON array as bullet list with key-value pairs
          const renderJsonArray = (arr) => {
            return (
              <ul className="list-disc list-outside ml-4 space-y-3 my-3">
                {arr.map((item, i) => (
                  <li key={i}>
                    {typeof item === "object" && item !== null ? (
                      <div className="space-y-1">
                        {Object.entries(item).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</strong>: {String(value)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>{String(item)}</span>
                    )}
                  </li>
                ))}
              </ul>
            );
          };

          // Try to extract and parse a JSON array from text
          const extractJsonArray = (text) => {
            // Find [ that's followed by { (indicating array of objects)
            const startMatch = text.match(/\[\s*\n?\s*\{/);
            if (!startMatch) return null;
            
            const startIndex = startMatch.index;
            
            // Find matching ] by counting brackets
            let depth = 0;
            let endIndex = -1;
            let inString = false;
            let escapeNext = false;
            
            for (let i = startIndex; i < text.length; i++) {
              const char = text[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\' && inString) {
                escapeNext = true;
                continue;
              }
              
              if (char === '"') {
                inString = !inString;
                continue;
              }
              
              if (inString) continue;
              
              if (char === '[') depth++;
              if (char === ']') {
                depth--;
                if (depth === 0) {
                  endIndex = i;
                  break;
                }
              }
            }
            
            if (endIndex === -1) return null;
            
            const jsonStr = text.slice(startIndex, endIndex + 1);
            
            try {
              const parsed = JSON.parse(jsonStr);
              if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
                return {
                  array: parsed,
                  startIndex,
                  endIndex: endIndex + 1
                };
              }
            } catch (e) {
              // Not valid JSON
            }
            return null;
          };

          const strippedContent = stripXmlTags(content);
          
          // Check if content contains a JSON array
          const jsonResult = extractJsonArray(strippedContent);
          
          if (jsonResult) {
            const beforeJson = strippedContent.slice(0, jsonResult.startIndex).trim();
            const afterJson = strippedContent.slice(jsonResult.endIndex).trim();
            
            return (
              <>
                {beforeJson && <ReactMarkdown>{beforeJson}</ReactMarkdown>}
                {renderJsonArray(jsonResult.array)}
                {afterJson && <ReactMarkdown>{afterJson}</ReactMarkdown>}
              </>
            );
          }
          
          return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#f5f5f5]">{children}</thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-[#e5e5e5]">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-semibold text-[#141414] border border-[#e0e0e0] bg-[#f5f5f5]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-[#333] border border-[#e0e0e0]">{children}</td>
            ),
          }}>{strippedContent}</ReactMarkdown>;
        })()}
      </div>

      {/* Artifact Card - Show if this message has an artifact */}
      {artifactData && (
        <div
          onClick={() => onArtifactClick?.(artifactData.reportType, artifactData.reportData, artifactData.messageId)}
          className={`
            bg-white border rounded-xl overflow-hidden cursor-pointer transition-all max-w-[480px] w-full mt-2
            ${artifactData.isOpen 
              ? "border-[#86efac] shadow-sm" 
              : "border-[#f1f1f1] hover:border-[#e0e0e0]"
            }
          `}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  ${artifactData.isOpen ? "bg-[#dcfce7]" : "bg-[#f6f6f6]"}
                `}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={artifactData.isOpen ? "#16a34a" : "#6d6d6d"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="text-[14px] font-medium text-[#141414] truncate"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {artifactData.reportData?.header?.reportTitle || "Report"}
                </span>
                <span
                  className="text-[12px] text-[#6d6d6d]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {artifactData.reportData?.header?.analysisPeriodStart && artifactData.reportData?.header?.analysisPeriodEnd
                    ? `${artifactData.reportData.header.analysisPeriodStart} - ${artifactData.reportData.header.analysisPeriodEnd}`
                    : "Report"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {artifactData.isOpen && (
                <div className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
              )}
              <div className="p-1.5 text-[#6d6d6d]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {/* Regenerate button - hidden for now
        {canRegenerate && (
          <ActionIcon
            icon={Restart}
            tooltip="Regenerate"
            onClick={onRegenerate}
          />
        )}
        */}
      </div>

    </div>
  );
};

export default LLMMessage;
