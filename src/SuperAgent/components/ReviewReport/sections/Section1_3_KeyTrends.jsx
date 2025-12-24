import { SectionTitle } from "@/SuperAgent/components/ReviewReport/ui";

const Section1_3_KeyTrends = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
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
