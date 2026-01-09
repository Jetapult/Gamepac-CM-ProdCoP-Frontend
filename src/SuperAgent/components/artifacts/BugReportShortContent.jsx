import React from "react";
import {
  Header,
  Section1_BugOverview,
  Section2_ImpactSnapshot,
  Section3_ResolutionProgress,
  Section4_CriticalStakeholders,
  Section5_NextSteps,
} from "@/SuperAgent/components/artifacts/BugReportShort/sections";

const A4_WIDTH_PX = 794;

const BugReportShortContent = ({ data }) => {
  return (
    <div
      style={{
        width: A4_WIDTH_PX,
        background: "#fff",
        padding: "40px 48px",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Header data={data.header} />
      {/* Section 1: Bug Overview */}
      <Section1_BugOverview data={data.section1Short} />
      {/* Section 2: Impact Snapshot */}
      <Section2_ImpactSnapshot data={data.section2Short} />
      {/* Section 3: Resolution & Progress */}
      <Section3_ResolutionProgress data={data.section3Short} />
      {/* Section 4: Critical Stakeholders */}
      <Section4_CriticalStakeholders data={data.section4Short} />
      {/* Section 5: Next Steps */}
      <Section5_NextSteps data={data.section5Short} />
    </div>
  );
};

export default BugReportShortContent;
