import { useEffect, useState } from "react";
import DisappearAnimationPanel from "../DisappearAnimationPanel";
import FadeInAnimationPanel from "../FadeInAnimationPanel";
import SlideInAnimationPanel from "../SlideInAnimationPanel";
import VisibilityAnimationPanel from "../VisibilityAnimationPanel";
import ScaleAnimationPanel from "../ScaleAnimationPanel";
import PositionAnimationPanel from "../PositionAnimationPanel";

const UpdateActionPanel = ({
  action,
  handleTargetSelect,
  placedSprites,
  handleConfigChange,
  spriteData,
  handleDeleteUpdate,
  handleUpdateElementProperty,
  updateFrameUpdateAnimation,
  game
}) => {
  const [activePanel, setActivePanel] = useState("");
  useEffect(() => {
    return () => {
      if (game?.playground) {
        const scene = game.playground;
        action?.config?.frameToUpdate?.forEach((update) => {
          const targetSprite = scene.children.list.find(
            (child) => child.getData("id") === Number(update.targetId)
          );
          if (targetSprite) {
            const originalFrame = targetSprite.getData("originalFrame");
            if (originalFrame) {
              targetSprite.setTexture("charactersprite", originalFrame);
            }
          }
        });
      }
    };
  }, [game, action?.config?.frameToUpdate]);
  return (
    <div>
      {/* Target Selection Dropdown - Always at the top */}
      <div className="mb-4">
        <label className="block mb-2">Select Elements to Update</label>
        <select
          multiple
          className="w-full p-2 border rounded bg-[#222] text-white border-[#444]"
          onChange={(e) => handleTargetSelect(e)}
          value={action?.config?.targetIds || []}
        >
          {placedSprites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.frameName}
            </option>
          ))}
        </select>
      </div>

      {/* Frame Selection for Selected Targets */}
      {(action?.config?.targetIds || []).map((targetId) => {
        const targetSprite = placedSprites.find(
          (s) => s.id === Number(targetId)
        );
        const frameUpdate = action?.config?.frameToUpdate?.find(
          (update) => update.targetId === targetId
        );

        if (!targetSprite) return null;

        return (
          <div
            key={targetId}
            className="mb-4 p-3 border border-[#444] rounded bg-[#333]"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                {targetSprite.frameName}
              </span>
            </div>

            <select
              value={frameUpdate?.newFrameName || ""}
              onChange={(e) => handleConfigChange(targetId, e.target.value)}
              className="w-full p-2 border rounded mb-3 bg-[#222] text-white border-[#444]"
            >
              <option value="">Select Frame</option>
              {Object.keys(spriteData.frames).map((frameName) => (
                <option key={frameName} value={frameName}>
                  {frameName}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      {/* List of Updated Elements */}
      <div className="mt-6">
        {action?.config?.frameToUpdate.length > 0 && (
          <h3 className="text-white text-sm font-medium mb-4">
            Updated Elements:
          </h3>
        )}
        <div className="space-y-4">
          {(action?.config?.frameToUpdate || []).map((frameUpdate, index) => {
            const targetSprite = placedSprites.find(
              (s) => s.id === Number(frameUpdate.targetId)
            );
            if (!targetSprite) return null;

            return (
              <div
                key={frameUpdate.targetId}
                className="p-4 border border-[#444] rounded bg-[#333]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                    {targetSprite.frameName} → {frameUpdate.newFrameName}
                  </span>
                  <button
                    onClick={() => handleDeleteUpdate(frameUpdate.targetId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <select
                  value={frameUpdate.newFrameName || ""}
                  onChange={(e) =>
                    handleConfigChange(frameUpdate.targetId, e.target.value)
                  }
                  className="w-full p-2 border rounded mb-3 bg-[#222] text-white border-[#444]"
                >
                  <option value="">Select Frame</option>
                  {Object.keys(spriteData.frames).map((frameName) => (
                    <option key={frameName} value={frameName}>
                      {frameName}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-white text-xs mb-1">X:</label>
                    <input
                      type="number"
                      value={Math.round(frameUpdate.x || 0)}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "x",
                          e.target.value
                        )
                      }
                      className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs mb-1">Y:</label>
                    <input
                      type="number"
                      value={Math.round(frameUpdate.y || 0)}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "y",
                          e.target.value
                        )
                      }
                      className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-white text-xs mb-1">
                    Scale:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={frameUpdate.scale || 1}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "scale",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Number(frameUpdate.scale || 1).toFixed(1)}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "scale",
                          e.target.value
                        )
                      }
                      className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      min="0.1"
                      max="3"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-white text-xs mb-1">
                    Rotation:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={frameUpdate.rotation || 0}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "rotation",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Math.round(frameUpdate.rotation || 0)}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "rotation",
                          e.target.value
                        )
                      }
                      className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      min="0"
                      max="360"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-white text-xs mb-1">
                    Transparency:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={frameUpdate.alpha || 1}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "alpha",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Number(frameUpdate.alpha || 1).toFixed(1)}
                      onChange={(e) =>
                        handleUpdateElementProperty(
                          frameUpdate.targetId,
                          "alpha",
                          e.target.value
                        )
                      }
                      className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-[#444] pt-4">
                  <div className="flex gap-2">
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "move"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.position?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "move" ? "" : "move"
                        )
                      }
                    >
                      <span className="text-white">↔️</span>
                    </button>
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "scale"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.scale?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "scale" ? "" : "scale"
                        )
                      }
                    >
                      <span className="text-white">⤢</span>
                    </button>
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "visibility"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.alpha?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "visibility" ? "" : "visibility"
                        )
                      }
                    >
                      <span className="text-white">👁</span>
                    </button>
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "slideIn"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.slideIn?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "slideIn" ? "" : "slideIn"
                        )
                      }
                    >
                      <span className="text-white">↘️</span>
                    </button>
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "fadeIn"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.fadeIn?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "fadeIn" ? "" : "fadeIn"
                        )
                      }
                    >
                      <span className="text-white">🌓</span>
                    </button>
                    <button
                      className={`p-2 border rounded ${
                        activePanel === "disappear"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-[#444]"
                      } ${
                        frameUpdate.animations?.disappear?.isEnabled
                          ? "bg-purple-500/10"
                          : ""
                      }`}
                      onClick={() =>
                        setActivePanel((prev) =>
                          prev === "disappear" ? "" : "disappear"
                        )
                      }
                    >
                      <span className="text-white"></span>
                    </button>
                  </div>

                  {activePanel === "move" && (
                    <PositionAnimationPanel
                      config={frameUpdate.animations?.position?.config}
                      isEnabled={frameUpdate.animations?.position?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "position", {
                          isEnabled:
                            !frameUpdate.animations?.position?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "position", {
                          config: {
                            ...frameUpdate.animations?.position?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                  {activePanel === "scale" && (
                    <ScaleAnimationPanel
                      config={frameUpdate.animations?.scale?.config}
                      isEnabled={frameUpdate.animations?.scale?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "scale", {
                          isEnabled: !frameUpdate.animations?.scale?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "scale", {
                          config: {
                            ...frameUpdate.animations?.scale?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                  {activePanel === "visibility" && (
                    <VisibilityAnimationPanel
                      config={frameUpdate.animations?.alpha?.config}
                      isEnabled={frameUpdate.animations?.alpha?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "alpha", {
                          isEnabled: !frameUpdate.animations?.alpha?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "alpha", {
                          config: {
                            ...frameUpdate.animations?.alpha?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                  {activePanel === "slideIn" && (
                    <SlideInAnimationPanel
                      config={frameUpdate.animations?.slideIn?.config}
                      isEnabled={frameUpdate.animations?.slideIn?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "slideIn", {
                          isEnabled:
                            !frameUpdate.animations?.slideIn?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "slideIn", {
                          config: {
                            ...frameUpdate.animations?.slideIn?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                  {activePanel === "fadeIn" && (
                    <FadeInAnimationPanel
                      config={frameUpdate.animations?.fadeIn?.config}
                      isEnabled={frameUpdate.animations?.fadeIn?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "fadeIn", {
                          isEnabled: !frameUpdate.animations?.fadeIn?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "fadeIn", {
                          config: {
                            ...frameUpdate.animations?.fadeIn?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                  {activePanel === "disappear" && (
                    <DisappearAnimationPanel
                      config={frameUpdate.animations?.disappear?.config}
                      isEnabled={frameUpdate.animations?.disappear?.isEnabled}
                      onToggle={() =>
                        updateFrameUpdateAnimation(index, "disappear", {
                          isEnabled:
                            !frameUpdate.animations?.disappear?.isEnabled,
                        })
                      }
                      onChange={(newConfig) =>
                        updateFrameUpdateAnimation(index, "disappear", {
                          config: {
                            ...frameUpdate.animations?.disappear?.config,
                            ...newConfig,
                          },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpdateActionPanel;
