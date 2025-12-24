import React, { useRef, useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import "@/pages/ReviewReport/ReportStyles.css";
import { Button } from "antd"; // Assuming Ant Design is used based on package.json, otherwise use standard button
import {
  Header,
  // Section 1
  Section1_ReportMetadata,
  Section1_1_ExecutiveSummary,
  Section1_2_SentimentDistribution,
  Section1_3_KeyTrends,
  Section1_4_CriticalIssues,
  // Section 2
  Section2_DetailedAnalytics,
  Section2_1_SentimentTimeline,
  Section2_2_IssueCategoryBreakdown,
  Section2_3_VersionImpactAnalysis,
  Section2_4_GeographicDistribution,
  Section2_5_StarRatingComparison,
  // Section 3
  Section3_IssueDeepDive,
  Section3_1_EmergingIssues,
  Section3_2_ResolvedIssues,
  Section3_3_FeatureSpecificFeedback,
  // Section 4
  Section4_ActionableInsights,
  Section4_1_PriorityRecommendations,
  Section4_2_ResponsibleTeams,
  Section4_3_TimelineExpectations,
  Section4_4_FinalValidation,
} from "@/SuperAgent/components/artifacts/ReviewReport/sections";
import {
  Header as HeaderShort,
  Section1_ReportMetadata as Section1_ReportMetadataShort,
  Section2_KeyMetricsDashboard as Section2_KeyMetricsDashboardShort,
  Section3_CriticalAlerts as Section3_CriticalAlertsShort,
  Section4_ActionItems as Section4_ActionItemsShort,
} from "@/SuperAgent/components/artifacts/ReviewReportShort/sections";

const A4_WIDTH_PX = 794; // 210mm at 96 DPI

const ArtifactPlaceholder = ({ type = "review-report", data }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  const handleDownload = async () => {
    try {
      // Placeholder for backend call
      console.log("Downloading PDF...");
      // await axios.post('/api/download-report', { data });
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
  }, [type]);

  // Measure content height (logic remains same)
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [type]);

  if (type === "review-report-short" && data) {
    return (
      <div className="h-full w-full flex flex-col bg-[#f8f8f7]">
        {/* Toolbar Header */}
        <div className="h-14 bg-white border-b border-[#e0e0e0] px-4 flex items-center justify-between shrink-0 z-10">
          <span className="font-semibold text-gray-700">
            Review Report Short v1
          </span>
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
              // Flex constraint to prevent collapse
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
              <div className="review-report-container bg-white shadow-xl">
                {/* Header */}
                <HeaderShort data={data.header} />
                {/* 1. Report Metadata */}
                <Section1_ReportMetadataShort data={data.section1} />
                {/* 2. Key Metrics Dashboard */}
                <Section2_KeyMetricsDashboardShort data={data.header} />
                {/* 3. Critical Alerts */}
                <Section3_CriticalAlertsShort data={data.section3} />
                {/* 4. Action Items */}
                <Section4_ActionItemsShort data={data.section4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "review-report" && data) {
    return (
      <div className="h-full w-full flex flex-col bg-[#f8f8f7]">
        {/* Toolbar Header */}
        <div className="h-14 bg-white border-b border-[#e0e0e0] px-4 flex items-center justify-between shrink-0 z-10">
          <span className="font-semibold text-gray-700">Review Report v1</span>
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
              // Flex constraint to prevent collapse
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
              <div className="review-report-container bg-white shadow-xl">
                {/* Header */}
                <Header data={data.header} />
                {/* ... sections ... */}
                {/* 1. Report Metadata */}
                <Section1_ReportMetadata data={data.section1} />
                <Section1_1_ExecutiveSummary data={data.section1_1} />
                <Section1_2_SentimentDistribution data={data.section1_2} />
                <Section1_3_KeyTrends data={data.section1_3} />
                <Section1_4_CriticalIssues data={data.section1_4} />

                {/* 2. Detailed Analytics */}
                <Section2_DetailedAnalytics data={data.section2} />
                <Section2_1_SentimentTimeline data={data.section2_1} />
                <Section2_2_IssueCategoryBreakdown data={data.section2_2} />
                <Section2_3_VersionImpactAnalysis data={data.section2_3} />
                <Section2_4_GeographicDistribution data={data.section2_4} />
                <Section2_5_StarRatingComparison data={data.section2_5} />

                {/* 3. Issue Deep Dive */}
                <Section3_IssueDeepDive data={data.section3} />
                <Section3_1_EmergingIssues data={data.section3_1} />
                <Section3_2_ResolvedIssues data={data.section3_2} />
                <Section3_3_FeatureSpecificFeedback data={data.section3_3} />

                {/* 4. Actionable Insights */}
                <Section4_ActionableInsights data={data.section4} />
                <Section4_1_PriorityRecommendations data={data.section4_1} />
                <Section4_2_ResponsibleTeams data={data.section4_2} />
                <Section4_3_TimelineExpectations data={data.section4_3} />
                <Section4_4_FinalValidation data={data.section4_4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-[#e0e0e0]">
        <FileText size={120} strokeWidth={1} />
        <p
          className="text-xl font-medium mt-4 text-[#d0d0d0]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Artifact Preview
        </p>
      </div>
    </div>
  );
};

export default ArtifactPlaceholder;
