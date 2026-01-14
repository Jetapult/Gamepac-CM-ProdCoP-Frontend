const CreditCardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke="#141414"
      strokeWidth="1.5"
    />
    <line x1="2" y1="10" x2="22" y2="10" stroke="#141414" strokeWidth="1.5" />
    <line x1="6" y1="14" x2="10" y2="14" stroke="#141414" strokeWidth="1.5" />
  </svg>
);

const DeviceIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="6"
      y="2"
      width="12"
      height="20"
      rx="2"
      stroke="#141414"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="18" r="1" fill="#141414" />
  </svg>
);

const DollarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke="#141414" strokeWidth="1.5" />
    <path
      d="M12 6V18M15 9.5C15 8.12 13.66 7 12 7C10.34 7 9 8.12 9 9.5C9 10.88 10.34 12 12 12C13.66 12 15 13.12 15 14.5C15 15.88 13.66 17 12 17C10.34 17 9 15.88 9 14.5"
      stroke="#141414"
      strokeWidth="1.5"
    />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7L10 14L14 10L21 17M21 17V11M21 17H15"
      stroke="#141414"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SummaryItem = ({ icon, title, description }) => (
  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      width: "100%",
    }}
  >
    <div
      style={{
        width: "54px",
        height: "53px",
        background: "#f8f8f8",
        border: "1px solid #dfdfdf",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "21px",
          color: "#141414",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "21px",
          color: "#6d6d6d",
        }}
      >
        {description}
      </span>
    </div>
  </div>
);

const Section2_IncidentSummary = ({ data, sectionNumber }) => {
  if (!data) return null;
  const displayNumber = sectionNumber || "2.";

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginTop: "28px",
    },
    sectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
      color: "#141414",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    description: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
      width: "100%",
    },
    itemsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  const summaryItems = data.items || [
    {
      icon: <CreditCardIcon />,
      title: "Payment Processing Failures",
      description:
        "Users charged twice for single Battle Pass purchase due to payment conformation loop",
    },
    {
      icon: <DeviceIcon />,
      title: "Platform Distribution",
      description: "iOS users disproportionately affected (62% vs 38% Android)",
    },
    {
      icon: <DollarIcon />,
      title: "Financial Impact",
      description:
        "Estimated $47,000 - $62,000 in duplicate charges requiring immediate refund",
    },
    {
      icon: <TrendDownIcon />,
      title: "User Experience",
      description:
        "Customer support tickets increased 340% with negative sentiment trending",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>{displayNumber} Incident Summary</div>

      <div style={styles.content}>
        <p style={styles.description}>
          {data.description ||
            "This report documents a critical bug affecting Battle Pass Purchases where users are being charged twice for single transactions. The issue was discovered on January 12, 2025, and is currently impacting an estimated 1,742-310 users across mobile platforms."}
        </p>

        <div style={styles.itemsContainer}>
          {summaryItems.map((item, index) => (
            <SummaryItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section2_IncidentSummary;
