import {
  ArrowRightLeft,
  Eye,
  MoveHorizontal,
  Pencil,
  Trash,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "1",
    name: "General",
    slug: "general",
    icon: <Wrench size={16} />,
  },
  {
    id: "2",
    name: "Position",
    slug: "position",
    icon: <ArrowRightLeft size={16} />,
  },
  {
    id: "3",
    name: "Scale",
    slug: "scale",
    icon: <MoveHorizontal size={16} />,
  },
  {
    id: "4",
    name: "Transparency",
    slug: "transparency",
    icon: <Eye size={16} />,
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
        return <div>Scale</div>;
      case "transparency":
        return <div>Transparency</div>;
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
            <button className="text-red-500">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="text-red-500" onClick={onDelete}>
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-2 rounded border mr-2 mt-6 ${
              activeTab === tab.slug
                ? "bg-white text-purple-600 border-purple-600"
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
      <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
};

const PositionAnimation = ({ sprite, handleNumberInput, onUpdate }) => {
  return (
    <div className="mt-4 space-y-4">
      {/* Animation Controls */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-medium">Position Animation</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Enable</span>
            <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
              <input
                type="checkbox"
                className="sr-only"
                checked={sprite.animation?.position?.enabled || false}
                onChange={(e) => {
                  onUpdate({
                    ...sprite,
                    animation: {
                      ...sprite.animation,
                      position: {
                        ...sprite.animation?.position,
                        enabled: e.target.checked,
                        destination: sprite.animation?.position
                          ?.destination || {
                          x: sprite.position.x,
                          y: sprite.position.y,
                        },
                        duration: sprite.animation?.position?.duration || 500,
                        repeat: sprite.animation?.position?.repeat || -1,
                        easing: sprite.animation?.position?.easing || "linear",
                        yoyo: sprite.animation?.position?.yoyo || false,
                      },
                    },
                  });
                }}
              />
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                  sprite.animation?.position?.enabled
                    ? "translate-x-6 bg-purple-600"
                    : "bg-white"
                }`}
              />
            </div>
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
              <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={sprite.animation.position.yoyo}
                  onChange={(e) => {
                    onUpdate({
                      ...sprite,
                      animation: {
                        ...sprite.animation,
                        position: {
                          ...sprite.animation.position,
                          yoyo: e.target.checked,
                        },
                      },
                    });
                  }}
                />
                <div
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                    sprite.animation.position.yoyo
                      ? "translate-x-6 bg-purple-600"
                      : "bg-white"
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpriteEditor;
