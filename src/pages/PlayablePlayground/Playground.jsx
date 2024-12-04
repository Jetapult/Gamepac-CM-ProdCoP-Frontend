import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';

const Playground = () => {
  const gameContainerRef = useRef(null);
  const [game, setGame] = useState(null);
  const [spritesheet, setSpritesheet] = useState(null);
  const [spriteData, setSpriteData] = useState(null);
  const [frameNames, setFrameNames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState('');
  const [placedSprites, setPlacedSprites] = useState([]);

  // Initialize Phaser game
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: {
        create: function() {
          this.game.playground = this;
        }
      }
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, []);

  // Handle spritesheet upload
  const handleSpriteUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSpritesheet(img);
        
        // Load the image into Phaser's texture manager
        if (game && game.playground) {
          const scene = game.playground;
          // First clear any existing texture
          if (scene.textures.exists('charactersprite')) {
            scene.textures.remove('charactersprite');
          }
          // Add the spritesheet with frame data
          scene.textures.addImage('charactersprite', img);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle JSON upload
  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        setSpriteData(jsonData);
        const names = Object.keys(jsonData.frames);
        setFrameNames(names);
        setSelectedFrame(names[0]);

        // Add frame data to Phaser texture
        if (game && game.playground && spritesheet) {
          const scene = game.playground;
          Object.entries(jsonData.frames).forEach(([key, frame]) => {
            scene.textures.get('charactersprite').add(key, 0, 
              frame.frame.x, 
              frame.frame.y, 
              frame.frame.w, 
              frame.frame.h
            );
          });
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  // Add frame preview component
  const FramePreview = ({ frameName }) => {
    const previewRef = useRef(null);

    useEffect(() => {
      if (!previewRef.current || !spriteData || !spritesheet || !frameName) return;

      const canvas = previewRef.current;
      const ctx = canvas.getContext('2d');
      const frameData = spriteData.frames[frameName];

      if (!frameData) return;

      canvas.width = frameData.frame.w;
      canvas.height = frameData.frame.h;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        spritesheet,
        frameData.frame.x,
        frameData.frame.y,
        frameData.frame.w,
        frameData.frame.h,
        0,
        0,
        frameData.frame.w,
        frameData.frame.h
      );
    }, [frameName, spriteData, spritesheet]);

    return <canvas ref={previewRef} className="max-w-full" />;
  };

  // Handle sprite placement
  const handleCanvasClick = (e) => {
    if (!game || !spritesheet || !selectedFrame) return;

    const scene = game.playground;
    const rect = e.target.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (1920 / rect.width);
    const y = (e.clientY - rect.top) * (1080 / rect.height);

    const sprite = scene.add.sprite(x, y, 'charactersprite', selectedFrame)
      .setOrigin(0, 0);

    const newSprite = {
      id: Date.now(),
      frameName: selectedFrame,
      x,
      y,
      scale: 1,
      phaserSprite: sprite
    };

    setPlacedSprites(prev => [...prev, newSprite]);
  };

  // Update sprite position
  const updateSpritePosition = (id, newX, newY) => {
    setPlacedSprites(prev => prev.map(sprite => {
      if (sprite.id === id) {
        sprite.phaserSprite.setPosition(Number(newX), Number(newY));
        return {
          ...sprite,
          x: Number(newX),
          y: Number(newY)
        };
      }
      return sprite;
    }));
  };

  // Update sprite scale
  const updateSpriteScale = (id, newScale) => {
    setPlacedSprites(prev => prev.map(sprite => {
      if (sprite.id === id) {
        sprite.phaserSprite.setScale(Number(newScale));
        return {
          ...sprite,
          scale: Number(newScale)
        };
      }
      return sprite;
    }));
  };

  // Delete sprite
  const deleteSprite = useCallback((id) => {
    setPlacedSprites(prev => {
      const spriteToDelete = prev.find(sprite => sprite.id === id);
      if (spriteToDelete?.phaserSprite) {
        spriteToDelete.phaserSprite.destroy();
      }
      return prev.filter(sprite => sprite.id !== id);
    });
  }, []);

  // Add this helper function to generate Phaser code
  const generatePhaserCode = (sprite) => {
    return `this.${sprite.frameName} = this.add
        .sprite(
          ${Math.round(sprite.x)},
          ${Math.round(sprite.y)},
          "spritesheetname",
          "${sprite.frameName}"
        )
        .setOrigin(0, 0)
        .setScale(${sprite.scale})
        .setDepth(0.2);`;
  };

  // Add this function to handle copy
  const handleCopyCode = (sprite) => {
    const code = generatePhaserCode(sprite);
    navigator.clipboard.writeText(code)
      .then(() => {
        // Optional: Add some visual feedback
        // alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
      });
  };

  return (
    <div className="flex w-full h-screen bg-[#1e1e1e] relative overflow-hidden">
      {/* Phaser Game Container */}
      <div 
        ref={gameContainerRef}
        className="flex-1 h-screen mr-[300px] bg-[#2d2d2d] flex items-center justify-center"
        onClick={handleCanvasClick}
      />

      {/* Control Panel - this one should scroll */}
      <div className="w-[300px] bg-[#252525] p-5 border-l border-[#333] fixed right-0 top-0 h-full overflow-y-auto">
        {/* File Inputs */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-4">Assets</h3>
          <div className="mb-4">
            <label className="block text-white mb-2">Spritesheet:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleSpriteUpload}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded hover:border-[#555]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">JSON File:</label>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleJsonUpload}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded hover:border-[#555]"
            />
          </div>
        </div>

        {/* Frame Selection */}
        {frameNames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-medium mb-4">Frame Selection</h3>
            <div className="mb-4">
              <select
                value={selectedFrame}
                onChange={(e) => setSelectedFrame(e.target.value)}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded hover:border-[#555]"
              >
                {frameNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Section */}
            <div className="mb-4">
              <label className="block text-white mb-2">Preview: (Click canvas to place)</label>
              <div className="bg-[#333] border border-[#444] rounded p-2 flex items-center justify-center">
                <FramePreview frameName={selectedFrame} />
              </div>
              {spriteData && selectedFrame && spriteData.frames[selectedFrame] && (
                <div className="mt-2 text-white text-sm">
                  <p>Size: {spriteData.frames[selectedFrame].frame.w} x {spriteData.frames[selectedFrame].frame.h}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placed Sprites */}
        {placedSprites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-medium mb-4">Placed Sprites</h3>
            <div className="space-y-4">
              {[...placedSprites].reverse().map((sprite) => (
                <div 
                  key={sprite.id} 
                  className="bg-[#333] p-3 rounded border border-[#444]"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                      {sprite.frameName}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopyCode(sprite)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm transition-colors"
                      >
                        Copy Code
                      </button>
                      <button 
                        onClick={() => deleteSprite(sprite.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-white text-xs mb-1">X:</label>
                      <input
                        type="number"
                        value={Math.round(sprite.x)}
                        onChange={(e) => updateSpritePosition(sprite.id, e.target.value, sprite.y)}
                        className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-xs mb-1">Y:</label>
                      <input
                        type="number"
                        value={Math.round(sprite.y)}
                        onChange={(e) => updateSpritePosition(sprite.id, sprite.x, e.target.value)}
                        className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      />
                    </div>
                  </div>

                  {/* Scale Control */}
                  <div>
                    <label className="block text-white text-xs mb-1">Scale:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={sprite.scale}
                        onChange={(e) => updateSpriteScale(sprite.id, e.target.value)}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={Number(sprite.scale).toFixed(1)}
                        onChange={(e) => updateSpriteScale(sprite.id, e.target.value)}
                        className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                        min="0.1"
                        max="3"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Code Preview */}
                  {/* <div className="mt-3 p-2 bg-[#222] rounded text-xs font-mono text-gray-300 overflow-x-auto">
                    <pre>{generatePhaserCode(sprite)}</pre>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playground;