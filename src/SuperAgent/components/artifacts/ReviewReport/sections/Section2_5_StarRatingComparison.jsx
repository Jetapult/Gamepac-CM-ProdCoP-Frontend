import {
  SectionTitle,
  ChartContainer,
} from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { ArrowIcon } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section2_5_StarRatingComparison = ({ data, sectionNumber }) => {
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

      {data.ratings?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Star Rating</th>
              <th>Current Period (%)</th>
              <th>Previous Period (%)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.ratings.map(
              (r, index) =>
                r?.stars && (
                  <tr key={index}>
                    <td>⭐ {r.stars}</td>
                    <td>{r.currentPeriod || "N/A"}</td>
                    <td>{r.previousPeriod || "N/A"}</td>
                    <td>{r.change || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}

      {data.chartImage && (
        <ChartContainer
          src={data.chartImage}
          alt="Star Rating Comparison Chart"
        />
      )}

      {data.summaryCards?.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginTop: "24pt" }}>
          {data.summaryCards.map(
            (card, index) =>
              card?.value && (
                <RatingCard
                  key={index}
                  label={card.label || ""}
                  value={card.value}
                  valueColor={card.valueColor || "#141414"}
                  subtitle={card.subtitle || ""}
                />
              )
          )}
        </div>
      )}
    </>
  );
};

const RatingCard = ({ label, value, valueColor, subtitle }) => (
  <div
    style={{
      flex: 1,
      background: "#fafafa",
      border: "1px solid #e5e5e5",
      borderRadius: "8px",
      padding: "20px",
    }}
  >
    <div
      style={{
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "16px",
        color: "#6d6d6d",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <ArrowIcon />
      {label}
    </div>
    <div
      style={{
        fontWeight: 700,
        fontSize: "48px",
        lineHeight: "56px",
        color: valueColor,
        marginBottom: "8px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "16px",
        color: "#6d6d6d",
      }}
    >
      {subtitle}
    </div>
  </div>
);

export default Section2_5_StarRatingComparison;
