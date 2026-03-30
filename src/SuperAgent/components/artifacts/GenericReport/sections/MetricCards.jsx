// Handles both schemas:
// Designed: section.items[{label, value, subtitle, delta, delta_direction}]
// Agent:    section.content.cards[{label, value, status, delta, trend}]
const MetricCards = ({ section }) => {
  const items = section?.content?.cards || section?.items || [];
  if (!items.length) return null;

  const statusColor = (status, trend) => {
    if (trend === "down" || status === "critical") return "#dc2626";
    if (trend === "up" || status === "positive") return "#16a34a";
    if (status === "caution") return "#f59e0b";
    return "#6d6d6d";
  };

  const trendSymbol = (trend, direction) => {
    const t = trend || direction;
    if (t === "up") return "▲";
    if (t === "down") return "▼";
    return "";
  };

  return (
    <div style={{ display: "flex", gap: "16px", marginTop: "16pt", flexWrap: "wrap" }}>
      {items.map((item, i) => {
        const deltaText = item.delta;
        const trend = item.trend || item.delta_direction;
        const color = statusColor(item.status, trend);

        return (
          <div
            key={i}
            style={{
              flex: "1 1 160px",
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "16px",
                color: "#6d6d6d",
                marginBottom: "12px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "36px",
                lineHeight: "44px",
                color: "#141414",
                marginBottom: "6px",
              }}
            >
              {item.value ?? "—"}
            </div>
            {(item.subtitle || deltaText) && (
              <div style={{ fontSize: "12px", color: "#6d6d6d", lineHeight: "16px" }}>
                {deltaText && (
                  <span style={{ color, marginRight: "4px" }}>
                    {trendSymbol(trend)} {deltaText}
                  </span>
                )}
                {item.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
