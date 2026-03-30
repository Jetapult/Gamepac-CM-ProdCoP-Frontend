import { useSelector } from "react-redux";
import GamepacLogo from "@/assets/super-agents/gamepac-logo.svg";

const ReportHeader = ({ header }) => {
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  if (!header) return null;

  const gameName = header.game || header.game_name || selectedGame?.game_name;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {/* Show report_title as small label only when a game name also exists */}
          {header.report_title && gameName && (
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

      {/* Game name as large title, or fall back to report_title if no game name */}
      {(gameName || header.report_title) && (
        <div className="main-title">{gameName || header.report_title}</div>
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
