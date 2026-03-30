import ReportHeader from "./GenericReport/ReportHeader";
import SectionRenderer from "./GenericReport/SectionRenderer";

const GenericReportContent = ({ data }) => {
  if (!data) return null;

  return (
    <>
      <ReportHeader header={data.header} />

      {(data.sections || []).map((section, i) => (
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
