import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Like, Dislike, Copy, Restart } from "@solar-icons/react";
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

const LLMMessage = ({ content, agentName = "GamePac", isLatest = false }) => {
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
      className="flex flex-col gap-3 max-w-[551px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Agent Header */}
      <div className="flex items-center gap-2">
        <img src={gamepacLogo} alt={agentName} className="w-6 h-6" />
        <span
          className="text-base font-medium text-black"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {agentName}
        </span>
      </div>

      {/* Response Text */}
      <p
        className="text-base text-black"
        style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
      >
        {content}
      </p>

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
            className="p-[4px] text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-[8px] transition-all"
          >
            <Copy weight="Linear" size={20} />
          </button>
        </Tooltip>
        <ActionIcon icon={Restart} tooltip="Regenerate" onClick={() => {}} />
      </div>
    </div>
  );
};

export default LLMMessage;
