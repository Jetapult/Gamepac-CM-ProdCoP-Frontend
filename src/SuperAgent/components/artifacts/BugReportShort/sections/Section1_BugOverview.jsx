const WarningIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.86 2.57333L1.21333 12C1.09693 12.2016 1.03533 12.4302 1.03467 12.6632C1.034 12.8962 1.09429 13.1251 1.20954 13.3274C1.32478 13.5296 1.49103 13.6981 1.69182 13.8161C1.89261 13.934 2.12055 13.9974 2.35333 14H13.6467C13.8794 13.9974 14.1074 13.934 14.3082 13.8161C14.509 13.6981 14.6752 13.5296 14.7905 13.3274C14.9057 13.1251 14.966 12.8962 14.9653 12.6632C14.9647 12.4302 14.9031 12.2016 14.7867 12L9.14 2.57333C9.02117 2.37742 8.85383 2.21543 8.65414 2.10313C8.45446 1.99083 8.22917 1.93188 8 1.93188C7.77083 1.93188 7.54554 1.99083 7.34586 2.10313C7.14617 2.21543 6.97883 2.37742 6.86 2.57333Z"
      stroke="#f25a5a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6V8.66667"
      stroke="#f25a5a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 11.3333H8.00667"
      stroke="#f25a5a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Section1_BugOverview = ({ data = {}, sectionNumber }) => {
  const displayNumber = sectionNumber || "1.";
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
    valueText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "19px",
      letterSpacing: "-0.42px",
      color: "#30333b",
    },
    statusText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#4a4f5e",
    },
    severityBadge: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px",
      background: "#fadada",
      borderRadius: "6px",
    },
    severityText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "-0.42px",
      color: "#f25a5a",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {displayNumber} {data.title || ""}
      </div>

      <div style={styles.table}>
        {/* Severity Column */}
        <div style={{ ...styles.column, width: "21%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderTopLeftRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Severity</span>
          </div>
          <div
            style={{
              ...styles.dataCell,
              borderLeft: "1px solid #d9dee4",
              borderBottomLeftRadius: "8px",
            }}
          >
            <div style={styles.severityBadge}>
              <WarningIcon />
              <span style={styles.severityText}>{data.severity || ""}</span>
            </div>
          </div>
        </div>

        {/* Bug ID Column */}
        <div style={{ ...styles.column, width: "39%" }}>
          <div
            style={{
              ...styles.headerCell,
              borderLeft: "none",
            }}
          >
            <span style={styles.headerText}>Bug ID</span>
          </div>
          <div style={styles.dataCell}>
            <span style={styles.valueText}>{data.bugId || ""}</span>
          </div>
        </div>

        {/* Status Column */}
        <div style={{ ...styles.column, flex: 1 }}>
          <div
            style={{
              ...styles.headerCell,
              borderLeft: "none",
              borderTopRightRadius: "8px",
            }}
          >
            <span style={styles.headerText}>Status</span>
          </div>
          <div
            style={{
              ...styles.dataCell,
              borderBottomRightRadius: "8px",
            }}
          >
            <span style={styles.statusText}>{data.status || ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section1_BugOverview;
