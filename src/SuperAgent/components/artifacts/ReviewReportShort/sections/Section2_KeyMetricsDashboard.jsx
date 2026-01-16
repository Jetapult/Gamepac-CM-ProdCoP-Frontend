import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReportShort/ui";

const TrendUpIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "rotate(90deg)" }}
  >
    <path
      d="M13.5 6.75L9 2.25L4.5 6.75"
      stroke="#6D6D6D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 2.25V15.75"
      stroke="#6D6D6D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.33333 3.33333H16.6667V13.3333H4.16667L3.33333 14.1667V3.33333Z"
      stroke="#6D6D6D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  valueColor = "#141414",
}) => (
  <div
    style={{
      background: "#f8f8f8",
      border: "1px solid #dfdfdf",
      borderRadius: "12px",
      padding: "9px 8px",
      width: "289px",
      height: "132px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "260px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "#ededed",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "18px",
            color: "#000",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "28px",
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        color: valueColor === "#f25a5a" ? "#f25a5a" : "#141414",
        marginTop: "12px",
      }}
    >
      {subtitle}
    </div>
  </div>
);

const Section2_KeyMetricsDashboard = ({ data, sectionNumber }) => {
  const displayNumber = sectionNumber || "2.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SectionTitle>{displayNumber} Key Metrics Dashboard</SectionTitle>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            margin: 0,
            width: "100%",
          }}
        >
          This section summarizes the key performance indicators derived from
          the player review data for the reporting period.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "590px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <MetricCard
            icon={<TrendUpIcon />}
            title="Overall Sentiment Score"
            value={data?.overallSentimentScore ?? "N/A"}
            subtitle="Scale: -1.0 Negative to +1.0 Positive"
          />
          <MetricCard
            icon={<ChatIcon />}
            title="Total Reviews Analyzed"
            value={data?.totalReviewsAnalyzed?.toLocaleString() ?? "N/A"}
            subtitle="Both iOS and Android platforms"
          />
        </div>
        <MetricCard
          icon={<TrendUpIcon />}
          title="Sentiment Trend vs Previous Month"
          value={data?.sentimentTrendPercentage ?? "N/A"}
          subtitle={data?.sentimentTrendLabel ?? "N/A"}
          valueColor={
            data?.sentimentTrendPercentage < 0 ? "#f25a5a" : "#141414"
          }
        />
      </div>

      {data?.topIssues && data.topIssues.length > 0 && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
          }}
        >
          <p style={{ fontWeight: 700, margin: 0 }}>Top Issues Identified:</p>
          <ul style={{ margin: 0, paddingLeft: "21px", listStyleType: "disc" }}>
            {data.topIssues.map((issue, index) => (
              <li key={index}>
                <span style={{ fontWeight: 700 }}>{issue.title}: </span>
                <span style={{ fontWeight: 400 }}>{issue.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Section2_KeyMetricsDashboard;
