import React, { useMemo } from "react";
import {
  Header,
  Section1_ReportMetadata,
  Section1_1_ExecutiveSummary,
  Section1_2_SentimentDistribution,
  Section1_3_KeyTrends,
  Section1_4_CriticalIssues,
  Section2_DetailedAnalytics,
  Section2_1_SentimentTimeline,
  Section2_2_IssueCategoryBreakdown,
  Section2_3_VersionImpactAnalysis,
  Section2_4_GeographicDistribution,
  Section2_5_StarRatingComparison,
  Section3_IssueDeepDive,
  Section3_1_EmergingIssues,
  Section3_2_ResolvedIssues,
  Section3_3_FeatureSpecificFeedback,
  Section4_ActionableInsights,
  Section4_1_PriorityRecommendations,
  Section4_2_ResponsibleTeams,
  Section4_3_TimelineExpectations,
  Section4_4_FinalValidation,
} from "@/SuperAgent/components/artifacts/ReviewReport/sections";
import { calculateSectionNumbers } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const ReviewReportContent = ({ data }) => {
  const sectionNumbers = useMemo(() => calculateSectionNumbers(data), [data]);

  return (
    <>
      {/* Header */}
      <Header data={data.header} />
      {/* 1. Report Metadata */}
      <Section1_ReportMetadata
        data={data.section1}
        sectionNumber={sectionNumbers.section1}
      />
      <Section1_1_ExecutiveSummary
        data={data.section1_1}
        sectionNumber={sectionNumbers.section1_1}
      />
      <Section1_2_SentimentDistribution
        data={data.section1_2}
        sectionNumber={sectionNumbers.section1_2}
      />
      <Section1_3_KeyTrends
        data={data.section1_3}
        sectionNumber={sectionNumbers.section1_3}
      />
      <Section1_4_CriticalIssues
        data={data.section1_4}
        sectionNumber={sectionNumbers.section1_4}
      />

      {/* 2. Detailed Analytics */}
      <Section2_DetailedAnalytics
        data={data.section2}
        sectionNumber={sectionNumbers.section2}
      />
      <Section2_1_SentimentTimeline
        data={data.section2_1}
        sectionNumber={sectionNumbers.section2_1}
      />
      <Section2_2_IssueCategoryBreakdown
        data={data.section2_2}
        sectionNumber={sectionNumbers.section2_2}
      />
      <Section2_3_VersionImpactAnalysis
        data={data.section2_3}
        sectionNumber={sectionNumbers.section2_3}
      />
      <Section2_4_GeographicDistribution
        data={data.section2_4}
        sectionNumber={sectionNumbers.section2_4}
      />
      <Section2_5_StarRatingComparison
        data={data.section2_5}
        sectionNumber={sectionNumbers.section2_5}
      />

      {/* 3. Issue Deep Dive */}
      <Section3_IssueDeepDive
        data={data.section3}
        sectionNumber={sectionNumbers.section3}
      />
      <Section3_1_EmergingIssues
        data={data.section3_1}
        sectionNumber={sectionNumbers.section3_1}
      />
      <Section3_2_ResolvedIssues
        data={data.section3_2}
        sectionNumber={sectionNumbers.section3_2}
      />
      <Section3_3_FeatureSpecificFeedback
        data={data.section3_3}
        sectionNumber={sectionNumbers.section3_3}
      />

      {/* 4. Actionable Insights */}
      <Section4_ActionableInsights
        data={data.section4}
        sectionNumber={sectionNumbers.section4}
      />
      <Section4_1_PriorityRecommendations
        data={data.section4_1}
        sectionNumber={sectionNumbers.section4_1}
      />
      <Section4_2_ResponsibleTeams
        data={data.section4_2}
        sectionNumber={sectionNumbers.section4_2}
      />
      <Section4_3_TimelineExpectations
        data={data.section4_3}
        sectionNumber={sectionNumbers.section4_3}
      />
      <Section4_4_FinalValidation
        data={data.section4_4}
        sectionNumber={sectionNumbers.section4_4}
      />
    </>
  );
};

export default ReviewReportContent;
