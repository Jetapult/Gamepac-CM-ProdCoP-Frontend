const Section4_CriticalStakeholders = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "28px",
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
      height: "50px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderBottom: "1px solid #d9dee4",
      borderRight: "1px solid #d9dee4",
    },
    roleText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    assignmentText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#4a4f5e",
    },
  };

  const tableData = data.stakeholders || [];

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>4. {data.title || ""}</div>

      <div style={styles.table}>
        {/* Role Column */}
        <div style={{ ...styles.column, width: "50%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Role</span>
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
              <span style={styles.roleText}>{row.role}</span>
            </div>
          ))}
        </div>

        {/* Assignment Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div
            style={{
              ...styles.headerCell,
              borderLeft: "none",
              borderTopRightRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Assignment</span>
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
              <span style={styles.assignmentText}>{row.assignment}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section4_CriticalStakeholders;
