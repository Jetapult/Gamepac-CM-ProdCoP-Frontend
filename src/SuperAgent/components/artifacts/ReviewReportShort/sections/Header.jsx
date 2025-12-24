import GamepacLogo from "@/assets/super-agents/gamepac-logo.svg";

const Header = ({ data }) => {
  if (!data) return null;

  const trendArrow = data.sentimentTrendDirection === "down" ? "▼" : "▲";
  const formattedReviews = data.totalReviewsAnalyzed?.toLocaleString() || "N/A";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="title">Review Report- Short (One Page)</div>

          <div className="analysis-period">
            {data.analysisPeriodStart || "N/A"} -{" "}
            {data.analysisPeriodEnd || "N/A"} | Generated:{" "}
            {new Date().toISOString().slice(0, 10)},{" "}
            {new Date().toLocaleTimeString()}
          </div>
        </div>
        <img
          src={GamepacLogo}
          alt="Gamepac Logo"
          style={{ width: "70px", marginLeft: "0px" }}
        />
      </div>

      {data.productName && <div className="main-title">{data.productName}</div>}

      {(data.overallSentimentScore !== undefined ||
        data.totalReviewsAnalyzed ||
        data.sentimentTrendPercentage !== undefined) && (
        <div className="sentiment-score">
          {data.overallSentimentScore !== undefined && (
            <>
              Overall Sentiment Score: {data.overallSentimentScore}{" "}
              {data.sentimentLabel && `(${data.sentimentLabel})`}
            </>
          )}
          {data.totalReviewsAnalyzed && (
            <> | Total Reviews Analyzed: {formattedReviews}</>
          )}
          {data.sentimentTrendPercentage !== undefined && (
            <>
              {" "}
              | Sentiment Trend vs Previous Month: {trendArrow}{" "}
              {data.sentimentTrendPercentage}%{" "}
              {data.sentimentTrendLabel && `(${data.sentimentTrendLabel})`}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
