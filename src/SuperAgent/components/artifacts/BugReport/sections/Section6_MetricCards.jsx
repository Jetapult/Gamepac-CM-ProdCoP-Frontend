const CheckCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.6667 7.38667V8C14.6659 9.43762 14.2003 10.8365 13.3395 11.9879C12.4788 13.1393 11.2688 13.9817 9.89022 14.3893C8.5116 14.7969 7.03815 14.7479 5.68963 14.2497C4.3411 13.7515 3.18975 12.8307 2.40729 11.6247C1.62482 10.4187 1.25317 8.99205 1.34776 7.55755C1.44235 6.12305 1.99812 4.75756 2.93217 3.66473C3.86621 2.57189 5.1285 1.81027 6.53077 1.49344C7.93304 1.17662 9.40016 1.32157 10.7133 1.90667"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6667 2.66667L8 9.34L6 7.34"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6V8.66667"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 11.3333H8.00667"
      stroke="#2c2c2c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MetricCard = ({ icon, badgeText, value, label }) => (
  <div
    style={{
      background: "#f8f8f8",
      border: "1px solid #f1f1f1",
      borderRadius: "12px",
      padding: "12px",
      flex: 1,
      height: "130px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "26px",
      }}
    >
      {/* Badge */}
      <div
        style={{
          background: "#ededed",
          borderRadius: "8px",
          padding: "5px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "fit-content",
        }}
      >
        {icon}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "18px",
            color: "#2c2c2c",
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Value and Label */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "26px",
            color: "#191919",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "12px",
            color: "#6d6d6d",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  </div>
);

const Section6_MetricCards = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      gap: "14px",
      alignItems: "center",
      marginTop: "20px",
      width: "100%",
    },
  };

  const metrics = data.communicationMetrics || [
    {
      icon: <CheckCircleIcon />,
      badgeText: "92% RESOLVED",
      value: "847",
      label: "Tickets Processed",
    },
    {
      icon: <WarningIcon />,
      badgeText: "ALERT",
      value: "48 hrs",
      label: "Avg Response Time",
    },
  ];

  return (
    <div style={styles.container}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon || <CheckCircleIcon />}
          badgeText={metric.badgeText}
          value={metric.value}
          label={metric.label}
        />
      ))}
    </div>
  );
};

export default Section6_MetricCards;
