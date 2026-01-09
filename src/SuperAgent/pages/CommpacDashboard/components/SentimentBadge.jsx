import React from "react";

const SentimentBadge = ({ sentiment }) => {
  const styles = {
    positive: {
      bg: "bg-[#E8F5E9]",
      border: "border-[#00a251]",
      text: "text-[#00a251]",
    },
    negative: {
      bg: "bg-[#FFEBEE]",
      border: "border-[#f64c4c]",
      text: "text-[#f64c4c]",
    },
    neutral: {
      bg: "bg-[#FFF3E0]",
      border: "border-[#ff9800]",
      text: "text-[#ff9800]",
    },
  };

  const labels = {
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
  };

  const style = styles[sentiment] || styles.neutral;

  return (
    <span
      className={`font-urbanist font-medium text-xs px-2 py-1 rounded border ${style.bg} ${style.border} ${style.text}`}
    >
      {labels[sentiment]}
    </span>
  );
};

export default SentimentBadge;

