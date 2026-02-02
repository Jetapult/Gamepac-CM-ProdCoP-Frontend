import React from "react";
import { FileText } from "lucide-react";
import "@/pages/ReviewReport/ReportStyles.css";
import ReportWrapper from "@/SuperAgent/components/artifacts/ReportWrapper";
import BugReportContent from "@/SuperAgent/components/artifacts/BugReportContent";
import BugReportShortContent from "@/SuperAgent/components/artifacts/BugReportShortContent";
import ReviewReportContent from "@/SuperAgent/components/artifacts/ReviewReportContent";
import ReviewReportShortContent from "@/SuperAgent/components/artifacts/ReviewReportShortContent";

const ArtifactPlaceholder = ({ type = "bug-report-short", data, googleDocsActionData }) => {
  if (type === "bug-report" && data) {
    return (
      <ReportWrapper title="Bug Report v1" googleDocsActionData={googleDocsActionData}>
        <BugReportContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "bug-report-short" && data) {
    return (
      <ReportWrapper title="Bug Report Short v1" containerClassName="" googleDocsActionData={googleDocsActionData}>
        <BugReportShortContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "review-report-short" && data) {
    return (
      <ReportWrapper title="Review Report Short v1" googleDocsActionData={googleDocsActionData}>
        <ReviewReportShortContent data={data} />
      </ReportWrapper>
    );
  }

  if (type === "review-report" && data) {
    return (
      <ReportWrapper title="Review Report v1" googleDocsActionData={googleDocsActionData}>
        <ReviewReportContent data={data} />
      </ReportWrapper>
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
