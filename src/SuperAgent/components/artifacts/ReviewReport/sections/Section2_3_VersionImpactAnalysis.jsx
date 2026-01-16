import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section2_3_VersionImpactAnalysis = ({ data, sectionNumber }) => {
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

      {data.versions?.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Release Date</th>
              <th>Sentiment Behavior</th>
              <th>Key Issues</th>
            </tr>
          </thead>
          <tbody>
            {data.versions.map(
              (v, index) =>
                v?.version && (
                  <tr key={index}>
                    <td>{v.version}</td>
                    <td>{v.releaseDate || "N/A"}</td>
                    <td>{v.sentimentBehavior || "N/A"}</td>
                    <td>{v.keyIssues || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Section2_3_VersionImpactAnalysis;
