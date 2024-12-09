import { useEffect, useRef, useState, useCallback, useContext } from "react";
import Phaser from "phaser";
import AnimationPanel from "./components/AnimationPanel";

// Create default animation config outside component
const createDefaultAnimations = () => ({
  position: {
    isEnabled: false,
    config: {
      x: 0.4,
      y: 0.4,
      duration: 500,
      repeat: -1,
      ease: "Linear",
      yoyo: true,
    },
  },
  scale: {
    isEnabled: false,
    config: {
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 500,
      repeat: -1,
      ease: "Linear",
      yoyo: true,
    },
  },
  transparency: {
    isEnabled: false,
    config: {
      alpha: 0.5,
      duration: 500,
      repeat: -1,
      ease: "Linear",
      yoyo: true,
    },
  },
  slideIn: {
    isEnabled: false,
    priority: 0,
    config: {
      direction: 'left',
      distance: 100,
      duration: 500,
      ease: 'Power2',
      delay: 0,
    }
  }
});

const Playground = () => {
  const gameContainerRef = useRef(null);
  const [game, setGame] = useState(null);
  const [spritesheet, setSpritesheet] = useState(null);
  const [spriteData, setSpriteData] = useState(null);
  const [frameNames, setFrameNames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState("");
  const [placedSprites, setPlacedSprites] = useState([]);
  const [orientation, setOrientation] = useState('landscape');

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const dimensions = orientation === 'landscape' 
      ? { width: 1920, height: 1080 }
      : { width: 1080, height: 1920 };

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: "#ffffff",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
        create: function () {
          this.game.playground = this;
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, [orientation]);

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'landscape' ? 'portrait' : 'landscape');
  };

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
          if (scene.textures.exists("charactersprite")) {
            scene.textures.remove("charactersprite");
          }
          // Add the spritesheet with frame data
          scene.textures.addImage("charactersprite", img);
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
            scene.textures
              .get("charactersprite")
              .add(
                key,
                0,
                frame.frame.x,
                frame.frame.y,
                frame.frame.w,
                frame.frame.h
              );
          });
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  // Add frame preview component
  const FramePreview = ({ frameName }) => {
    const previewRef = useRef(null);

    useEffect(() => {
      if (!previewRef.current || !spriteData || !spritesheet || !frameName)
        return;

      const canvas = previewRef.current;
      const ctx = canvas.getContext("2d");
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

    const sprite = scene.add
      .sprite(x, y, "charactersprite", selectedFrame)
      .setOrigin(0, 0);

    const newSprite = {
      id: Date.now(),
      frameName: selectedFrame,
      x,
      y,
      scale: 1,
      rotation: 0,
      alpha: 1,
      phaserSprite: sprite,
      animations: createDefaultAnimations(), // Add default animations
    };

    setPlacedSprites((prev) => [...prev, newSprite]);
  };

  // Update sprite position
  const updateSpritePosition = (id, newX, newY) => {
    setPlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          sprite.phaserSprite.setPosition(Number(newX), Number(newY));
          return {
            ...sprite,
            x: Number(newX),
            y: Number(newY),
          };
        }
        return sprite;
      })
    );
  };

  // Update sprite scale
  const updateSpriteScale = (id, newScale) => {
    setPlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          sprite.phaserSprite.setScale(Number(newScale));
          return {
            ...sprite,
            scale: Number(newScale),
          };
        }
        return sprite;
      })
    );
  };

  // Update sprite rotation
  const updateSpriteRotation = (id, newRotation) => {
    setPlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          sprite.phaserSprite.setAngle(Number(newRotation));
          return {
            ...sprite,
            rotation: Number(newRotation),
          };
        }
        return sprite;
      })
    );
  };

  const updateSpriteTransparency = (id, newAlpha) => {
    setPlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          sprite.phaserSprite.setAlpha(Number(newAlpha));
          return {
            ...sprite,
            alpha: Number(newAlpha),
          };
        }
        return sprite;
      })
    );
  };

  const deleteSprite = useCallback((id) => {
    setPlacedSprites((prev) => {
      const spriteToDelete = prev.find((sprite) => sprite.id === id);
      if (spriteToDelete?.phaserSprite) {
        spriteToDelete.phaserSprite.destroy();
      }
      return prev.filter((sprite) => sprite.id !== id);
    });
  }, []);

  // Modify generatePhaserCode to include animations
  const generatePhaserCode = (sprite) => {
    // Base sprite code with all properties
    let code = `// ${sprite.frameName} sprite
const ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")} = this.add
  .sprite(${Math.round(sprite.x)}, ${Math.round(sprite.y)}, 'spritesheetname', '${sprite.frameName}')
  .setOrigin(0, 0)`;

    // Add properties if they're different from defaults
    if (sprite.scale !== 1) {
      code += `\n  .setScale(${sprite.scale})`;
    }
    if (sprite.rotation) {
      code += `\n  .setAngle(${sprite.rotation})`;
    }
    if (sprite.alpha !== 1) {
      code += `\n  .setAlpha(${sprite.alpha})`;
    }
    code += ";";

    // Add animation code if animations are enabled
    if (sprite.animations) {
      // Handle slide-in animation first
      if (sprite.animations.slideIn.isEnabled) {
        const slideConfig = sprite.animations.slideIn.config;
        let initialX, initialY;
        
        // Calculate initial position based on direction
        switch (slideConfig.direction) {
          case 'left':
            initialX = `${Math.round(sprite.x)} - ${slideConfig.distance}`;
            initialY = `${Math.round(sprite.y)}`;
            break;
          case 'right':
            initialX = `${Math.round(sprite.x)} + ${slideConfig.distance}`;
            initialY = `${Math.round(sprite.y)}`;
            break;
          case 'top':
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)} - ${slideConfig.distance}`;
            break;
          case 'bottom':
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)} + ${slideConfig.distance}`;
            break;
          default:
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)}`;
        }

        code += `\n\n// Slide-in animation
