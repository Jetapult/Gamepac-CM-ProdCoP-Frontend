const Section5_NextSteps = ({ data = {}, sectionNumber }) => {
  const displayNumber = sectionNumber || "5.";
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
      fontSize: "16px",
      color: "#141414",
    },
    stepsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    stepRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
    },
    numberBox: {
      width: "54px",
      height: "53px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f6f7f8",
      border: "1px solid #dfdfdf",
      borderRadius: "4px",
      flexShrink: 0,
    },
    numberText: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "20px",
      lineHeight: "21px",
      color: "#6d6d6d",
    },
    contentContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      flex: 1,
    },
    stepTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
    },
    stepDescription: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "21px",
      color: "#6d6d6d",
    },
  };

  const steps = data.steps || [];

  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {displayNumber} {data.title || ""}
      </div>

      <div style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={index} style={styles.stepRow}>
            <div style={styles.numberBox}>
              <span style={styles.numberText}>{formatNumber(index + 1)}</span>
            </div>
            <div style={styles.contentContainer}>
              <div style={styles.stepTitle}>{step.title}</div>
              <div style={styles.stepDescription}>{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Section5_NextSteps;
