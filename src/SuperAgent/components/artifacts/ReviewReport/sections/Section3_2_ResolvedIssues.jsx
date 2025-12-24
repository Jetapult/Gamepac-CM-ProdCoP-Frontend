import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section3_2_ResolvedIssues = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
        </SectionTitle>
      )}

      {data.resolvedIssues?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.resolvedIssues.map(
              (issue, index) =>
                issue?.title && (
                  <li
                    key={index}
                    style={{
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "#141414",
                      marginBottom: "12px",
                    }}
                  >
                    <strong>{issue.title}:</strong> {issue.description || ""}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Section3_2_ResolvedIssues;
