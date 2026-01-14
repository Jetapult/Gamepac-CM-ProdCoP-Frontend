import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section1_3_KeyTrends = ({ data, sectionNumber }) => {
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

      {data.trends?.length > 0 && (
        <ul
          style={{
            marginTop: "16pt",
            paddingLeft: "20px",
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
          }}
        >
          {data.trends.map(
            (trend, index) =>
              trend?.title && (
                <li key={index} style={{ marginBottom: "12px" }}>
                  <strong>{trend.title}:</strong> {trend.description || ""}
                </li>
              )
          )}
        </ul>
      )}
    </>
  );
};

export default Section1_3_KeyTrends;
