import React from "react";
import {
  Header,
  Section1_ReportMetadata,
  Section2_KeyMetricsDashboard,
  Section3_CriticalAlerts,
  Section4_ActionItems,
} from "@/SuperAgent/components/artifacts/ReviewReportShort/sections";

const ReviewReportShortContent = ({ data }) => {
  return (
    <>
      {/* Header */}
      <Header data={data.header} />
      {/* 1. Report Metadata */}
      <Section1_ReportMetadata data={data.section1} />
      {/* 2. Key Metrics Dashboard */}
      <Section2_KeyMetricsDashboard data={data.header} />
      {/* 3. Critical Alerts */}
      <Section3_CriticalAlerts data={data.section3} />
      {/* 4. Action Items */}
      <Section4_ActionItems data={data.section4} />
    </>
  );
};

export default ReviewReportShortContent;
