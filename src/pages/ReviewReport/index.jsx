import "@/pages/ReviewReport/ReportStyles.css";

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
} from "@/SuperAgent/components/ReviewReport/sections";

// Import report data (later this will come from API)
import reportData from "@/pages/ReviewReport/data/sampleReportData.json";

export default function ReviewReport() {
  return (
    <div className="review-report-container">
      {/* Header */}
      <Header data={reportData.header} />

      {/* 1. Report Metadata */}
      <Section1_ReportMetadata data={reportData.section1} />
      <Section1_1_ExecutiveSummary data={reportData.section1_1} />
      <Section1_2_SentimentDistribution data={reportData.section1_2} />
      <Section1_3_KeyTrends data={reportData.section1_3} />
      <Section1_4_CriticalIssues data={reportData.section1_4} />

      {/* 2. Detailed Analytics */}
      <Section2_DetailedAnalytics data={reportData.section2} />
      <Section2_1_SentimentTimeline data={reportData.section2_1} />
      <Section2_2_IssueCategoryBreakdown data={reportData.section2_2} />
      <Section2_3_VersionImpactAnalysis data={reportData.section2_3} />
      <Section2_4_GeographicDistribution data={reportData.section2_4} />
      <Section2_5_StarRatingComparison data={reportData.section2_5} />

      {/* 3. Issue Deep Dive */}
      <Section3_IssueDeepDive data={reportData.section3} />
      <Section3_1_EmergingIssues data={reportData.section3_1} />
      <Section3_2_ResolvedIssues data={reportData.section3_2} />
      <Section3_3_FeatureSpecificFeedback data={reportData.section3_3} />

      {/* 4. Actionable Insights */}
      <Section4_ActionableInsights data={reportData.section4} />
      <Section4_1_PriorityRecommendations data={reportData.section4_1} />
      <Section4_2_ResponsibleTeams data={reportData.section4_2} />
      <Section4_3_TimelineExpectations data={reportData.section4_3} />
      <Section4_4_FinalValidation data={reportData.section4_4} />
    </div>
  );
}

