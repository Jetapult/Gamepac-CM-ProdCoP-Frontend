import { Pencil, Trash, ArrowUp, ArrowDown, Edit, Hand } from "lucide-react";
import { Switch } from "@headlessui/react";
import { initialSpriteState } from "../state";
import { useState, useRef } from 'react';
import SpriteEditor from "./SpriteEditor";
import { ModificationType } from "../state";

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

const BreakVideoControls = ({ activeTab, videoPlayable, setVideoPlayable }) => {
  const fileInputRef = useRef(null);
  
  if (!activeTab || !videoPlayable || !videoPlayable.modifications) {
    return null;
  }

  const currentBreak = videoPlayable.modifications[activeTab.modificationIndex];
  
  if (!currentBreak || currentBreak.type !== ModificationType.BREAK) {
    return null;
  }

  const handleTimeChange = (newTime) => {
    setVideoPlayable(prev => {
      const updatedModifications = [...prev.modifications];
      updatedModifications[activeTab.modificationIndex] = {
        ...updatedModifications[activeTab.modificationIndex],
        time: parseInt(newTime)
      };
      return { 
        ...prev, 
        modifications: updatedModifications.sort((a, b) => a.time - b.time)
      };
    });
  };

  const updateModification = (updates) => {
    setVideoPlayable(prev => {
      const updatedModifications = [...prev.modifications];
      updatedModifications[activeTab.modificationIndex] = {
        ...updatedModifications[activeTab.modificationIndex],
        ...updates
      };
      return { ...prev, modifications: updatedModifications };
    });
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateModification({
        backgroundMusic: {
          ...currentBreak.backgroundMusic,
          file
        }
      });
    }
  };

  const handleAudioDelete = () => {
    updateModification({
      backgroundMusic: {
        ...currentBreak.backgroundMusic,
        file: null
      }
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
        imageUrl
      };

      updateModification({
        sprites: [...currentBreak.sprites, newSprite]
      });
    } catch (error) {
      console.error('Error adding sprite:', error);
    }
  };

  const handleSpriteUpdate = (spriteIndex, updatedSprite) => {
    updateModification({
      sprites: currentBreak.sprites.map((sprite, index) =>
        index === spriteIndex ? updatedSprite : sprite
      )
    });
  };

  const handleSpriteDelete = (spriteIndex) => {
    updateModification({
      sprites: currentBreak.sprites.filter((_, index) => index !== spriteIndex)
    });
  };

  const handleSpriteMoveUp = (spriteIndex) => {
    if (spriteIndex === 0) return;
    updateModification({
      sprites: [
        ...currentBreak.sprites.slice(0, spriteIndex - 1),
        currentBreak.sprites[spriteIndex],
        currentBreak.sprites[spriteIndex - 1]
      ]
    });
  };

  const handleSpriteMoveDown = (spriteIndex) => {
    if (spriteIndex === currentBreak.sprites.length - 1) return;
    updateModification({
      sprites: [
        ...currentBreak.sprites.slice(0, spriteIndex),
        currentBreak.sprites[spriteIndex + 1],
        currentBreak.sprites[spriteIndex]
      ]
    });
  };

  return (
    <div className="space-y-6 text-white p-4 overflow-y-auto h-[calc(100vh-100px)]">
      <h2 className="text-2xl font-bold">Break</h2>

      <div>
        <label className="block mb-2">Time (ms)</label>
        <input
          type="number"
          value={currentBreak.time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2 w-full"
          min="0"
          step="1"
        />
      </div>

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
              {currentBreak.backgroundMusic.file?.name || "<no audio>"}
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

        {currentBreak.backgroundMusic.file && (
          <>
            <div className="mt-4">
              <label className="block mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentBreak.backgroundMusic.volume}
                onChange={(e) => {
                  updateModification({
                    backgroundMusic: {
                      ...currentBreak.backgroundMusic,
                      volume: parseFloat(e.target.value)
                    }
                  });
                }}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-2">Repeat</label>
              <input
                type="number"
                value={currentBreak.backgroundMusic.repeat}
                onChange={(e) => {
                  updateModification({
                    backgroundMusic: {
                      ...currentBreak.backgroundMusic,
                      repeat: parseInt(e.target.value)
                    }
                  });
                }}
                className="bg-gray-700 rounded px-3 py-2 w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Stop on Video Resume</span>
              <SwitchComponent
                checked={currentBreak.stopOnVideoResume}
                onChange={(checked) => {
                  updateModification({
                    stopOnVideoResume: checked
                  });
                }}
                label="Stop on Video Resume"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span>Background</span>
        <SwitchComponent
          checked={currentBreak.background}
          onChange={(checked) => {
            updateModification({
              background: checked
            });
          }}
          label="Background"
        />
      </div>

      <div>
        <label className="block mb-2">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={currentBreak.backgroundColor}
            onChange={(e) => {
              updateModification({
                backgroundColor: e.target.value
              });
            }}
          />
          <SwitchComponent
            checked={currentBreak.relativeToScreenSize}
            onChange={(checked) => {
              updateModification({
                relativeToScreenSize: checked
              });
            }}
            label="Relative to Screen Size"
          />
          <span>Relative to Screen Size</span>
        </div>
      </div>

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

      {currentBreak.sprites.map((sprite, spriteIndex) => (
        <SpriteEditor
          key={sprite.id}
          sprite={sprite}
          onUpdate={(updatedSprite) => handleSpriteUpdate(spriteIndex, updatedSprite)}
          onDelete={() => handleSpriteDelete(spriteIndex)}
          onMoveUp={() => handleSpriteMoveUp(spriteIndex)}
          onMoveDown={() => handleSpriteMoveDown(spriteIndex)}
        />
      ))}

    </div>
  );
};

export default BreakVideoControls;
