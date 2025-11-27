import React from "react";
import gamepacLogo from "../../../assets/super-agents/gamepac-logo.svg";

const LLMMessage = ({ content, agentName = "GamePac" }) => {
  return (
    <div className="flex flex-col gap-3 max-w-[551px]">
      {/* Agent Header */}
      <div className="flex items-center gap-2">
        <img src={gamepacLogo} alt={agentName} className="w-6 h-6" />
        <span
          className="text-base font-medium text-black"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {agentName}
        </span>
      </div>

      {/* Response Text */}
      <p
        className="text-base text-black"
        style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
      >
        {content}
      </p>
    </div>
  );
};

export default LLMMessage;
