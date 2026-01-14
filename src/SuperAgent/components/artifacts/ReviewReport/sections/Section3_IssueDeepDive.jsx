import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section3_IssueDeepDive = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && (
        <div
          style={{
            fontWeight: 500,
            fontSize: "18pt",
            lineHeight: "18pt",
            color: "#141414",
            marginTop: "37.5pt",
          }}
        >
          {displayTitle}
        </div>
      )}

      {data.negativeThemes?.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: "24pt" }}>
            Negative Themes (with real examples quotes)
          </SectionTitle>

          <table className="data-table">
            <thead>
              <tr>
                <th>Theme</th>
                <th>Mentions</th>
                <th>Example Quote</th>
                <th>Responsible Team</th>
              </tr>
            </thead>
            <tbody>
              {data.negativeThemes.map(
                (theme, index) =>
                  theme?.theme && (
                    <tr key={index}>
                      <td style={{ fontWeight: 500, letterSpacing: "-0.42px" }}>
                        {theme.theme}
                      </td>
                      <td style={{ letterSpacing: "-0.42px" }}>
                        {theme.mentions || "N/A"}
                      </td>
                      <td
                        style={{
                          letterSpacing: "-0.42px",
                          fontStyle: "italic",
                        }}
                      >
                        {theme.exampleQuote ? `"${theme.exampleQuote}"` : "N/A"}
                      </td>
                      <td style={{ letterSpacing: "-0.42px" }}>
                        {theme.responsibleTeam || "N/A"}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};

export default Section3_IssueDeepDive;
