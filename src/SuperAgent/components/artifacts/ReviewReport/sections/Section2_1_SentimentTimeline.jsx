import {
  SectionTitle,
  ChartContainer,
  VersionCard,
} from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { StarIcon } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section2_1_SentimentTimeline = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "24pt" }}>
          {displayTitle}
        </SectionTitle>
      )}

      {data.description && (
        <div
          style={{
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            marginTop: "16pt",
          }}
        >
          {data.description}
        </div>
      )}

      {data.timelineData?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date Range</th>
              <th>Daily Sentiment</th>
              <th>7 Day Moving Average</th>
            </tr>
          </thead>
          <tbody>
            {data.timelineData.map(
              (row, index) =>
                row?.dateRange && (
                  <tr key={index}>
                    <td>{row.dateRange}</td>
                    <td>{row.dailySentiment || "N/A"}</td>
                    <td>{row.movingAverage || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}

      {data.chartImage && (
        <ChartContainer src={data.chartImage} alt="Sentiment Timeline Chart" />
      )}

      {data.versionCards?.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginTop: "24pt" }}>
          {data.versionCards.map(
            (card, index) =>
              card?.version && (
                <VersionCard
                  key={index}
                  icon={<StarIcon />}
                  label={card.label || ""}
                  version={card.version}
                  date={card.date || ""}
                />
              )
          )}
        </div>
      )}
    </>
  );
};

export default Section2_1_SentimentTimeline;
