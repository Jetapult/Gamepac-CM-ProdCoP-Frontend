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
import { CornerDownLeft } from "lucide-react";
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
          document.body
        )}
    </div>
  );
};

const LLMMessage = ({
  content,
  isLatest = false,
  relatedActions = [],
  onSendMessage,
  onRegenerate,
  versionInfo,
  canRegenerate = true,
}) => {
  const [copiedTooltip, setCopiedTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'liked' | 'disliked' | null

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
    setFeedback(feedback === "liked" ? null : "liked");
  };

  const handleDislike = () => {
    setFeedback(feedback === "disliked" ? null : "disliked");
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
      {/* Response Text */}
      <div
        className="text-base text-black prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-semibold"
        style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
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
              feedback === "liked"
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
              feedback === "disliked"
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
