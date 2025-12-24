const MetricCard = ({
  icon,
  label,
  value,
  subtitle,
  valueColor = "#141414",
}) => (
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
      {icon && (
        <div
          style={{
            width: "24px",
            height: "24px",
            background: "white",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      {label}
    </div>
    <div
      style={{
        fontWeight: 700,
        fontSize: "48px",
        lineHeight: "56px",
        color: valueColor,
        marginBottom: "8px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "16px",
        color: "#6d6d6d",
      }}
    >
      {subtitle}
    </div>
  </div>
);

export default MetricCard;
