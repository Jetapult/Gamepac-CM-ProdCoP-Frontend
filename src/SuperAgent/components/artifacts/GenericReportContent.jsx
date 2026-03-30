import ReportHeader from "./GenericReport/ReportHeader";
import SectionRenderer from "./GenericReport/SectionRenderer";

// Extract JSON object from a possible markdown code block: ```json\n{...}\n```
const extractJsonFromMarkdown = (str) => {
  if (typeof str !== "string") return null;
  const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
  try {
    return JSON.parse(match ? match[1].trim() : str.trim());
  } catch {
    return null;
  }
};

// Resolve actual report data from various agent wrapping patterns
const resolveData = (data) => {
  if (!data) return null;
  // ScalePac: data.raw is a JSON string
  if (data.raw && typeof data.raw === "string") {
    try { return JSON.parse(data.raw); } catch { /* fall through */ }
  }
  // LiveOps: data.markdown is a ```json ... ``` code block
  if (data.markdown && typeof data.markdown === "string") {
    const parsed = extractJsonFromMarkdown(data.markdown);
    if (parsed) return parsed;
  }
  return data;
};

// Returns true if a section has no meaningful content to show
const isSectionEmpty = (s) => {
  if (!s) return true;
  switch (s.type) {
    case "metric_cards":
      return !(s.content?.cards?.length || s.items?.length);
    case "table":
      return !(s.content?.rows?.length || s.rows?.length);
    case "list":
      return !(s.content?.items?.length || s.items?.length);
    case "text": {
      const t = typeof s.content === "string" ? s.content : s.content?.body;
      return !t?.trim();
    }
    case "kv_pairs":
      return !(s.content?.pairs?.length || s.content?.items?.length || s.items?.length);
    case "score_list":
      return !(s.content?.items?.length || s.items?.length);
    case "two_column": {
      const l = s.content?.left || s.left;
      const r = s.content?.right || s.right;
      return (
        !(l?.content?.items?.length || l?.items?.length) &&
        !(r?.content?.items?.length || r?.items?.length)
      );
    }
    case "alert_list":
      return !(s.content?.items?.length || s.items?.length);
    default:
      return true;
  }
};

const GenericReportContent = ({ data }) => {
  const resolved = resolveData(data);
  if (!resolved) return null;

  const { header, sections = [] } = resolved;
  const visibleSections = sections.filter((s) => !isSectionEmpty(s));

  return (
    <>
      <ReportHeader header={header} />

      {visibleSections.map((section, i) => (
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
