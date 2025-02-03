import { Pencil, Trash, ArrowUp, ArrowDown, Edit, Hand } from "lucide-react";
import { Switch } from "@headlessui/react";
import { initialSpriteState, ModificationType } from "../state";
import { useRef } from "react";
import SpriteEditor from "./SpriteEditor";

const SwitchComponent = ({ checked, onChange, label }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${
      checked ? "bg-purple-600" : "bg-gray-700"
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
  >
    <span className="sr-only">{label}</span>
    <span
      className={`${
        checked ? "translate-x-6" : "translate-x-1"
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </Switch>
);

const ModificationControls = ({
  activeTab,
  videoPlayable,
  setVideoPlayable,
}) => {
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  if (
    activeTab?.modificationIndex === undefined ||
    !videoPlayable?.modifications
  ) {
    console.log("Early return - missing props:", {
      modificationIndex: activeTab?.modificationIndex,
      hasModifications: !!videoPlayable?.modifications,
    });
    return null;
  }

  const currentModification =
    videoPlayable.modifications[activeTab.modificationIndex];

  if (!currentModification) {
    console.log("No modification found at index:", activeTab.modificationIndex);
    return null;
  }

  const updateModification = (updates) => {
    setVideoPlayable((prev) => {
      const updatedModifications = [...prev.modifications];
      updatedModifications[activeTab.modificationIndex] = {
        ...updatedModifications[activeTab.modificationIndex],
        ...updates,
      };
      return { ...prev, modifications: updatedModifications };
    });
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateModification({
        backgroundMusic: {
          ...currentModification.backgroundMusic,
          file,
        },
      });
    }
  };

  const handleAudioDelete = () => {
    updateModification({
      backgroundMusic: {
        ...currentModification.backgroundMusic,
        file: null,
      },
    });
  };

  const handleSpriteImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      const newSprite = {
        ...initialSpriteState,
        id: Date.now(),
        file,
        imageUrl,
      };

      updateModification({
        sprites: [...currentModification.sprites, newSprite],
      });
    } catch (error) {
      console.error("Error adding sprite:", error);
    }
  };

  const handleSpriteUpdate = (spriteIndex, updatedSprite) => {
    updateModification({
      sprites: currentModification.sprites.map((sprite, index) =>
        index === spriteIndex ? updatedSprite : sprite
      ),
    });
  };

  const handleSpriteDelete = (spriteIndex) => {
    updateModification({
      sprites: currentModification.sprites.filter(
        (_, index) => index !== spriteIndex
      ),
    });
  };

  const renderTimeControls = () => {
    if (currentModification.type === ModificationType.OVERLAY) {
      return (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Start Time (ms)</label>
            <input
              type="number"
              value={currentModification.startTime}
              onChange={(e) => {
                const newTime = parseInt(e.target.value);
                updateModification({
                  startTime: newTime,
                  time: newTime, // Keep time in sync with startTime for overlays
                });
              }}
              className="bg-gray-700 rounded px-3 py-2 w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2">End Time (ms)</label>
            <input
              type="number"
              value={currentModification.endTime}
              onChange={(e) => {
                updateModification({ endTime: parseInt(e.target.value) });
              }}
              className="bg-gray-700 rounded px-3 py-2 w-full"
              min="0"
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="block mb-2">Time (ms)</label>
        <input
          type="number"
          value={currentModification.time}
          onChange={(e) =>
            updateModification({ time: parseInt(e.target.value) })
          }
          className="bg-gray-700 rounded px-3 py-2 w-full"
          min="0"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 text-white p-4 overflow-y-auto h-[calc(100vh-100px)]">
      {console.log(currentModification, "currentModification")}
      <h2 className="text-2xl font-bold">
        {currentModification.type === ModificationType.BREAK && "Break"}
        {currentModification.type === ModificationType.OVERLAY &&
          "Permanent Overlay"}
        {currentModification.type === ModificationType.END_SCREEN &&
          "End Screen"}
      </h2>

      {renderTimeControls()}

      <div>
        <h3 className="text-xl mb-4">Background music</h3>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
            id="music-upload"
          />
          <div className="flex items-center gap-2">
            <span className="text-purple-500">♪</span>
            <label
              htmlFor="music-upload"
              className="cursor-pointer text-gray-300"
            >
              {currentModification.backgroundMusic.file?.name || "<no audio>"}
            </label>
          </div>
          <div className="flex gap-2">
            <button className="text-purple-500">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="text-red-500" onClick={handleAudioDelete}>
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {currentModification.backgroundMusic.file && (
          <>
            <div className="mt-4">
              <label className="block mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentModification.backgroundMusic.volume}
                onChange={(e) => {
                  updateModification({
                    backgroundMusic: {
                      ...currentModification.backgroundMusic,
                      volume: parseFloat(e.target.value),
                    },
                  });
                }}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-2">Repeat</label>
              <input
                type="number"
                value={currentModification.backgroundMusic.repeat}
                onChange={(e) => {
                  updateModification({
                    backgroundMusic: {
                      ...currentModification.backgroundMusic,
                      repeat: parseInt(e.target.value),
                    },
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>

            {currentModification.backgroundMusic.file &&
              currentModification.type === ModificationType.BREAK && (
                <div className="mt-4 flex items-center justify-between">
                  <span>Stop on Video Resume</span>
                  <SwitchComponent
                    checked={currentModification.stopOnVideoResume}
                    onChange={(checked) => {
                      updateModification({
                        stopOnVideoResume: checked,
                      });
                    }}
                    label="Stop on Video Resume"
                  />
                </div>
              )}
          </>
        )}
      </div>

      {currentModification.type !== ModificationType.END_SCREEN && (
        <div className="flex items-center justify-between">
          <span>Background</span>
          <SwitchComponent
            checked={currentModification.background}
            onChange={(checked) => {
              updateModification({
                background: checked,
              });
            }}
            label="Background"
          />
        </div>
      )}

      {currentModification.background && (
        <div>
          <label className="block mb-2">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentModification.backgroundColor}
              onChange={(e) => {
                updateModification({
                  backgroundColor: e.target.value,
                });
              }}
            />
            <SwitchComponent
              checked={currentModification.relativeToScreenSize}
              onChange={(checked) => {
                updateModification({
                  relativeToScreenSize: checked,
                });
              }}
              label="Relative to Screen Size"
            />
            <span>Relative to Screen Size</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSpriteImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded"
        >
          Add Sprite
        </button>
      </div>

      {currentModification.sprites.map((sprite, spriteIndex) => (
        <SpriteEditor
          key={sprite.id}
          sprite={sprite}
          onUpdate={(updatedSprite) =>
            handleSpriteUpdate(spriteIndex, updatedSprite)
          }
          onDelete={() => handleSpriteDelete(spriteIndex)}
          onMoveUp={() => handleSpriteMoveUp(spriteIndex)}
          onMoveDown={() => handleSpriteMoveDown(spriteIndex)}
        />
      ))}
    </div>
  );
};

export default ModificationControls;
