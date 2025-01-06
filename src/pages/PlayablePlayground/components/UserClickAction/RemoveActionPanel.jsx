const RemoveActionPanel = ({ action, handleTargetSelect, placedSprites, handleRemoveDeleteFrame }) => {
  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2">Select Elements to Remove</label>
        <select
          multiple
          className="w-full p-2 border rounded bg-[#222] text-white border-[#444]"
          onChange={(e) => handleTargetSelect(e)}
          value={
            action?.config?.framesToDelete?.map(
              (f) => f.targetId
            ) || []
          }
        >
          {placedSprites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.frameName}
            </option>
          ))}
        </select>
      </div>

      {action?.config?.framesToDelete?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2 text-white">Elements to Remove:</h4>
          <div className="space-y-2">
            {action.config.framesToDelete.map((frame) => {
              const targetSprite = placedSprites.find(
                (s) => s.id === Number(frame.targetId)
              );
              if (!targetSprite) return null;

              return (
                <div
                  key={frame.targetId}
                  className="flex justify-between items-center p-2 bg-[#333] rounded"
                >
                  <span className="text-white">{frame.frameName}</span>
                  <button
                    onClick={() => handleRemoveDeleteFrame(frame.targetId)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveActionPanel;
