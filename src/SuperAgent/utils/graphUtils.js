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

// All charts use placeholder URLs with big PLACEHOLDER text
const PLACEHOLDER_CHART =
  "https://placehold.co/600x300/f8f8f7/141414?text=PLACEHOLDER&font=roboto";
const PLACEHOLDER_PLATFORM =
  "https://placehold.co/400x300/f8f8f7/141414?text=PLACEHOLDER%0APlatform+Chart&font=roboto";
const PLACEHOLDER_ESCALATION =
  "https://placehold.co/500x300/f8f8f7/141414?text=PLACEHOLDER%0AEscalation+Chart&font=roboto";

export const generateLineChart = (data = {}) => PLACEHOLDER_CHART;
export const generateHorizontalBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generateGeoBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generateGroupedBarChart = (data = {}) => PLACEHOLDER_CHART;
export const generatePlatformChart = (data = {}) => PLACEHOLDER_PLATFORM;
export const generateEscalationChart = (data = {}) => PLACEHOLDER_ESCALATION;

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
