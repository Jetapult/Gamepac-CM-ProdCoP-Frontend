import React, { useState } from "react";

const docsIcon = "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png";

const GoogleDocsExportCard = ({
  doc_title: initialDocTitle = "",
  content_summary: initialContentSummary = "",
  onSend,
  onCancel,
  onChange,
  isConnected = false,
  onConnect,
  isLoading = false,
  isConnecting = false,
  successData = null,
}) => {
  const [docTitle, setDocTitle] = useState(initialDocTitle);
  const [contentSummary, setContentSummary] = useState(initialContentSummary);

  // If we have success data, show success state
  if (successData) {
    return (
      <div className="max-w-[600px]">
        {/* Success Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-[#dcfce7] rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3
            className="text-[16px] font-medium text-[#141414] mb-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Document Created Successfully!
          </h3>
          <p
            className="text-[14px] text-[#6d6d6d] mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {successData.title || docTitle}
          </p>
          <a
            href={successData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open in Google Docs
          </a>
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (updates) => {
    onChange?.({
      doc_title: docTitle,
      content_summary: contentSummary,
      ...updates,
    });
  };

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={docsIcon} alt="Google Docs" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Google Doc
        </span>
      </div>

      {/* Document Title Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Doc Title
        </span>
        <input
          type="text"
          value={docTitle}
          onChange={(e) => { setDocTitle(e.target.value); handleChange({ doc_title: e.target.value }); }}
          placeholder="Document title..."
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Content Summary Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Content
        </span>
        <textarea
          value={contentSummary}
          onChange={(e) => { setContentSummary(e.target.value); handleChange({ content_summary: e.target.value }); }}
          placeholder="Document content summary..."
          rows={8}
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] leading-[22px] outline-none bg-transparent resize-none ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
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
            You're not connected to Google Docs
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 p-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Cancel
        </button>
        {isConnected ? (
          <button
            onClick={() => onSend?.({ doc_title: docTitle, content_summary: contentSummary })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Creating..." : "Create Doc"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading || isConnecting}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Connect Google Docs
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleDocsExportCard;
