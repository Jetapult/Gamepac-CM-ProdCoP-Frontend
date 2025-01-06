import { createDefaultAnimations } from "../Playground";
import React, { useRef } from "react";
import AddActionPanel from "./UserClickAction/AddActionPanel";
import UpdateActionPanel from "./UserClickAction/UpdateActionPanel";
import RemoveActionPanel from "./UserClickAction/RemoveActionPanel";

const ClickActionPanel = ({
  sprite,
  setPlacedSprites,
  placedSprites,
  spriteData,
  game,
}) => {
  if (!spriteData) return null;
  const handleActionTypeChange = (type, enabled) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const existingActions = s.clickAction?.actions || [];
          const actionIndex = existingActions.findIndex((a) => a.type === type);

          let updatedActions;
          if (actionIndex === -1 && enabled) {
            // Add new action
            updatedActions = [
              ...existingActions,
              {
                type,
                enabled: true,
                config: getDefaultConfigForType(type),
              },
            ];
          } else if (!enabled) {
            updatedActions = existingActions.filter((a) => a.type !== type);
          } else {
            updatedActions = existingActions.map((a) =>
              a.type === type ? { ...a, enabled } : a
            );
          }

          return {
            ...s,
            clickAction: {
              enabled: updatedActions.length > 0,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };

  const getDefaultConfigForType = (type) => {
    switch (type) {
      case "add":
        return { framesToAdd: [] };
      case "update":
        return { frameToUpdate: [] };
      case "remove":
        return { framesToDelete: [] };
      default:
        return {};
    }
  };

  const handleConfigChange = (targetId, newFrameName) => {
    if (!game?.playground || !targetId || !newFrameName) return;
    const scene = game.playground;

    const targetSprite = scene.children.list.find(
      (child) => child.getData("id") === Number(targetId)
    );

    if (targetSprite) {
      targetSprite.setTexture("charactersprite", newFrameName);
    }

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const existingActions = s.clickAction?.actions || [];
          const updateAction = existingActions.find(
            (a) => a.type === "update" && a.enabled
          );

          if (!updateAction) return s;

          const updatedActions = existingActions.map((action) => {
            if (action.type === "update" && action.enabled) {
              const existingUpdates = action.config?.frameToUpdate || [];
              const updatedFrameToUpdate = existingUpdates.map((update) =>
                update.targetId === targetId
                  ? {
                      ...update,
                      newFrameName,
                    }
                  : update
              );

              return {
                ...action,
                config: {
                  ...action.config,
                  frameToUpdate: updatedFrameToUpdate,
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
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

          const existingActions = s.clickAction?.actions || [];
          const addActionIndex = existingActions.findIndex(
            (a) => a.type === "add"
          );

          let updatedActions;
          if (addActionIndex === -1) {
            updatedActions = [
              ...existingActions,
              {
                type: "add",
                enabled: true,
                config: {
                  isPlacingFrame: true,
                  framesToAdd: [newFrame],
                },
              },
            ];
          } else {
            updatedActions = existingActions.map((action, index) => {
              if (index === addActionIndex) {
                return {
                  ...action,
                  enabled: true,
                  config: {
                    ...action.config,
                    isPlacingFrame: true,
                    framesToAdd: [
                      ...(action.config.framesToAdd || []),
                      newFrame,
                    ],
                  },
                };
              }
              return action;
            });
          }

          return {
            ...s,
            clickAction: {
              enabled: true,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };
  const handleRemoveFrame = (index) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedActions = s.clickAction.actions.map((action) => {
            if (action.type === "add" && action.enabled) {
              const frameToRemove = action.config.framesToAdd[index];

              // Remove the corresponding sprite from the canvas
              const scene = game?.playground;
              if (scene && frameToRemove) {
                scene.children.list
                  .filter(
                    (child) =>
                      child.type === "Sprite" &&
                      child.getData("parentId") === s.id &&
                      child.getData("frameConfig").frameName ===
                        frameToRemove.frameName
                  )
                  .forEach((sprite) => {
                    sprite.destroy();
                  });
              }

              return {
                ...action,
                config: {
                  ...action.config,
                  framesToAdd: action.config.framesToAdd.filter(
                    (_, i) => i !== index
                  ),
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };

  const handleTargetSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const existingActions = s.clickAction?.actions || [];
          const removeAction = existingActions.find((a) => a.type === "remove");
          const updateAction = existingActions.find((a) => a.type === "update");

          if (removeAction?.enabled) {
            const framesToDelete = selectedOptions.map((targetId) => {
              const targetSprite = placedSprites.find(
                (s) => s.id === Number(targetId)
              );
              return {
                targetId,
                frameName: targetSprite.frameName,
                parentId: targetSprite?.parentId,
                fadeOutDuration: 500,
                delay: 0,
                ease: "Linear",
              };
            });

            const updatedActions = existingActions.map((action) =>
              action.type === "remove"
                ? {
                    ...action,
                    config: {
                      ...action.config,
                      framesToDelete,
                    },
                  }
                : action
            );

            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                actions: updatedActions,
              },
            };
          } else if (updateAction?.enabled) {
            const existingUpdates = updateAction.config?.frameToUpdate || [];

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

            const updatedActions = existingActions.map((action) =>
              action.type === "update"
                ? {
                    ...action,
                    config: {
                      ...action.config,
                      targetIds: selectedOptions,
                      frameToUpdate: updatedFrameToUpdate,
                    },
                  }
                : action
            );

            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                actions: updatedActions,
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
          // Find the add action in the actions array
          const updatedActions = s.clickAction.actions.map((action) => {
            if (action.type === "add" && action.enabled) {
              // Handle add elements
              const updatedFrames = action.config.framesToAdd.map(
                (frame, idx) => {
                  if (idx === frameIndex) {
                    const updatedFrame = { ...frame };

                    // Update all properties
                    if (updates.x !== undefined)
                      updatedFrame.x = Number(updates.x);
                    if (updates.y !== undefined)
                      updatedFrame.y = Number(updates.y);
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
                            child.getData("frameConfig").frameName ===
                              frame.frameName
                        )
                        .forEach((sprite) => {
                          if (updates.x !== undefined)
                            sprite.x = Number(updates.x);
                          if (updates.y !== undefined)
                            sprite.y = Number(updates.y);
                          if (updates.scale !== undefined)
                            sprite.setScale(Number(updates.scale));
                          if (updates.rotation !== undefined)
                            sprite.setRotation(
                              (Number(updates.rotation) * Math.PI) / 180
                            );
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
                ...action,
                config: {
                  ...action.config,
                  framesToAdd: updatedFrames,
                },
              };
            } else if (action.type === "update" && action.enabled) {
              const updatedFrameToUpdate = action.config.frameToUpdate.map(
                (frame, idx) => {
                  if (idx === frameIndex) {
                    const updatedFrame = { ...frame };

                    // Update all properties
                    if (updates.x !== undefined)
                      updatedFrame.x = Number(updates.x);
                    if (updates.y !== undefined)
                      updatedFrame.y = Number(updates.y);
                    if (updates.scale !== undefined)
                      updatedFrame.scale = Number(updates.scale);
                    if (updates.rotation !== undefined)
                      updatedFrame.rotation = Number(updates.rotation);
                    if (updates.alpha !== undefined)
                      updatedFrame.alpha = Number(updates.alpha);

                    // Find and update the target sprite in the scene
                    const scene = game?.playground;
                    const targetSprite = scene?.children.list.find(
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
                ...action,
                config: {
                  ...action.config,
                  frameToUpdate: updatedFrameToUpdate,
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };

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
        onComplete: function () {
          if (!frame?.animations?.alpha?.isEnabled) {
            target?.setAlpha(frame.baseProps?.alpha || 1);
          } else {
            this.restart();
          }
        },
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
          // Find and update the add action
          const updatedActions = s.clickAction.actions.map((action) => {
            if (action.type === "add" && action.enabled) {
              const updatedFrames = action.config.framesToAdd.map(
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
                ...action,
                config: {
                  ...action.config,
                  framesToAdd: updatedFrames,
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };

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
          const updatedActions = s.clickAction.actions.map((action) => {
            if (action.type === "update" && action.enabled) {
              const updatedFrameToUpdate = action.config.frameToUpdate.map(
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
                        config: {},
                      };
                    }

                    const updatedFrame = {
                      ...frame,
                      animations: {
                        ...frame.animations,
                        [type]: {
                          ...frame.animations[type],
                          ...updates,
                          config: updates.config
                            ? {
                                ...frame.animations[type].config,
                                ...updates.config,
                              }
                            : frame.animations[type].config,
                        },
                      },
                    };

                    if (
                      targetSprite &&
                      updatedFrame.animations[type].isEnabled
                    ) {
                      // Rest of the animation logic remains the same
                      scene.tweens
                        .getTweensOf(targetSprite)
                        .forEach((tween) => {
                          tween.stop();
                          tween.remove();
                        });

                      const currentConfig =
                        updatedFrame.animations[type].config;
                      const startCommonAnimations = () => {
                        switch (type) {
                          case "scale":
                            scene.tweens.add({
                              targets: targetSprite,
                              scaleX: currentConfig?.scaleX || 1,
                              scaleY: currentConfig?.scaleY || 1,
                              duration: currentConfig?.duration || 1000,
                              repeat:
                                currentConfig?.repeat === undefined
                                  ? -1
                                  : currentConfig.repeat,
                              yoyo: currentConfig?.yoyo || true,
                              ease: currentConfig?.ease || "Linear",
                            });
                            break;
                          case "alpha":
                            scene.tweens.add({
                              targets: targetSprite,
                              alpha: currentConfig?.alpha || 1, // Changed from object to direct value
                              duration: currentConfig?.duration || 1000,
                              repeat: currentConfig?.repeat ?? -1,
                              yoyo: currentConfig?.yoyo ?? true,
                              ease: currentConfig?.ease || "Linear",
                              onComplete: function () {
                                if (!updatedFrame.animations[type].isEnabled) {
                                  targetSprite.setAlpha(
                                    frame.baseProps?.alpha || 1
                                  );
                                }
                              },
                            });
                            break;
                          case "position":
                            const baseX = frame.baseProps?.x || targetSprite.x;
                            const baseY = frame.baseProps?.y || targetSprite.y;
                            scene.tweens.add({
                              targets: targetSprite,
                              x: baseX + (currentConfig?.x || 0) * 100,
                              y: baseY + (currentConfig?.y || 0) * 100,
                              duration: currentConfig?.duration || 1000,
                              repeat: currentConfig?.repeat ?? -1,
                              yoyo: currentConfig?.yoyo ?? true,
                              ease: currentConfig?.ease || "Linear",
                            });
                            break;
                          case "disappear":
                            scene.tweens.add({
                              targets: targetSprite,
                              alpha: 0,
                              duration: currentConfig?.duration || 1000,
                              ease: currentConfig?.ease || "Linear",
                              delay: currentConfig?.delay || 0,
                              onComplete: () => {
                                targetSprite.setVisible(false);
                              },
                            });
                            break;
                        }
                      };

                      if (updatedFrame.animations.slideIn?.isEnabled) {
                        const { direction, distance } =
                          updatedFrame.animations.slideIn.config;
                        const baseX = frame.baseProps?.x || targetSprite.x;
                        const baseY = frame.baseProps?.y || targetSprite.y;

                        let startX = baseX;
                        let startY = baseY;

                        switch (direction) {
                          case "left":
                            startX = baseX - (distance || 0);
                            break;
                          case "right":
                            startX = baseX + (distance || 0);
                            break;
                          case "top":
                            startY = baseY - (distance || 0);
                            break;
                          case "bottom":
                            startY = baseY + (distance || 0);
                            break;
                        }

                        targetSprite.setPosition(startX, startY);
                        scene.tweens.add({
                          targets: targetSprite,
                          x: baseX,
                          y: baseY,
                          duration:
                            updatedFrame.animations.slideIn.config.duration ||
                            1000,
                          ease:
                            updatedFrame.animations.slideIn.config.ease ||
                            "Linear",
                          onComplete: startCommonAnimations,
                        });
                      } else if (updatedFrame.animations.fadeIn?.isEnabled) {
                        targetSprite.setAlpha(0);
                        scene.tweens.add({
                          targets: targetSprite,
                          alpha: 1,
                          duration:
                            updatedFrame.animations.fadeIn.config.duration ||
                            1000,
                          ease:
                            updatedFrame.animations.fadeIn.config.ease ||
                            "Linear",
                          onComplete: startCommonAnimations,
                        });
                      } else {
                        startCommonAnimations();
                      }
                    }

                    return updatedFrame;
                  }
                  return frame;
                }
              );

              return {
                ...action,
                config: {
                  ...action.config,
                  frameToUpdate: updatedFrameToUpdate,
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
            },
          };
        }
        return s;
      })
    );
  };

  const handleUpdateElementProperty = (targetId, property, value) => {
    if (!game?.playground) return;
    const scene = game.playground;

    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const updatedActions = s.clickAction.actions.map((action) => {
            if (action.type === "update" && action.enabled) {
              const updatedFrameToUpdate = action.config.frameToUpdate.map(
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
                          targetSprite.setRotation(
                            (Number(value) * Math.PI) / 180
                          );
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
                ...action,
                config: {
                  ...action.config,
                  frameToUpdate: updatedFrameToUpdate,
                },
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions,
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
            const updatedActions = s.clickAction.actions.map((action) => {
              if (action.type === "update" && action.enabled) {
                return {
                  ...action,
                  config: {
                    ...action.config,
                    frameToUpdate: action.config.frameToUpdate.filter(
                      (update) => update.targetId !== targetId
                    ),
                    targetIds: action.config.targetIds.filter(
                      (id) => id !== targetId
                    ),
                  },
                };
              }
              return action;
            });

            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                actions: updatedActions,
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
    const updateRemoveAction = (action) => {
      if (action.type === "remove" && action.enabled) {
        // Get the target sprite info
        const targetSprite = placedSprites.find(s => s.id === Number(targetId));
        
        return {
          ...action,
          config: {
            ...action.config,
            framesToDelete: (action.config?.framesToDelete || []).filter(
              frame => frame.targetId !== targetId
            ),
          },
        };
      }
      return action;
    };
  
    setPlacedSprites((prev) =>
      prev.map((s) =>
        s.id === sprite.id
          ? {
              ...s,
              clickAction: {
                ...s.clickAction,
                actions: s.clickAction.actions.map(updateRemoveAction),
              },
            }
          : s
      )
    );
  };

  return (
    <div className="">
      <h3 className="font-bold mb-2">Click Actions</h3>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {["add", "update", "remove"].map((actionType) => (
            <label key={actionType} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sprite.clickAction?.actions?.some(
                  (a) => a.type === actionType && a.enabled
                )}
                onChange={(e) =>
                  handleActionTypeChange(actionType, e.target.checked)
                }
              />
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
              Elements
            </label>
          ))}
        </div>

        {sprite.clickAction?.actions?.map(
          (action) =>
            action.enabled && (
              <div key={action.type} className="border-t pt-4">
                {action.type === "add" && (
                  <AddActionPanel
                    action={action}
                    spriteData={spriteData}
                    handleAddFrame={handleAddFrame}
                    sprite={sprite}
                    handleRemoveFrame={handleRemoveFrame}
                    updateFrameProperties={updateFrameProperties}
                    updateFrameAnimation={updateFrameAnimation}
                    game={game}
                    activeTweens={activeTweens}
                    startCommonAnimations={startCommonAnimations}
                  />
                )}
                {action.type === "update" && (
                  <UpdateActionPanel
                    action={action}
                    handleTargetSelect={handleTargetSelect}
                    placedSprites={placedSprites}
                    handleConfigChange={handleConfigChange}
                    spriteData={spriteData}
                    handleDeleteUpdate={handleDeleteUpdate}
                    handleUpdateElementProperty={handleUpdateElementProperty}
                    updateFrameUpdateAnimation={updateFrameUpdateAnimation}
                    game={game}
                  />
                )}
                {action.type === "remove" && (
                  <RemoveActionPanel
                    action={action}
                    handleTargetSelect={handleTargetSelect}
                    placedSprites={placedSprites}
                    handleRemoveDeleteFrame={handleRemoveDeleteFrame}
                  />
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ClickActionPanel;
