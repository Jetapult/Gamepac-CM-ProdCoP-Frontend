import { SectionTitle, ChartContainer } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section2_2_IssueCategoryBreakdown = ({ data }) => {
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

      {data.categories?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Issue Category</th>
              <th>Mentions</th>
              <th>Percentage of Top 5</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map(
              (cat, index) =>
                cat?.category && (
                  <tr key={index}>
                    <td>{cat.category}</td>
                    <td>{cat.mentions || "N/A"}</td>
                    <td>{cat.percentage || "N/A"}</td>
                  </tr>
                )
            )}
            {data.totalMentions && (
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontWeight: 600 }}>Total Top Mentions</td>
                <td style={{ fontWeight: 600 }}>{data.totalMentions}</td>
                <td style={{ fontWeight: 600 }}>100.0%</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {data.chartImage && (
        <ChartContainer
          src={data.chartImage}
          alt="Issue Category Breakdown Chart"
        />
      )}
    </>
  );
};

export default Section2_2_IssueCategoryBreakdown;
