import React, { useMemo } from "react";
import {
  Header,
  Section1_ReportMetadata,
  Section2_IncidentSummary,
  Section2_MetricCards,
  Section3_TechnicalDetails,
  Section3_PlatformChart,
  Section3_ErrorLogs,
  Section4_UserImpact,
  Section4_UserQuotes,
  Section4_EscalationChart,
  Section4_EscalationHistory,
  Section5_ResolutionPlanning,
  Section5_ApproachesTable,
  Section5_RiskAssessment,
  Section6_CommunicationTrial,
  Section6_UserCommunications,
  Section6_MetricCards,
  Section6_WorkflowState,
} from "@/SuperAgent/components/artifacts/BugReport/sections";

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

const BugReportContent = ({ data }) => {
  const sectionNumbers = useMemo(() => {
    const numbers = {};
    let currentNumber = 0;

    if (hasData(data.section1)) {
      currentNumber++;
      numbers.section1 = `${currentNumber}.`;
    }
    if (hasData(data.section2)) {
      currentNumber++;
      numbers.section2 = `${currentNumber}.`;
    }
    if (hasData(data.section3)) {
      currentNumber++;
      numbers.section3 = `${currentNumber}.`;
    }
    if (hasData(data.section4)) {
      currentNumber++;
      numbers.section4 = `${currentNumber}.`;
    }
    if (hasData(data.section5)) {
      currentNumber++;
      numbers.section5 = `${currentNumber}.`;
    }
    if (hasData(data.section6)) {
      currentNumber++;
      numbers.section6 = `${currentNumber}.`;
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
      {/* 2. Incident Summary */}
      <Section2_IncidentSummary
        data={data.section2}
        sectionNumber={sectionNumbers.section2}
      />
      {/* 2. Metric Cards */}
      <Section2_MetricCards data={data.section2} />
      {/* 3. Technical Details */}
      <Section3_TechnicalDetails
        data={data.section3}
        sectionNumber={sectionNumbers.section3}
      />
      {/* 3. Platform Chart */}
      <Section3_PlatformChart data={data.section3} />
      {/* 3. Error Logs */}
      <Section3_ErrorLogs data={data.section3} />
      {/* 4. User Impact Analysis */}
      <Section4_UserImpact
        data={data.section4}
        sectionNumber={sectionNumbers.section4}
      />
      {/* 4. User Quotes */}
      <Section4_UserQuotes data={data.section4} />
      {/* 4. Escalation Chart */}
      <Section4_EscalationChart data={data.section4} />
      {/* 4. Escalation History */}
      <Section4_EscalationHistory data={data.section4} />
      {/* 5. Resolution Planning */}
      <Section5_ResolutionPlanning
        data={data.section5}
        sectionNumber={sectionNumbers.section5}
      />
      {/* 5. Approaches Table */}
      <Section5_ApproachesTable data={data.section5} />
      {/* 5. Risk Assessment */}
      <Section5_RiskAssessment data={data.section5} />
      {/* 6. Communication Trial */}
      <Section6_CommunicationTrial
        data={data.section6}
        sectionNumber={sectionNumbers.section6}
      />
      {/* 6. User Communications */}
      <Section6_UserCommunications data={data.section6} />
      {/* 6. Metric Cards */}
      <Section6_MetricCards data={data.section6} />
      {/* 6. Workflow State */}
      <Section6_WorkflowState data={data.section6} />
    </>
  );
};

export default BugReportContent;
