import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReportShort/ui";

const Section1_ReportMetadata = ({ data }) => {
  if (!data) return null;

  const timestamp = new Date().toISOString();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionTitle>1. Report Metadata</SectionTitle>

      <div
        style={{
          display: "flex",
          background: "white",
          borderRadius: "8px",
          width: "100%",
          border: "1px solid #d9dee4",
        }}
      >
        {/* Report Type Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              borderRight: "1px solid #d9dee4",
              borderRadius: "8px 0 0 0",
              padding: "12px",
              height: "44px",
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
              Report Type
            </span>
          </div>
          <div
            style={{
              padding: "12px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              borderRight: "1px solid #d9dee4",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#30333b",
                letterSpacing: "-0.42px",
                lineHeight: "16px",
              }}
            >
              Review Report- Short (One Page)
            </span>
          </div>
        </div>

        {/* Date Range Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              borderRight: "1px solid #d9dee4",
              padding: "12px",
              height: "44px",
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
              Date Range
            </span>
          </div>
          <div
            style={{
              padding: "12px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              borderRight: "1px solid #d9dee4",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#30333b",
                letterSpacing: "-0.42px",
                lineHeight: "16px",
              }}
            >
              {data?.dateRange || "N/A"}
            </span>
          </div>
        </div>

        {/* Timestamp Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              background: "#f6f7f8",
              borderBottom: "1px solid #d9dee4",
              borderRadius: "0 8px 0 0",
              padding: "12px",
              height: "44px",
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
              Timestamp (ISO 8601)
            </span>
          </div>
          <div
            style={{
              padding: "12px",
              height: "50px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#4a4f5e",
                letterSpacing: "-0.42px",
                lineHeight: "16px",
              }}
            >
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section1_ReportMetadata;
