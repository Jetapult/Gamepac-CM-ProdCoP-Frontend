import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section1_2_SentimentDistribution = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
        </SectionTitle>
      )}

      {data.categories?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Percentage</th>
              <th>Review Count</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map(
              (cat, index) =>
                cat?.category && (
                  <tr key={index}>
                    <td
                      style={{ color: cat.color || "#141414", fontWeight: 500 }}
                    >
                      {cat.category} {cat.range && `(${cat.range})`}
                    </td>
                    <td>
                      {cat.percentage !== undefined
                        ? `${cat.percentage}%`
                        : "N/A"}
                    </td>
                    <td>{cat.reviewCount || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Section1_2_SentimentDistribution;
