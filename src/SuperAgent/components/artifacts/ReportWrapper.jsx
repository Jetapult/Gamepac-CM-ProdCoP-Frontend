import React, { useRef, useState, useEffect } from "react";
import { Download, Loader2, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import pdfIcon from "@/assets/file-icons/pdf.png";
import docsIcon from "@/assets/docs.png";
import GoogleDocsExportCard from "../ExportToGoogleDocs";
import { createGoogleDoc } from "@/services/composioApi";
import useComposioConnections from "@/hooks/useComposioConnections";
import { exportMarkdownPdf } from "@/services/superAgentApi";

const A4_WIDTH_PX = 794; // 210mm at 96 DPI
const A4_WIDTH_MM = 210;

const ReportWrapper = ({
  title,
  children,
  containerClassName = "review-report-container bg-white shadow-xl",
  googleDocsActionData = null,
  markdownString = null,
  pdfFilename = null,
}) => {
  const { isConnected, connect } = useComposioConnections();
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [downloadType, setDownloadType] = useState(null); // 'pdf' | 'markdown' | 'drive'
  const [showDocsDialog, setShowDocsDialog] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [isConnectingDocs, setIsConnectingDocs] = useState(false);
  const [docsSuccessData, setDocsSuccessData] = useState(null);

  // Handle Google Docs export send
  const handleDocsSend = async (data) => {
    console.log("[ReportWrapper] Creating Google Doc:", data);
    setIsCreatingDoc(true);
    try {
      const result = await createGoogleDoc({
        title: data.doc_title,
        content: data.content_summary,
      });
      console.log("[ReportWrapper] Google Doc created:", result);
      // Show success state with link - construct from document_id
      const documentId = result?.data?.document_id;
      const url = documentId ? `https://docs.google.com/document/d/${documentId}/edit` : "";
      setDocsSuccessData({
        title: data.doc_title,
        url,
      });
    } catch (err) {
      console.error("[ReportWrapper] Failed to create Google Doc:", err);
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // Handle Google Docs connect
  const handleDocsConnect = async () => {
    console.log("[ReportWrapper] Connecting to Google Docs");
    setIsConnectingDocs(true);
    try {
      await connect("google-docs");
    } catch (err) {
      console.error("[ReportWrapper] Failed to connect Google Docs:", err);
    } finally {
      setIsConnectingDocs(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save to Google Docs
  const handleSaveToGoogleDocs = () => {
    setShowDropdown(false);
    setShowDocsDialog(true);
  };

  // Download markdown artifact as PDF via backend (text-based, small, selectable)
  const handleMarkdownPdfDownload = async () => {
    if (!markdownString || isDownloading) return;

    setIsDownloading(true);
    setDownloadType("pdf");
    setShowDropdown(false);
    try {
      const blob = await exportMarkdownPdf(markdownString, title || "Report");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(pdfFilename || title || "Report").replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Markdown PDF download failed:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  // Download as PDF (image-based, continuous — no margins between pages)
  const handleImagePdfDownload = async () => {
    if (!contentRef.current || isDownloading) return;

    setIsDownloading(true);
    setDownloadType("pdf");
    setShowDropdown(false);
    try {
      // Temporarily remove display scaling so html2canvas captures at natural 1:1 size
      const el = contentRef.current;
      const prevTransform = el.style.transform;
      el.style.transform = "none";

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      el.style.transform = prevTransform;

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const totalImgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
      const pdf = new jsPDF("p", "mm", [A4_WIDTH_MM, totalImgHeight]);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, totalImgHeight);

      pdf.save(`${(pdfFilename || title || "report").replace(/[^a-z0-9]/gi, "_")}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  const handlePdfDownload = markdownString
    ? handleMarkdownPdfDownload
    : handleImagePdfDownload;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const padding = 4;
        const availableWidth = parentWidth - padding;
        const newScale = availableWidth / A4_WIDTH_PX;
        setScale(newScale);
      }
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-[#f8f8f7]">
      {/* Toolbar Header */}
      <div className="h-14 bg-white border-b border-[#e0e0e0] px-4 flex items-center justify-between shrink-0 z-10">
        <span className="font-semibold text-gray-700">{title}</span>

        {/* Download Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isDownloading}
            className="p-2 text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-2 z-50">
              <button
                onClick={handlePdfDownload}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
              >
                <img
                  src={pdfIcon}
                  alt="PDF"
                  className="w-5 h-5 object-contain"
                />
                <span
                  className="text-[15px] text-[#141414]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  PDF
                </span>
              </button>

              <button
                onClick={handleSaveToGoogleDocs}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
              >
                <img
                  src={docsIcon}
                  alt="Google Docs"
                  className="w-5 h-5 object-contain"
                />
                <span
                  className="text-[15px] text-[#141414]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Export to Google Docs
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Docs Dialog */}
      {showDocsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[90vw] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#f1f1f1]">
              <div className="flex items-center gap-3">
                <img
                  src={docsIcon}
                  alt="Google Docs"
                  className="w-8 h-8 object-contain"
                />
                <span
                  className="text-[16px] font-medium text-[#141414]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Export to Google Docs
                </span>
              </div>
              <button
                onClick={() => setShowDocsDialog(false)}
                className="p-1.5 text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <GoogleDocsExportCard
                doc_title={googleDocsActionData?.doc_title || title || "Document"}
                content_summary={googleDocsActionData?.content_summary || markdownString || ""}
                onSend={handleDocsSend}
                onCancel={() => {
                  setShowDocsDialog(false);
                  setDocsSuccessData(null);
                }}
                isConnected={isConnected?.("google-docs")}
                onConnect={handleDocsConnect}
                isLoading={isCreatingDoc}
                isConnecting={isConnectingDocs}
                successData={docsSuccessData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Report Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center"
      >
        <div
          style={{
            height: contentHeight * scale,
            width: A4_WIDTH_PX * scale,
            transition: "height 0.2s",
            minHeight: contentHeight * scale || "auto",
          }}
        >
          <div
            ref={contentRef}
            className="origin-top-left transition-transform duration-200"
            style={{
              transform: `scale(${scale})`,
              width: `${A4_WIDTH_PX}px`,
            }}
          >
            <div className={containerClassName}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportWrapper;
