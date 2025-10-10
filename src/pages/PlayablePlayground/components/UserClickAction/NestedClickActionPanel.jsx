import React, { useRef } from 'react';
import AddActionPanel from './AddActionPanel';
import UpdateActionPanel from './UpdateActionPanel';
import RemoveActionPanel from './RemoveActionPanel';
import { createDefaultAnimations } from '../../Playground';

const NestedClickActionPanel = ({
  frame,
  spriteData,
  game,
  updateFrameAnimation,
  index,
  isNested = false,
  updatePlacedSprites,
  sprite,
  placedSprites 
}) => {
  const activeTweens = useRef([]);

  const handleAddFrame = (frameName) => {
    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          // Find the parent frame's add action that contains our current frame
          const parentAddAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!parentAddAction) return s;

          // Find our current frame in the parent's framesToAdd
          const currentFrameIndex = parentAddAction.config.framesToAdd.findIndex((f, idx) => idx === index);
          if (currentFrameIndex === -1) return s;

          // Check if this frame already exists in the current frame's framesToAdd
          const currentFrame = parentAddAction.config.framesToAdd[currentFrameIndex];
          const existingActions = currentFrame.clickAction?.actions || [];
          const addAction = existingActions.find(a => a.type === 'add');
          
          // Check for duplicate frame
          if (addAction?.config?.framesToAdd?.some(f => f.frameName === frameName)) {
            return s;
          }

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
            clickAction: {
              enabled: false,
              actions: [],
            },
          };

          // Update the nested frame's actions
          let updatedNestedActions;
          const addActionIndex = existingActions.findIndex(a => a.type === 'add');

          if (addActionIndex === -1) {
            updatedNestedActions = [
              ...existingActions,
              {
                type: 'add',
                enabled: true,
                config: {
                  isPlacingFrame: true,
                  framesToAdd: [newFrame],
                  allowNestedClickActions: true,
                },
              },
            ];
          } else {
            updatedNestedActions = existingActions.map((action, idx) => {
              if (idx === addActionIndex) {
                return {
                  ...action,
                  enabled: true,
                  config: {
                    ...action.config,
                    isPlacingFrame: true,
                    framesToAdd: [...(action.config.framesToAdd || []), newFrame],
                    allowNestedClickActions: true,
                  },
                };
              }
              return action;
            });
          }

          // Update the parent's framesToAdd with the updated nested frame
          const updatedFramesToAdd = parentAddAction.config.framesToAdd.map((f, idx) => {
            if (idx === currentFrameIndex) {
              return {
                ...f,
                clickAction: {
                  enabled: true,
                  actions: updatedNestedActions,
                },
              };
            }
            return f;
          });

          // Update the parent sprite's actions
          const updatedActions = s.clickAction.actions.map(action => {
            if (action.type === 'add') {
              return {
                ...action,
                config: {
                  ...action.config,
                  framesToAdd: updatedFramesToAdd,
                },
              };
            }
            return action;
          });

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

  const handleRemoveFrame = (frameIndex) => {
    const addAction = frame.clickAction?.actions?.find(a => a.type === 'add');
    if (!addAction) return;

    const updatedFramesToAdd = addAction.config.framesToAdd.filter((_, idx) => idx !== frameIndex);
    
    const updatedActions = frame.clickAction.actions.map(action => {
      if (action.type === 'add') {
        return {
          ...action,
          config: {
            ...action.config,
            framesToAdd: updatedFramesToAdd
          }
        };
      }
      return action;
    });

    updateFrameAnimation(index, 'clickAction', {
      enabled: true,
      actions: updatedActions
    });
  };

  const updateFrameProperties = (frameIndex, updates) => {
    const addAction = frame.clickAction?.actions?.find(a => a.type === 'add');
    if (!addAction) return;

    const updatedFramesToAdd = addAction.config.framesToAdd.map((frame, idx) => {
      if (idx === frameIndex) {
        return { ...frame, ...updates };
      }
      return frame;
    });

    const updatedActions = frame.clickAction.actions.map(action => {
      if (action.type === 'add') {
        return {
          ...action,
          config: {
            ...action.config,
            framesToAdd: updatedFramesToAdd
          }
        };
      }
      return action;
    });

    updateFrameAnimation(index, 'clickAction', {
      enabled: true,
      actions: updatedActions
    });
  };

  const handleNestedActionTypeChange = (type, enabled) => {
    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          // Find the parent frame's add action
          const addAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!addAction) return s;

          // Update the nested actions within the specific frame
          const updatedFramesToAdd = addAction.config.framesToAdd.map((f, idx) => {
            if (idx === index) {
              const existingActions = f.clickAction?.actions || [];
              const actionIndex = existingActions.findIndex((a) => a.type === type);

              let updatedActions;
              if (actionIndex === -1 && enabled) {
                updatedActions = [
                  ...existingActions,
                  {
                    type,
                    enabled: true,
                    config: {
                      ...getDefaultConfigForType(type),
                      allowNestedClickActions: true,
                    },
                  },
                ];
              } else if (!enabled) {
                updatedActions = existingActions.map((a) =>
                  a.type === type ? { ...a, enabled: false } : a
                );
              } else {
                updatedActions = existingActions.map((a) =>
                  a.type === type ? { ...a, enabled: true } : a
                );
              }

              return {
                ...f,
                clickAction: {
                  enabled: updatedActions.some(a => a.enabled),
                  actions: updatedActions,
                },
              };
            }
            return f;
          });

          // Update the parent sprite's add action
          const updatedActions = s.clickAction.actions.map(action => {
            if (action.type === 'add') {
              return {
                ...action,
                config: {
                  ...action.config,
                  framesToAdd: updatedFramesToAdd
                }
              };
            }
            return action;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: updatedActions
            }
          };
        }
        return s;
      })
    );
  };

  const getDefaultConfigForType = (type) => {
    switch (type) {
      case "add":
        return { 
          isPlacingFrame: true,
          framesToAdd: [],
          allowNestedClickActions: true 
        };
      case "update":
        return { 
          frameToUpdate: [],
          animations: createDefaultAnimations() 
        };
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

    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const parentAddAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!parentAddAction) return s;

          const updatedFramesToAdd = parentAddAction.config.framesToAdd.map((f, idx) => {
            if (idx === index) {
              const updateAction = f.clickAction?.actions?.find(
                (a) => a.type === "update" && a.enabled
              );

              if (!updateAction) return f;

              const updatedActions = f.clickAction.actions.map((action) => {
                if (action.type === "update" && action.enabled) {
                  const existingUpdates = action.config?.frameToUpdate || [];
                  const updatedFrameToUpdate = existingUpdates.map((update) =>
                    update.targetId === targetId
                      ? { ...update, newFrameName }
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
                ...f,
                clickAction: {
                  ...f.clickAction,
                  actions: updatedActions,
                },
              };
            }
            return f;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: s.clickAction.actions.map(action => 
                action.type === 'add' ? {
                  ...action,
                  config: {
                    ...action.config,
                    framesToAdd: updatedFramesToAdd
                  }
                } : action
              )
            }
          };
        }
        return s;
      })
    );
  };

  const handleUpdateElementProperty = (targetId, property, value) => {
    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const parentAddAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!parentAddAction) return s;

          const updatedFramesToAdd = parentAddAction.config.framesToAdd.map((f, idx) => {
            if (idx === index) {
              const updateAction = f.clickAction?.actions?.find(a => a.type === "update");
              if (!updateAction) return f;

              const updatedActions = f.clickAction.actions.map(action => {
                if (action.type === "update") {
                  const existingUpdates = action.config?.frameToUpdate || [];
                  const updatedFrameToUpdate = existingUpdates.map(update =>
                    update.targetId === targetId
                      ? { ...update, [property]: value }
                      : update
                  );

                  return {
                    ...action,
                    config: {
                      ...action.config,
                      frameToUpdate: updatedFrameToUpdate
                    }
                  };
                }
                return action;
              });

              return {
                ...f,
                clickAction: {
                  ...f.clickAction,
                  actions: updatedActions
                }
              };
            }
            return f;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: s.clickAction.actions.map(action =>
                action.type === 'add' ? {
                  ...action,
                  config: {
                    ...action.config,
                    framesToAdd: updatedFramesToAdd
                  }
                } : action
              )
            }
          };
        }
        return s;
      })
    );
  };

  const handleTargetSelect = (targetId, actionType) => {
    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const parentAddAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!parentAddAction) return s;

          const updatedFramesToAdd = parentAddAction.config.framesToAdd.map((f, idx) => {
            if (idx === index) {
              const existingActions = f.clickAction?.actions || [];
              const targetAction = existingActions.find(a => a.type === actionType);

              if (!targetAction) return f;

              const updatedActions = existingActions.map(action => {
                if (action.type === actionType) {
                  const config = action.config || {};
                  const targetConfig = actionType === 'update' 
                    ? { frameToUpdate: [...(config.frameToUpdate || []), { targetId }] }
                    : { framesToDelete: [...(config.framesToDelete || []), { targetId }] };

                  return {
                    ...action,
                    config: {
                      ...config,
                      ...targetConfig
                    }
                  };
                }
                return action;
              });

              return {
                ...f,
                clickAction: {
                  ...f.clickAction,
                  actions: updatedActions
                }
              };
            }
            return f;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: s.clickAction.actions.map(action =>
                action.type === 'add' ? {
                  ...action,
                  config: {
                    ...action.config,
                    framesToAdd: updatedFramesToAdd
                  }
                } : action
              )
            }
          };
        }
        return s;
      })
    );
  };

  const handleDeleteUpdate = (targetId) => {
    updatePlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          const parentAddAction = s.clickAction?.actions?.find(a => a.type === 'add');
          if (!parentAddAction) return s;

          const updatedFramesToAdd = parentAddAction.config.framesToAdd.map((f, idx) => {
            if (idx === index) {
              const updateAction = f.clickAction?.actions?.find(a => a.type === 'update');
              if (!updateAction) return f;

              const updatedActions = f.clickAction.actions.map(action => {
                if (action.type === 'update') {
                  return {
                    ...action,
                    config: {
                      ...action.config,
                      frameToUpdate: action.config.frameToUpdate.filter(
                        update => update.targetId !== targetId
                      )
                    }
                  };
                }
                return action;
              });

              return {
                ...f,
                clickAction: {
                  ...f.clickAction,
                  actions: updatedActions
                }
              };
            }
            return f;
          });

          return {
            ...s,
            clickAction: {
              ...s.clickAction,
              actions: s.clickAction.actions.map(action =>
                action.type === 'add' ? {
                  ...action,
                  config: {
                    ...action.config,
                    framesToAdd: updatedFramesToAdd
                  }
                } : action
              )
            }
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="ml-4 mt-4 border-l-2 pl-4">
      <h4 className="font-semibold mb-2">Nested Click Actions</h4>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {["add", "update", "remove"].map((actionType) => (
            <label key={actionType} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={frame.clickAction?.actions?.some(
                  (a) => a.type === actionType && a.enabled
                )}
                onChange={(e) =>
                  handleNestedActionTypeChange(actionType, e.target.checked)
                }
              />
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Elements
            </label>
          ))}
        </div>

        {frame.clickAction?.actions?.map((action) =>
          action.enabled && (
            <div key={action.type} className="border-t pt-4">
              {action.type === "add" && (
                <AddActionPanel
                  action={action}
                  spriteData={spriteData}
                  game={game}
                  isNested={true}
                  handleAddFrame={handleAddFrame}
                  handleRemoveFrame={handleRemoveFrame}
                  updateFrameProperties={updateFrameProperties}
                  updateFrameAnimation={updateFrameAnimation}
                  activeTweens={activeTweens}
                  startCommonAnimations={() => {}}
                  updatePlacedSprites={updatePlacedSprites}
                  sprite={sprite}
                />
              )}
              {action.type === "update" && (
                <UpdateActionPanel
                  action={action}
                  spriteData={spriteData}
                  game={game}
                  isNested={true}
                  updateFrameUpdateAnimation={(actionIndex, type, config) => {
                    const updatedActions = frame.clickAction.actions.map((a, i) => 
                      a.type === action.type ? { ...a, config } : a
                    );
                    updateFrameAnimation(index, 'clickAction', {
                      enabled: true,
                      actions: updatedActions
                    });
                  }}
                />
              )}
              {action.type === "remove" && (
                <RemoveActionPanel
                  action={action}
                  spriteData={spriteData}
                  isNested={true}
                  handleRemoveDeleteFrame={(targetId) => {
                    const updatedActions = frame.clickAction.actions.map((a) => 
                      a.type === action.type ? {
                        ...a,
                        config: {
                          ...a.config,
                          framesToDelete: a.config.framesToDelete.filter(
                            frame => frame.targetId !== targetId
                          )
                        }
                      } : a
                    );
                    updateFrameAnimation(index, 'clickAction', {
                      enabled: true,
                      actions: updatedActions
                    });
                  }}
                />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default NestedClickActionPanel;
