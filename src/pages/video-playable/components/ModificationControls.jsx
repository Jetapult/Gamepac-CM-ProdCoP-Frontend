import { Pencil, Trash, Palette, X } from "lucide-react";
import { Switch } from "@headlessui/react";
import { initialSpriteState, ModificationType } from "../state";
import { useRef, useState } from "react";
import SpriteEditor from "./SpriteEditor";
import React from "react";
import { SketchPicker } from "react-color";

// Helper function to convert hex color into an RGB object
const hexToRgb = (hex) => {
  // Remove the hash if present
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

export const SwitchComponent = ({ checked, onChange, label }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${
      checked ? "bg-[#b9ff66]" : "bg-gray-700"
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
  handleRemoveTab,
}) => {
  const [activeSpriteId, setActiveSpriteId] = useState(null);
  const audioUploadRef = useRef(null);

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
      // Reset the input value so the same file can be selected again later.
      e.target.value = "";
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
        onClickAction:
          currentModification.type === ModificationType.OVERLAY
            ? "nothing"
            : currentModification.type === ModificationType.BREAK
            ? "resume-video"
            : currentModification.type === ModificationType.END_SCREEN
            ? "open-store-url"
            : "nothing",
      };

      updateModification({
        sprites: [...currentModification.sprites, newSprite],
      });
      setActiveSpriteId(newSprite.id);
      // Reset the input value so the user can select the same image again later.
      e.target.value = "";
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
    setActiveSpriteId(null);
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
                  time: newTime, // Keep time in sync for overlays
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
    <div className="space-y-6 text-white p-4 overflow-y-auto h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentModification.type === ModificationType.BREAK && "Break"}
          {currentModification.type === ModificationType.OVERLAY &&
            "Permanent Overlay"}
          {currentModification.type === ModificationType.END_SCREEN &&
            "End Screen"}
        </h2>
        <button
          onClick={() => handleRemoveTab(activeTab)}
          className="p-2 hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {renderTimeControls()}

      <div>
        <h3 className="text-xl mb-4">Background music</h3>
        <div className="flex items-center gap-4">
          <input
            ref={audioUploadRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
            id="music-upload"
          />
          <div className="flex items-center gap-2">
            <span className="text-[#b9ff66]">♪</span>
            <label
              htmlFor="music-upload"
              className="cursor-pointer text-gray-300"
            >
              {currentModification.backgroundMusic.file?.name || "<no audio>"}
            </label>
          </div>
          <div className="flex gap-2">
            <button className="text-[#b9ff66]" onClick={() => audioUploadRef.current?.click()}>
              <Pencil className="w-4 h-4" />
            </button>
            <button className="text-[#b9ff66]" onClick={handleAudioDelete}>
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
                className="w-full accent-[#b9ff66]"
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

      {currentModification.background && (
        <BackgroundEditor
          currentModification={currentModification}
          updateModification={updateModification}
        />
      )}

      <Sprites
        activeSpriteId={activeSpriteId}
        setActiveSpriteId={setActiveSpriteId}
        currentModification={currentModification}
        handleSpriteImageUpload={handleSpriteImageUpload}
        handleSpriteUpdate={handleSpriteUpdate}
        handleSpriteDelete={handleSpriteDelete}
      />
    </div>
  );
};

const BackgroundEditor = ({ currentModification, updateModification }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  return (
    <div>
      <label
        className="block mb-2"
        onClick={() => setShowColorPicker(!showColorPicker)}
      >
        Background Color <Palette />
      </label>
      <div className="flex items-center gap-2 relative">
        {showColorPicker && (
          <div className="absolute top-0 left-0 z-10">
            <SketchPicker
              color={{
                ...hexToRgb(currentModification.backgroundColor),
                a: currentModification.transparency,
              }}
              onChange={(color) => {
                updateModification({
                  backgroundColor: color.hex,
                  transparency: color.rgb.a,
                });
              }}
            />
          </div>
        )}
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
  );
};

const Sprites = ({
  activeSpriteId,
  setActiveSpriteId,
  currentModification,
  handleSpriteImageUpload,
  handleSpriteUpdate,
  handleSpriteDelete,
}) => {
  const fileInputRef = useRef(null);
  return (
    <>
      <div className="flex items-center">
        {currentModification.sprites.map((sprite, spriteIndex) => (
          <div
            className="bg-white rounded border border-[#800080] mr-2 cursor-pointer"
            onClick={() => setActiveSpriteId(sprite.id)}
            key={sprite.id}
          >
            <img
              src={sprite.imageUrl}
              className="w-8 h-8 object-cover rounded"
            />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSpriteImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-[#b9ff66] px-4 py-1.5 rounded text-black"
          >
            Add Sprite
          </button>
        </div>
      </div>
      {currentModification.sprites.map(
        (sprite, spriteIndex) =>
          sprite.id === activeSpriteId && (
            <SpriteEditor
              key={sprite.id}
              sprite={sprite}
              onUpdate={(updatedSprite) =>
                handleSpriteUpdate(spriteIndex, updatedSprite)
              }
              onDelete={() => handleSpriteDelete(spriteIndex)}
            />
          )
      )}
    </>
  );
};
export default ModificationControls;
