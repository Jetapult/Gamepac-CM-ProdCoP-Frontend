import { useEffect, useState } from "react";
import DisappearAnimationPanel from "../DisappearAnimationPanel";
import FadeInAnimationPanel from "../FadeInAnimationPanel";
import PositionAnimationPanel from "../PositionAnimationPanel";
import ScaleAnimationPanel from "../ScaleAnimationPanel";
import SlideInAnimationPanel from "../SlideInAnimationPanel";
import VisibilityAnimationPanel from "../VisibilityAnimationPanel";

const AddActionPanel = ({
  action,
  spriteData,
  handleAddFrame,
  handleRemoveFrame,
  updateFrameProperties,
  updateFrameAnimation,
  game,
  activeTweens,
  sprite,
  startCommonAnimations
}) => {
  const [activePanel, setActivePanel] = useState("");

  // Effect to handle animations
  useEffect(() => {
    if (!game?.playground) return;

    const scene = game.playground;

    // Stop existing tweens
    activeTweens.current.forEach((tween) => {
      if (tween?.isPlaying) {
        tween.stop();
      }
    });
    activeTweens.current = [];

    // Start animations for each frame
    action.config.framesToAdd.forEach((frame) => {
      const target = scene.children.list.find(
        (child) =>
          child.getData("frameConfig")?.frameName === frame.frameName &&
          child.getData("parentId") === sprite.id
      );

      if (target) {
        startCommonAnimations(frame, target);
      }
    });

    // Cleanup function
    return () => {
      activeTweens.current.forEach((tween) => {
        if (tween?.isPlaying) {
          tween.stop();
        }
      });
    };
  }, [action.config.framesToAdd, game]);
  return (
    <div>
      <label className="block mb-2">Add Frame</label>
      <select
        value=""
        onChange={(e) => handleAddFrame(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Frame to Add</option>
        {Object.keys(spriteData.frames).map((frameName) => (
          <option key={frameName} value={frameName}>
            {frameName}
          </option>
        ))}
      </select>

      {/* Display added frames */}
      {action?.config?.framesToAdd?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2 text-white">Added Frames:</h4>
          <div className="space-y-4">
            {action.config.framesToAdd.map((frame, index) => (
              <div
                key={index}
                className="bg-[#333] p-3 rounded border border-[#444]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                    {frame.frameName}
                  </span>
                  <button
                    onClick={() => handleRemoveFrame(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-white text-xs mb-1">X:</label>
                    <input
                      type="number"
                      value={Math.round(frame.x)}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          x: Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs mb-1">Y:</label>
                    <input
                      type="number"
                      value={Math.round(frame.y)}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          y: Number(e.target.value),
                        })
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
                      value={frame.scale}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          scale: Number(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Number(frame.scale).toFixed(1)}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          scale: Number(e.target.value),
                        })
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
                      value={frame.rotation || 0}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          rotation: Number(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Math.round(frame.rotation || 0)}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          rotation: Number(e.target.value),
                        })
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
                      value={frame.alpha || 1}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          alpha: Number(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={Number(frame.alpha || 1).toFixed(1)}
                      onChange={(e) =>
                        updateFrameProperties(index, {
                          alpha: Number(e.target.value),
                        })
                      }
                      className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    className={`p-2 border rounded ${
                      frame.animations.position.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("position")}
                  >
                    <span className="text-white">↔️</span>
                  </button>
                  <button
                    className={`p-2 border rounded ${
                      frame.animations.scale.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("scale")}
                  >
                    <span className="text-white">⚖️</span>
                  </button>
                  <button
                    className={`p-2 border rounded ${
                      frame.animations?.alpha?.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("visibility")}
                  >
                    <span className="text-white">👁</span>
                  </button>

                  <button
                    className={`p-2 border rounded ${
                      frame.animations.slideIn?.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("slideIn")}
                  >
                    <span className="text-white">↳</span>
                  </button>
                  <button
                    className={`p-2 border rounded ${
                      frame.animations.fadeIn?.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("fadeIn")}
                  >
                    <span className="text-white">🌓</span>
                  </button>
                  <button
                    className={`p-2 border rounded ${
                      frame.animations.disappear?.isEnabled
                        ? "bg-purple-500/20 border-purple-500"
                        : "border-[#444]"
                    }`}
                    onClick={() => setActivePanel("disappear")}
                  >
                    <span className="text-white">⌛</span>
                  </button>
                </div>
                {activePanel === "position" && (
                  <PositionAnimationPanel
                    config={frame.animations.position.config}
                    isEnabled={frame.animations.position.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "position", {
                        isEnabled: !frame.animations.position.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "position", {
                        config: {
                          ...frame.animations.position.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
                {activePanel === "scale" && (
                  <ScaleAnimationPanel
                    config={frame.animations.scale.config}
                    isEnabled={frame.animations.scale.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "scale", {
                        isEnabled: !frame.animations.scale.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "scale", {
                        config: {
                          ...frame.animations.scale.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
                {console.log(frame?.animations, "frame?.animations")}
                {activePanel === "visibility" && (
                  <VisibilityAnimationPanel
                    config={frame?.animations?.transparency?.config}
                    isEnabled={frame?.animations?.transparency?.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "transparency", {
                        isEnabled: !frame?.animations?.transparency?.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "transparency", {
                        config: {
                          ...frame?.animations?.transparency?.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
                {activePanel === "slideIn" && (
                  <SlideInAnimationPanel
                    config={frame.animations.slideIn.config}
                    isEnabled={frame.animations.slideIn?.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "slideIn", {
                        isEnabled: !frame.animations.slideIn?.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "slideIn", {
                        config: {
                          ...frame.animations.slideIn.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
                {activePanel === "fadeIn" && (
                  <FadeInAnimationPanel
                    config={frame.animations.fadeIn.config}
                    isEnabled={frame.animations.fadeIn?.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "fadeIn", {
                        isEnabled: !frame.animations.fadeIn?.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "fadeIn", {
                        config: {
                          ...frame.animations.fadeIn.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
                {activePanel === "disappear" && (
                  <DisappearAnimationPanel
                    config={frame.animations.disappear.config}
                    isEnabled={frame.animations.disappear?.isEnabled}
                    onToggle={() =>
                      updateFrameAnimation(index, "disappear", {
                        isEnabled: !frame.animations.disappear?.isEnabled,
                      })
                    }
                    onChange={(newConfig) =>
                      updateFrameAnimation(index, "disappear", {
                        config: {
                          ...frame.animations.disappear.config,
                          ...newConfig,
                        },
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddActionPanel;
