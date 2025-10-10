import React from 'react';

const SceneTransitionPanel = ({ scenes, activeSceneId, onUpdateTransition }) => {
  const activeScene = scenes.find(scene => scene.id === activeSceneId);
  
  return (
    <div className="mt-4 p-4 bg-[#333] rounded">
      <h3 className="text-white text-sm font-medium mb-2">Scene Transition</h3>
      <div className="flex flex-col gap-2">
        <label className="text-white text-xs">Next Scene</label>
        <select
          className="w-full p-2 bg-[#222] border border-[#444] text-white rounded"
          value={activeScene.nextSceneId || ""}
          onChange={(e) => onUpdateTransition(activeSceneId, e.target.value)}
        >
          <option value="">Select next scene...</option>
          {scenes
            .filter(scene => scene.id !== activeSceneId)
            .map(scene => (
              <option key={scene.id} value={scene.id}>
                {scene.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default SceneTransitionPanel;