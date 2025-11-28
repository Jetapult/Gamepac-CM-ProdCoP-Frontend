import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ClockCircle, Unread } from "@solar-icons/react";
import thinkingSphere from "../../assets/thinking_sphere.gif";

const TaskProgress = ({
  currentTask = null,
  currentTaskIndex = 0,
  totalTasks = 5,
  elapsedTime = 0,
  allTasks = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTask && allTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#dfdfdf] rounded-t-lg shadow-lg overflow-hidden">
      {/* Header Row - Always visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p
          className="text-base text-[#141414] font-semibold"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
        >
          Task Progress
        </p>
        <div className="flex items-center gap-1">
          <span
            className="text-sm text-[#b0b0b0] font-medium bg-[#f6f6f6] px-[10px] py-1 rounded"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
          >
            {currentTaskIndex}/{totalTasks}
          </span>
          <div
            style={{
              transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronDown size={16} className="text-[#b0b0b0]" />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Task List */}
        {allTasks.length > 0 && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {allTasks.map((task, index) => {
              const taskNum = index + 1;
              const isCompleted = taskNum < currentTaskIndex;
              const isCurrent = taskNum === currentTaskIndex;
              const isPending = taskNum > currentTaskIndex;

              return (
                <div key={index} className="flex items-center gap-2">
                  {isCompleted && (
                    <Unread weight="Linear" size={16} color="#1f6744" />
                  )}
                  {isCurrent && (
                    <img
                      src={thinkingSphere}
                      alt="Thinking"
                      className="w-4 h-4 shrink-0"
                    />
                  )}
                  {isPending && (
                    <ClockCircle weight="Linear" size={16} color="#b0b0b0" />
                  )}
                  <p
                    className={`text-base ${
                      isPending ? "text-[#b0b0b0]" : "text-[#141414]"
                    }`}
                    style={{
                      fontFamily: "Urbanist, sans-serif",
                      lineHeight: "24px",
                    }}
                  >
                    {task}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collapsed Current Task View */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          !isExpanded && currentTask
            ? "max-h-[100px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <img src={thinkingSphere} alt="Thinking" className="w-4 h-4" />
            <p
              className="text-base text-[#141414] font-medium truncate max-w-[500px]"
              style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
            >
              {currentTask}
            </p>
          </div>
          <div
            className="flex items-center gap-[10px] text-xs text-[#b0b0b0] mt-[10px]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <span>{formatTime(elapsedTime)}</span>
            <span>Thinking....</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgress;
