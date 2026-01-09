import React from "react";
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

const BugReportContent = ({ data }) => {
  return (
    <>
      {/* Header */}
      <Header data={data.header} />
      {/* 1. Report Metadata */}
      <Section1_ReportMetadata data={data.section1} />
      {/* 2. Incident Summary */}
      <Section2_IncidentSummary data={data.section2} />
      {/* 2. Metric Cards */}
      <Section2_MetricCards data={data.section2} />
      {/* 3. Technical Details */}
      <Section3_TechnicalDetails data={data.section3} />
      {/* 3. Platform Chart */}
      <Section3_PlatformChart data={data.section3} />
      {/* 3. Error Logs */}
      <Section3_ErrorLogs data={data.section3} />
      {/* 4. User Impact Analysis */}
      <Section4_UserImpact data={data.section4} />
      {/* 4. User Quotes */}
      <Section4_UserQuotes data={data.section4} />
      {/* 4. Escalation Chart */}
      <Section4_EscalationChart data={data.section4} />
      {/* 4. Escalation History */}
      <Section4_EscalationHistory data={data.section4} />
      {/* 5. Resolution Planning */}
      <Section5_ResolutionPlanning data={data.section5} />
      {/* 5. Approaches Table */}
      <Section5_ApproachesTable data={data.section5} />
      {/* 5. Risk Assessment */}
      <Section5_RiskAssessment data={data.section5} />
      {/* 6. Communication Trial */}
      <Section6_CommunicationTrial data={data.section6} />
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
