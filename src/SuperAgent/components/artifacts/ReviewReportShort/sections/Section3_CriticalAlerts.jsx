import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReportShort/ui";

const WarningCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="6.5" stroke="#6D6D6D" strokeWidth="1.5" />
    <path
      d="M8 5V8.5"
      stroke="#6D6D6D"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11" r="0.75" fill="#6D6D6D" />
  </svg>
);

const WarningIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 2L14.5 13H1.5L8 2Z"
      stroke="#6D6D6D"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M8 6V9" stroke="#6D6D6D" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.75" fill="#6D6D6D" />
  </svg>
);

const AlertCard = ({ type, value, description, valueColor = "#191919" }) => (
  <div
    style={{
      background: "#f8f8f8",
      border: "1px solid #f1f1f1",
      borderRadius: "12px",
      padding: "12px",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
      <div
        style={{
          background: "#ededed",
          borderRadius: "8px",
          padding: "5px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "fit-content",
        }}
      >
        {type === "critical" ? <WarningCircleIcon /> : <WarningIcon />}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "18px",
            color: "#2c2c2c",
          }}
        >
          {type === "critical" ? "Critical" : "High"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "26px",
            color: valueColor,
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "12px",
            color: "#6d6d6d",
          }}
        >
          {description}
        </span>
      </div>
    </div>
  </div>
);

const Section3_CriticalAlerts = ({ data, sectionNumber }) => {
  if (!data?.alerts || !data.alerts.length) return null;

  const displayNumber = sectionNumber || "3.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <SectionTitle>{displayNumber} Critical Alerts</SectionTitle>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            margin: 0,
          }}
        >
          The following issues have an urgency score exceeding the threshold,
          demanding immediate executive attention and resource allocation.
        </p>
      </div>

      {data?.alerts && data.alerts.length > 0 && (
        <div style={{ display: "flex", gap: "14px" }}>
          {data.alerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              value={alert.value}
              description={alert.description}
              valueColor={alert.type === "critical" ? "#f25a5a" : "#191919"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Section3_CriticalAlerts;
