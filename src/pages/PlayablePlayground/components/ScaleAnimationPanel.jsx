import { easingFunctions } from "../constants";

const ScaleAnimationPanel = ({ config, isEnabled, onToggle, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white text-lg font-medium">SCALE ANIMATION</h4>
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

      <div className="space-y-4">
        <div>
          <label className="text-white text-sm mb-2">Scale Factor</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={config.scaleX}
                onChange={(e) => onChange({ scaleX: Number(e.target.value) })}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
                step="0.1"
              />
              <span className="absolute left-2 top-2 text-white opacity-50">
                w:
              </span>
            </div>
            <button
              className="px-2 bg-purple-500 rounded"
              onClick={() => onChange({ scaleY: config.scaleX })}
            >
              ⇋
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                value={config.scaleY}
                onChange={(e) => onChange({ scaleY: Number(e.target.value) })}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
                step="0.1"
              />
              <span className="absolute left-2 top-2 text-white opacity-50">
                h:
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm">Duration</label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => onChange({ duration: Number(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              step="100"
            />
          </div>
          <div>
            <label className="text-white text-sm">Repeat</label>
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
            <label className="text-white text-sm">Easing</label>
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
    </div>
  );
};

export default ScaleAnimationPanel;
