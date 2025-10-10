import React from 'react';

const TextPanel = ({ text, updateText }) => {
  return (
    <div className="mb-4">
      <h3 className="text-white text-lg font-medium mb-4">Text Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Content:</label>
          <textarea
            value={text.content}
            onChange={(e) => updateText({ content: e.target.value })}
            className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">Font Family:</label>
            <select
              value={text.fontFamily}
              onChange={(e) => updateText({ fontFamily: e.target.value })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Font Weight:</label>
            <select
              value={text.fontWeight}
              onChange={(e) => updateText({ fontWeight: e.target.value })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Light</option>
              <option value="bolder">Bolder</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">Font Size:</label>
            <input
              type="number"
              value={text.fontSize}
              onChange={(e) => updateText({ fontSize: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              min="8"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Text Align:</label>
            <select
              value={text.align}
              onChange={(e) => updateText({ align: e.target.value })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Color:</label>
          <input
            type="color"
            value={text.color}
            onChange={(e) => updateText({ color: e.target.value })}
            className="w-full p-2 bg-[#333] border border-[#444] rounded h-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">X Position:</label>
            <input
              type="number"
              value={text.x}
              onChange={(e) => updateText({ x: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Y Position:</label>
            <input
              type="number"
              value={text.y}
              onChange={(e) => updateText({ y: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={text.persistent}
                onChange={(e) => updateText({ persistent: e.target.checked })}
                className="form-checkbox"
              />
              <span className="text-white">Keep Visible</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2">Sequence Number:</label>
            <input
              type="number"
              value={text.sequence || 0}
              onChange={(e) => updateText({ sequence: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Display Duration (ms):</label>
            <input
              type="number"
              value={text.displayDuration || 2000}
              onChange={(e) => updateText({ displayDuration: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              min="0"
              step="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;