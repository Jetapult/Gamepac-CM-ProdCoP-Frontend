import React, { useRef, useState, useEffect } from "react";
import { Download } from "lucide-react";

const A4_WIDTH_PX = 794; // 210mm at 96 DPI

const ReportWrapper = ({
  title,
  children,
  containerClassName = "review-report-container bg-white shadow-xl",
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  const handleDownload = async () => {
    try {
      console.log("Downloading PDF...");
    } catch (error) {
      console.error("Download failed:", error);
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
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
        >
          <Download size={16} />
          Download PDF
        </button>
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
