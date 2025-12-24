const VersionCard = ({ icon, label, version, date }) => (
  <div
    style={{
      flex: 1,
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
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {icon}
      {label}
    </div>
    <div
      style={{
        fontWeight: 700,
        fontSize: "32px",
        lineHeight: "40px",
        color: "#141414",
        marginBottom: "8px",
      }}
    >
      {version}
    </div>
    <div
      style={{
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "16px",
        color: "#6d6d6d",
      }}
    >
      {date}
    </div>
  </div>
);

export default VersionCard;
