import { Image, Pause, Plus, Star } from "lucide-react";
import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const AddModificationButtons = ({isPreviewMode, currentTime, addBreak, addEndScreen, addOverlay}) => {
    const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div
      className={`absolute top-4 left-4 z-10 ${
        isPreviewMode ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="relative">
        <button
          onClick={() => !isPreviewMode && setIsExpanded(!isExpanded)}
          className={`w-10 h-10 bg-[#b9ff66] rounded-full flex items-center justify-center ${
            isPreviewMode ? "cursor-default" : "cursor-pointer"
          }`}
          disabled={isPreviewMode}
        >
          <Plus
            className={`w-6 h-6 transition-transform ${
              isExpanded ? "rotate-45" : ""
            }`}
          />
        </button>

        {isExpanded && !isPreviewMode && (
          <div className="absolute left-0 top-12 space-y-2">
            <button
              data-tooltip-id="add-break"
              onClick={() => addBreak(currentTime)}
              className="w-10 h-10 bg-[#b9ff66] rounded-full flex items-center justify-center"
              title="Add Break"
            >
              <Pause className="w-6 h-6" />
            </button>
            <ReactTooltip id="add-break" place="right" content="Add Break" />
            <button
              data-tooltip-id="add-end-screen"
              onClick={addEndScreen}
              className="w-10 h-10 bg-[#b9ff66] rounded-full flex items-center justify-center"
              title="Add End Screen"
            >
              <Star className="w-6 h-6" />
            </button>
            <ReactTooltip
              id="add-end-screen"
              place="right"
              content="Add End Screen"
            />
            <button
              data-tooltip-id="add-overlay"
              onClick={addOverlay}
              className="w-10 h-10 bg-[#b9ff66] rounded-full flex items-center justify-center"
              title="Add Permanent Overlay"
            >
              <Image className="w-6 h-6" />
            </button>
            <ReactTooltip
              id="add-overlay"
              place="right"
              content="Add Permanent Overlay"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddModificationButtons;
