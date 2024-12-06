import { easingFunctions } from "../constants";

const PositionAnimationPanel = ({ config, isEnabled, onToggle, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white text-lg font-medium">POSITION ANIMATION</h4>
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

      <div className="mb-6">
        <label className="block text-white text-xl mb-3">Destination</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <div className="relative bg-[#444] rounded group">
              <input
                type="number"
                value={config.x}
                onChange={(e) => onChange({ x: Number(e.target.value) })}
                className="w-full p-3 pl-12 bg-transparent text-white rounded appearance-none"
                step="0.1"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg">
                x:
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="relative bg-[#444] rounded group">
              <input
                type="number"
                value={config.y}
                onChange={(e) => onChange({ y: Number(e.target.value) })}
                className="w-full p-3 pl-12 bg-transparent text-white rounded appearance-none"
                step="0.1"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg">
                y:
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-white text-xl mb-3">Duration</label>
          <div className="relative bg-[#444] rounded group">
            <input
              type="number"
              value={config.duration}
              onChange={(e) => onChange({ duration: Number(e.target.value) })}
              className="w-full p-3 pr-12 bg-transparent text-white rounded appearance-none"
              step="100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-50">
              ms
            </span>
          </div>
        </div>
        <div>
          <label className="block text-white text-xl mb-3">Repeat</label>
          <div className="relative bg-[#444] rounded group">
            <input
              type="number"
              value={config.repeat}
              onChange={(e) => onChange({ repeat: Number(e.target.value) })}
              className="w-full p-3 bg-transparent text-white rounded appearance-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-xl mb-3">
            Easing Function
          </label>
          <div className="relative bg-[#444] rounded">
            <select
              value={config.ease}
              onChange={(e) => onChange({ ease: e.target.value })}
              className="w-full p-3 bg-transparent text-white rounded"
            >
              {easingFunctions.map((ease) => (
                <option key={ease} value={ease}>
                  {ease}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3">
            <span className="text-white text-xl">Yoyo</span>
            <div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                config.yoyo ? "bg-purple-600" : "bg-[#444]"
              }`}
              onClick={() => onChange({ yoyo: !config.yoyo })}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  config.yoyo ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PositionAnimationPanel;
