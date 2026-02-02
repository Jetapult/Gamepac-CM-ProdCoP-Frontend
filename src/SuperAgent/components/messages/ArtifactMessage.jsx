import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import { report } from "process";

const reportTypeLabels = {
  "review-report-short": "Review Report",
  "review-report": "Detailed Review Report",
  "bug-report-short": "Bug Report",
  "bug-report": "Detailed Bug Report",
};

const ArtifactMessage = ({
  reportType,
  reportData,
  isOpen = false,
  onClick,
}) => {
  const title = reportData?.header?.reportTitle || "Report";
  
  // Extract date range from reportData - check multiple possible locations
  console.log("dsdfsdfsfsd", reportData);
  
  const dateRange = reportData?.header?.analysisPeriodStart + " - " + reportData?.header?.analysisPeriodEnd || "";
  const subtitle = dateRange ? `${dateRange}` : label;

  return (
    <div className="flex justify-center -mt-2">
      <div
        onClick={onClick}
        className={`
          bg-white border rounded-xl overflow-hidden cursor-pointer transition-all max-w-[480px] w-full
          ${isOpen 
            ? "border-[#86efac] shadow-sm" 
            : "border-[#f1f1f1] hover:border-[#e0e0e0]"
          }
        `}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                ${isOpen ? "bg-[#dcfce7]" : "bg-[#f6f6f6]"}
              `}
            >
              <FileText
                size={18}
                className={isOpen ? "text-[#16a34a]" : "text-[#6d6d6d]"}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="text-[14px] font-medium text-[#141414] truncate"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {title}
              </span>
              <span
                className="text-[12px] text-[#6d6d6d]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {subtitle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOpen && (
              <div className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
            )}
            <div className="p-1.5 text-[#6d6d6d]">
              <ExternalLink size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactMessage;
