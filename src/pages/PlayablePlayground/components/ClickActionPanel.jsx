import { createDefaultAnimations } from "../Playground";
import React, { useState, useEffect, useRef } from "react";
import PositionAnimationPanel from "./PositionAnimationPanel";
import ScaleAnimationPanel from "./ScaleAnimationPanel";
import VisibilityAnimationPanel from "./VisibilityAnimationPanel";
import SlideInAnimationPanel from "./SlideInAnimationPanel";
import FadeInAnimationPanel from "./FadeInAnimationPanel";
import DisappearAnimationPanel from "./DisappearAnimationPanel";

const ClickActionPanel = ({
  sprite,
  setPlacedSprites,
  placedSprites,
  spriteData,
  game,
}) => {
  if (!spriteData) return null;
  const handleActionTypeChange = (type) => {
    setPlacedSprites((prev) =>
      prev.map((s) =>
        s.id === sprite.id
          ? {
              ...s,
              clickAction: {
                enabled: true,
                type,
                config: {
                  framesToAdd: [], // Initialize as empty array
                  position: { x: 0, y: 0 },
                },
              },
            }
          : s
      )
    );
  };

  const handleConfigChange = (updates) => {
    setPlacedSprites((prev) =>
      prev.map((s) =>
        s.id === sprite.id
          ? {
              ...s,
              clickAction: {
                ...s.clickAction,
                config: {
                  ...s.clickAction.config,
                  ...updates,
                },
              },
            }
          : s
      )
    );
  };

  const handleAddFrame = (frameName) => {
    if (!game?.playground) return;

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const newFrame = {
            frameName,
            x: 0,
            y: 0,
            baseX: 0,
            baseY: 0,
            scale: 1,
            rotation: 0,
            alpha: 1,
            animations: createDefaultAnimations(),
          };

          return {
            ...s,
            clickAction: {
              enabled: true,
              type: "add",
              config: {
                ...s.clickAction?.config,
                isPlacingFrame: true,
                framesToAdd: [
                  ...(s.clickAction?.config?.framesToAdd || []),
                  newFrame,
                ],
              },
            },
          };
        }
        return s;
      })
    );
  };

  const handleRemoveFrame = (index) => {
    setPlacedSprites((prev) =>
      prev.map((s) =>
        s.id === sprite.id
          ? {
              ...s,
              clickAction: {
                ...s.clickAction,
                config: {
                  ...s.clickAction.config,
                  framesToAdd: s.clickAction.config.framesToAdd.filter(
                    (_, i) => i !== index
                  ),
                },
              },
            }
          : s
      )
    );
  };

  const handleTargetSelect = (targetId) => {
    setPlacedSprites((prev) =>
      prev.map((s) =>
        s.id === sprite.id
          ? {
              ...s,
              clickAction: {
                ...s.clickAction,
                targetIds: [...s.clickAction.targetIds, targetId],
              },
            }
          : s
      )
    );
  };

  const updateFrameProperties = (frameIndex, updates) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedFrames = s.clickAction.config.framesToAdd.map(
            (frame, idx) => {
              if (idx === frameIndex) {
                const updatedFrame = { ...frame };

                // Update all properties
                if (updates.x !== undefined) updatedFrame.x = Number(updates.x);
                if (updates.y !== undefined) updatedFrame.y = Number(updates.y);
                if (updates.scale !== undefined)
                  updatedFrame.scale = Number(updates.scale);
                if (updates.rotation !== undefined)
                  updatedFrame.rotation = Number(updates.rotation);
                if (updates.alpha !== undefined)
                  updatedFrame.alpha = Number(updates.alpha);

                // Find and update the corresponding sprite in the scene
                if (game?.playground) {
                  const scene = game.playground;
                  scene.children.list
                    .filter(
                      (child) =>
                        child.type === "Sprite" &&
                        child.getData("parentId") === s.id &&
                        child.getData("frameConfig").frameName ===
                          frame.frameName
                    )
                    .forEach((sprite) => {
                      // Apply all updates to the sprite
                      if (updates.x !== undefined) sprite.x = Number(updates.x);
                      if (updates.y !== undefined) sprite.y = Number(updates.y);
                      if (updates.scale !== undefined)
                        sprite.setScale(Number(updates.scale));
                      if (updates.rotation !== undefined)
                        sprite.setRotation(Number(updates.rotation));
                      if (updates.alpha !== undefined)
                        sprite.setAlpha(Number(updates.alpha));

                      // Update the sprite's stored frame config
                      sprite.setData("frameConfig", updatedFrame);
                    });
                }
                return updatedFrame;
              }
              return frame;
            }
          );

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...s.clickAction.config,
                framesToAdd: updatedFrames,
              },
            },
          };
        }
        return s;
      })
    );
  };

  const [activePanel, setActivePanel] = useState("");
  const activeTweens = useRef([]);
  const baseProps = useRef({});

  // Function to start animations for a frame
  const startCommonAnimations = (frame, target) => {
    if (!target || !game?.playground) return;

    const scene = game.playground;
    const originalX = frame.baseX || target.x;
    const originalY = frame.baseY || target.y;

    // Handle Slide-in Animation first
    if (frame.animations.slideIn?.isEnabled) {
      const getInitialPosition = () => {
        const { direction, distance } = frame.animations.slideIn.config;
        switch (direction) {
          case "left":
            return { x: originalX - distance, y: originalY };
          case "right":
            return { x: originalX + distance, y: originalY };
          case "top":
            return { x: originalX, y: originalY - distance };
          case "bottom":
            return { x: originalX, y: originalY + distance };
          default:
            return { x: originalX, y: originalY };
        }
      };

      const initialPos = getInitialPosition();
      target.setPosition(initialPos.x, initialPos.y);

      const slideInTween = scene.tweens.add({
        targets: target,
        x: originalX,
        y: originalY,
        duration: frame.animations.slideIn.config.duration,
        ease: frame.animations.slideIn.config.ease,
        delay: frame.animations.slideIn.config.priority * 200,
      });
      activeTweens.current.push(slideInTween);
    }

    // Handle Fade-in Animation
    if (frame.animations.fadeIn?.isEnabled) {
      target.setAlpha(0);
      const fadeInTween = scene.tweens.add({
        targets: target,
        alpha: 1,
        duration: frame.animations.fadeIn.config.duration,
        ease: frame.animations.fadeIn.config.ease,
        delay: frame.animations.fadeIn.config.priority * 200,
      });
      activeTweens.current.push(fadeInTween);
    }

    // Position Animation
    if (frame.animations.position?.isEnabled) {
      const config = frame.animations.position.config;
      const xOffset = config.x * 100;
      const yOffset = config.y * 100;

      const positionTween = scene.tweens.add({
        targets: target,
        x: { from: originalX, to: originalX + xOffset },
        y: { from: originalY, to: originalY + yOffset },
        duration: config.duration,
        repeat: config.repeat,
        yoyo: config.yoyo,
        ease: config.ease,
      });
      activeTweens.current.push(positionTween);
    }

    // Scale Animation
    if (frame.animations.scale?.isEnabled) {
      const scaleTween = scene.tweens.add({
        targets: target,
        scaleX: frame.animations.scale.config.scaleX,
        scaleY: frame.animations.scale.config.scaleY,
        duration: frame.animations.scale.config.duration,
        repeat: frame.animations.scale.config.repeat,
        yoyo: frame.animations.scale.config.yoyo,
        ease: frame.animations.scale.config.ease,
      });
      activeTweens.current.push(scaleTween);
    }

    // Alpha Animation
    if (frame.animations.alpha?.isEnabled) {
      const alphaTween = scene.tweens.add({
        targets: target,
        alpha: frame.animations.alpha.config.alpha,
        duration: frame.animations.alpha.config.duration,
        repeat: frame.animations.alpha.config.repeat,
        yoyo: frame.animations.alpha.config.yoyo,
        ease: frame.animations.alpha.config.ease,
      });
      activeTweens.current.push(alphaTween);
    }

    // Handle Disappear Animation
    if (frame.animations.disappear?.isEnabled) {
      const disappearTimer = scene.time.delayedCall(
        frame.animations.disappear.config.delay,
        () => {
          const disappearTween = scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: frame.animations.disappear.config.duration,
            ease: frame.animations.disappear.config.ease,
            onComplete: () => {
              target.destroy();
            },
          });
          activeTweens.current.push(disappearTween);
        }
      );
    }
  };

  // Update animation configuration
  const updateFrameAnimation = (frameIndex, type, updates) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedFrames = s.clickAction.config.framesToAdd.map(
            (frame, idx) => {
              if (idx === frameIndex) {
                const updatedFrame = {
                  ...frame,
                  animations: {
                    ...frame.animations,
                    [type]: {
                      ...frame.animations[type],
                      ...updates,
                    },
                  },
                };
                return updatedFrame;
              }
              return frame;
            }
          );

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...s.clickAction.config,
                framesToAdd: updatedFrames,
              },
            },
          };
        }
        return s;
      })
    );
  };

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
    sprite.clickAction.config.framesToAdd.forEach((frame) => {
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
  }, [sprite.clickAction.config.framesToAdd, game]);

  return (
    <div className="">
      <h3 className="font-bold mb-2">Click Actions</h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Action Type</label>
          <select
            value={sprite.clickAction?.type || "none"}
            onChange={(e) => handleActionTypeChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="none">None</option>
            <option value="add">Add Elements</option>
          </select>
        </div>

        {sprite.clickAction?.type === "add" && (
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
            {sprite.clickAction?.config?.framesToAdd?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold mb-2 text-white">Added Frames:</h4>
                <div className="space-y-4">
                  {sprite.clickAction.config.framesToAdd.map((frame, index) => (
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
                          <label className="block text-white text-xs mb-1">
                            X:
                          </label>
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
                          <label className="block text-white text-xs mb-1">
                            Y:
                          </label>
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
                      {activePanel === "visibility" && (
                        <VisibilityAnimationPanel
                          config={frame.animations.alpha.config}
                          isEnabled={frame.animations.alpha.isEnabled}
                          onToggle={() =>
                            updateFrameAnimation(index, "alpha", {
                              isEnabled: !frame.animations.alpha.isEnabled,
                            })
                          }
                          onChange={(newConfig) =>
                            updateFrameAnimation(index, "alpha", {
                              config: {
                                ...frame.animations.alpha.config,
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
        )}

        {sprite.clickAction?.type === "update" && (
          <div>
            <label className="block mb-2">Select Elements to Update</label>
            <select
              multiple
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => handleTargetSelect(e.target.value)}
            >
              {placedSprites
                .filter((s) => s.id !== sprite.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.frameName}
                  </option>
                ))}
            </select>

            <label className="block mb-2">New Frame</label>
            <select
              value={sprite.clickAction?.config?.frameToUpdate || ""}
              onChange={(e) =>
                handleConfigChange({ frameToUpdate: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Frame</option>
              {Object.keys(spriteData.frames).map((frameName) => (
                <option key={frameName} value={frameName}>
                  {frameName}
                </option>
              ))}
            </select>
          </div>
        )}

        {sprite.clickAction?.type === "remove" && (
          <div>
            <label className="block mb-2">Select Elements to Remove</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              onChange={(e) => handleTargetSelect(e.target.value)}
            >
              {placedSprites
                .filter((s) => s.id !== sprite.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.frameName}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClickActionPanel;
