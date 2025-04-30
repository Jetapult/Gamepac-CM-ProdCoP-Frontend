import React from "react";
import { Play, Square } from "lucide-react";
import { ModificationType } from "../state";

const timelineContainerStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "48px",
  backgroundColor: "#1f2937",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
};

const timelineStyle = {
  flex: 1,
  height: "4px",
  backgroundColor: "#374151",
  borderRadius: "2px",
  position: "relative",
  margin: "0 16px",
};

const timelineProgressStyle = {
  position: "absolute",
  height: "100%",
  backgroundColor: "#b9ff66",
  borderRadius: "2px",
};

const timelineHandleStyle = {
  position: "absolute",
  width: "12px",
  height: "12px",
  backgroundColor: "#b9ff66",
  borderRadius: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  cursor: "pointer",
};

// Base triangle indicator style - moved from index.jsx
const baseIndicatorStyle = {
  position: "absolute",
  width: 0,
  height: 0,
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderBottom: "12px solid",
  cursor: "pointer",
  transform: "translate(-50%, -50%)",
  top: "10px",
  zIndex: 2,
};

const Timeline = ({
  togglePlayPause,
  isPreviewMode,
  activeBreakIndex,
  isPlaying,
  timelineRef,
  handleTimelineMouseDown,
  handleTimelineClick,
  currentTime,
  duration,
  videoPlayable,
  handleModificationClick,
}) => {
  // Moved the renderModificationIndicators function here from index.jsx
  const renderModificationIndicators = () => {
    return videoPlayable.modifications.map((modification, index) => {
      const isActive = index === activeBreakIndex;

      // Calculate position based on modification type
      const position =
        modification.type === ModificationType.OVERLAY
          ? modification.startTime
          : modification.time;

      const style = {
        ...baseIndicatorStyle,
        borderBottomColor: isActive ? "#b9ff66" : "#4B5563",
        left: `${(position / duration) * 100}%`,
      };

      // Add duration bar for overlay type
      if (modification.type === ModificationType.OVERLAY) {
        const durationBar = {
          position: "absolute",
          height: "2px",
          backgroundColor: "#4B5563",
          left: `${(modification.startTime / duration) * 100}%`,
          width: `${
            ((modification.endTime - modification.startTime) / duration) * 100
          }%`,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
        };

        return (
          <div key={modification.id}>
            <div
              style={style}
              onClick={() => handleModificationClick(index, modification)}
            />
            <div style={durationBar} />
          </div>
        );
      }

      return (
        <div
          key={modification.id}
          style={style}
          onClick={() => handleModificationClick(index, modification)}
        />
      );
    });
  };

  return (
    <div style={timelineContainerStyle} className="video-controls">
      <button
        onClick={togglePlayPause}
        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 ${
          isPreviewMode && activeBreakIndex !== -1 ? "opacity-50" : ""
        }`}
        disabled={isPreviewMode && activeBreakIndex !== -1}
        title="preview"
      >
        {isPlaying || (isPreviewMode && activeBreakIndex !== -1) ? (
          <Square />
        ) : (
          <Play className="w-4 h-4 text-white" />
        )}
      </button>

      <div
        ref={timelineRef}
        style={timelineStyle}
        className="relative cursor-pointer"
        onMouseDown={handleTimelineMouseDown}
        onClick={handleTimelineClick}
      >
        <div
          style={{
            ...timelineProgressStyle,
            width: `${(currentTime / duration) * 100}%`,
          }}
        />
        {renderModificationIndicators()}
        <div
          style={{
            ...timelineHandleStyle,
            left: `${(currentTime / duration) * 100}%`,
            width: "20px",
            height: "20px",
          }}
        />
      </div>

      <div className="text-white text-sm ml-4">
        {Math.floor(currentTime)}ms / {Math.floor(duration)}ms
      </div>
    </div>
  );
};

export default Timeline;
