// Handles both schemas:
// Designed: section.items[{label, score, max, color}]
// Agent:    section.content.items[{label, score, max, status}]
const ScoreList = ({ section }) => {
  const items = section?.content?.items || section?.items || [];
  if (!items.length) return null;

  return (
    <div style={{ marginTop: "16pt" }}>
      {items.map((item, i) => {
        const max = item.max ?? 10;
        const pct = Math.min(100, Math.round((item.score / max) * 100));
        const barColor =
          item.color ||
          (item.status === "critical"
            ? "#dc2626"
            : item.status === "caution"
            ? "#f59e0b"
            : pct >= 70
            ? "#16a34a"
            : pct >= 40
            ? "#f59e0b"
            : "#dc2626");

        return (
          <div
            key={i}
            style={{
              padding: "10px 0",
              borderBottom: i < items.length - 1 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "14px", color: "#141414" }}>{item.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#141414" }}>
                {item.value ?? `${item.score}/${max}`}
              </span>
            </div>
            <div
              style={{
                height: "6px",
                background: "#f0f0f0",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: barColor,
                  borderRadius: "3px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreList;
