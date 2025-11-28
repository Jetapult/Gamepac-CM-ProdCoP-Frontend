import React from "react";
import TaskProgress from "./TaskProgress";
import ZeroStateAnimation from "./ZeroStateAnimation";

const PreviewPanel = ({
  currentTask,
  currentTaskIndex,
  elapsedTime,
  allTasks = [],
}) => {
  return (
    <div className="flex-1 bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col relative">
      {/* Zero State / Building State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Illustration */}
          <div className="mb-6">
            <ZeroStateAnimation />
          </div>

          <p
            className="text-sm text-black"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
          >
            GamePac is building the document. Hang tight ✌️
          </p>
        </div>
      </div>

      {/* Task Progress Footer - Overlay */}
      <div className="absolute bottom-0 left-0 right-0">
        <TaskProgress
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          totalTasks={allTasks.length || 5}
          elapsedTime={elapsedTime}
          allTasks={allTasks}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
