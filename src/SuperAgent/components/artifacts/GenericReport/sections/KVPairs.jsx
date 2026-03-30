// Handles both schemas:
// Designed: section.items[{key, value}]
// Agent:    section.content.pairs[{key, value, status}]
const KVPairs = ({ section }) => {
  const items = section?.content?.pairs || section?.content?.items || section?.items || [];
  if (!items.length) return null;

  return (
    <div style={{ marginTop: "16pt" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "16px",
            padding: "10px 0",
            borderBottom: i < items.length - 1 ? "1px solid #f0f0f0" : "none",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              minWidth: "160px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#6d6d6d",
              flexShrink: 0,
            }}
          >
            {item.key}
          </div>
          <div style={{ fontSize: "14px", color: "#141414", lineHeight: "21px" }}>
            {item.value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KVPairs;
