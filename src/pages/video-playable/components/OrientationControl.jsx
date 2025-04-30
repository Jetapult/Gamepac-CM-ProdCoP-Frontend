import { RotateCw } from "lucide-react";
import React from "react";

const OrientationControl = ({isPreviewMode, toggleOrientation, orientation}) => {
  return (
    <div
      className={`absolute top-4 right-4 bg-gray-800 rounded-lg p-2 ${
        isPreviewMode ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <button
        onClick={toggleOrientation}
        className="p-2 hover:bg-gray-700 rounded"
        disabled={isPreviewMode}
      >
        <RotateCw className="w-5 h-5 text-white" />
      </button>
      <div className="text-white text-xs mt-1">
        {orientation.width}x{orientation.height}
      </div>
    </div>
  );
};

export default OrientationControl;
