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
                  framesToAdd: [], // For 'add' type
                  frameToUpdate: [], // Changed to array to store frame updates
                  targetIds: [], // For both types
                  framesToDelete: [],
                  position: { x: 0, y: 0 },
                },
              },
            }
          : s
      )
    );
  };

  const handleConfigChange = (targetId, newFrameName) => {
    if (!game?.playground || !targetId || !newFrameName) return;
    const scene = game.playground;

    // Find the target sprite in the scene
    const targetSprite = scene.children.list.find(
      (child) => child.getData("id") === Number(targetId)
    );

    if (targetSprite) {
      // Update the sprite's texture for preview
      targetSprite.setTexture("charactersprite", newFrameName);
    }

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const currentConfig = s.clickAction?.config || {};
          const existingUpdates = currentConfig.frameToUpdate || [];

          const updatedFrameToUpdate = existingUpdates.map((update) =>
            update.targetId === targetId
              ? {
                  ...update,
                  newFrameName,
                }
              : update
          );

          return {
            ...s,
            clickAction: {
              enabled: true,
              type: "update",
              config: {
                ...currentConfig,
                frameToUpdate: updatedFrameToUpdate,
              },
            },
          };
        }
        return s;
      })
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

  const handleTargetSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          if (s.clickAction.type === "remove") {
            const framesToDelete = selectedOptions.map(targetId => {
              const targetSprite = placedSprites.find(
                (s) => s.id === Number(targetId)
              );
              return {
                targetId,
                frameName: targetSprite.frameName,
                fadeOutDuration: 500,
                delay: 0,
                ease: 'Linear'
              };
            });
  
            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                config: {
                  ...s.clickAction.config,
                  framesToDelete
                },
              },
            };
          } else {
            const currentConfig = s.clickAction?.config || {};
          const existingUpdates = currentConfig.frameToUpdate || [];

          // Create initial frameToUpdate entries for newly selected targets
          const updatedFrameToUpdate = selectedOptions.map((targetId) => {
            const targetSprite = placedSprites.find(
              (s) => s.id === Number(targetId)
            );
            const existingUpdate = existingUpdates.find(
              (u) => u.targetId === targetId
            );

            if (existingUpdate) {
              return existingUpdate;
            }

            return {
              targetId,
              newFrameName: targetSprite.frameName,
              x: targetSprite.x,
              y: targetSprite.y,
              baseX: targetSprite.x,
              baseY: targetSprite.y,
              scale: targetSprite.scale || 1,
              rotation: targetSprite.rotation || 0,
              alpha: targetSprite.alpha || 1,
              animations: {
                position: {
                  isEnabled: false,
                  config: {
                    x: 0.4,
                    y: 0.4,
                    duration: 1000,
                    repeat: -1,
                    yoyo: true,
                    ease: "Linear",
                  },
                },
                scale: {
                  isEnabled: false,
                  config: {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 1000,
                    repeat: -1,
                    yoyo: true,
                    ease: "Linear",
                  },
                },
                alpha: {
                  isEnabled: false,
                  config: {
                    alpha: 1,
                    duration: 1000,
                    repeat: -1,
                    yoyo: true,
                    ease: "Linear",
                  },
                },
                slideIn: {
                  isEnabled: false,
                  config: {
                    direction: "left",
                    distance: 100,
                    duration: 1000,
                    ease: "Power2",
                    priority: 0,
                  },
                },
                fadeIn: {
                  isEnabled: false,
                  config: {
                    duration: 1000,
                    ease: "Linear",
                    priority: 0,
                  },
                },
                disappear: {
                  isEnabled: false,
                  config: {
                    duration: 1000,
                    delay: 0,
                    ease: "Linear",
                  },
                },
              },
            };
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              enabled: true,
              type: "update",
              config: {
                ...currentConfig,
                targetIds: selectedOptions,
                frameToUpdate: updatedFrameToUpdate,
              },
            },
          };
          }
        }
        return s;
      })
    );
  };

  const updateFrameProperties = (frameIndex, updates) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          if (s.clickAction.type === "add") {
            // Handle add elements
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
                  const scene = game?.playground;
                  if (scene) {
                    scene.children.list
                      .filter(
                        (child) =>
                          child.type === "Sprite" &&
                          child.getData("parentId") === s.id &&
                          child.getData("frameConfig").frameName === frame.frameName
                      )
                      .forEach((sprite) => {
                        if (updates.x !== undefined) sprite.x = Number(updates.x);
                        if (updates.y !== undefined) sprite.y = Number(updates.y);
                        if (updates.scale !== undefined)
                          sprite.setScale(Number(updates.scale));
                        if (updates.rotation !== undefined)
                          sprite.setRotation((Number(updates.rotation) * Math.PI) / 180);
                        if (updates.alpha !== undefined)
                          sprite.setAlpha(Number(updates.alpha));
  
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
          } else if (s.clickAction.type === "update") {
            const updatedFrameToUpdate = s.clickAction.config.frameToUpdate.map(
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
  
                  // Find and update the target sprite in the scene
                  const targetSprite = scene.children.list.find(
                    (child) => child.getData("id") === Number(frame.targetId)
                  );
  
                  if (targetSprite) {
                    if (updates.x !== undefined)
                      targetSprite.x = Number(updates.x);
                    if (updates.y !== undefined)
                      targetSprite.y = Number(updates.y);
                    if (updates.scale !== undefined)
                      targetSprite.setScale(Number(updates.scale));
                    if (updates.rotation !== undefined)
                      targetSprite.setRotation(
                        (Number(updates.rotation) * Math.PI) / 180
                      );
                    if (updates.alpha !== undefined)
                      targetSprite.setAlpha(Number(updates.alpha));
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
                  frameToUpdate: updatedFrameToUpdate,
                },
              },
            };
          }
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
        onComplete: function() {
          if (!frame?.animations?.alpha?.isEnabled) {
            target?.setAlpha(frame.baseProps?.alpha || 1);
          } else {
            this.restart();
          }
        }
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

  const handleFrameUpdate = (targetId) => {
    if (!game?.playground) return;

    const scene = game.playground;
    const targetSprite = scene.children.list.find(
      (child) => child.getData("id") === targetId
    );

    const frameUpdate = sprite.clickAction?.config?.frameToUpdate.find(
      (update) => update.targetId === targetId
    );

    if (targetSprite && frameUpdate) {
      // Update the sprite's texture
      targetSprite.setTexture(spriteData.key, frameUpdate.newFrameName);

      // Update the sprite's data
      targetSprite.setData("frameConfig", {
        ...targetSprite.getData("frameConfig"),
        frameName: frameUpdate.newFrameName,
        ...frameUpdate.parentValues,
      });

      // Apply parent values
      const { parentValues } = frameUpdate;
      targetSprite.setPosition(parentValues.x, parentValues.y);
      targetSprite.setScale(parentValues.scale);
      targetSprite.setRotation(parentValues.rotation);
      targetSprite.setAlpha(parentValues.alpha);
    }
  };

  const handleUpdateFrameProperty = (targetId, property, value) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const currentConfig = s.clickAction?.config || {};
          const existingUpdates = currentConfig.frameToUpdate || [];

          const updatedFrameToUpdate = existingUpdates.map((update) =>
            update.targetId === targetId
              ? {
                  ...update,
                  [property]: Number(value),
                }
              : update
          );

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...currentConfig,
                frameToUpdate: updatedFrameToUpdate,
              },
            },
          };
        }
        return s;
      })
    );
  };

  const updateFrameUpdateAnimation = (frameIndex, type, updates) => {
    const scene = game.scene.scenes[0];

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedClickAction = {
            ...s.clickAction,
            config: {
              ...s.clickAction.config,
              frameToUpdate: s.clickAction.config.frameToUpdate.map(
                (frame, idx) => {
                  if (idx === frameIndex) {
                    const targetSprite = scene.children.list.find(
                      (child) => child.getData("id") === Number(frame.targetId)
                    );

                    if (!frame.animations) {
                      frame.animations = {};
                    }
                    if (!frame.animations[type]) {
                      frame.animations[type] = {
                        isEnabled: false,
                        config: {}
                      };
                    }

                    const updatedFrame = {
                      ...frame,
                      animations: {
                        ...frame.animations,
                        [type]: {
                          ...frame.animations[type],
                          ...updates,
                          config: updates.config ? {
                            ...frame.animations[type].config,
                            ...updates.config
                          } : frame.animations[type].config
                        },
                      },
                    };

                    if (targetSprite && updatedFrame.animations[type].isEnabled) {
                      // Stop existing tweens
                      scene.tweens.getTweensOf(targetSprite).forEach(tween => {
                        tween.stop();
                        tween.remove();
                      });

                      const currentConfig = updatedFrame.animations[type].config;
                      
                      // Start common animations
                      const startCommonAnimations = () => {
                        switch (type) {
                          case "scale":
                            scene.tweens.add({
                              targets: targetSprite,
                              scaleX: currentConfig?.scaleX || 1,
                              scaleY: currentConfig?.scaleY || 1,
                              duration: currentConfig?.duration || 1000,
                              repeat: currentConfig?.repeat === undefined ? -1 : currentConfig.repeat,
                              yoyo: currentConfig?.yoyo || false,
                              ease: currentConfig?.ease || "Linear"
                            });
                            break;
                          case "alpha":
                            scene.tweens.add({
                              targets: targetSprite,
                              alpha: { 
                                from: frame.baseProps?.alpha || 1, 
                                to: currentConfig?.alpha || 1 
                              },
                              duration: currentConfig?.duration || 1000,
                              repeat: currentConfig?.repeat ?? -1,
                              yoyo: currentConfig?.yoyo ?? false,
                              ease: currentConfig?.ease || "Linear",
                              onComplete: function() {
                                if (!updatedFrame.animations[type].isEnabled) {
                                  targetSprite.setAlpha(frame.baseProps?.alpha || 1);
                                } else {
                                  this.restart();
                                }
                              }
                            });
                            break;
                          case "position":
                            scene.tweens.add({
                              targets: targetSprite,
                              x: frame.baseProps?.x + (currentConfig?.x || 0) * 100,
                              y: frame.baseProps?.y + (currentConfig?.y || 0) * 100,
                              duration: currentConfig?.duration || 1000,
                              repeat: currentConfig?.repeat ?? -1,
                              yoyo: currentConfig?.yoyo ?? false,
                              ease: currentConfig?.ease || "Linear"
                            });
                            break;
                          case "disappear":
                            scene.tweens.add({
                              targets: targetSprite,
                              alpha: { from: 1, to: 0 },
                              duration: currentConfig?.duration || 1000,
                              ease: currentConfig?.ease || "Linear",
                              delay: currentConfig?.delay || 0,
                              onComplete: () => {
                                targetSprite.destroy();
                                // Remove the sprite from placedSprites
                                setPlacedSprites(prev => prev.map(s => 
                                  s.id === sprite.id 
                                    ? { ...s, isDestroyed: true }
                                    : s
                                ));
                              }
                            });
                            break;
                        }
                      };

                      // Handle custom animations first
                      if (updatedFrame.animations.slideIn?.isEnabled) {
                        const getInitialPosition = () => {
                          const { direction, distance } = updatedFrame.animations.slideIn.config;
                          switch (direction) {
                            case "left":
                              return { x: frame.baseProps?.x - distance || 0, y: frame.baseProps?.y || 0 };
                            case "right":
                              return { x: frame.baseProps?.x + distance || 0, y: frame.baseProps?.y || 0 };
                            case "top":
                              return { x: frame.baseProps?.x || 0, y: frame.baseProps?.y - distance || 0 };
                            case "bottom":
                              return { x: frame.baseProps?.x || 0, y: frame.baseProps?.y + distance || 0 };
                            default:
                              return { x: frame.baseProps?.x || 0, y: frame.baseProps?.y || 0 };
                          }
                        };
                      
                        const initialPos = getInitialPosition();
                        targetSprite.setPosition(initialPos.x, initialPos.y);
                      
                        scene.tweens.add({
                          targets: targetSprite,
                          x: frame.baseProps?.x || 0,
                          y: frame.baseProps?.y || 0,
                          duration: updatedFrame.animations.slideIn.config.duration || 1000,
                          ease: updatedFrame.animations.slideIn.config.ease || 'Linear',
                          onComplete: startCommonAnimations
                        });
                      } else if (updatedFrame.animations.fadeIn?.isEnabled) {
                        targetSprite.setAlpha(0);
                        scene.tweens.add({
                          targets: targetSprite,
                          alpha: 1,
                          duration: updatedFrame.animations.fadeIn.config.duration || 1000,
                          ease: updatedFrame.animations.fadeIn.config.ease || 'Linear',
                          onComplete: startCommonAnimations
                        });
                      } else {
                        startCommonAnimations();
                      }
                    }

                    return updatedFrame;
                  }
                  return frame;
                }
              ),
            },
          };

          return {
            ...s,
            clickAction: updatedClickAction,
          };
        }
        return s;
      })
    );
  };

  useEffect(() => {
    return () => {
      if (game?.playground) {
        const scene = game.playground;
        sprite.clickAction?.config?.frameToUpdate?.forEach((update) => {
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
  }, [game, sprite.clickAction?.config?.frameToUpdate]);

  const handleUpdateElementProperty = (targetId, property, value) => {
    if (!game?.playground) return;
    const scene = game.playground;

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedFrameToUpdate = s.clickAction.config.frameToUpdate.map(
            (update) => {
              if (update.targetId === targetId) {
                const updatedFrame = { ...update };
                updatedFrame[property] = Number(value);

                // Find and update the target sprite in the scene
                const targetSprite = scene.children.list.find(
                  (child) => child.getData("id") === Number(targetId)
                );

                if (targetSprite) {
                  switch (property) {
                    case "x":
                      targetSprite.x = Number(value);
                      break;
                    case "y":
                      targetSprite.y = Number(value);
                      break;
                    case "scale":
                      targetSprite.setScale(Number(value));
                      break;
                    case "rotation":
                      targetSprite.setRotation((Number(value) * Math.PI) / 180);
                      break;
                    case "alpha":
                      targetSprite.setAlpha(Number(value));
                      break;
                  }
                }

                return updatedFrame;
              }
              return update;
            }
          );

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...s.clickAction.config,
                frameToUpdate: updatedFrameToUpdate,
              },
            },
          };
        }
        return s;
      })
    );
  };

  const handleDeleteUpdate = (targetId) => {
    if (!game?.playground) return;
    const scene = game.playground;

    // Find the target sprite
    const targetSprite = scene.children.list.find(
      (child) => child.getData("id") === Number(targetId)
    );

    // Find the original sprite data
    const originalSprite = placedSprites.find((s) => s.id === Number(targetId));

    if (targetSprite && originalSprite) {
      // Revert the sprite to its original state
      targetSprite.setTexture("charactersprite", originalSprite.frameName);
      targetSprite.setPosition(originalSprite.x, originalSprite.y);
      targetSprite.setScale(originalSprite.scale);
      targetSprite.setRotation((originalSprite.rotation * Math.PI) / 180);
      targetSprite.setAlpha(originalSprite.alpha);

      // Stop any active animations
      scene.tweens.killTweensOf(targetSprite);

      // Update placedSprites to remove this target from frameToUpdate and targetIds
      setPlacedSprites((prev) =>
        prev.map((s) => {
          if (s.id === sprite.id) {
            const updatedConfig = {
              ...s.clickAction.config,
              frameToUpdate: s.clickAction.config.frameToUpdate.filter(
                (update) => update.targetId !== targetId
              ),
              targetIds: s.clickAction.config.targetIds.filter(
                (id) => id !== targetId
              ),
            };

            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                config: updatedConfig,
              },
            };
          }
          return s;
        })
      );
    }
  };

  const handleRemoveTarget = (targetId) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...s.clickAction.config,
                targetIds: s.clickAction.config.targetIds.filter(
                  (id) => id !== targetId
                ),
              },
            },
          };
        }
        return s;
      })
    );
  };

  const handleRemoveDeleteFrame = (targetId) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              config: {
                ...s.clickAction.config,
                framesToDelete: s.clickAction.config.framesToDelete.filter(
                  (frame) => frame.targetId !== targetId
                ),
              },
            },
          };
        }
        return s;
      })
    );
  };

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
            <option value="update">Update Elements</option>
            <option value="remove">Remove Elements</option>
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
                      )}{console.log(frame?.animations,'frame?.animations')}
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
        )}

        {sprite.clickAction?.type === "update" && (
          <div>
            {/* Target Selection Dropdown - Always at the top */}
            <div className="mb-4">
              <label className="block mb-2">Select Elements to Update</label>
              <select
                multiple
                className="w-full p-2 border rounded bg-[#222] text-white border-[#444]"
                onChange={(e) => handleTargetSelect(e)}
                value={sprite.clickAction?.config?.targetIds || []}
              >
                {placedSprites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.frameName}
                  </option>
                ))}
              </select>
            </div>

            {/* Frame Selection for Selected Targets */}
            {(sprite.clickAction?.config?.targetIds || []).map((targetId) => {
              const targetSprite = placedSprites.find(
                (s) => s.id === Number(targetId)
              );
              const frameUpdate =
                sprite.clickAction?.config?.frameToUpdate?.find(
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
                    onChange={(e) =>
                      handleConfigChange(targetId, e.target.value)
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
                </div>
              );
            })}

            {/* List of Updated Elements */}
            <div className="mt-6">
              {sprite.clickAction?.config?.frameToUpdate.length > 0 && (
                <h3 className="text-white text-sm font-medium mb-4">
                  Updated Elements:
                </h3>
              )}
              <div className="space-y-4">
                {(sprite.clickAction?.config?.frameToUpdate || []).map(
                  (frameUpdate, index) => {
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
                            {targetSprite.frameName} →{" "}
                            {frameUpdate.newFrameName}
                          </span>
                          <button
                            onClick={() =>
                              handleDeleteUpdate(frameUpdate.targetId)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>

                        <select
                          value={frameUpdate.newFrameName || ""}
                          onChange={(e) =>
                            handleConfigChange(
                              frameUpdate.targetId,
                              e.target.value
                            )
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
                            <label className="block text-white text-xs mb-1">
                              X:
                            </label>
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
                            <label className="block text-white text-xs mb-1">
                              Y:
                            </label>
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
                                activePanel === "move" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.position?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "move" ? "" : "move"))}
                            >
                              <span className="text-white">↔️</span>
                            </button>
                            <button
                              className={`p-2 border rounded ${
                                activePanel === "scale" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.scale?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "scale" ? "" : "scale"))}
                            >
                              <span className="text-white">⤢</span>
                            </button>
                            <button
                              className={`p-2 border rounded ${
                                activePanel === "visibility" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.alpha?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "visibility" ? "" : "visibility"))}
                            >
                              <span className="text-white">👁</span>
                            </button>
                            <button
                              className={`p-2 border rounded ${
                                activePanel === "slideIn" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.slideIn?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "slideIn" ? "" : "slideIn"))}
                            >
                              <span className="text-white">↘️</span>
                            </button>
                            <button
                              className={`p-2 border rounded ${
                                activePanel === "fadeIn" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.fadeIn?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "fadeIn" ? "" : "fadeIn"))}
                            >
                              <span className="text-white">🌓</span>
                            </button>
                            <button
                              className={`p-2 border rounded ${
                                activePanel === "disappear" ? "border-purple-500 bg-purple-500/20" : "border-[#444]"
                              } ${frameUpdate.animations?.disappear?.isEnabled ? "bg-purple-500/10" : ""}`}
                              onClick={() => setActivePanel((prev) => (prev === "disappear" ? "" : "disappear"))}
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
                                  isEnabled: !frameUpdate.animations?.position?.isEnabled,
                                })
                              }
                              onChange={(newConfig) =>
                                updateFrameUpdateAnimation(index, "position", {
                                  config: { ...frameUpdate.animations?.position?.config, ...newConfig },
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
                                  config: { ...frameUpdate.animations?.scale?.config, ...newConfig },
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
                                  config: { ...frameUpdate.animations?.alpha?.config, ...newConfig },
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
                                  isEnabled: !frameUpdate.animations?.slideIn?.isEnabled,
                                })
                              }
                              onChange={(newConfig) =>
                                updateFrameUpdateAnimation(index, "slideIn", {
                                  config: { ...frameUpdate.animations?.slideIn?.config, ...newConfig },
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
                                  isEnabled: !frameUpdate.animations?.disappear?.isEnabled,
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
                  }
                )}
              </div>
            </div>
          </div>
        )}

{sprite.clickAction?.type === "remove" && (
  <div>
    <div className="mb-4">
      <label className="block mb-2">Select Elements to Remove</label>
      <select
        multiple
        className="w-full p-2 border rounded bg-[#222] text-white border-[#444]"
        onChange={(e) => handleTargetSelect(e)}
        value={sprite.clickAction?.config?.framesToDelete?.map(f => f.targetId) || []}
      >
        {placedSprites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.frameName}
          </option>
        ))}
      </select>
    </div>

    {sprite.clickAction?.config?.framesToDelete?.length > 0 && (
      <div className="mt-4">
        <h4 className="font-bold mb-2 text-white">Elements to Remove:</h4>
        <div className="space-y-2">
          {sprite.clickAction.config.framesToDelete.map((frame) => {
            const targetSprite = placedSprites.find(
              (s) => s.id === Number(frame.targetId)
            );
            if (!targetSprite) return null;

            return (
              <div
                key={frame.targetId}
                className="flex justify-between items-center p-2 bg-[#333] rounded"
              >
                <span className="text-white">{frame.frameName}</span>
                <button
                  onClick={() => handleRemoveDeleteFrame(frame.targetId)}
                  className="text-red-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default ClickActionPanel;