// Set initial position
${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")}.setPosition(${initialX}, ${initialY});

// Create slide-in tween with callback for common animations
const slideInTween = this.tweens.add({
  targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
  x: ${Math.round(sprite.x)},
  y: ${Math.round(sprite.y)},
  duration: ${slideConfig.duration},
  ease: '${slideConfig.ease}',
  delay: ${slideConfig.priority * 200}, // Delay based on priority
  onComplete: function() {`;

        // Add common animations inside the onComplete callback
        if (sprite.animations.position.isEnabled) {
          const posConfig = sprite.animations.position.config;
          code += `\n    // Position animation
    this.tweens.add({
      targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
      x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
      y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
      duration: ${posConfig.duration},
      repeat: ${posConfig.repeat},
      yoyo: ${posConfig.yoyo},
      ease: '${posConfig.ease}'
    });`;
        }

        if (sprite.animations.scale.isEnabled) {
          const scaleConfig = sprite.animations.scale.config;
          code += `\n    // Scale animation
    this.tweens.add({
      targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
      scaleX: ${scaleConfig.scaleX},
      scaleY: ${scaleConfig.scaleY},
      duration: ${scaleConfig.duration},
      repeat: ${scaleConfig.repeat},
      yoyo: ${scaleConfig.yoyo},
      ease: '${scaleConfig.ease}'
    });`;
        }

        if (sprite.animations.transparency.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `\n    // Transparency animation
    this.tweens.add({
      targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
      alpha: ${alphaConfig.alpha},
      duration: ${alphaConfig.duration},
      repeat: ${alphaConfig.repeat},
      yoyo: ${alphaConfig.yoyo},
      ease: '${alphaConfig.ease}'
    });`;
        }

        code += `\n  }
});`;
      } else {
        // If no slide-in animation, add common animations directly
        if (sprite.animations.position.isEnabled) {
          const posConfig = sprite.animations.position.config;
          code += `\n\n// Position animation
this.tweens.add({
  targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
  x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
  y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
  duration: ${posConfig.duration},
  repeat: ${posConfig.repeat},
  yoyo: ${posConfig.yoyo},
  ease: '${posConfig.ease}'
});`;
        }

        if (sprite.animations.scale.isEnabled) {
          const scaleConfig = sprite.animations.scale.config;
          code += `\n\n// Scale animation
this.tweens.add({
  targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
  scaleX: ${scaleConfig.scaleX},
  scaleY: ${scaleConfig.scaleY},
  duration: ${scaleConfig.duration},
  repeat: ${scaleConfig.repeat},
  yoyo: ${scaleConfig.yoyo},
  ease: '${scaleConfig.ease}'
});`;
        }

        if (sprite.animations.transparency.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `\n\n// Transparency animation
this.tweens.add({
  targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
  alpha: ${alphaConfig.alpha},
  duration: ${alphaConfig.duration},
  repeat: ${alphaConfig.repeat},
  yoyo: ${alphaConfig.yoyo},
  ease: '${alphaConfig.ease}'
});`;
        }
      }
    }

    return code;
  };

  const handleCopyCode = (sprite) => {
    const code = generatePhaserCode(sprite);
    navigator.clipboard.writeText(code).then(() => {
      // Optional: Add some user feedback that code was copied
      console.log("Code copied to clipboard");
    });
  };

  // Add this new function near generatePhaserCode
  const generateAllPhaserCode = (sprites) => {
    const allCode = sprites.map((sprite) => generatePhaserCode(sprite)).join('\n\n');
    return `// All Sprites and Animations\n${allCode}`;
  };

  // Add this new function near handleCopyCode
  const handleCopyAllCode = () => {
    const code = generateAllPhaserCode(placedSprites);
    navigator.clipboard.writeText(code).then(() => {
      console.log("All sprite code copied to clipboard");
    });
  };

  return (
    <div className="flex w-full h-[calc(100vh-55px)] bg-[#1e1e1e] relative">
      <div
        ref={gameContainerRef}
        className="w-[calc(100%-300px)] bg-[#2d2d2d] flex justify-center"
        onClick={handleCanvasClick}
      />

      <div className="w-[300px] bg-[#252525] p-5 border-l border-[#333] h-full overflow-y-auto">
        {/* Add this button at the top of the sidebar */}
        {placedSprites.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleCopyAllCode}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Copy All Sprites Code
            </button>
          </div>
        )}

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

        {frameNames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-medium mb-4">
              Frame Selection
            </h3>
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
            <div className="mb-4">
              <label className="block text-white mb-2">
                Preview: (Click canvas to place)
              </label>
              <div className="bg-[#333] border border-[#444] rounded p-2 flex items-center justify-center">
                <FramePreview frameName={selectedFrame} />
              </div>
              {spriteData &&
                selectedFrame &&
                spriteData.frames[selectedFrame] && (
                  <div className="mt-2 text-white text-sm">
                    <p>
                      Size: {spriteData.frames[selectedFrame].frame.w} x{" "}
                      {spriteData.frames[selectedFrame].frame.h}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {placedSprites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-medium mb-4">
              Placed Sprites
            </h3>
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

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-white text-xs mb-1">
                        X:
                      </label>
                      <input
                        type="number"
                        value={Math.round(sprite.x)}
                        onChange={(e) =>
                          updateSpritePosition(
                            sprite.id,
                            e.target.value,
                            sprite.y
                          )
                        }
                        className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-xs mb-1">
                        Y:
                      </label>
                      <input
                        type="number"
                        value={Math.round(sprite.y)}
                        onChange={(e) =>
                          updateSpritePosition(
                            sprite.id,
                            sprite.x,
                            e.target.value
                          )
                        }
                        className="w-full p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-white text-xs mb-1">
                      Scale:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={sprite.scale}
                        onChange={(e) =>
                          updateSpriteScale(sprite.id, e.target.value)
                        }
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={Number(sprite.scale).toFixed(1)}
                        onChange={(e) =>
                          updateSpriteScale(sprite.id, e.target.value)
                        }
                        className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                        min="0.1"
                        max="3"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-white text-xs mb-1">
                      Rotation:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={sprite.rotation || 0}
                        onChange={(e) =>
                          updateSpriteRotation(sprite.id, e.target.value)
                        }
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={Math.round(sprite.rotation || 0)}
                        onChange={(e) =>
                          updateSpriteRotation(sprite.id, e.target.value)
                        }
                        className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                        min="0"
                        max="360"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-white text-xs mb-1">
                      Transparency:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={sprite.alpha || 1}
                        onChange={(e) =>
                          updateSpriteTransparency(sprite.id, e.target.value)
                        }
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={Number(sprite.alpha || 1).toFixed(1)}
                        onChange={(e) =>
                          updateSpriteTransparency(sprite.id, e.target.value)
                        }
                        className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <AnimationPanel sprite={sprite} game={game} setPlacedSprites={setPlacedSprites} />
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
