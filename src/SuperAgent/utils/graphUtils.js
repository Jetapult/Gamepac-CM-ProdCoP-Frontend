/**
 * Graph generation utilities for report artifacts
 *
 * Chart types used in reports:
 * - line: Sentiment Timeline (Review Report section2_1)
 * - horizontalBar: Issue Category Breakdown (Review Report section2_2)
 * - geoBar: Geographic Distribution (Review Report section2_4)
 * - groupedBar: Star Rating Comparison (Review Report section2_5)
 * - platformChart: Platform Distribution (Bug Report)
 * - escalationChart: Escalation Trend (Bug Report)
 *
 * TODO: Replace with actual chart rendering (e.g., Chart.js, Recharts)
 */

import platformChartImage from "@/assets/bug-report/platform-chart.png";
import escalationChartImage from "@/assets/bug-report/escalation-chart.png";

// Placeholder image for charts that don't have static PNGs yet
const PLACEHOLDER_CHART =
  "https://placehold.co/600x300/f8f8f7/6d6d6d?text=Chart+Placeholder";

export const generateLineChart = (data = {}) => PLACEHOLDER_CHART;
export const generateHorizontalBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generateGeoBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generateGroupedBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generatePlatformChart = (data = {}) => platformChartImage;
export const generateEscalationChart = (data = {}) => escalationChartImage;

export const generateChart = (chartType, data = {}) => {
  const chartGenerators = {
    line: generateLineChart,
    horizontalBar: generateHorizontalBarChart,
    geoBar: generateGeoBarChart,
    groupedBar: generateGroupedBarChart,
    platformChart: generatePlatformChart,
    escalationChart: generateEscalationChart,
  };

  const generator = chartGenerators[chartType] || (() => PLACEHOLDER_CHART);
  return generator(data);
};

export const processReportGraphs = (reportData) => {
  if (!reportData || typeof reportData !== "object") {
    return reportData;
  }

  const processObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const result = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in result) {
      if (typeof result[key] === "object" && result[key] !== null) {
        if (result[key].chartData && result[key].chartData.type) {
          result[key] = {
            ...result[key],
            chartImage: generateChart(
              result[key].chartData.type,
              result[key].chartData
            ),
          };
        } else {
          result[key] = processObject(result[key]);
        }
      }
    }

    return result;
  };

  return processObject(reportData);
};

export default {
  generateLineChart,
  generateHorizontalBarChart,
  generateGeoBarChart,
  generateGroupedBarChart,
  generatePlatformChart,
  generateEscalationChart,
  generateChart,
  processReportGraphs,
};
