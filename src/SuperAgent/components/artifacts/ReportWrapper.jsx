import React, { useRef, useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import pdfIcon from "@/assets/file-icons/pdf.png";
import docsIcon from "@/assets/docs.png";

const A4_WIDTH_PX = 794; // 210mm at 96 DPI
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 10;

const ReportWrapper = ({
  title,
  children,
  containerClassName = "review-report-container bg-white shadow-xl",
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [downloadType, setDownloadType] = useState(null); // 'pdf' | 'markdown' | 'drive'

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

  const findPageBreaks = (container, pageHeightPx, canvasScale) => {
    const breakPoints = [0];
    let currentPageEnd = pageHeightPx;
    const containerRect = container.getBoundingClientRect();
    const totalHeight = container.scrollHeight * canvasScale;

    const sectionTitles = container.querySelectorAll(".section-title");
    const titleBounds = [];
    sectionTitles.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = (rect.top - containerRect.top) * canvasScale;
      titleBounds.push({ top });
    });

    const avoidBreakElements = container.querySelectorAll(
      ".data-table, .metadata-table, table, .metric-card, .chart-container"
    );
    const elementBounds = [];
    avoidBreakElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = (rect.top - containerRect.top) * canvasScale;
      const bottom = (rect.bottom - containerRect.top) * canvasScale;
      elementBounds.push({ top, bottom });
    });

    while (currentPageEnd < totalHeight) {
      let bestBreak = currentPageEnd;
      const prevBreak = breakPoints[breakPoints.length - 1];
      const minPageContent = pageHeightPx * 0.25;

      for (const title of titleBounds) {
        if (title.top > prevBreak && title.top < currentPageEnd) {
          const spaceAfterTitle = currentPageEnd - title.top;
          if (spaceAfterTitle < 150 * canvasScale) {
            if (title.top - prevBreak > minPageContent) {
              bestBreak = title.top - 5;
              break;
            }
          }
        }
      }

      if (bestBreak === currentPageEnd) {
        for (const bound of elementBounds) {
          if (bound.top < currentPageEnd && bound.bottom > currentPageEnd) {
            if (bound.top - prevBreak > minPageContent) {
              bestBreak = bound.top - 5;
            }
            break;
          }
        }
      }

      breakPoints.push(bestBreak);
      currentPageEnd = bestBreak + pageHeightPx;
    }

    breakPoints.push(totalHeight);
    return breakPoints;
  };

  // Save to Google Docs (placeholder - shows coming soon)
  const handleSaveToGoogleDocs = () => {
    setShowDropdown(false);
    alert("Save to Google Docs coming soon!");
  };

  // Download as PDF
  const handlePdfDownload = async () => {
    if (!contentRef.current || isDownloading) return;

    setIsDownloading(true);
    setDownloadType('pdf');
    setShowDropdown(false);
    try {
      const canvasScale = 2;
      const canvas = await html2canvas(contentRef.current, {
        scale: canvasScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = A4_WIDTH_MM;
      const pageHeightPx = (A4_HEIGHT_MM / A4_WIDTH_MM) * canvas.width;

      const breakPoints = findPageBreaks(
        contentRef.current,
        pageHeightPx,
        canvasScale
      );

      for (let i = 0; i < breakPoints.length - 1; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const sourceY = breakPoints[i];
        const sourceHeight = breakPoints[i + 1] - breakPoints[i];

        if (sourceHeight <= 0) continue;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourceHeight, pageHeightPx);

        const ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          Math.min(sourceHeight, pageHeightPx)
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        const pageImgHeight =
          (Math.min(sourceHeight, pageHeightPx) * imgWidth) / canvas.width;

        const topMargin = i === 0 ? 0 : PAGE_MARGIN_MM;
        pdf.addImage(pageImgData, "PNG", 0, topMargin, imgWidth, pageImgHeight);
      }

      const filename = `${title?.replace(/[^a-z0-9]/gi, "_") || "report"}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

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
                <img src={pdfIcon} alt="PDF" className="w-5 h-5 object-contain" />
                <span className="text-[15px] text-[#141414]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  PDF
                </span>
              </button>
              
              {/* Save to Google Docs - hidden for now
              <button
                onClick={handleSaveToGoogleDocs}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
              >
                <img src={docsIcon} alt="Google Docs" className="w-5 h-5 object-contain" />
                <span className="text-[15px] text-[#141414]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  Save to Google Docs
                </span>
              </button>
              */}
            </div>
          )}
        </div>
      </div>

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
