const Section5_ApproachesTable = ({ data = {} }) => {
  const styles = {
    container: {
      marginTop: "16px",
      width: "100%",
    },
    table: {
      display: "flex",
      width: "100%",
      borderRadius: "8px",
      background: "#fff",
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
      height: "120px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderBottom: "1px solid #d9dee4",
      borderRight: "1px solid #d9dee4",
    },
    approachText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "18px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    descriptionText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    prosText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    consText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
  };

  const tableData = data.approachesTable || [
    {
      approach: "A: Hotfix (ClientSide)",
      description:
        "Temporarily disable Battle Pass purchase button in v.. client.",
      pros: "Immediate stop to new incidents. Low",
      cons: "Requires a new client update (App Store review delay). Loss of revenue stream.",
    },
    {
      approach: "B: Hotfix (ServerSide)",
      description:
        "Implement a - second server-side de-duplication check on payment confirmation.",
      pros: "No client update required. Immediate deployment.",
      cons: "Risk of false positives (blocking legitimate retries). Requires immediate refund script deployment.",
    },
    {
      approach: "C: Full Patch",
      description: "Revert payment gateway module to pre-v.3.8 stable code.",
      pros: "Highest confidence in permanent fix.",
      cons: "Requires full QA cycle (- days). New client update needed.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.table}>
        {/* Approach Column */}
        <div style={{ ...styles.column, width: "20%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
              borderLeft: "1px solid #d9dee4",
            }}
          >
            <span style={styles.headerText}>Approach</span>
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
              <span style={styles.approachText}>{row.approach}</span>
            </div>
          ))}
        </div>

        {/* Description Column */}
        <div style={{ ...styles.column, width: "26%" }}>
          <div style={styles.headerCell}>
            <span style={styles.headerText}>Description</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span style={styles.descriptionText}>{row.description}</span>
            </div>
          ))}
        </div>

        {/* Pros Column */}
        <div style={{ ...styles.column, width: "24%" }}>
          <div style={styles.headerCell}>
            <span style={styles.headerText}>Pros</span>
          </div>
          {tableData.map((row, index) => (
            <div key={index} style={styles.dataCell}>
              <span style={styles.prosText}>{row.pros}</span>
            </div>
          ))}
        </div>

        {/* Cons Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div style={{ ...styles.headerCell, borderTopRightRadius: "8px" }}>
            <span style={styles.headerText}>Cons</span>
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
                  ...styles.consText,
                  color: index > 0 ? "#4a4f5e" : "#30333b",
                }}
              >
                {row.cons}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section5_ApproachesTable;
