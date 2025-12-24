import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section1_ReportMetadata = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && <SectionTitle>{data.title}</SectionTitle>}

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
