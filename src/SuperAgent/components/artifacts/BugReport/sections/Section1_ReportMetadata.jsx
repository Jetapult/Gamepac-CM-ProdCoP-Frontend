const Section1_ReportMetadata = ({ data, sectionNumber }) => {
  if (!data) return null;
  const displayNumber = sectionNumber || "1.";

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      marginTop: "60px",
    },
    mainTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "24px",
      color: "#141414",
    },
    sectionContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
    },
    sectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
      color: "#141414",
    },
    table: {
      display: "flex",
      width: "100%",
      background: "#fff",
      borderRadius: "8px",
    },
    fieldColumn: {
      width: "40%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "8px 0 0 8px",
    },
    valueColumn: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    headerCell: {
      height: "44px",
      background: "#f6f7f8",
      border: "1px solid #d9dee4",
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
      height: "50px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderBottom: "1px solid #d9dee4",
      borderRight: "1px solid #d9dee4",
    },
    fieldText: {
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
      lineHeight: "18px",
      color: "#30333b",
    },
    criticalText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "18px",
      color: "#f25a5a",
    },
    statusText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#4a4f5e",
    },
  };

  const tableData = [
    { field: "Bug ID", value: data.bugId || "DF-BP-44921" },
    {
      field: "Discovery Date",
      value: data.discoveryDate || "01 Jan 2025 - 31 Jan 2025",
    },
    {
      field: "Reporting Source",
      value: data.reportingSource || "01 Jan 2025 - 31 Jan 2025",
    },
    {
      field: "Severity Classification",
      value: data.severity || "Critical",
      isCritical: true,
    },
    {
      field: "Affected User Count (Estimated)",
      value: data.affectedUsers || "1,742 – 2,310",
    },
    {
      field: "Current Status",
      value: data.status || "In Progress",
      isStatus: true,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Main Title */}
      <div style={styles.mainTitle}>Comprehensive Field Structure</div>

      {/* Section 1 */}
      <div style={styles.sectionContainer}>
        <div style={styles.sectionTitle}>{displayNumber} Incident Overview</div>

        <div style={styles.table}>
          {/* Field Column */}
          <div style={styles.fieldColumn}>
            <div
              style={{
                ...styles.headerCell,
                borderTopLeftRadius: "8px",
                border: "1px solid #d9dee4",
              }}
            >
              <span style={styles.headerText}>Field</span>
            </div>
            {tableData.map((row, index) => (
              <div
                key={index}
                style={{
                  ...styles.dataCell,
                  border: "1px solid #d9dee4",
                  borderTop: "none",
                  ...(index === tableData.length - 1
                    ? { borderBottomLeftRadius: "8px" }
                    : {}),
                }}
              >
                <span style={styles.fieldText}>{row.field}</span>
              </div>
            ))}
          </div>

          {/* Value Column */}
          <div style={styles.valueColumn}>
            <div
              style={{
                ...styles.headerCell,
                borderTopRightRadius: "8px",
                borderLeft: "none",
              }}
            >
              <span style={styles.headerText}>Value</span>
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
                  style={
                    row.isCritical
                      ? styles.criticalText
                      : row.isStatus
                      ? styles.statusText
                      : styles.valueText
                  }
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section1_ReportMetadata;
