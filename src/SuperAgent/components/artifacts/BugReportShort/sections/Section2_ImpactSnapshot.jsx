const Section2_ImpactSnapshot = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginTop: "28px",
    },
    titleContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    sectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
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
    metricText: {
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
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    valueTextRed: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#f25a5a",
    },
    valueTextGreen: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#1f6744",
    },
    contextText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
  };

  const tableData = data.metrics || [];

  const getValueStyle = (type) => {
    if (type === "negative") return styles.valueTextRed;
    if (type === "positive") return styles.valueTextGreen;
    return styles.valueText;
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleContainer}>
        <div style={styles.sectionTitle}>2. {data.title || ""}</div>
        <div style={styles.description}>{data.description || ""}</div>
      </div>

      <div style={styles.table}>
        {/* Metric Column */}
        <div style={{ ...styles.column, width: "24%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Metric</span>
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
              <span style={styles.metricText}>{row.metric}</span>
            </div>
          ))}
        </div>

        {/* Value Column */}
        <div style={{ ...styles.column, width: "39%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderLeft: "none",
            }}
          >
            <span style={styles.headerText}>Value</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span style={getValueStyle(row.valueType)}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Context Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div
            style={{
              ...styles.headerCell,
              borderLeft: "none",
              borderTopRightRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Context</span>
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
              <span style={styles.contextText}>{row.context}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section2_ImpactSnapshot;
