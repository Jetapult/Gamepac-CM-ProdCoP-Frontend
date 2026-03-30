import ReportHeader from "./GenericReport/ReportHeader";
import SectionRenderer from "./GenericReport/SectionRenderer";

// Parse JSON string, recovering gracefully from truncated input.
// Strategy: strip back to the last complete '}', count unclosed
// brackets/braces, then append the matching closers.
const parseJson = (str) => {
  if (!str || typeof str !== "string") return null;

  // 1. Full parse — works if JSON is complete
  try { return JSON.parse(str); } catch { /* fall through */ }

  // 2. Strip to last '}' to remove any trailing incomplete property
  const lastBrace = str.lastIndexOf("}");
  if (lastBrace < 0) return null;
  let attempt = str.substring(0, lastBrace + 1);

  // 3. Count unmatched open brackets/braces
  const opens = [];
  let inStr = false, esc = false;
  for (let i = 0; i < attempt.length; i++) {
    const c = attempt[i];
    if (esc) { esc = false; continue; }
    if (c === "\\" && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") opens.push(c);
    else if (c === "}" || c === "]") opens.pop();
  }

  // 4. Append closers in reverse order
  const closer = opens
    .reverse()
    .map((c) => (c === "{" ? "}" : "]"))
    .join("");

  try { return JSON.parse(attempt + closer); } catch { return null; }
};

// Extract JSON from a possible ```json ... ``` markdown code block
const parseMarkdownJson = (str) => {
  if (typeof str !== "string") return null;
  const match = str.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
  return parseJson(match ? match[1].trim() : str.trim());
};

// Resolve actual report data from various agent wrapping patterns:
//   ScalePac: data.raw = JSON string (possibly truncated)
//   LiveOps:  data.markdown = ```json...``` code block (possibly truncated)
//   Others:   data already has header + sections
const resolveData = (data) => {
  if (!data) return null;
  if (data.raw && typeof data.raw === "string") {
    const parsed = parseJson(data.raw);
    if (parsed) return parsed;
  }
  if (data.markdown && typeof data.markdown === "string") {
    const parsed = parseMarkdownJson(data.markdown);
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
        <div key={i} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
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
