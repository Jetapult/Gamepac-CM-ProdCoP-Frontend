const Section3_ErrorLogs = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginTop: "28px",
    },
    subsection: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
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
    platformText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    valueText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
  };

  const tableData = data.errorLogs || [
    {
      platform: "iOS",
      percentage: "62%",
      version: "V.3.8.2",
      paymentMethod: "Apple Wallet",
    },
    {
      platform: "Android",
      percentage: "72%",
      version: "V.3.8.2",
      paymentMethod: "Google Pay",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.subsection}>
        <div style={styles.subsectionTitle}>3.3 Error Logs</div>
        <p style={styles.description}>
          {data.errorLogsDescription ||
            "The following sanitized error snapshot indicates a failure in the final stage of the payment confirmation process, suggesting a timeout or malformed response that triggers a retry mechanism on the server side, leading to the duplicate charge."}
        </p>
      </div>

      <div style={styles.table}>
        {/* Platform Column */}
        <div style={{ ...styles.column, width: "20%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
              borderLeft: "1px solid #d9dee4",
            }}
          >
            <span style={styles.headerText}>Platform</span>
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
              <span style={styles.platformText}>{row.platform}</span>
            </div>
          ))}
        </div>

        {/* Affected Percentage Column */}
        <div style={{ ...styles.column, width: "25%" }}>
          <div style={styles.headerCell}>
            <span style={styles.headerText}>Affected Percentage</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span style={styles.valueText}>{row.percentage}</span>
            </div>
          ))}
        </div>

        {/* App Version Column */}
        <div style={{ ...styles.column, width: "20%" }}>
          <div style={styles.headerCell}>
            <span style={styles.headerText}>App Version</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span style={styles.valueText}>{row.version}</span>
            </div>
          ))}
        </div>

        {/* Payment Methods Impacted Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div style={{ ...styles.headerCell, borderTopRightRadius: "8px" }}>
            <span style={styles.headerText}>Payment Methods Impacted</span>
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
                  ...styles.valueText,
                  color: index === tableData.length - 1 ? "#4a4f5e" : "#30333b",
                }}
              >
                {row.paymentMethod}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section3_ErrorLogs;
