import {
  ArrowRightLeft,
  Eye,
  MoveHorizontal,
  Pencil,
  Trash,
  Wrench,
} from "lucide-react";
import { useState, useRef } from "react";
import { SwitchComponent } from "./ModificationControls";

const tabs = [
  {
    id: "1",
    name: "General",
    slug: "general",
    icon: <Wrench size={14} />,
  },
  {
    id: "2",
    name: "Position",
    slug: "position",
    icon: <ArrowRightLeft size={14} />,
  },
  {
    id: "3",
    name: "Scale",
    slug: "scale",
    icon: <MoveHorizontal size={14} />,
  },
  {
    id: "4",
    name: "Transparency",
    slug: "transparency",
    icon: <Eye size={14} />,
  },
];

const SpriteEditor = ({ sprite, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState("general");
  const handleNumberInput = (
    property,
    value,
    isNested = false,
    nestedProperty = ""
  ) => {
    if (isNested) {
      if (property === "position") {
        // Clamp position values between 0 and 1
        const clampedValue = Math.max(0, Math.min(1, parseFloat(value) || 0));
        onUpdate({
          ...sprite,
          [property]: {
            ...sprite[property],
            [nestedProperty]: clampedValue,
          },
        });
      } else {
        onUpdate({
          ...sprite,
          [property]: {
            ...sprite[property],
            [nestedProperty]: parseFloat(value) || 0,
          },
        });
      }
    } else {
      onUpdate({
        ...sprite,
        [property]: parseFloat(value) || 0,
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralSpriteSettings
            sprite={sprite}
            handleNumberInput={handleNumberInput}
            onUpdate={onUpdate}
          />
        );
      case "position":
        return (
          <PositionAnimation
            sprite={sprite}
            handleNumberInput={handleNumberInput}
            onUpdate={onUpdate}
          />
        );
      case "scale":
        return (
          <ScaleAnimation
            sprite={sprite}
            handleNumberInput={handleNumberInput}
            onUpdate={onUpdate}
          />
        );
      case "transparency":
        return (
          <TransparencyAnimation
            sprite={sprite}
            handleNumberInput={handleNumberInput}
            onUpdate={onUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mt-4 border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={sprite.imageUrl}
              alt="sprite"
              className="w-8 h-8 object-cover rounded"
            />
            <span className="text-gray-300">{sprite.file?.name}</span>
          </div>
          <div className="flex gap-2">
            <button className="text-[#b9ff66]">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="text-[#b9ff66]" onClick={onDelete}>
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-2 py-1 rounded border mr-2 mt-6 ${
              activeTab === tab.slug
                ? "bg-black text-[#b9ff66] border-[#b9ff66]"
                : "border-white"
            }`}
            onClick={() => setActiveTab(tab.slug)}
          >
            {tab.icon}
          </button>
        ))}

        {renderTabContent()}
      </div>
    </>
  );
};

const GeneralSpriteSettings = ({ sprite, handleNumberInput, onUpdate }) => {
  return (
    <div className="mt-4 space-y-4">
      {/* Position Controls */}
      <div>
        <label className="block mb-2">Action</label>
        <select
          value={sprite.onClickAction}
          onChange={(e) =>
            onUpdate({ ...sprite, onClickAction: e.target.value })
          }
          className="bg-gray-700 rounded px-3 py-2"
        >
          <option value="nothing">Nothing</option>
          <option value="resume-video">Resume Video</option>
          <option value="open-store-url">Open Store URL</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Position</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">X</label>
            <input
              type="number"
              step="0.01"
              value={sprite.position.x}
              onChange={(e) =>
                handleNumberInput("position", e.target.value, true, "x")
              }
              className="bg-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Y</label>
            <input
              type="number"
              step="0.01"
              value={sprite.position.y}
              onChange={(e) =>
                handleNumberInput("position", e.target.value, true, "y")
              }
              className="bg-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Scale Control */}
      <div>
        <label className="block mb-2">Scale</label>
        <input
          type="number"
          step="0.1"
          value={sprite.scale}
          onChange={(e) => handleNumberInput("scale", e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full"
          min={0}
        />
      </div>

      {/* Rotation Control */}
      <div>
        <label className="block mb-2">Rotation (degrees)</label>
        <input
          type="number"
          value={sprite.rotation}
          onChange={(e) => handleNumberInput("rotation", e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full"
          min={0}
        />
      </div>

      {/* Anchor Point Controls */}
      <div>
        <label className="block mb-2">Anchor</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">X</label>
            <input
              type="number"
              step="0.1"
              value={sprite.anchor.x}
              onChange={(e) =>
                handleNumberInput("anchor", e.target.value, true, "x")
              }
              className="bg-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Y</label>
            <input
              type="number"
              step="0.1"
              value={sprite.anchor.y}
              onChange={(e) =>
                handleNumberInput("anchor", e.target.value, true, "y")
              }
              className="bg-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Transparency Control */}
      <div>
        <label className="block mb-2">Transparency</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={sprite.transparency}
          onChange={(e) => handleNumberInput("transparency", e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full"
        />
      </div>

      {/* Position Relative to Screen Toggle */}
      {/* <div className="flex items-center justify-between">
        <span>Position Relative to Screen</span>
        <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
          <input
            type="checkbox"
            className="sr-only"
            checked={sprite.positionRelativeToScreen}
            onChange={(e) =>
              onUpdate({
                ...sprite,
                positionRelativeToScreen: e.target.checked,
              })
            }
          />
          <div
            className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
              sprite.positionRelativeToScreen
                ? "translate-x-6 bg-purple-600"
                : "bg-white"
            }`}
          />
        </div>
      </div> */}
    </div>
  );
};

const PositionAnimation = ({ sprite, handleNumberInput, onUpdate }) => {
  const startTimeRef = useRef(Date.now());

  return (
    <div className="mt-4 space-y-4">
      {/* Animation Controls */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-medium">Position Animation</label>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 text-xs rounded border border-white ${
                sprite.animation?.position?.enabled ? "bg-[#b9ff66] text-black border-[#b9ff66]" : "text-[#b9ff66]"
              }`}
              onClick={() => {
                const positionAnimation = {
                  enabled:
                    sprite.animation?.position?.enabled === true ? false : true,
                  destination: {
                    x: 0.4,
                    y: 0.4,
                  },
                  duration: 500,
                  repeat: -1,
                  easing: "linear",
                  yoyo: true,
                };

                const updatedSprite = {
                  ...sprite,
                  animation: {
                    ...sprite.animation,
                    position: positionAnimation,
                  },
                };

                onUpdate(updatedSprite);
              }}
            >
              {sprite.animation?.position?.enabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {sprite.animation?.position?.enabled && (
          <div className="space-y-4">
            {/* Destination Controls */}
            <div>
              <label className="block mb-2">Destination</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">X</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sprite.animation.position.destination.x}
                    onChange={(e) => {
                      onUpdate({
                        ...sprite,
                        animation: {
                          ...sprite.animation,
                          position: {
                            ...sprite.animation.position,
                            destination: {
                              ...sprite.animation.position.destination,
                              x: parseFloat(e.target.value) || 0,
                            },
                          },
                        },
                      });
                    }}
                    className="bg-gray-700 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Y</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sprite.animation.position.destination.y}
                    onChange={(e) => {
                      onUpdate({
                        ...sprite,
                        animation: {
                          ...sprite.animation,
                          position: {
                            ...sprite.animation.position,
                            destination: {
                              ...sprite.animation.position.destination,
                              y: parseFloat(e.target.value) || 0,
                            },
                          },
                        },
                      });
                    }}
                    className="bg-gray-700 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Duration Control */}
            <div>
              <label className="block mb-2">Duration (ms)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={sprite.animation.position.duration}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      position: {
                        ...sprite.animation.position,
                        duration: parseInt(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>

            {/* Repeat Control */}
            <div>
              <label className="block mb-2">Repeat (-1 for infinite)</label>
              <input
                type="number"
                value={sprite.animation.position.repeat}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      position: {
                        ...sprite.animation.position,
                        repeat: parseInt(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
                min={-1}
              />
            </div>

            {/* Easing Function */}
            <div>
              <label className="block mb-2">Easing Function</label>
              <select
                value={sprite.animation.position.easing}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      position: {
                        ...sprite.animation.position,
                        easing: e.target.value,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              >
                <option value="linear">Linear</option>
                <option value="easeInQuad">Ease In Quad</option>
                <option value="easeOutQuad">Ease Out Quad</option>
                <option value="easeInOutQuad">Ease In Out Quad</option>
                <option value="easeInCubic">Ease In Cubic</option>
                <option value="easeOutCubic">Ease Out Cubic</option>
                <option value="easeInOutCubic">Ease In Out Cubic</option>
              </select>
            </div>

            {/* Yoyo Effect Toggle */}
            <div className="flex items-center justify-between">
              <span>Yoyo Effect</span>
              <SwitchComponent
                checked={sprite.animation.position.yoyo}
                onChange={(checked) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      position: {
                        ...sprite.animation.position,
                        yoyo: checked,
                      },
                    },
                  });
                }}
                label="Background"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScaleAnimation = ({ sprite, handleNumberInput, onUpdate }) => {
  return (
    <div className="mt-4 space-y-4">
      {/* Animation Controls */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-medium">Scale Animation</label>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 text-xs rounded text-[#b9ff66] border border-white ${
                sprite.animation?.scale?.enabled ? "bg-white" : ""
              }`}
              onClick={() => {
                const scaleAnimation = {
                  enabled:
                    sprite.animation?.scale?.enabled === true ? false : true,
                  destination: {
                    w: sprite.scale * 2,
                    h: sprite.scale * 2,
                  },
                  duration: 500,
                  repeat: -1,
                  easing: "linear",
                  yoyo: true,
                };

                const updatedSprite = {
                  ...sprite,
                  animation: {
                    ...sprite.animation,
                    scale: scaleAnimation,
                  },
                };

                onUpdate(updatedSprite);
              }}
            >
              {sprite.animation?.scale?.enabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {sprite.animation?.scale?.enabled && (
          <div className="space-y-4">
            {/* Scale Factor Controls */}
            <div>
              <label className="block mb-2">Scale Factor</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Width</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sprite.animation.scale.destination.w}
                    onChange={(e) => {
                      onUpdate({
                        ...sprite,
                        animation: {
                          ...sprite.animation,
                          scale: {
                            ...sprite.animation.scale,
                            destination: {
                              ...sprite.animation.scale.destination,
                              w: parseFloat(e.target.value) || 0,
                            },
                          },
                        },
                      });
                    }}
                    className="bg-gray-700 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Height</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sprite.animation.scale.destination.h}
                    onChange={(e) => {
                      onUpdate({
                        ...sprite,
                        animation: {
                          ...sprite.animation,
                          scale: {
                            ...sprite.animation.scale,
                            destination: {
                              ...sprite.animation.scale.destination,
                              h: parseFloat(e.target.value) || 0,
                            },
                          },
                        },
                      });
                    }}
                    className="bg-gray-700 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Duration Control */}
            <div>
              <label className="block mb-2">Duration (ms)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={sprite.animation.scale.duration}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      scale: {
                        ...sprite.animation.scale,
                        duration: parseInt(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>

            {/* Repeat Control */}
            <div>
              <label className="block mb-2">Repeat (-1 for infinite)</label>
              <input
                type="number"
                value={sprite.animation.scale.repeat}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      scale: {
                        ...sprite.animation.scale,
                        repeat: parseInt(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
                min={-1}
              />
            </div>

            {/* Easing Function */}
            <div>
              <label className="block mb-2">Easing Function</label>
              <select
                value={sprite.animation.scale.easing}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      scale: {
                        ...sprite.animation.scale,
                        easing: e.target.value,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              >
                <option value="linear">Linear</option>
                <option value="easeInQuad">Ease In Quad</option>
                <option value="easeOutQuad">Ease Out Quad</option>
                <option value="easeInOutQuad">Ease In Out Quad</option>
                <option value="easeInCubic">Ease In Cubic</option>
                <option value="easeOutCubic">Ease Out Cubic</option>
                <option value="easeInOutCubic">Ease In Out Cubic</option>
              </select>
            </div>

            {/* Yoyo Effect Toggle */}
            <div className="flex items-center justify-between">
              <span>Yoyo Effect</span>
              <SwitchComponent
                checked={sprite.animation.scale.yoyo}
                onChange={(checked) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      scale: {
                        ...sprite.animation.scale,
                        yoyo: checked,
                      },
                    },
                  });
                }}
                label="Background"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TransparencyAnimation = ({ sprite, handleNumberInput, onUpdate }) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-medium">Transparency Animation</label>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 text-xs rounded text-[#b9ff66] border border-white ${
                sprite.animation?.transparency?.enabled ? "bg-white" : ""
              }`}
              onClick={() => {
                const transparencyAnimation = {
                  enabled:
                    sprite.animation?.transparency?.enabled === true
                      ? false
                      : true,
                  destination: 0.5,
                  duration: 500,
                  repeat: -1,
                  easing: "linear",
                  yoyo: true,
                };

                onUpdate({
                  ...sprite,
                  animation: {
                    ...sprite.animation,
                    transparency: transparencyAnimation,
                  },
                });
              }}
            >
              {sprite.animation?.transparency?.enabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {sprite.animation?.transparency?.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Target Alpha (0-1)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={sprite.animation.transparency.destination}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      transparency: {
                        ...sprite.animation.transparency,
                        destination: parseFloat(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-2">Duration (ms)</label>
              <input
                type="number"
                value={sprite.animation.transparency.duration}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      transparency: {
                        ...sprite.animation.transparency,
                        duration: parseInt(e.target.value) || 500,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-2">Repeat (-1 for infinite)</label>
              <input
                type="number"
                value={sprite.animation.transparency.repeat}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      transparency: {
                        ...sprite.animation.transparency,
                        repeat: parseInt(e.target.value) || 0,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
                min={-1}
              />
            </div>

            {/* Easing Function */}
            <div>
              <label className="block mb-2">Easing Function</label>
              <select
                value={sprite.animation.transparency.easing}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      transparency: {
                        ...sprite.animation.transparency,
                        easing: e.target.value,
                      },
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              >
                <option value="linear">Linear</option>
                <option value="easeInQuad">Ease In Quad</option>
                <option value="easeOutQuad">Ease Out Quad</option>
                <option value="easeInOutQuad">Ease In Out Quad</option>
                <option value="easeInCubic">Ease In Cubic</option>
                <option value="easeOutCubic">Ease Out Cubic</option>
                <option value="easeInOutCubic">Ease In Out Cubic</option>
              </select>
            </div>

            {/* Yoyo Effect Toggle */}
            <div className="flex items-center justify-between">
              <span>Yoyo Effect</span>
              <SwitchComponent
                checked={sprite.animation.transparency.yoyo}
                onChange={(checked) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      transparency: {
                        ...sprite.animation.transparency,
                        yoyo: checked,
                      },
                    },
                  });
                }}
                label="Background"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpriteEditor;
