import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Copy, Unread } from "@solar-icons/react";
import pdfIcon from "../../../assets/file-icons/pdf.png";
import wordIcon from "../../../assets/file-icons/word.png";
import excelIcon from "../../../assets/file-icons/excel.png";
import mediaIcon from "../../../assets/file-icons/media.png";
import codeIcon from "../../../assets/file-icons/code.png";

const FILE_TYPE_ICONS = {
  pdf: pdfIcon,
  doc: wordIcon,
  docx: wordIcon,
  xls: excelIcon,
  xlsx: excelIcon,
  csv: excelIcon,
  txt: codeIcon,
  png: mediaIcon,
  jpg: mediaIcon,
  jpeg: mediaIcon,
  svg: mediaIcon,
  mp4: mediaIcon,
};

const formatFileSize = (size) => {
  if (typeof size === "string") return size;
  if (typeof size === "number") {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return "";
};

const MessageAttachment = ({ attachment }) => {
  const fileType = attachment.file_type || attachment.fileType || "";
  const isImage = ["png", "jpg", "jpeg", "svg"].includes(fileType);
  const isVideo = fileType === "mp4";
  const hasPreview = (isImage || isVideo) && attachment.file_url;
  const fileIcon = FILE_TYPE_ICONS[fileType] || mediaIcon;

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg border border-[#e6e6e6] bg-white"
      style={{ minWidth: "140px", maxWidth: "180px", height: "52px" }}
    >
      {hasPreview ? (
        <div className="w-8 h-8 rounded overflow-hidden shrink-0">
          {isImage ? (
            <img
              src={attachment.file_url}
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={attachment.file_url}
              className="w-full h-full object-cover"
              muted
            />
          )}
        </div>
      ) : (
        <img
          src={fileIcon}
          alt={fileType}
          className="w-8 h-8 shrink-0 object-contain"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#141414] font-urbanist font-medium truncate">
          {attachment.name}
        </p>
        <p className="text-[10px] text-[#6D6D6D] font-urbanist">
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </div>
  );
};

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

const UserMessage = ({ content, attachments = [], isLatest = false }) => {
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
        {content && (
          <p
            className="text-base text-[#141414]"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
          >
            {content}
          </p>
        )}
        {attachments && attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${content ? "mt-2" : ""}`}>
            {attachments.map((attachment) => (
              <MessageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
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
