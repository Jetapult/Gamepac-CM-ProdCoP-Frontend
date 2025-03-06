import { easingFunctions } from "../constants";

const VisibilityAnimationPanel = ({
  config,
  isEnabled,
  onToggle,
  onChange,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white text-lg font-medium">
          TRANSPARENCY ANIMATION
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-white">Off</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={onToggle}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
          <span className="text-white">On</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">Target Alpha:</label>
        <div className="relative">
          <input
            type="number"
            value={config.alpha}
            onChange={(e) => onChange({ alpha: Number(e.target.value) })}
            className="w-full p-2 pl-16 bg-[#333] border border-[#444] text-white rounded"
            step="0.1"
            min="0"
            max="1"
          />
          <span className="absolute left-2 top-2 text-white opacity-50">
            alpha:
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-white text-sm">Duration (ms)</label>
          <input
            type="number"
            value={config.duration}
            onChange={(e) => onChange({ duration: Number(e.target.value) })}
            className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            step="100"
          />
        </div>
        <div>
          <label className="text-white text-sm">Repeat (-1 = ∞)</label>
          <input
            type="number"
            value={config.repeat}
            onChange={(e) => onChange({ repeat: Number(e.target.value) })}
            className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-white text-sm">Easing Function</label>
          <select
            value={config.ease}
            onChange={(e) => onChange({ ease: e.target.value })}
            className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
          >
            {easingFunctions.map((ease) => (
              <option key={ease} value={ease}>
                {ease}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2">
            <span className="text-white text-sm">Yoyo</span>
            <input
              type="checkbox"
              checked={config.yoyo}
              onChange={(e) => onChange({ yoyo: e.target.checked })}
              className="form-checkbox text-purple-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
export default VisibilityAnimationPanel;
