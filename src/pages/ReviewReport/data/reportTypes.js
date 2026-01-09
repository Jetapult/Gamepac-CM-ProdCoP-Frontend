/**
 * Report Data Types
 * These define the structure of data expected from the API endpoint
 */

/**
 * @typedef {Object} HeaderData
 * @property {string} reportTitle - e.g., "Review Report- Detailed"
 * @property {string} analysisPeriodStart - e.g., "01 January 2025"
 * @property {string} analysisPeriodEnd - e.g., "31 January 2025"
 * @property {string} productName - e.g., "Dragon Forge Arena"
 * @property {number} overallSentimentScore - e.g., -0.42
 * @property {string} sentimentLabel - e.g., "Negative"
 * @property {number} totalReviewsAnalyzed - e.g., 12482
 * @property {number} sentimentTrendPercentage - e.g., -14
 * @property {string} sentimentTrendDirection - "up" | "down"
 * @property {string} sentimentTrendLabel - e.g., "Worsened"
 */

/**
 * @typedef {Object} MetadataField
 * @property {string} field
 * @property {string} value
 */

/**
 * @typedef {Object} Section1Data
 * @property {MetadataField[]} metadata
 * @property {ExecutiveSummaryData} executiveSummary
 * @property {SentimentDistributionData} sentimentDistribution
 * @property {KeyTrendsData} keyTrends
 * @property {CriticalIssuesData} criticalIssues
 */

/**
 * @typedef {Object} ExecutiveSummaryData
 * @property {string} summary
 * @property {number} overallSentimentScore
 * @property {string} sentimentScaleDescription
 * @property {number} totalReviewsAnalyzed
 * @property {string} platformsDescription
 */

/**
 * @typedef {Object} SentimentCategory
 * @property {string} category
 * @property {string} range
 * @property {number} percentage
 * @property {number} reviewCount
 * @property {string} color - hex color for display
 */

/**
 * @typedef {Object} SentimentDistributionData
 * @property {SentimentCategory[]} categories
 */

/**
 * @typedef {Object} KeyTrend
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} KeyTrendsData
 * @property {KeyTrend[]} trends
 */

/**
 * @typedef {Object} CriticalIssue
 * @property {string} number
 * @property {string} title
 * @property {string} description
 * @property {number} urgency
 */

/**
 * @typedef {Object} CriticalIssuesData
 * @property {number} urgencyThreshold
 * @property {CriticalIssue[]} issues
 */

/**
 * @typedef {Object} ReportData
 * @property {HeaderData} header
 * @property {Section1Data} section1
 * // Add more sections as needed
 */

// Default/empty data structures for type reference
export const defaultHeaderData = {
  reportTitle: "",
  analysisPeriodStart: "",
  analysisPeriodEnd: "",
  productName: "",
  overallSentimentScore: 0,
  sentimentLabel: "",
  totalReviewsAnalyzed: 0,
  sentimentTrendPercentage: 0,
  sentimentTrendDirection: "down",
  sentimentTrendLabel: "",
};

export const defaultSection1Data = {
  metadata: [],
  executiveSummary: {
    summary: "",
    overallSentimentScore: 0,
    sentimentScaleDescription: "",
    totalReviewsAnalyzed: 0,
    platformsDescription: "",
  },
  sentimentDistribution: {
    categories: [],
  },
  keyTrends: {
    trends: [],
  },
  criticalIssues: {
    urgencyThreshold: 0,
    issues: [],
  },
};
