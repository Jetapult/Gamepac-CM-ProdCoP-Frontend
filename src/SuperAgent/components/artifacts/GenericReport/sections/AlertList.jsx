const levelStyles = {
  high: { bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", label: "High" },
  medium: { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Medium" },
  low: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", label: "Low" },
  info: { bg: "#eff6ff", border: "#bfdbfe", dot: "#2563eb", label: "Info" },
};

const AlertList = ({ section }) => {
  if (!section?.items?.length) return null;

  return (
    <div style={{ marginTop: "16pt", display: "flex", flexDirection: "column", gap: "10px" }}>
      {section.items.map((item, i) => {
        const style = levelStyles[item.level] || levelStyles.info;
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
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#141414",
                  lineHeight: "21px",
                }}
              >
                {item.title}
              </div>
              {item.description && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    marginTop: "4px",
                    lineHeight: "19px",
                  }}
                >
                  {item.description}
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
