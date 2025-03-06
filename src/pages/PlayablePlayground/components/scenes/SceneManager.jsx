import React from "react";
import SceneTransitionPanel from "./SceneTransitionPanel";
import SceneConnectionPanel from "./SceneConnectionPanel";

const SceneManager = ({
  scenes,
  activeSceneId,
  onSceneSelect,
  onAddScene,
  onDeleteScene,
  onSceneNameChange,
  isOpen,
  onClose,
  handleUpdateTransition,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-80 bg-[#333] rounded-lg shadow-xl z-40 border border-[#444] h-[600px] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">Scenes</h3>
          <button
            onClick={onAddScene}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            + New Scene
          </button>
        </div>

        <div className="space-y-2">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              onClick={() => onSceneSelect(scene.id)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer
                ${scene.id === activeSceneId ? "bg-purple-500" : "bg-[#444]"}
                hover:bg-purple-400 transition-colors`}
            >
              <input
                type="text"
                value={scene.name}
                onChange={(e) => onSceneNameChange(scene.id, e.target.value)}
                className="bg-transparent text-white outline-none flex-1"
                onClick={(e) => e.stopPropagation()}
              />
              {scenes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScene(scene.id);
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* <SceneTransitionPanel
        scenes={scenes}
        activeSceneId={activeSceneId}
        onUpdateTransition={handleUpdateTransition}
      /> */}

      <SceneConnectionPanel
        scenes={scenes}
        activeSceneId={activeSceneId}
        onUpdateTransition={handleUpdateTransition}
      />
    </div>
  );
};

export default SceneManager;
