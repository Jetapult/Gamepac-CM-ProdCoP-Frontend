import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReportShort/ui";

const WarningIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 2L14.5 13H1.5L8 2Z"
      stroke="#f25a5a"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M8 6V9" stroke="#f25a5a" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.75" fill="#f25a5a" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12V4M8 4L4 8M8 4L12 8"
      stroke="#f25a5a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SignalIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="8" width="3" height="5" fill="#916603" />
    <rect x="5.5" y="5" width="3" height="8" fill="#916603" />
    <rect x="10" y="2" width="3" height="11" fill="#916603" opacity="0.3" />
  </svg>
);

const PriorityBadge = ({ priority }) => {
  const configs = {
    critical: {
      bg: "#fadada",
      color: "#f25a5a",
      icon: <WarningIcon />,
      label: "Critical",
      fontWeight: 500,
    },
    high: {
      bg: "#fadada",
      color: "#f25a5a",
      icon: <ArrowUpIcon />,
      label: "High",
      fontWeight: 400,
    },
    medium: {
      bg: "#fff0ce",
      color: "#916603",
      icon: <SignalIcon />,
      label: "Medium",
      fontWeight: 400,
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <div
      style={{
        background: config.bg,
        borderRadius: "6px",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {config.icon}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: config.fontWeight,
          fontSize: "14px",
          lineHeight: "16px",
          letterSpacing: "-0.42px",
          color: config.color,
        }}
      >
        {config.label}
      </span>
    </div>
  );
};

const Section4_ActionItems = ({ data }) => {
  const items = data?.actionItems || [];

  if (!items.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <SectionTitle>4. Action Items</SectionTitle>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            margin: 0,
          }}
        >
          A maximum of five prioritized recommendations are listed below to
          address the most pressing player concerns and technical issues.
        </p>
      </div>

      {/* Table */}
      <div
        style={{
          display: "flex",
          width: "100%",
          border: "1px solid #e7eaee",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Action Column */}
        <div style={{ width: "197px", flexShrink: 0 }}>
          {/* Header */}
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              borderRight: "1px solid #d9dee4",
              padding: "12px",
              height: "44px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                color: "#6a728b",
              }}
            >
              Action
            </span>
          </div>
          {/* Cells */}
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom:
                  index < items.length - 1 ? "1px solid #d9dee4" : "none",
                borderRight: "1px solid #d9dee4",
                padding: "16px 12px",
                height: "80px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  letterSpacing: "-0.42px",
                  color: "#30333b",
                }}
              >
                {item.action}
              </span>
            </div>
          ))}
        </div>

        {/* Assigned Owner Column */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              borderRight: "1px solid #d9dee4",
              padding: "12px",
              height: "44px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                color: "#6a728b",
              }}
            >
              Assigned Owner
            </span>
          </div>
          {/* Cells */}
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom:
                  index < items.length - 1 ? "1px solid #d9dee4" : "none",
                borderRight: "1px solid #d9dee4",
                padding: "16px 12px",
                height: "80px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "16px",
                  letterSpacing: "-0.42px",
                  color: "#30333b",
                }}
              >
                {item.owner}
              </span>
            </div>
          ))}
        </div>

        {/* Priority Column */}
        <div style={{ width: "197.5px", flexShrink: 0 }}>
          {/* Header */}
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              padding: "12px",
              height: "44px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                color: "#6a728b",
              }}
            >
              Priority
            </span>
          </div>
          {/* Cells */}
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                borderBottom:
                  index < items.length - 1 ? "1px solid #d9dee4" : "none",
                padding: "16px 12px",
                height: "80px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              <PriorityBadge priority={item.priority} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section4_ActionItems;
