import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Copy, Unread } from "@solar-icons/react";

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

const UserMessage = ({ content, isLatest = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copiedTooltip, setCopiedTooltip] = useState(false);

  const borderRadiusClass = isLatest
    ? "rounded-tl-lg rounded-tr-lg rounded-bl-lg"
    : "rounded-lg";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTooltip(true);
      setTimeout(() => setCopiedTooltip(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className="flex flex-col items-end gap-2 max-w-[400px] ml-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-[#f6f6f6] border border-[#e6e6e6] ${borderRadiusClass} px-4 py-[14px]`}
      >
        <p
          className="text-base text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
        >
          {content}
        </p>
      </div>

      {/* Copy Icon - Only visible on hover */}
      <div
        className={`flex items-center transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
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
      </div>
    </div>
  );
};

export default UserMessage;
