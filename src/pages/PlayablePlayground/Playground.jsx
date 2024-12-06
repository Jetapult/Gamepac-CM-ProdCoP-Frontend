import { useEffect, useRef, useState, useCallback, useContext } from "react";
import Phaser from "phaser";

const easingFunctions = [
  "Linear",
  "Quad.easeIn",
  "Quad.easeOut",
  "Quad.easeInOut",
  "Cubic.easeIn",
  "Cubic.easeOut",
  "Cubic.easeInOut",
  "Quart.easeIn",
  "Quart.easeOut",
  "Quart.easeInOut",
  "Quint.easeIn",
  "Quint.easeOut",
  "Quint.easeInOut",
  "Sine.easeIn",
  "Sine.easeOut",
  "Sine.easeInOut",
  "Expo.easeIn",
  "Expo.easeOut",
  "Expo.easeInOut",
  "Circ.easeIn",
  "Circ.easeOut",
  "Circ.easeInOut",
  "Elastic.easeIn",
  "Elastic.easeOut",
  "Elastic.easeInOut",
  "Back.easeIn",
  "Back.easeOut",
  "Back.easeInOut",
  "Bounce.easeIn",
  "Bounce.easeOut",
  "Bounce.easeInOut",
];

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
  .sprite(${Math.round(sprite.x)}, ${Math.round(
      sprite.y
    )}, 'spritesheetname', '${sprite.frameName}')
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
      // Position animation
      if (sprite.animations.position.isEnabled) {
        const posConfig = sprite.animations.position.config;
        code += `\n\n// Position animation
this.tweens.add({
  targets: ${sprite.frameName.replace(/[^a-zA-Z0-9]/g, "_")},
  x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)}, // Move ${
          posConfig.x * 100
        }px on X
  y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)}, // Move ${
          posConfig.y * 100
        }px on Y
  duration: ${posConfig.duration},
  repeat: ${posConfig.repeat},
  yoyo: ${posConfig.yoyo},
  ease: '${posConfig.ease}'
});`;
      }

      // Scale animation
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

      // Transparency animation
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

    return code;
  };

  const handleCopyCode = (sprite) => {
    const code = generatePhaserCode(sprite);
    navigator.clipboard.writeText(code).then(() => {
      // Optional: Add some user feedback that code was copied
      console.log("Code copied to clipboard");
    });
  };

  const AnimationPanel = ({ sprite, game }) => {
    const [activePanel, setActivePanel] = useState("");

    const updateAnimation = (type, updates) => {
      setPlacedSprites((prev) =>
        prev.map((s) => {
          if (s.id === sprite.id) {
            return {
              ...s,
              animations: {
                ...s.animations,
                [type]: {
                  ...s.animations[type],
                  ...updates,
                },
              },
            };
          }
          return s;
        })
      );
    };

    // Track base properties with useRef
    const baseProps = useRef({
      x: sprite.x,
      y: sprite.y,
      scale: sprite.scale,
      rotation: sprite.rotation,
      alpha: sprite.alpha,
    });

    // Store active tweens reference
    const activeTweens = useRef([]);

    // Update base properties when sprite properties change
    useEffect(() => {
      baseProps.current = {
        x: sprite.x,
        y: sprite.y,
        scale: sprite.scale,
        rotation: sprite.rotation,
        alpha: sprite.alpha,
      };
    }, [sprite.x, sprite.y, sprite.scale, sprite.rotation, sprite.alpha]);

    // Handle animations
    useEffect(() => {
      if (!game?.playground || !sprite.phaserSprite) return;

      const scene = game.playground;
      const target = sprite.phaserSprite;

      // Stop all active tweens
      activeTweens.current.forEach((tween) => {
        if (tween.isPlaying) {
          tween.stop();
        }
      });
      activeTweens.current = [];

      // Position Animation
      if (sprite.animations.position.isEnabled) {
        const positionTween = scene.tweens.add({
          targets: target,
          x: baseProps.current.x + sprite.animations.position.config.x * 100,
          y: baseProps.current.y + sprite.animations.position.config.y * 100,
          duration: sprite.animations.position.config.duration,
          repeat: sprite.animations.position.config.repeat,
          yoyo: sprite.animations.position.config.yoyo,
          ease: sprite.animations.position.config.ease,
          onComplete: () => {
            if (!sprite.animations.position.isEnabled) {
              target.setPosition(baseProps.current.x, baseProps.current.y);
            }
          },
        });
        activeTweens.current.push(positionTween);
      } else {
        target.setPosition(baseProps.current.x, baseProps.current.y);
      }

      // Scale Animation
      if (sprite.animations.scale.isEnabled) {
        const scaleTween = scene.tweens.add({
          targets: target,
          scaleX: sprite.animations.scale.config.scaleX,
          scaleY: sprite.animations.scale.config.scaleY,
          duration: sprite.animations.scale.config.duration,
          repeat: sprite.animations.scale.config.repeat,
          yoyo: sprite.animations.scale.config.yoyo,
          ease: sprite.animations.scale.config.ease,
          onComplete: () => {
            if (!sprite.animations.scale.isEnabled) {
              target.setScale(baseProps.current.scale);
            }
          },
        });
        activeTweens.current.push(scaleTween);
      } else {
        target.setScale(baseProps.current.scale);
      }

      // Transparency Animation
      if (sprite.animations.transparency.isEnabled) {
        const alphaTween = scene.tweens.add({
          targets: target,
          alpha: sprite.animations.transparency.config.alpha,
          duration: sprite.animations.transparency.config.duration,
          repeat: sprite.animations.transparency.config.repeat,
          yoyo: sprite.animations.transparency.config.yoyo,
          ease: sprite.animations.transparency.config.ease,
          onComplete: () => {
            if (!sprite.animations.transparency.isEnabled) {
              target.setAlpha(baseProps.current.alpha);
            }
          },
        });
        activeTweens.current.push(alphaTween);
      } else {
        target.setAlpha(baseProps.current.alpha);
      }

      // Cleanup function
      return () => {
        activeTweens.current.forEach((tween) => {
          if (tween.isPlaying) {
            tween.stop();
          }
        });
        // Reset to base properties on cleanup
        target.setPosition(baseProps.current.x, baseProps.current.y);
        target.setScale(baseProps.current.scale);
        target.setAlpha(baseProps.current.alpha);
      };
    }, [
      sprite.animations,
      game,
      sprite.phaserSprite,
      sprite.x,
      sprite.y,
      sprite.scale,
      sprite.alpha,
    ]);

    return (
      <div className="mt-4 border-t border-[#444] pt-4">
        <div className="flex gap-2 mb-4">
          <button
            className={`p-2 border rounded ${
              activePanel === "move"
                ? "border-purple-500 bg-purple-500/20"
                : "border-[#444]"
            } ${
              sprite.animations.position.isEnabled ? "bg-purple-500/10" : ""
            }`}
            onClick={() =>
              setActivePanel((prev) => (prev === "move" ? "" : "move"))
            }
          >
            <span className="text-white">↔️</span>
          </button>
          <button
            className={`p-2 border rounded ${
              activePanel === "scale"
                ? "border-purple-500 bg-purple-500/20"
                : "border-[#444]"
            } ${sprite.animations.scale.isEnabled ? "bg-purple-500/10" : ""}`}
            onClick={() =>
              setActivePanel((prev) => (prev === "scale" ? "" : "scale"))
            }
          >
            <span className="text-white">⤢</span>
          </button>
          <button
            className={`p-2 border rounded ${
              activePanel === "visibility"
                ? "border-purple-500 bg-purple-500/20"
                : "border-[#444]"
            } ${
              sprite.animations.transparency.isEnabled ? "bg-purple-500/10" : ""
            }`}
            onClick={() =>
              setActivePanel((prev) =>
                prev === "visibility" ? "" : "visibility"
              )
            }
          >
            <span className="text-white">👁</span>
          </button>
        </div>

        {activePanel === "move" && (
          <PositionAnimationPanel
            config={sprite.animations.position.config}
            isEnabled={sprite.animations.position.isEnabled}
            onToggle={() =>
              updateAnimation("position", {
                isEnabled: !sprite.animations.position.isEnabled,
              })
            }
            onChange={(newConfig) =>
              updateAnimation("position", {
                config: { ...sprite.animations.position.config, ...newConfig },
              })
            }
          />
        )}
        {activePanel === "scale" && (
          <ScaleAnimationPanel
            config={sprite.animations.scale.config}
            isEnabled={sprite.animations.scale.isEnabled}
            onToggle={() =>
              updateAnimation("scale", {
                isEnabled: !sprite.animations.scale.isEnabled,
              })
            }
            onChange={(newConfig) =>
              updateAnimation("scale", {
                config: { ...sprite.animations.scale.config, ...newConfig },
              })
            }
          />
        )}
        {activePanel === "visibility" && (
          <VisibilityAnimationPanel
            config={sprite.animations.transparency.config}
            isEnabled={sprite.animations.transparency.isEnabled}
            onToggle={() =>
              updateAnimation("transparency", {
                isEnabled: !sprite.animations.transparency.isEnabled,
              })
            }
            onChange={(newConfig) =>
              updateAnimation("transparency", {
                config: {
                  ...sprite.animations.transparency.config,
                  ...newConfig,
                },
              })
            }
          />
        )}
      </div>
    );
  };

  const ScaleAnimationPanel = ({ config, isEnabled, onToggle, onChange }) => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white text-lg font-medium">SCALE ANIMATION</h4>
          <div className="flex items-center gap-2">
            <span className="text-white">Off</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={onToggle}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-white">On</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2">Scale Factor</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={config.scaleX}
                  onChange={(e) => onChange({ scaleX: Number(e.target.value) })}
                  className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
                  step="0.1"
                />
                <span className="absolute left-2 top-2 text-white opacity-50">
                  w:
                </span>
              </div>
              <button
                className="px-2 bg-purple-500 rounded"
                onClick={() => onChange({ scaleY: config.scaleX })}
              >
                ⇋
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={config.scaleY}
                  onChange={(e) => onChange({ scaleY: Number(e.target.value) })}
                  className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
                  step="0.1"
                />
                <span className="absolute left-2 top-2 text-white opacity-50">
                  h:
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm">Duration</label>
              <input
                type="number"
                value={config.duration}
                onChange={(e) => onChange({ duration: Number(e.target.value) })}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
                step="100"
              />
            </div>
            <div>
              <label className="text-white text-sm">Repeat</label>
              <input
                type="number"
                value={config.repeat}
                onChange={(e) => onChange({ repeat: Number(e.target.value) })}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm">Easing</label>
              <select
                value={config.ease}
                onChange={(e) => onChange({ ease: e.target.value })}
                className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              >
                {easingFunctions.map((ease) => (
                  <option key={ease} value={ease}>
                    {ease}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <span className="text-white text-sm">Yoyo</span>
                <input
                  type="checkbox"
                  checked={config.yoyo}
                  onChange={(e) => onChange({ yoyo: e.target.checked })}
                  className="form-checkbox text-purple-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VisibilityAnimationPanel = ({
    config,
    isEnabled,
    onToggle,
    onChange,
  }) => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white text-lg font-medium">
            TRANSPARENCY ANIMATION
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-white">Off</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={onToggle}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-white">On</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Target Alpha:</label>
          <div className="relative">
            <input
              type="number"
              value={config.alpha}
              onChange={(e) => onChange({ alpha: Number(e.target.value) })}
              className="w-full p-2 pl-16 bg-[#333] border border-[#444] text-white rounded"
              step="0.1"
              min="0"
              max="1"
            />
            <span className="absolute left-2 top-2 text-white opacity-50">
              alpha:
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm">Duration (ms)</label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => onChange({ duration: Number(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
              step="100"
            />
          </div>
          <div>
            <label className="text-white text-sm">Repeat (-1 = ∞)</label>
            <input
              type="number"
              value={config.repeat}
              onChange={(e) => onChange({ repeat: Number(e.target.value) })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm">Easing Function</label>
            <select
              value={config.ease}
              onChange={(e) => onChange({ ease: e.target.value })}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            >
              {easingFunctions.map((ease) => (
                <option key={ease} value={ease}>
                  {ease}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <span className="text-white text-sm">Yoyo</span>
              <input
                type="checkbox"
                checked={config.yoyo}
                onChange={(e) => onChange({ yoyo: e.target.checked })}
                className="form-checkbox text-purple-500"
              />
            </label>
          </div>
        </div>
      </div>
    );
  };

  const PositionAnimationPanel = ({
    config,
    isEnabled,
    onToggle,
    onChange,
  }) => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white text-lg font-medium">POSITION ANIMATION</h4>
          <div className="flex items-center gap-2">
            <span className="text-white">Off</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={onToggle}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-white">On</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white text-xl mb-3">Destination</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="relative bg-[#444] rounded group">
                <input
                  type="number"
                  value={config.x}
                  onChange={(e) => onChange({ x: Number(e.target.value) })}
                  className="w-full p-3 pl-12 bg-transparent text-white rounded appearance-none"
                  step="0.1"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg">
                  x:
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-[#444] rounded group">
                <input
                  type="number"
                  value={config.y}
                  onChange={(e) => onChange({ y: Number(e.target.value) })}
                  className="w-full p-3 pl-12 bg-transparent text-white rounded appearance-none"
                  step="0.1"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg">
                  y:
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white text-xl mb-3">Duration</label>
            <div className="relative bg-[#444] rounded group">
              <input
                type="number"
                value={config.duration}
                onChange={(e) => onChange({ duration: Number(e.target.value) })}
                className="w-full p-3 pr-12 bg-transparent text-white rounded appearance-none"
                step="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-50">
                ms
              </span>
            </div>
          </div>
          <div>
            <label className="block text-white text-xl mb-3">Repeat</label>
            <div className="relative bg-[#444] rounded group">
              <input
                type="number"
                value={config.repeat}
                onChange={(e) => onChange({ repeat: Number(e.target.value) })}
                className="w-full p-3 bg-transparent text-white rounded appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-xl mb-3">
              Easing Function
            </label>
            <div className="relative bg-[#444] rounded">
              <select
                value={config.ease}
                onChange={(e) => onChange({ ease: e.target.value })}
                className="w-full p-3 bg-transparent text-white rounded"
              >
                {easingFunctions.map((ease) => (
                  <option key={ease} value={ease}>
                    {ease}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3">
              <span className="text-white text-xl">Yoyo</span>
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  config.yoyo ? "bg-purple-600" : "bg-[#444]"
                }`}
                onClick={() => onChange({ yoyo: !config.yoyo })}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    config.yoyo ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-screen bg-[#1e1e1e] relative overflow-hidden">
      <div
        ref={gameContainerRef}
        className="flex-1 h-screen mr-[300px] bg-[#2d2d2d] flex items-center justify-center"
        onClick={handleCanvasClick}
      />

      <div className="w-[300px] bg-[#252525] p-5 border-l border-[#333] fixed right-0 top-0 h-full overflow-y-auto">
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

                  <AnimationPanel sprite={sprite} game={game} />
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
