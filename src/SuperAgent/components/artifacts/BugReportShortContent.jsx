import React, { useMemo } from "react";
import {
  Header,
  Section1_BugOverview,
  Section2_ImpactSnapshot,
  Section3_ResolutionProgress,
  Section4_CriticalStakeholders,
  Section5_NextSteps,
} from "@/SuperAgent/components/artifacts/BugReportShort/sections";

const A4_WIDTH_PX = 794;

const hasData = (data) => {
  if (!data) return false;
  if (typeof data !== "object") return true;
  const keys = Object.keys(data);
  return keys.some((key) => {
    const value = data[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "object" && value !== null) return hasData(value);
    return value !== null && value !== undefined;
  });
};

const BugReportShortContent = ({ data }) => {
  const sectionNumbers = useMemo(() => {
    const numbers = {};
    let currentNumber = 0;

    if (hasData(data.section1Short)) {
      currentNumber++;
      numbers.section1Short = `${currentNumber}.`;
    }
    if (hasData(data.section2Short)) {
      currentNumber++;
      numbers.section2Short = `${currentNumber}.`;
    }
    if (hasData(data.section3Short)) {
      currentNumber++;
      numbers.section3Short = `${currentNumber}.`;
    }
    if (hasData(data.section4Short)) {
      currentNumber++;
      numbers.section4Short = `${currentNumber}.`;
    }
    if (hasData(data.section5Short)) {
      currentNumber++;
      numbers.section5Short = `${currentNumber}.`;
    }

    return numbers;
  }, [data]);

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
      <Section1_BugOverview
        data={data.section1Short}
        sectionNumber={sectionNumbers.section1Short}
      />
      {/* Section 2: Impact Snapshot */}
      <Section2_ImpactSnapshot
        data={data.section2Short}
        sectionNumber={sectionNumbers.section2Short}
      />
      {/* Section 3: Resolution & Progress */}
      <Section3_ResolutionProgress
        data={data.section3Short}
        sectionNumber={sectionNumbers.section3Short}
      />
      {/* Section 4: Critical Stakeholders */}
      <Section4_CriticalStakeholders
        data={data.section4Short}
        sectionNumber={sectionNumbers.section4Short}
      />
      {/* Section 5: Next Steps */}
      <Section5_NextSteps
        data={data.section5Short}
        sectionNumber={sectionNumbers.section5Short}
      />
    </div>
  );
};

export default BugReportShortContent;
