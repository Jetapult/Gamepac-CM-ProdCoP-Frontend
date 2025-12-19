import React from "react";
import gamepacLogo from "../../../assets/super-agents/gamepac-logo.svg";

const AgentHeader = ({ agentName = "GamePac" }) => {
  return (
    <div className="flex items-center gap-2">
      <img src={gamepacLogo} alt={agentName} className="w-6 h-6" />
      <span
        className="text-base font-medium text-black"
        style={{ fontFamily: "Urbanist, sans-serif" }}
      >
        {agentName}
      </span>
    </div>
  );
};

export default AgentHeader;
