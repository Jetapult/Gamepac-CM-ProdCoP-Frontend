import SectionRenderer from "../SectionRenderer";

// Handles both schemas:
// Designed: col = {title, items: [string | {label, description}]}
// Agent:    col = {type, title, content: {items: [...]}} — delegates to SectionRenderer
const Column = ({ col }) => {
  if (!col) return null;

  const items = col.items || [];

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {col.title && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#6d6d6d",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {col.title}
        </div>
      )}
      {col.type ? (
        // Column has a section type — render it properly (alert_list, list, score_list, etc.)
        <SectionRenderer section={col} />
      ) : (
        // Flat items fallback (designed schema)
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, i) => {
            const label = typeof item === "string" ? item : (item.text || item.label);
            const description = typeof item === "object" ? item.description : null;
            return (
              <li key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#141414",
                    flexShrink: 0,
                    alignSelf: "flex-start",
                    marginTop: "8px",
                  }}
                />
                <div>
                  <div style={{ fontSize: "14px", color: "#141414", lineHeight: "21px" }}>{label}</div>
                  {description && (
                    <div style={{ fontSize: "12px", color: "#6d6d6d", marginTop: "2px" }}>{description}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const TwoColumn = ({ section }) => {
  // Support both section.left/right and section.content.left/right
  const left = section?.content?.left || section?.left;
  const right = section?.content?.right || section?.right;
  if (!left && !right) return null;

  return (
    <div style={{ display: "flex", gap: "32px", marginTop: "16pt" }}>
      <Column col={left} />
      <div style={{ width: "1px", background: "#e5e5e5", flexShrink: 0 }} />
      <Column col={right} />
    </div>
  );
};

export default TwoColumn;
