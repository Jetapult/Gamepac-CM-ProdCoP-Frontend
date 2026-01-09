const WarningCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 5.33333V8"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 10.6667H8.00667"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
    <path
      d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6667 1.33333V4"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.33333 1.33333V4"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 6.66667H14"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
    <path
      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 4.66667V8L10.6667 9.33333"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Section3_ResolutionProgress = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "28px",
    },
    sectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
      color: "#141414",
    },
    cardsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    cardsRow: {
      display: "flex",
      gap: "14px",
      width: "100%",
    },
    card: {
      flex: 1,
      padding: "12px",
      background: "#f8f8f8",
      border: "1px solid #f1f1f1",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "26px",
    },
    badge: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px",
      background: "#ededed",
      borderRadius: "8px",
      width: "fit-content",
    },
    badgeText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "18px",
      color: "#2c2c2c",
    },
    valueContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    mainValue: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      fontSize: "26px",
      color: "#191919",
    },
    label: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "12px",
      color: "#6d6d6d",
    },
    labelAlt: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "12px",
      color: "#6a728b",
    },
  };

  const cards = data.cards || [];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "warning":
        return <WarningCircleIcon />;
      case "calendar":
        return <CalendarIcon />;
      case "clock":
        return <ClockIcon />;
      default:
        return <WarningCircleIcon />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>3. {data.title || ""}</div>

      <div style={styles.cardsContainer}>
        <div style={styles.cardsRow}>
          {cards.slice(0, 2).map((card, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.badge}>
                {getIcon(card.icon)}
                <span style={styles.badgeText}>{card.badge}</span>
              </div>
              <div style={styles.valueContainer}>
                <div style={styles.mainValue}>{card.value}</div>
                <div style={styles.label}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
        {cards.length > 2 && (
          <div
            style={{ ...styles.card, flex: "none", width: "calc(50% - 7px)" }}
          >
            <div style={styles.badge}>
              {getIcon(cards[2].icon)}
              <span style={styles.badgeText}>{cards[2].badge}</span>
            </div>
            <div style={{ ...styles.valueContainer, gap: "12px" }}>
              <div style={{ ...styles.mainValue, fontSize: "28px" }}>
                {cards[2].value}
              </div>
              <div style={styles.labelAlt}>{cards[2].label}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section3_ResolutionProgress;
