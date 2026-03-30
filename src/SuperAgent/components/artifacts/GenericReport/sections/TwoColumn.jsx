const Column = ({ col }) => {
  if (!col) return null;
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
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {(col.items || []).map((item, i) => {
          const label = typeof item === "string" ? item : item.label;
          const description = typeof item === "object" ? item.description : null;
          return (
            <li key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  marginTop: "5px",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#141414",
                  flexShrink: 0,
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
    </div>
  );
};

const TwoColumn = ({ section }) => {
  if (!section?.left && !section?.right) return null;

  return (
    <div style={{ display: "flex", gap: "32px", marginTop: "16pt" }}>
      <Column col={section.left} />
      <div style={{ width: "1px", background: "#e5e5e5", flexShrink: 0 }} />
      <Column col={section.right} />
    </div>
  );
};

export default TwoColumn;
