import React from "react";
import { useSelector } from "react-redux";
import "@/pages/ReviewReport/ReportStyles.css";
import ReportWrapper from "@/SuperAgent/components/artifacts/ReportWrapper";
import BugReportContent from "@/SuperAgent/components/artifacts/BugReportContent";
import BugReportShortContent from "@/SuperAgent/components/artifacts/BugReportShortContent";
import ReviewReportContent from "@/SuperAgent/components/artifacts/ReviewReportContent";
import ReviewReportShortContent from "@/SuperAgent/components/artifacts/ReviewReportShortContent";
import MarkdownContent from "@/SuperAgent/components/artifacts/MarkdownContent";
import GenericReportContent from "@/SuperAgent/components/artifacts/GenericReportContent";
import { extractMarkdownFromData } from "@/SuperAgent/utils/markdownExtractor";

const truncate = (str, n) => (str || "").slice(0, n).trim();

const ArtifactPlaceholder = ({ type, data, googleDocsActionData }) => {
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  // Don't render anything if no type or no data
  if (!type || !data) {
    return null;
  }

  if (type === "bug-report") {
    return (
      <ReportWrapper title="Bug Report v1" googleDocsActionData={googleDocsActionData}>
        <BugReportContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "bug-report-short") {
    return (
      <ReportWrapper title="Bug Report Short v1" containerClassName="" googleDocsActionData={googleDocsActionData}>
        <BugReportShortContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "review-report-short") {
    return (
      <ReportWrapper title="Review Report Short v1" googleDocsActionData={googleDocsActionData}>
        <ReviewReportShortContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "review-report") {
    return (
      <ReportWrapper title="Review Report v1" googleDocsActionData={googleDocsActionData}>
        <ReviewReportContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "generic-report") {
    const agentName = truncate(data?.agent_slug || data?.header?.agent, 20);
    const gameName = truncate(
      data?.header?.game || data?.header?.game_name || selectedGame?.game_name,
      25,
    );
    const reportTitle = truncate(data?.header?.report_title, 30);
    const pdfFilename = [agentName, gameName || reportTitle]
      .filter(Boolean)
      .join("_");

    return (
      <ReportWrapper
        title={data?.header?.report_title || "Report"}
        pdfFilename={pdfFilename || undefined}
        googleDocsActionData={googleDocsActionData}
      >
        <GenericReportContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "trend_analysis") {
    const markdownString = extractMarkdownFromData(data);
    return (
      <ReportWrapper title="Trend Analysis Report" googleDocsActionData={googleDocsActionData} markdownString={markdownString}>
        <MarkdownContent data={data} />
      </ReportWrapper>
    );
  }

  // Unknown type - render as markdown content
  const markdownString = extractMarkdownFromData(data);
  return (
    <ReportWrapper title="Report" googleDocsActionData={googleDocsActionData} markdownString={markdownString}>
      <MarkdownContent data={data} />
    </ReportWrapper>
  );
};

export default ArtifactPlaceholder;
