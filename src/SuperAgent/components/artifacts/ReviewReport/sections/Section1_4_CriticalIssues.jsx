import {
  SectionTitle,
  IssueItem,
} from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section1_4_CriticalIssues = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {displayTitle}{" "}
          {data.urgencyThreshold !== undefined &&
            `(Urgency > ${data.urgencyThreshold})`}
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
                  description={`${issue.description || ""} ${
                    issue.urgency !== undefined
                      ? `(Urgency: ${issue.urgency})`
                      : ""
                  }`}
                />
              )
          )}
        </div>
      )}
    </>
  );
};

export default Section1_4_CriticalIssues;
