import React, { useState } from "react";
import { easingFunctions } from "../../PlayablePlayground/constants";
const SpriteAnimationTabs = ({ sprite, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("general");

  // Helper to update a specific animation type property
  const handleInputChange = (animationType, field, value) => {
    onUpdate({
      ...sprite,
      animations: {
        ...sprite.animations,
        [animationType]: {
          // Use existing settings or fallback to defaults
          ...(sprite.animations?.[animationType] || getDefaultAnimation(animationType, sprite)),
          [field]: value,
        },
      },
    });
  };

  const handleToggleAnimation = (animationType, active) => {
    onUpdate({
      ...sprite,
      animations: {
        ...sprite.animations,
        [animationType]: {
          ...(sprite.animations?.[animationType] || getDefaultAnimation(animationType, sprite)),
          active,
        },
      },
    });
  };

  const getDefaultAnimation = (animationType, sprite) => {
    if (animationType === "position") {
      return {
        active: false,
        destination: { x: 0.4, y: 0.4 },
        duration: 500,
        repeat: -1,
        easing: "Linear",
        yoyo: true,
      };
    }
    if (animationType === "scale") {
      return {
        active: false,
        // Use current sprite scale as starting point
        startScale: sprite.scale,
        destinationScale: sprite.scale,
        duration: 500,
        repeat: -1,
        easing: "Linear",
        yoyo: true,
      };
    }
    if (animationType === "transparency") {
      return {
        active: false,
        start: sprite.transparency,
        destination: 0.5,
        duration: 500,
        repeat: -1,
        easing: "Linear",
        yoyo: true,
      };
    }
    return {};
  };

  const renderGeneral = () => (
    <div>
      <p className="text-sm text-gray-400">
        Select an animation tab above to edit specific parameters.
      </p>
    </div>
  );

  const renderPosition = () => {
    const posAnim = sprite.animations?.position || getDefaultAnimation("position", sprite);
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center mb-4">
          <label className="mr-2 text-sm">Animate Position</label>
          <input
            type="checkbox"
            checked={posAnim.active}
            onChange={(e) => handleToggleAnimation("position", e.target.checked)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Destination X</label>
          <input
            type="number"
            step="0.01"
            value={posAnim.destination.x}
            onChange={(e) =>
              handleInputChange("position", "destination", {
                ...posAnim.destination,
                x: parseFloat(e.target.value),
              })
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Destination Y</label>
          <input
            type="number"
            step="0.01"
            value={posAnim.destination.y}
            onChange={(e) =>
              handleInputChange("position", "destination", {
                ...posAnim.destination,
                y: parseFloat(e.target.value),
              })
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Duration (ms)</label>
          <input
            type="number"
            value={posAnim.duration}
            onChange={(e) =>
              handleInputChange("position", "duration", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Repeat</label>
          <input
            type="number"
            value={posAnim.repeat}
            onChange={(e) =>
              handleInputChange("position", "repeat", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Easing Function</label>
          <select
            value={posAnim.easing}
            onChange={(e) => handleInputChange("position", "easing", e.target.value)}
            className="bg-gray-700 rounded px-3 py-2 w-full"
          >
            {easingFunctions.map((fn) => (
              <option key={fn} value={fn}>
                {fn}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center">
          <label className="mr-2 text-sm">Yoyo</label>
          <input
            type="checkbox"
            checked={posAnim.yoyo}
            onChange={(e) => handleInputChange("position", "yoyo", e.target.checked)}
          />
        </div>
      </div>
    );
  };

  const renderScale = () => {
    const scaleAnim = sprite.animations?.scale || getDefaultAnimation("scale", sprite);
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center mb-4">
          <label className="mr-2 text-sm">Animate Scale</label>
          <input
            type="checkbox"
            checked={scaleAnim.active}
            onChange={(e) => handleToggleAnimation("scale", e.target.checked)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Destination Scale</label>
          <input
            type="number"
            step="0.1"
            value={scaleAnim.destinationScale}
            onChange={(e) =>
              handleInputChange("scale", "destinationScale", parseFloat(e.target.value))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Duration (ms)</label>
          <input
            type="number"
            value={scaleAnim.duration}
            onChange={(e) =>
              handleInputChange("scale", "duration", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Repeat</label>
          <input
            type="number"
            value={scaleAnim.repeat}
            onChange={(e) =>
              handleInputChange("scale", "repeat", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Easing Function</label>
          <select
            value={scaleAnim.easing}
            onChange={(e) => handleInputChange("scale", "easing", e.target.value)}
            className="bg-gray-700 rounded px-3 py-2 w-full"
          >
            {easingFunctions.map((fn) => (
              <option key={fn} value={fn}>
                {fn}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center">
          <label className="mr-2 text-sm">Yoyo</label>
          <input
            type="checkbox"
            checked={scaleAnim.yoyo}
            onChange={(e) => handleInputChange("scale", "yoyo", e.target.checked)}
          />
        </div>
      </div>
    );
  };

  const renderTransparency = () => {
    const tAnim = sprite.animations?.transparency || getDefaultAnimation("transparency", sprite);
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center mb-4">
          <label className="mr-2 text-sm">Animate Transparency</label>
          <input
            type="checkbox"
            checked={tAnim.active}
            onChange={(e) => handleToggleAnimation("transparency", e.target.checked)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Destination Transparency</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={tAnim.destination}
            onChange={(e) =>
              handleInputChange("transparency", "destination", parseFloat(e.target.value))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Duration (ms)</label>
          <input
            type="number"
            value={tAnim.duration}
            onChange={(e) =>
              handleInputChange("transparency", "duration", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Repeat</label>
          <input
            type="number"
            value={tAnim.repeat}
            onChange={(e) =>
              handleInputChange("transparency", "repeat", parseInt(e.target.value, 10))
            }
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Easing Function</label>
          <select
            value={tAnim.easing}
            onChange={(e) => handleInputChange("transparency", "easing", e.target.value)}
            className="bg-gray-700 rounded px-3 py-2 w-full"
          >
            {easingFunctions.map((fn) => (
              <option key={fn} value={fn}>
                {fn}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center">
          <label className="mr-2 text-sm">Yoyo</label>
          <input
            type="checkbox"
            checked={tAnim.yoyo}
            onChange={(e) => handleInputChange("transparency", "yoyo", e.target.checked)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <div className="flex space-x-4 mb-4">
        {["general", "position", "scale", "transparency"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-purple-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === "general" && renderGeneral()}
      {activeTab === "position" && renderPosition()}
      {activeTab === "scale" && renderScale()}
      {activeTab === "transparency" && renderTransparency()}
    </div>
  );
};

export default SpriteAnimationTabs;
