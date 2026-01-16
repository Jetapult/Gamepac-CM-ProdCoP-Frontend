import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section4_1_PriorityRecommendations = ({ data, sectionNumber }) => {
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

      {data.recommendations?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Recommendation</th>
              <th>Impact (-)</th>
              <th>Effort (-)</th>
              <th>Priority Score</th>
              <th>Responsible Team</th>
            </tr>
          </thead>
          <tbody>
            {data.recommendations.map(
              (rec, index) =>
                rec?.recommendation && (
                  <tr key={index}>
                    <td>{rec.rank || String(index + 1).padStart(2, "0")}</td>
                    <td>{rec.recommendation}</td>
                    <td>{rec.impact || "N/A"}</td>
                    <td>{rec.effort || "N/A"}</td>
                    <td style={{ fontWeight: 600 }}>
                      {rec.priorityScore || "N/A"}
                    </td>
                    <td>{rec.responsibleTeam || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Section4_1_PriorityRecommendations;
