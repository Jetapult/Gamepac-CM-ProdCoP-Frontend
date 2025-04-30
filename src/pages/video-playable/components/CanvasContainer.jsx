import React from "react";
import AddModificationButtons from "./AddModificationButtons";
import OrientationControl from "./OrientationControl";

const CanvasContainer = ({
  isPreviewMode,
  currentTime,
  addBreak,
  addEndScreen,
  addOverlay,
  orientation,
  pixiContainerRef,
  toggleOrientation,
}) => {
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 bg-gray-900">
        <AddModificationButtons
          isPreviewMode={isPreviewMode}
          currentTime={currentTime}
          addBreak={addBreak}
          addEndScreen={addEndScreen}
          addOverlay={addOverlay}
        />
        <div
          className="canvas-container"
          style={{
            width: orientation.width + "px",
            height: orientation.height + "px",
            position: "relative",
            margin: "auto",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            ref={pixiContainerRef}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
      <OrientationControl
        isPreviewMode={isPreviewMode}
        toggleOrientation={toggleOrientation}
        orientation={orientation}
      />
    </div>
  );
};

export default CanvasContainer;
