const WarningIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="6" stroke="#2c2c2c" strokeWidth="1.5" />
    <path
      d="M8 5V8.5M8 10.5V11"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="1"
      stroke="#2c2c2c"
      strokeWidth="1.5"
    />
    <line x1="2" y1="6" x2="14" y2="6" stroke="#2c2c2c" strokeWidth="1.5" />
    <line x1="5" y1="2" x2="5" y2="4" stroke="#2c2c2c" strokeWidth="1.5" />
    <line x1="11" y1="2" x2="11" y2="4" stroke="#2c2c2c" strokeWidth="1.5" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="6" stroke="#2c2c2c" strokeWidth="1.5" />
    <path
      d="M8 5V8L10 10"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MetricCard = ({ icon, badge, value, label }) => (
  <div
    style={{
      background: "#f8f8f8",
      border: "1px solid #f1f1f1",
      borderRadius: "12px",
      padding: "12px",
      width: "288px",
      display: "flex",
      flexDirection: "column",
      gap: "26px",
    }}
  >
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
      {icon}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "18px",
          color: "#2c2c2c",
        }}
      >
        {badge}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "26px",
          color: "#191919",
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
        {label}
      </span>
    </div>
  </div>
);

const Section2_MetricCards = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "24px",
    },
    row: {
      display: "flex",
      gap: "14px",
      alignItems: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <MetricCard
          icon={<WarningIcon />}
          badge="Critical"
          value={data.bugId || "DF - BP -44921"}
          label="Bug ID"
        />
        <MetricCard
          icon={<CalendarIcon />}
          badge="High"
          value={data.discoveryDate || "12 Jan 2025"}
          label="Discovery Date"
        />
      </div>
      <MetricCard
        icon={<ClockIcon />}
        badge="High"
        value={data.affectedUsers || "15"}
        label="Affected Users"
      />
    </div>
  );
};

export default Section2_MetricCards;
