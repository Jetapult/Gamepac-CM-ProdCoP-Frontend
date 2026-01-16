import {
  SectionTitle,
  MetricCard,
} from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import {
  BarChartIcon,
  ChatIcon,
} from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const iconMap = {
  barChart: <BarChartIcon />,
  chat: <ChatIcon />,
};

const Section1_1_ExecutiveSummary = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {displayTitle}
        </SectionTitle>
      )}

      {data.summary && (
        <div
          style={{
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            marginTop: "16pt",
          }}
        >
          {data.summary}
        </div>
      )}

      {data.metrics?.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginTop: "16pt" }}>
          {data.metrics.map(
            (metric, index) =>
              metric?.label && (
                <MetricCard
                  key={index}
                  icon={iconMap[metric.icon]}
                  label={metric.label}
                  value={metric.value || "N/A"}
                  subtitle={metric.subtitle}
                />
              )
          )}
        </div>
      )}
    </>
  );
};

export default Section1_1_ExecutiveSummary;
