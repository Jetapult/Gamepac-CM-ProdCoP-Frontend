const Section4_EscalationHistory = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "28px",
    },
    subsectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
      color: "#141414",
    },
    description: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
    },
    table: {
      display: "flex",
      width: "100%",
      borderRadius: "8px",
    },
    column: {
      display: "flex",
      flexDirection: "column",
    },
    headerCell: {
      height: "44px",
      background: "#f6f7f8",
      border: "1px solid #d9dee4",
      borderLeft: "none",
      padding: "12px",
      display: "flex",
      alignItems: "center",
    },
    headerText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "12px",
      color: "#6a728b",
    },
    dataCell: {
      height: "80px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderBottom: "1px solid #d9dee4",
      borderRight: "1px solid #d9dee4",
    },
    dateText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    eventText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    escalationText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#f25a5a",
    },
    metricText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
  };

  const tableData = data.escalationHistory || [
    {
      date: "12 Jan 2025",
      event: "First report received (Google Play Review)",
      metric: "1 Report",
    },
    {
      date: "13 Jan 2025",
      event: "Internal ticket created;\nSeverity set to Critical",
      metric: "25 Reports",
    },
    {
      date: "14 Jan 2025",
      event: "Escalation Triggered",
      metric: "100+ Reports in 48h",
      isEscalation: true,
    },
    {
      date: "15 Jan 2025",
      event: "Hotfix investigation initiated",
      metric: "1742 Estimated Affected Users",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.subsectionTitle}>4.3 Escalation History</div>
      <p style={styles.description}>
        {data.escalationDescription ||
          "The issue escalated rapidly, indicating a high-frequency trigger and widespread impact."}
      </p>

      <div style={styles.table}>
        {/* Date Column */}
        <div style={{ ...styles.column, width: "22%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
              borderLeft: "1px solid #d9dee4",
            }}
          >
            <span style={styles.headerText}>Date</span>
          </div>
          {tableData.map((row, index) => (
            <div
              key={index}
              style={{
                ...styles.dataCell,
                borderLeft: "1px solid #d9dee4",
                ...(index === tableData.length - 1
                  ? { borderBottomLeftRadius: "8px" }
                  : {}),
              }}
            >
              <span style={styles.dateText}>{row.date}</span>
            </div>
          ))}
        </div>

        {/* Event Column */}
        <div style={{ ...styles.column, width: "40%" }}>
          <div style={styles.headerCell}>
            <span style={styles.headerText}>Event</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span
                style={
                  row.isEscalation ? styles.escalationText : styles.eventText
                }
              >
                {row.event.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < row.event.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* Metric Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div style={{ ...styles.headerCell, borderTopRightRadius: "8px" }}>
            <span style={styles.headerText}>Metric</span>
          </div>
          {tableData.map((row, index) => (
            <div
              key={index}
              style={{
                ...styles.dataCell,
                ...(index === tableData.length - 1
                  ? { borderBottomRightRadius: "8px" }
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.metricText,
                  color: index === tableData.length - 1 ? "#4a4f5e" : "#30333b",
                }}
              >
                {row.metric}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section4_EscalationHistory;
