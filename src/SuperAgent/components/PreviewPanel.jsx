import React from "react";
import TaskProgress from "./TaskProgress";
import ZeroStateAnimation from "./ZeroStateAnimation";
import ArtifactPlaceholder from "./ArtifactPlaceholder";

const PreviewPanel = ({
  currentTask,
  currentTaskIndex,
  elapsedTime,
  allTasks = [],
  isThinking = false,
}) => {
  return (
    <div className="flex-1 bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col relative">
      {/* Building State - Show animation */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
          isThinking ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
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

      {/* Artifact Placeholder */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
          isThinking ? "opacity-0" : "opacity-100"
        }`}
      >
        <ArtifactPlaceholder />
      </div>

      {/* Task Progress Footer - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
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
