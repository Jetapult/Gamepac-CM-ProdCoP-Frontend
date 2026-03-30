const List = ({ section }) => {
  if (!section?.items?.length) return null;

  return (
    <ul style={{ marginTop: "16pt", paddingLeft: "0", listStyle: "none" }}>
      {section.items.map((item, i) => {
        const label = typeof item === "string" ? item : item.label;
        const description = typeof item === "object" ? item.description : null;

        return (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              padding: "8px 0",
              borderBottom: i < section.items.length - 1 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <span
              style={{
                marginTop: "3px",
                width: "6px",
                height: "6px",
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
  );
};

export default List;
