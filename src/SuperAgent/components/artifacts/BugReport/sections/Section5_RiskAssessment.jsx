const CodeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 18L22 12L16 6"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6L2 12L8 18"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckSquareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 11L12 14L22 4"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BracketsCurlyIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3H6C5.46957 3 4.96086 3.21071 4.58579 3.58579C4.21071 3.96086 4 4.46957 4 5V9C4 9.53043 3.78929 10.0391 3.41421 10.4142C3.03914 10.7893 2.53043 11 2 11V13C2.53043 13 3.03914 13.2107 3.41421 13.5858C3.78929 13.9609 4 14.4696 4 15V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H8"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3H18C18.5304 3 19.0391 3.21071 19.4142 3.58579C19.7893 3.96086 20 4.46957 20 5V9C20 9.53043 20.2107 10.0391 20.5858 10.4142C20.9609 10.7893 21.4696 11 22 11V13C21.4696 13 20.9609 13.2107 20.5858 13.5858C20.2107 13.9609 20 14.4696 20 15V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H16"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeadsetIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 18V12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12V18"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H18C17.4696 21 16.9609 20.7893 16.5858 20.4142C16.2107 20.0391 16 19.5304 16 19V16C16 15.4696 16.2107 14.9609 16.5858 14.5858C16.9609 14.2107 17.4696 14 18 14H21V19ZM3 19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H6C6.53043 21 7.03914 20.7893 7.41421 20.4142C7.78929 20.0391 8 19.5304 8 19V16C8 15.4696 7.78929 14.9609 7.41421 14.5858C7.03914 14.2107 6.53043 14 6 14H3V19Z"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ResourceItem = ({ icon, title, description }) => (
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
        width: "54px",
        height: "53px",
        background: "#f8f8f8",
        border: "1px solid #dfdfdf",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "21px",
          color: "#141414",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "21px",
          color: "#6d6d6d",
        }}
      >
        {description}
      </span>
    </div>
  </div>
);

const Section5_RiskAssessment = ({ data = {} }) => {
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
    resourcesSection: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    resourcesTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
    },
    resourcesContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  const resources = data.resources || [
    {
      icon: <CodeIcon />,
      title: "Backend Engineering: 2 senior developers (48 hours)",
      description:
        "Payment handler refactoring amd webhook sequence management",
    },
    {
      icon: <CheckSquareIcon />,
      title: "QA Testing: 1 lead + 2 testers (24 hours)",
      description: "Payment flow regression testing across all platforms",
    },
    {
      icon: <BracketsCurlyIcon />,
      title: "DevOps: 1 engineer (16 hours)",
      description:
        "Deployment pipeline setup and production monitoring configuration",
    },
    {
      icon: <HeadsetIcon />,
      title: "Customer Support: Refund processing script deployment (8 hours)",
      description: "Automated refund execution for confirmed duplicate charges",
    },
  ];

  return (
    <div style={styles.container}>
      {/* 5.2 Risk Assessment */}
      <div style={styles.subsection}>
        <div style={styles.subsectionTitle}>5.2 Risk Assessment</div>
        <p style={styles.description}>
          {data.riskDescription ||
            "The primary risk is a failure to accurately identify all duplicate charges, leading to continued user dissatisfaction and potential regulatory issues. The proposed server-side deduplication (Approach B) carries a low risk of false positives, which can be mitigated by a tight time window (e.g., seconds) and comprehensive logging. The highest risk is the reputational damage from delayed resolution and refund processing."}
        </p>
      </div>

      {/* Resource Requirements */}
      <div style={styles.resourcesSection}>
        <div style={styles.resourcesTitle}>
          Resource Requirements (Approach B + Refund Script)
        </div>
        <div style={styles.resourcesContainer}>
          {resources.map((resource, index) => (
            <ResourceItem
              key={index}
              icon={resource.icon || <CodeIcon />}
              title={resource.title}
              description={resource.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section5_RiskAssessment;
