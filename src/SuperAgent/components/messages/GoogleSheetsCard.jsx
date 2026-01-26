import React, { useState } from "react";

const sheetsIcon = "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png";

const GoogleSheetsCard = ({
  sheet_title: initialSheetTitle = "",
  data_summary: initialDataSummary = "",
  onSend,
  onCancel,
  onChange,
  isConnected = false,
  onConnect,
  isLoading = false,
  isConnecting = false,
}) => {
  const [sheetTitle, setSheetTitle] = useState(initialSheetTitle);
  const [dataSummary, setDataSummary] = useState(initialDataSummary);

  const handleChange = (updates) => {
    onChange?.({
      sheet_title: sheetTitle,
      data_summary: dataSummary,
      ...updates,
    });
  };

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={sheetsIcon} alt="Google Sheets" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Google Sheet
        </span>
      </div>

      {/* Sheet Title Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Sheet Title
        </span>
        <input
          type="text"
          value={sheetTitle}
          onChange={(e) => { setSheetTitle(e.target.value); handleChange({ sheet_title: e.target.value }); }}
          placeholder="Spreadsheet title..."
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Data Summary Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Data
        </span>
        <textarea
          value={dataSummary}
          onChange={(e) => { setDataSummary(e.target.value); handleChange({ data_summary: e.target.value }); }}
          placeholder="Describe the data/metrics to include in the sheet..."
          rows={6}
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
            You're not connected to Google Sheets
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
            onClick={() => onSend?.({ sheet_title: sheetTitle, data_summary: dataSummary })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Creating..." : "Create Sheet"}
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
                Connect Google Sheets
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleSheetsCard;
