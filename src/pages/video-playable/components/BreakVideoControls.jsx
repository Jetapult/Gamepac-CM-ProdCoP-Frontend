import { Pencil, Trash, ArrowUp, ArrowDown, Edit, Hand } from "lucide-react";
import { Switch } from "@headlessui/react";
import { initialSpriteState } from "../state";
import { useState, useRef } from 'react';
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

const BreakVideoControls = ({ activeTab, videoPlayable, setVideoPlayable }) => {
  const fileInputRef = useRef(null);
  
  // Add null checks and default values
  if (!activeTab || !videoPlayable || !videoPlayable.breaks) {
    return null;
  }

  // Get current break using breakIndex from activeTab
  const currentBreak = videoPlayable.breaks[activeTab.breakIndex];
  
  // Add a guard clause
  if (!currentBreak) {
    console.log('No break found for index:', activeTab.breakIndex);
    return null;
  }

  const handleTimeChange = (newTime) => {
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      updatedBreaks[activeTab.breakIndex] = {
        ...updatedBreaks[activeTab.breakIndex],
        time: parseInt(newTime)
      };
      return { 
        ...prev, 
        breaks: updatedBreaks.sort((a, b) => a.time - b.time) // Sort breaks by time
      };
    });
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPlayable(prev => {
        const updatedBreaks = [...prev.breaks];
        updatedBreaks[activeTab.breakIndex] = {
          ...updatedBreaks[activeTab.breakIndex],
          backgroundMusic: {
            ...updatedBreaks[activeTab.breakIndex].backgroundMusic,
            file
          }
        };
        return { ...prev, breaks: updatedBreaks };
      });
    }
  };

  const handleAudioDelete = () => {
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      updatedBreaks[activeTab.breakIndex] = {
        ...updatedBreaks[activeTab.breakIndex],
        backgroundMusic: {
          ...updatedBreaks[activeTab.breakIndex].backgroundMusic,
          file: null
        }
      };
      return { ...prev, breaks: updatedBreaks };
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

      setVideoPlayable(prev => {
        const updatedBreaks = [...prev.breaks];
        updatedBreaks[activeTab.breakIndex] = {
          ...updatedBreaks[activeTab.breakIndex],
          sprites: [...updatedBreaks[activeTab.breakIndex].sprites, newSprite]
        };
        return { ...prev, breaks: updatedBreaks };
      });
    } catch (error) {
      console.error('Error adding sprite:', error);
    }
  };

  const handleSpriteUpdate = (spriteIndex, updatedSprite) => {
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      updatedBreaks[activeTab.breakIndex] = {
        ...updatedBreaks[activeTab.breakIndex],
        sprites: updatedBreaks[activeTab.breakIndex].sprites.map((sprite, index) =>
          index === spriteIndex ? updatedSprite : sprite
        )
      };
      return { ...prev, breaks: updatedBreaks };
    });
  };

  const handleSpriteDelete = (spriteIndex) => {
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      updatedBreaks[activeTab.breakIndex] = {
        ...updatedBreaks[activeTab.breakIndex],
        sprites: updatedBreaks[activeTab.breakIndex].sprites.filter((_, index) => index !== spriteIndex)
      };
      return { ...prev, breaks: updatedBreaks };
    });
  };

  const handleSpriteMoveUp = (spriteIndex) => {
    if (spriteIndex === 0) return;
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      const sprites = updatedBreaks[activeTab.breakIndex].sprites;
      [sprites[spriteIndex - 1], sprites[spriteIndex]] = [sprites[spriteIndex], sprites[spriteIndex - 1]];
      return { ...prev, breaks: updatedBreaks };
    });
  };

  const handleSpriteMoveDown = (spriteIndex) => {
    const sprites = currentBreak.sprites;
    if (spriteIndex === sprites.length - 1) return;
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      [sprites[spriteIndex], sprites[spriteIndex + 1]] = [sprites[spriteIndex + 1], sprites[spriteIndex]];
      return { ...prev, breaks: updatedBreaks };
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
                  setVideoPlayable(prev => {
                    const updatedBreaks = [...prev.breaks];
                    updatedBreaks[activeTab.breakIndex] = {
                      ...updatedBreaks[activeTab.breakIndex],
                      backgroundMusic: {
                        ...updatedBreaks[activeTab.breakIndex].backgroundMusic,
                        volume: parseFloat(e.target.value)
                      }
                    };
                    return { ...prev, breaks: updatedBreaks };
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
                  setVideoPlayable(prev => {
                    const updatedBreaks = [...prev.breaks];
                    updatedBreaks[activeTab.breakIndex] = {
                      ...updatedBreaks[activeTab.breakIndex],
                      backgroundMusic: {
                        ...updatedBreaks[activeTab.breakIndex].backgroundMusic,
                        repeat: parseInt(e.target.value)
                      }
                    };
                    return { ...prev, breaks: updatedBreaks };
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
                  setVideoPlayable(prev => {
                    const updatedBreaks = [...prev.breaks];
                    updatedBreaks[activeTab.breakIndex] = {
                      ...updatedBreaks[activeTab.breakIndex],
                      stopOnVideoResume: checked
                    };
                    return { ...prev, breaks: updatedBreaks };
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
            setVideoPlayable(prev => {
              const updatedBreaks = [...prev.breaks];
              updatedBreaks[activeTab.breakIndex] = {
                ...updatedBreaks[activeTab.breakIndex],
                background: checked
              };
              return { ...prev, breaks: updatedBreaks };
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
              setVideoPlayable(prev => {
                const updatedBreaks = [...prev.breaks];
                updatedBreaks[activeTab.breakIndex] = {
                  ...updatedBreaks[activeTab.breakIndex],
                  backgroundColor: e.target.value
                };
                return { ...prev, breaks: updatedBreaks };
              });
            }}
          />
          <SwitchComponent
            checked={currentBreak.relativeToScreenSize}
            onChange={(checked) => {
              setVideoPlayable(prev => {
                const updatedBreaks = [...prev.breaks];
                updatedBreaks[activeTab.breakIndex] = {
                  ...updatedBreaks[activeTab.breakIndex],
                  relativeToScreenSize: checked
                };
                return { ...prev, breaks: updatedBreaks };
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
