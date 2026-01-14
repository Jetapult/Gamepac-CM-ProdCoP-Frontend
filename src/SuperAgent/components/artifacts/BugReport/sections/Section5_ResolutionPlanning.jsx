const FileTextIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13H8"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17H8"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 9H9H8"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CurrencyIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9.5C15 9.10218 14.842 8.72064 14.5607 8.43934C14.2794 8.15804 13.8978 8 13.5 8H10.5C10.1022 8 9.72064 8.15804 9.43934 8.43934C9.15804 8.72064 9 9.10218 9 9.5C9 9.89782 9.15804 10.2794 9.43934 10.5607C9.72064 10.842 10.1022 11 10.5 11H13.5C13.8978 11 14.2794 11.158 14.5607 11.4393C14.842 11.7206 15 12.1022 15 12.5C15 12.8978 14.842 13.2794 14.5607 13.5607C14.2794 13.842 13.8978 14 13.5 14H10.5C10.1022 14 9.72064 13.842 9.43934 13.5607C9.15804 13.2794 9 12.8978 9 12.5"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 6V8"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V16"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApproachItem = ({ icon, title, description }) => (
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

const Section5_ResolutionPlanning = ({ data = {}, sectionNumber }) => {
  const displayNumber = sectionNumber || "5.";
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
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
      gap: "16px",
    },
    subsectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
      color: "#141414",
    },
    approachesContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  const approaches = data.approaches || [
    {
      icon: <FileTextIcon />,
      title: "Approach A : Immediate Rollback",
      description:
        "Pros: Fast deployment, known stable state. Cons: Loses all v3.8.2 features, user data risk",
    },
    {
      icon: <CurrencyIcon />,
      title: "Approach B : Targeted Payment Handler Fix",
      description:
        "Pros: Surgical fix, preserves features, minimal user impact. Cons: 72-hour",
    },
    {
      icon: <FileTextIcon />,
      title: "Approach C : Payment Gateway Reconfiguration",
      description:
        "Pros: No code changes needed, leverages external validation. Cons: Third-party dependency risk",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {displayNumber} Resolution Planning Section
      </div>

      <div style={styles.content}>
        <div style={styles.subsectionTitle}>
          5.1 Solution Approaches Comparison
        </div>
        <div style={styles.approachesContainer}>
          {approaches.map((approach, index) => (
            <ApproachItem
              key={index}
              icon={approach.icon || <FileTextIcon />}
              title={approach.title}
              description={approach.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section5_ResolutionPlanning;
