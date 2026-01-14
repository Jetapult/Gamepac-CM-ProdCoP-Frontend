import React, { useMemo } from "react";
import {
  Header,
  Section1_ReportMetadata,
  Section2_KeyMetricsDashboard,
  Section3_CriticalAlerts,
  Section4_ActionItems,
} from "@/SuperAgent/components/artifacts/ReviewReportShort/sections";

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

const ReviewReportShortContent = ({ data }) => {
  const sectionNumbers = useMemo(() => {
    const numbers = {};
    let currentNumber = 0;

    if (hasData(data.section1)) {
      currentNumber++;
      numbers.section1 = `${currentNumber}.`;
    }
    if (hasData(data.header)) {
      currentNumber++;
      numbers.section2 = `${currentNumber}.`;
    }
    if (hasData(data.section3?.alerts)) {
      currentNumber++;
      numbers.section3 = `${currentNumber}.`;
    }
    if (hasData(data.section4?.actionItems)) {
      currentNumber++;
      numbers.section4 = `${currentNumber}.`;
    }

    return numbers;
  }, [data]);

  return (
    <>
      {/* Header */}
      <Header data={data.header} />
      {/* 1. Report Metadata */}
      <Section1_ReportMetadata
        data={data.section1}
        sectionNumber={sectionNumbers.section1}
      />
      {/* 2. Key Metrics Dashboard */}
      <Section2_KeyMetricsDashboard
        data={data.header}
        sectionNumber={sectionNumbers.section2}
      />
      {/* 3. Critical Alerts */}
      <Section3_CriticalAlerts
        data={data.section3}
        sectionNumber={sectionNumbers.section3}
      />
      {/* 4. Action Items */}
      <Section4_ActionItems
        data={data.section4}
        sectionNumber={sectionNumbers.section4}
      />
    </>
  );
};

export default ReviewReportShortContent;
