const levelStyles = {
  high: { bg: "#fef2f2", border: "#fecaca", dot: "#dc2626" },
  critical: { bg: "#fef2f2", border: "#fecaca", dot: "#dc2626" },
  medium: { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
  low: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" },
  info: { bg: "#eff6ff", border: "#bfdbfe", dot: "#2563eb" },
};

// Handles both schemas:
// Designed: section.items[{level, title, description}]
// Agent:    section.content.items[{severity, title, body}]
const AlertList = ({ section }) => {
  const items = section?.content?.items || section?.items || [];
  if (!items.length) return null;

  return (
    <div style={{ marginTop: "16pt", display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item, i) => {
        const level = item.level || item.severity || "info";
        const description = item.description || item.body;
        const style = levelStyles[level] || levelStyles.info;

        return (
          <div
            key={i}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: "8px",
              padding: "14px 16px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                marginTop: "4px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: style.dot,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#141414", lineHeight: "21px" }}>
                {item.title}
              </div>
              {description && (
                <div style={{ fontSize: "13px", color: "#555", marginTop: "4px", lineHeight: "19px" }}>
                  {description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertList;
