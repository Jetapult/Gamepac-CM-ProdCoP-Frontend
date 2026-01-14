const StepItem = ({ number, text }) => (
  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      width: "100%",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        background: "#f6f7f8",
        border: "1px solid #dfdfdf",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "20px",
          lineHeight: "21px",
          color: "#6d6d6d",
        }}
      >
        {number.toString().padStart(2, "0")}
      </span>
    </div>
    <div
      style={{
        flex: 1,
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "21px",
        color: "#141414",
      }}
    >
      {text}
    </div>
  </div>
);

const Section3_TechnicalDetails = ({ data, sectionNumber }) => {
  if (!data) return null;
  const displayNumber = sectionNumber || "3.";

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
    content: {
      display: "flex",
      flexDirection: "column",
      gap: "30px",
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
    stepsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  const reproductionSteps = data.reproductionSteps || [
    "Ensure the application is updated to version v.3.8 on an affected platform (iOS/Android).",
    "Navigate to the in-game Battle Pass purchase screen.",
    "Select the premium Battle Pass tier for purchase.",
    "Initiate payment using an impacted method (Google Pay or Apple Wallet).",
    "Observe the transaction processing. The user is charged once, the Battle Pass is granted, and immediately a second, unauthorized charge is processed without a corresponding product grant.",
    "Verify the duplicate charge on the external payment platform statement.",
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {displayNumber} Technical Details Section
      </div>

      <div style={styles.content}>
        {/* 3.1 Issue Description */}
        <div style={styles.subsection}>
          <div style={styles.subsectionTitle}>3.1 Issue Description</div>
          <p style={styles.description}>
            {data.issueDescription ||
              "The application is currently experiencing a critical payment processing error, specifically related to the purchase of the Battle Pass following the deployment of update v... Users attempting to complete the purchase transaction are being charged twice for a single item, without receiving any corresponding duplicate in-game rewards or currency. This issue is isolated to the Battle Pass purchase flow and appears to be a handshake failure between the application's payment gateway and external payment processors (Google Pay and Apple Wallet). The system is failing to automatically issue refunds for the erroneous second charge, resulting in direct financial loss and significant user dissatisfaction."}
          </p>
        </div>

        {/* 3.2 Reproduction Steps */}
        <div style={{ ...styles.subsection, gap: "16px" }}>
          <div style={styles.subsectionTitle}>3.2 Reproduction Steps</div>
          <div style={styles.stepsContainer}>
            {reproductionSteps.map((step, index) => (
              <StepItem key={index} number={index + 1} text={step} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section3_TechnicalDetails;
