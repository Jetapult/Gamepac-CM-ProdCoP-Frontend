import GamepacLogo from "@/assets/super-agents/gamepac-logo.svg";

const ReportHeader = ({ header }) => {
  if (!header) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {header.report_title && (
            <div className="title">{header.report_title}</div>
          )}
          {(header.period_start || header.period_end) && (
            <div className="analysis-period">
              Analysis Period: {header.period_start || "N/A"} – {header.period_end || "N/A"}
            </div>
          )}
        </div>
        <img
          src={GamepacLogo}
          alt="Gamepac Logo"
          style={{ width: "70px", marginLeft: "0px" }}
        />
      </div>

      {header.game && (
        <div className="main-title">{header.game}</div>
      )}

      {(header.agent || header.summary) && (
        <div className="sentiment-score">
          {header.agent && <span>Agent: {header.agent}</span>}
          {header.agent && header.summary && <span> | </span>}
          {header.summary && <span>{header.summary}</span>}
        </div>
      )}
    </div>
  );
};

export default ReportHeader;
