import ReportHeader from "./GenericReport/ReportHeader";
import SectionRenderer from "./GenericReport/SectionRenderer";

const GenericReportContent = ({ data }) => {
  if (!data) return null;

  // Some agents (e.g. ScalePac) wrap the report as a JSON string in data.raw
  let resolved = data;
  if (data.raw && typeof data.raw === "string") {
    try {
      resolved = JSON.parse(data.raw);
    } catch {
      resolved = data;
    }
  }

  const { header, sections = [] } = resolved;

  return (
    <>
      <ReportHeader header={header} />

      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <div className="section-title" style={{ marginTop: "37.5pt" }}>
              {section.title}
            </div>
          )}
          <SectionRenderer section={section} />
        </div>
      ))}
    </>
  );
};

export default GenericReportContent;
