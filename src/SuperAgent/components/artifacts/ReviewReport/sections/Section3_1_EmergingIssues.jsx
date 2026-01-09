import { SectionTitle, IssueItem } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section3_1_EmergingIssues = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
        </SectionTitle>
      )}

      {data.issues?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          {data.issues.map(
            (issue, index) =>
              issue?.title && (
                <IssueItem
                  key={index}
                  number={issue.number || String(index + 1).padStart(2, "0")}
                  title={issue.title}
                  description={issue.description || ""}
                />
              )
          )}
        </div>
      )}
    </>
  );
};

export default Section3_1_EmergingIssues;
