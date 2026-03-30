const MetricCards = ({ section }) => {
  if (!section?.items?.length) return null;

  const deltaColor = (dir) => {
    if (dir === "up") return "#16a34a";
    if (dir === "down") return "#dc2626";
    return "#6d6d6d";
  };

  const deltaSymbol = (dir) => {
    if (dir === "up") return "▲";
    if (dir === "down") return "▼";
    return "";
  };

  return (
    <div style={{ display: "flex", gap: "16px", marginTop: "16pt", flexWrap: "wrap" }}>
      {section.items.map((item, i) => (
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
          {(item.subtitle || item.delta !== undefined) && (
            <div style={{ fontSize: "12px", color: "#6d6d6d", lineHeight: "16px" }}>
              {item.delta !== undefined && item.delta_direction && (
                <span style={{ color: deltaColor(item.delta_direction), marginRight: "4px" }}>
                  {deltaSymbol(item.delta_direction)} {item.delta}
                </span>
              )}
              {item.subtitle}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
