import { SectionTitle, ChartContainer } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section2_4_GeographicDistribution = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
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

      {data.chartImage && (
        <ChartContainer
          src={data.chartImage}
          alt="Regional Sentiment Score Chart"
        />
      )}

      {data.regions?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Avg Score</th>
              <th>Key Issues</th>
            </tr>
          </thead>
          <tbody>
            {data.regions.map(
              (r, index) =>
                r?.region && (
                  <tr key={index}>
                    <td>{r.region}</td>
                    <td>{r.avgScore || "N/A"}</td>
                    <td>{r.keyIssues || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Section2_4_GeographicDistribution;
