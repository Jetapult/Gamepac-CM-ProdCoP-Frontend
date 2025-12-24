const IssueItem = ({ number, title, description }) => (
  <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
    <div
      style={{
        flexShrink: 0,
        width: "48px",
        height: "48px",
        background: "#fafafa",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: "18px",
        color: "#6d6d6d",
      }}
    >
      {number}
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "24px",
          color: "#141414",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "21px",
          color: "#6d6d6d",
        }}
      >
        {description}
      </div>
    </div>
  </div>
);

export default IssueItem;
