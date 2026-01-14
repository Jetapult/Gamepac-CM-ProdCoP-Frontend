import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section1_ReportMetadata = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && <SectionTitle>{displayTitle}</SectionTitle>}

      {data.metadata?.length > 0 && (
        <table className="metadata-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.metadata.map(
              (item, index) =>
                item?.field && (
                  <tr key={index}>
                    <td>{item.field}</td>
                    <td>{item.value || "N/A"}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Section1_ReportMetadata;
