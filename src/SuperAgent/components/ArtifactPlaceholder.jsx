import React from "react";
import "@/pages/ReviewReport/ReportStyles.css";
import ReportWrapper from "@/SuperAgent/components/artifacts/ReportWrapper";
import BugReportContent from "@/SuperAgent/components/artifacts/BugReportContent";
import BugReportShortContent from "@/SuperAgent/components/artifacts/BugReportShortContent";
import ReviewReportContent from "@/SuperAgent/components/artifacts/ReviewReportContent";
import ReviewReportShortContent from "@/SuperAgent/components/artifacts/ReviewReportShortContent";

const ArtifactPlaceholder = ({ type, data, googleDocsActionData }) => {
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

  // Unknown type - return null instead of placeholder
  return null;
};

export default ArtifactPlaceholder;
