import React, { useState } from "react";
import { X, Upload } from "lucide-react";

const gmailIcon = "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png";
const pdfIcon = "https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg";

const EmailDraftCard = ({
  to = ["max@fia.io"],
  subject: initialSubject = "Analysis of Hyper-Casual Mobile Games: Factors for Problematic Use and Toxic Design",
  body: initialBody = `Dear Max,

As requested, please find attached the analysis report on the common factors contributing to problematic use and toxic design in hyper-casual mobile games.

Best regards,
Harsh`,
  attachments = [{ name: "Hypercasual_Game_Analysis.pdf", type: "pdf" }],
  onSend,
  onRefine,
  onCancel,
  onChange,
  onAddAttachment,
  onRemoveAttachment,
  isConnected = false,
  onConnect,
  isLoading = false,
}) => {
  const [recipients, setRecipients] = useState(to);
  const [toInput, setToInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  const handleRemoveRecipient = (email) => {
    const newRecipients = recipients.filter((r) => r !== email);
    setRecipients(newRecipients);
    onChange?.({ to: newRecipients, subject, body });
  };

  const handleAddRecipient = (e) => {
    if (e.key === "Enter" && toInput.trim()) {
      e.preventDefault();
      const newRecipients = [...recipients, toInput.trim()];
      setRecipients(newRecipients);
      setToInput("");
      onChange?.({ to: newRecipients, subject, body });
    }
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    onChange?.({ to: recipients, subject: e.target.value, body });
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
    onChange?.({ to: recipients, subject, body: e.target.value });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return pdfIcon;
      default:
        return pdfIcon;
    }
  };

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={gmailIcon} alt="Gmail" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Email Draft
        </span>
      </div>

      {/* To Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-16 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          To
        </span>
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {recipients.map((email) => (
            <div
              key={email}
              className="flex items-center gap-1 px-2 py-1 bg-[#f6f7f8] rounded-md"
            >
              <span
                className="text-[14px] text-[#141414]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {email}
              </span>
              <button
                onClick={() => handleRemoveRecipient(email)}
                className="text-[#9ca3af] hover:text-[#141414] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            onKeyDown={handleAddRecipient}
            placeholder={recipients.length === 0 ? "Add recipients..." : ""}
            className="flex-1 min-w-[120px] text-[14px] text-[#141414] outline-none bg-transparent"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCc(!showCc)}
            className="text-[14px] text-[#3b82f6] hover:underline"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Cc
          </button>
          <button
            onClick={() => setShowBcc(!showBcc)}
            className="text-[14px] text-[#3b82f6] hover:underline"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Bcc
          </button>
        </div>
      </div>

      {/* Cc Field (conditional) */}
      {showCc && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
          <span
            className="text-[14px] text-[#9ca3af] w-16 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Cc
          </span>
          <input
            type="text"
            value={ccInput}
            onChange={(e) => setCcInput(e.target.value)}
            placeholder="Add Cc recipients..."
            className="flex-1 text-[14px] text-[#141414] outline-none bg-transparent"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
      )}

      {/* Bcc Field (conditional) */}
      {showBcc && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
          <span
            className="text-[14px] text-[#9ca3af] w-16 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Bcc
          </span>
          <input
            type="text"
            value={bccInput}
            onChange={(e) => setBccInput(e.target.value)}
            placeholder="Add Bcc recipients..."
            className="flex-1 text-[14px] text-[#141414] outline-none bg-transparent"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
      )}

      {/* Subject Field */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-16 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Subject
        </span>
        <input
          type="text"
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Enter subject..."
          className="flex-1 text-[14px] text-[#141414] leading-[22px] outline-none bg-transparent"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Body Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-16 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Body
        </span>
        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Enter email body..."
          rows={6}
          className="flex-1 text-[14px] text-[#141414] leading-[22px] outline-none bg-transparent resize-none"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Attachments */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-16 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Attachment
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-[#f6f7f8] border border-[#e6e6e6] rounded-lg"
            >
              <img
                src={getFileIcon(attachment.type)}
                alt={attachment.type}
                className="w-5 h-5 object-contain"
              />
              <span
                className="text-[14px] text-[#141414] max-w-[150px] truncate"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {attachment.name}
              </span>
            </div>
          ))}
          <button
            onClick={onAddAttachment}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors"
          >
            <Upload size={16} className="text-[#141414]" />
            <span
              className="text-[14px] text-[#141414]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Upload
            </span>
          </button>
        </div>
      </div>

      {/* Not connected warning */}
      {!isConnected && (
        <div className="px-4 py-3 bg-[#fffbeb] border-b border-[#f1f1f1]">
          <p
            className="text-[13px] text-[#f59e0b] flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            You're not connected to Gmail
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Cancel
        </button>
        {isConnected ? (
          <button
            onClick={onSend}
            disabled={isLoading}
            className="px-6 py-2.5 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="px-4 py-2.5 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Connect Gmail
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailDraftCard;
