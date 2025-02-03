import { ArrowUp, ArrowDown, Edit, Trash, Upload } from "lucide-react";
import SpriteAnimationTabs from "./SpriteAnimationTabs";

const SpriteEditor = ({ sprite, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const handleNumberInput = (property, value, isNested = false, nestedProperty = '') => {
    if (isNested) {
      if (property === 'position') {
        // Clamp position values between 0 and 1
        const clampedValue = Math.max(0, Math.min(1, parseFloat(value) || 0));
        onUpdate({
          ...sprite,
          [property]: {
            ...sprite[property],
            [nestedProperty]: clampedValue
          }
        });
      } else {
        onUpdate({
          ...sprite,
          [property]: {
            ...sprite[property],
            [nestedProperty]: parseFloat(value) || 0
          }
        });
      }
    } else {
      onUpdate({
        ...sprite,
        [property]: parseFloat(value) || 0
      });
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
          <button className="text-purple-500" onClick={onMoveUp}>
            <ArrowUp className="w-4 h-4" />
          </button>
          <button className="text-purple-500" onClick={onMoveDown}>
            <ArrowDown className="w-4 h-4" />
          </button>
          <button className="text-red-500" onClick={onDelete}>
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                onChange={(e) => handleNumberInput('position', e.target.value, true, 'x')}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Y</label>
              <input
                type="number"
                step="0.01"
                value={sprite.position.y}
                onChange={(e) => handleNumberInput('position', e.target.value, true, 'y')}
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
            onChange={(e) => handleNumberInput('scale', e.target.value)}
            className="bg-gray-700 rounded px-3 py-2 w-full"
          />
        </div>

        {/* Rotation Control */}
        <div>
          <label className="block mb-2">Rotation (degrees)</label>
          <input
            type="number"
            value={sprite.rotation}
            onChange={(e) => handleNumberInput('rotation', e.target.value)}
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
                onChange={(e) => handleNumberInput('anchor', e.target.value, true, 'x')}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Y</label>
              <input
                type="number"
                step="0.1"
                value={sprite.anchor.y}
                onChange={(e) => handleNumberInput('anchor', e.target.value, true, 'y')}
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
            onChange={(e) => handleNumberInput('transparency', e.target.value)}
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
              onChange={(e) => onUpdate({
                ...sprite,
                positionRelativeToScreen: e.target.checked
              })}
            />
            <div
              className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                sprite.positionRelativeToScreen ? 'translate-x-6 bg-purple-600' : 'bg-white'
              }`}
            />
          </div>
        </div>

        {/* Scale Type Selector */}
        {/* <div>
          <label className="block mb-2">Scale Type</label>
          <select
            value={sprite.scaleType}
            onChange={(e) => onUpdate({
              ...sprite,
              scaleType: e.target.value
            })}
            className="bg-gray-700 rounded px-3 py-2 w-full"
          >
            <option value="Screen Short Side">Screen Short Side</option>
            <option value="Screen Long Side">Screen Long Side</option>
            <option value="Relative To Sprite">Relative To Sprite</option>
          </select>
        </div> */}
      </div>
    </div>
    <SpriteAnimationTabs
        sprite={sprite}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default SpriteEditor;