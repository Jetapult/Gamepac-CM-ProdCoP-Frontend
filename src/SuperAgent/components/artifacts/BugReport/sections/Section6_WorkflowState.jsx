const Section6_WorkflowState = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "28px",
    },
    title: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
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
      lineHeight: "20px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
  };

  const tableData = data.workflowState || [
    {
      field: "Draft Version Notes",
      value:
        "This report serves as v.. All subsequent changes must be tracked via internal notes.",
    },
    {
      field: "Review Stage Expectations",
      value:
        "Requires review and sign-off from Backend Lead, QA Lead, and Product Manager before finalization.",
    },
    {
      field: "Finalization/Lock Conditions",
      value:
        "Report is locked upon successful deployment of the permanent fix (Approach C) and % completion of all outstanding refunds.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.title}>Workflow State Management</div>

      <div style={styles.table}>
        {/* Field Column */}
        <div style={{ ...styles.column, width: "36%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
              borderLeft: "1px solid #d9dee4",
            }}
          >
            <span style={styles.headerText}>Field</span>
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
              <span style={styles.fieldText}>{row.field}</span>
            </div>
          ))}
        </div>

        {/* Expectation/Condition Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div style={{ ...styles.headerCell, borderTopRightRadius: "8px" }}>
            <span style={styles.headerText}>Expectation/Condition</span>
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
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section6_WorkflowState;
