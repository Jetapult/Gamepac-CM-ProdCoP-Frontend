import React from "react";
import { ChevronDown } from "lucide-react";

const TaskProgress = ({ taskProgress = { current: 1, total: 5 } }) => {
  return (
    <div className="bg-white border-t border-[#f0f0f0] rounded-tl-lg rounded-tr-lg p-6">
      <div className="flex items-center justify-between">
        <p
          className="text-base text-[#0e2f1f] font-medium"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Task Progress
        </p>
        <div
          className="flex items-center gap-1 text-sm text-[#b0b0b0]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          <span>
            {taskProgress.current}/{taskProgress.total}
          </span>
          <ChevronDown size={16} className="text-[#6d6d6d]" />
        </div>
      </div>
    </div>
  );
};

export default TaskProgress;
