import { useEffect, useRef, useState, useCallback, useContext } from "react";
import Phaser from "phaser";
import AnimationPanel from "./components/AnimationPanel";
import PlayModePanel from "./components/PlayModePanel";

// Add these constants at the top of Playground.jsx
const STORAGE_KEY = "playgroundState";

// Helper functions for localStorage
const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
};

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState ? JSON.parse(serializedState) : null;
  } catch (err) {
    console.error("Error loading from localStorage:", err);
    return null;
  }
};

// Create default animation config outside component
export const createDefaultAnimations = () => ({
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
      direction: "left",
      distance: 100,
      duration: 500,
      ease: "Power2",
      delay: 0,
    },
  },
  fadeIn: {
    isEnabled: false,
    priority: 0,
    config: {
      duration: 1000,
      ease: "Power2",
      delay: 0,
    },
  },
  disappear: {
    isEnabled: false,
    config: {
      delay: 2000,
      duration: 1000,
      ease: "Power2",
    },
  },
  clickAction: {
    enabled: true,
    actions: [
      {
        type: "add",
        enabled: true,
        config: {
          framesToAdd: [],
        },
      },
      {
        type: "update",
        enabled: true,
        config: {
          frameToUpdate: [],
        },
      },
      {
        type: "remove",
        enabled: true,
        config: {
          framesToDelete: [],
        },
      },
    ],
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
  const [orientation, setOrientation] = useState("landscape");
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlaceSprite, setCanPlaceSprite] = useState(true);
  const [mode, setMode] = useState("edit"); // 'edit' or 'play'

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const dimensions =
      orientation === "landscape"
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
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: {
        create: function () {
          this.game.playground = this;
          // Enable input plugin
          this.input.enabled = true;
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
    setOrientation((prev) => (prev === "landscape" ? "portrait" : "landscape"));
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
        if (game && game.playground) {
          const scene = game.playground;
          if (scene.textures.exists("charactersprite")) {
            scene.textures.remove("charactersprite");
          }
          scene.textures.addImage("charactersprite", img);
          saveCurrentState();
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
          saveCurrentState();
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
    if (mode !== "edit" || !game || !spritesheet || !selectedFrame) return;
    const scene = game.playground;
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1920 / rect.width);
    const y = (e.clientY - rect.top) * (1080 / rect.height);

    // Check if we're placing a frame for click action
    const clickActionSprite = placedSprites.find(
      (sprite) =>
        sprite.clickAction?.enabled &&
        sprite.clickAction.actions?.some(
          (action) =>
            action.type === "add" &&
            action.enabled &&
            action.config.framesToAdd?.length > 0 &&
            action.config.isPlacingFrame
        )
    );

    if (clickActionSprite) {
      const addAction = clickActionSprite.clickAction.actions.find(
        (action) => action.type === "add" && action.enabled
      );
      const lastFrameIndex = addAction.config.framesToAdd.length - 1;
      const frameConfig = addAction.config.framesToAdd[lastFrameIndex];

      // Create the preview sprite with full opacity
      const previewSprite = scene.add
        .sprite(x, y, "charactersprite", frameConfig.frameName)
        .setOrigin(0, 0)
        .setScale(frameConfig.scale || 1)
        .setAlpha(1)
        .setData("id", Date.now());

      // Store reference data
      previewSprite.setData("frameConfig", frameConfig);
      previewSprite.setData("parentId", clickActionSprite.id);

      // Update the placedSprites state
      setPlacedSprites((prev) =>
        prev.map((s) => {
          if (s.id === clickActionSprite.id) {
            const updatedActions = s.clickAction.actions.map((action) => {
              if (action.type === "add" && action.enabled) {
                return {
                  ...action,
                  config: {
                    ...action.config,
                    isPlacingFrame: false,
                    framesToAdd: action.config.framesToAdd.map((frame, idx) =>
                      idx === lastFrameIndex
                        ? { ...frame, x, y, baseX: x, baseY: y }
                        : frame
                    ),
                  },
                };
              }
              return action;
            });

            return {
              ...s,
              clickAction: {
                ...s.clickAction,
                actions: updatedActions,
              },
            };
          }
          return s;
        })
      );
      return;
    }

    // Regular sprite placement logic for selectedFrame
    if (selectedFrame && canPlaceSprite) {
      // Create the sprite with all necessary properties
      const sprite = scene.add
        .sprite(x, y, "charactersprite", selectedFrame)
        .setOrigin(0, 0)
        .setInteractive({ draggable: true }) // Enable both interaction and dragging
        .setScale(1)
        .setAlpha(1)
        .setData("id", Date.now());

      // Create the sprite object
      const newSprite = {
        id: Date.now(),
        frameName: selectedFrame,
        x,
        y,
        scale: 1,
        rotation: 0,
        alpha: 1,
        phaserSprite: sprite,
        animations: createDefaultAnimations(),
        clickAction: {
          enabled: false,
          type: "none",
          config: {
            framesToAdd: [],
          },
        },
      };

      // Add event listeners
      sprite.on("pointerdown", () => {
        if (mode === "edit") {
          handleSpriteClick(newSprite);
        } else if (mode === "play" && newSprite.clickAction?.enabled) {
          handlePreviewClick(newSprite);
        }
      });

      sprite.on("drag", (pointer, dragX, dragY) => {
        sprite.setPosition(dragX, dragY);
        newSprite.x = dragX;
        newSprite.y = dragY;
        // Update the placedSprites array with new position
        setPlacedSprites((prev) =>
          prev.map((s) =>
            s.id === newSprite.id ? { ...s, x: dragX, y: dragY } : s
          )
        );
      });

      // Add to placedSprites array
      setPlacedSprites((prev) => [...prev, newSprite]);
      setCanPlaceSprite(false);

      // Save the current state
      saveCurrentState();
    }
  };

  // Add click handler function
  const handleSpriteClick = (clickedSprite) => {
    if (!game?.playground || mode !== "play") return;
    const { type, config } = clickedSprite.clickAction;
    const scene = game.playground;

    switch (type) {
      case "add":
        if (
          Array.isArray(config.framesToAdd) &&
          config.framesToAdd.length > 0
        ) {
          config.framesToAdd.forEach((frameConfig) => {
            const newSprite = scene.add
              .sprite(
                clickedSprite.x + (frameConfig.position?.x || 0),
                clickedSprite.y + (frameConfig.position?.y || 0),
                "charactersprite",
                frameConfig.frameName
              )
              .setOrigin(0, 0)
              .setScale(frameConfig.scale || 1)
              .setRotation(frameConfig.rotation || 0)
              .setAlpha(frameConfig.alpha || 1);

            const spriteObj = {
              id: Date.now() + Math.random(),
              frameName: frameConfig.frameName,
              x: clickedSprite.x + (frameConfig.position?.x || 0),
              y: clickedSprite.y + (frameConfig.position?.y || 0),
              scale: frameConfig.scale || 1,
              rotation: frameConfig.rotation || 0,
              alpha: frameConfig.alpha || 1,
              phaserSprite: newSprite,
              animations: createDefaultAnimations(),
              isClickActionResult: true,
              parentId: clickedSprite.id,
            };

            setPlacedSprites((prev) => [...prev, spriteObj]);
          });
        }
        break;
      case "update":
        const { frameToUpdate } = clickedSprite.clickAction.config;

        // Apply updates to each target sprite
        frameToUpdate.forEach((update) => {
          const targetSprite = placedSprites.find(
            (s) => s.id === Number(update.targetId)
          )?.phaserSprite;
          if (!targetSprite) return;

          // Update frame
          if (update.newFrameName) {
            targetSprite.setTexture("charactersprite", update.newFrameName);
          }

          // Update properties
          targetSprite.setPosition(update.x, update.y);
          targetSprite.setScale(update.scale);
          targetSprite.setRotation((update.rotation * Math.PI) / 180);
          targetSprite.setAlpha(update.alpha);
        });
        break;
      case "remove":
        if (
          Array.isArray(config.framesToDelete) &&
          config.framesToDelete.length > 0
        ) {
          config.framesToDelete.forEach((frameConfig) => {
            const targetSprite = placedSprites.find(
              (s) => s.id === Number(frameConfig.targetId)
            )?.phaserSprite;

            if (targetSprite) {
              scene.tweens.add({
                targets: targetSprite,
                alpha: 0,
                duration: frameConfig.fadeOutDuration,
                delay: frameConfig.delay,
                ease: frameConfig.ease,
                onComplete: () => {
                  targetSprite.destroy();
                  setPlacedSprites((prev) =>
                    prev.filter((s) => s.id !== Number(frameConfig.targetId))
                  );
                },
              });
            }
          });
        }
        break;
    }
  };

  // Update sprite position
  const updateSpritePosition = (id, newX, newY) => {
    setPlacedSprites((prev) => {
      const updated = prev.map((sprite) => {
        if (sprite.id === id) {
          sprite.phaserSprite.setPosition(Number(newX), Number(newY));
          return {
            ...sprite,
            x: Number(newX),
            y: Number(newY),
          };
        }
        return sprite;
      });
      saveCurrentState();
      return updated;
    });
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
    saveCurrentState();
  };

  // Update sprite rotation
  const updateSpriteRotation = (id, newRotation) => {
    setPlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          // Convert degrees to radians for Phaser
          const rotationInRadians = (Number(newRotation) * Math.PI) / 180;
          sprite.phaserSprite.setRotation(rotationInRadians);
          return {
            ...sprite,
            rotation: Number(newRotation), // Store rotation in degrees
          };
        }
        return sprite;
      })
    );
    saveCurrentState();
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
    saveCurrentState();
  };

  const deleteSprite = useCallback((id) => {
    setPlacedSprites((prev) => {
      const spriteToDelete = prev.find((sprite) => sprite.id === id);
      if (spriteToDelete?.phaserSprite && !spriteToDelete.isDestroyed) {
        spriteToDelete.phaserSprite.destroy();
      }
      const updated = prev.filter((sprite) => sprite.id !== id);
      saveCurrentState();
      return updated;
    });
  }, []);

  // Modify generatePhaserCode to include animations
  const generatePhaserCode = (sprite) => {
    // Create a counter for the variable name
    const counter = placedSprites.findIndex((s) => s.id === sprite.id) + 1;
    const varName = `sprite${counter}`;

    // Base sprite code with all properties including scale
    let code = `// ${sprite.frameName} sprite
const ${varName} = this.add
  .sprite(${Math.round(sprite.x)}, ${Math.round(
      sprite.y
    )}, 'spritesheetname', '${sprite.frameName}')
  .setOrigin(0, 0)
  .setScale(${sprite.scale})`;
    console.log(sprite.frameName, "frameName");

    // Update all references to use varName instead of uniqueVarName
    if (sprite.animations) {
      if (sprite.animations.slideIn.isEnabled) {
        const slideConfig = sprite.animations.slideIn.config;
        let initialX, initialY;

        // Calculate initial position based on direction
        switch (slideConfig.direction) {
          case "left":
            initialX = `${Math.round(sprite.x)} - ${slideConfig.distance}`;
            initialY = `${Math.round(sprite.y)}`;
            break;
          case "right":
            initialX = `${Math.round(sprite.x)} + ${slideConfig.distance}`;
            initialY = `${Math.round(sprite.y)}`;
            break;
          case "top":
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)} - ${slideConfig.distance}`;
            break;
          case "bottom":
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)} + ${slideConfig.distance}`;
            break;
          default:
            initialX = `${Math.round(sprite.x)}`;
            initialY = `${Math.round(sprite.y)}`;
        }

        code += `\n\n// Slide-in animation
// Set initial position
${varName}.setPosition(${initialX}, ${initialY});`;

        // Create slide-in tween with callback for common animations
        code += `\n\n// Create slide-in tween with callback for common animations
const slideInTween${counter} = this.tweens.add({
  targets: ${varName},
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
    const positionTween${counter} = this.tweens.add({
      targets: ${varName},
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
    const scaleTween${counter} = this.tweens.add({
      targets: ${varName},
      scaleX: ${scaleConfig.scaleX},
      scaleY: ${scaleConfig.scaleY},
      duration: ${scaleConfig.duration},
      repeat: ${scaleConfig.repeat},
      yoyo: ${scaleConfig.yoyo},
      ease: '${scaleConfig.ease}'
    });`;
        }

        if (sprite.animations?.transparency?.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `\n    // Transparency animation
    const transparencyTween${counter} = this.tweens.add({
      targets: ${varName},
      alpha: ${alphaConfig.alpha},
      duration: ${alphaConfig.duration},
      repeat: ${alphaConfig.repeat},
      yoyo: ${alphaConfig.yoyo},
      ease: '${alphaConfig.ease}'
    });`;
        }

        code += `\n  }
});`;
      } else if (sprite.animations.fadeIn.isEnabled) {
        const fadeConfig = sprite.animations.fadeIn.config;
        code += `\n\n// Fade-in animation
// Set initial alpha
${varName}.setAlpha(0);

// Create fade-in tween with callback for common animations
const fadeInTween${counter} = this.tweens.add({
  targets: ${varName},
  alpha: 1,
  duration: ${fadeConfig.duration},
  ease: '${fadeConfig.ease}',
  delay: ${fadeConfig.priority * 200}, // Delay based on priority
  onComplete: function() {`;

        // Add common animations inside the onComplete callback
        if (sprite.animations.position.isEnabled) {
          const posConfig = sprite.animations.position.config;
          code += `\n    // Position animation
    const positionTween${counter} = this.tweens.add({
      targets: ${varName},
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
    const scaleTween${counter} = this.tweens.add({
      targets: ${varName},
      scaleX: ${scaleConfig.scaleX},
      scaleY: ${scaleConfig.scaleY},
      duration: ${scaleConfig.duration},
      repeat: ${scaleConfig.repeat},
      yoyo: ${scaleConfig.yoyo},
      ease: '${scaleConfig.ease}'
    });`;
        }

        if (sprite.animations?.transparency?.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `\n    // Transparency animation
    const transparencyTween${counter} = this.tweens.add({
      targets: ${varName},
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
        // If no custom animations (slide-in or fade-in), add common animations directly
        if (sprite.animations.position.isEnabled) {
          const posConfig = sprite.animations.position.config;
          code += `\n\n// Position animation
this.tweens.add({
  targets: ${varName},
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
  targets: ${varName},
  scaleX: ${scaleConfig.scaleX},
  scaleY: ${scaleConfig.scaleY},
  duration: ${scaleConfig.duration},
  repeat: ${scaleConfig.repeat},
  yoyo: ${scaleConfig.yoyo},
  ease: '${scaleConfig.ease}'
});`;
        }

        if (sprite?.animations?.transparency?.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `\n\n// Transparency animation
this.tweens.add({
  targets: ${varName},
  alpha: ${alphaConfig.alpha},
  duration: ${alphaConfig.duration},
  repeat: ${alphaConfig.repeat},
  yoyo: ${alphaConfig.yoyo},
  ease: '${alphaConfig.ease}'
});`;
        }
      }

      // Add this inside generatePhaserCode after the other animations
      if (sprite.animations.disappear.isEnabled) {
        const disappearConfig = sprite.animations.disappear.config;
        code += `\n\n// Disappear animation
const disappearTimer${counter} = this.time.delayedCall(${disappearConfig.delay}, () => {
  this.tweens.add({
    targets: ${varName},
    alpha: 0,
    duration: ${disappearConfig.duration},
    ease: '${disappearConfig.ease}',
    onComplete: function(tween, targets) {
      targets[0].destroy();
    }
  });
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

  const generateAllPhaserCode = (sprites) => {
    // Group sprites by priority
    const groupedSprites = sprites.reduce((acc, sprite) => {
      const priority =
        sprite.animations.slideIn?.config?.priority ||
        sprite.animations.fadeIn?.config?.priority ||
        0;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(sprite);
      return acc;
    }, {});

    const priorities = Object.keys(groupedSprites).sort(
      (a, b) => Number(a) - Number(b)
    );
    let code = "// All Sprites and Animations\n\n";
    let totalDelay = 0;

    priorities.forEach((priority) => {
      const sprites = groupedSprites[priority];
      code += `// Sequence ${priority}\n`;

      sprites.forEach((sprite, index) => {
        const counter = index + 1;
        const varName = `sprite${counter}_seq${priority}`;

        // Create sprite
        code += `const ${varName} = this.add
    .sprite(${Math.round(sprite.x)}, ${Math.round(
          sprite.y
        )}, 'spritesheetname', '${sprite.frameName}')
    .setOrigin(0, 0)
    .setScale(${sprite.scale})
    .setRotation(${((sprite.rotation || 0) * Math.PI) / 180})
    .setAlpha(${sprite.alpha || 1})
    .setData('id', ${sprite.id});\n\n`;

        // Add initial animations (slide-in and fade-in)
        if (sprite.animations.slideIn.isEnabled) {
          const slideConfig = sprite.animations.slideIn.config;
          let initialPos;
          switch (slideConfig.direction) {
            case "left":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)} - ${
                slideConfig.distance
              }, ${Math.round(sprite.y)});`;
              break;
            case "right":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)} + ${
                slideConfig.distance
              }, ${Math.round(sprite.y)});`;
              break;
            case "top":
              initialPos = `${varName}.setPosition(${Math.round(
                sprite.x
              )}, ${Math.round(sprite.y)} - ${slideConfig.distance});`;
              break;
            case "bottom":
              initialPos = `${varName}.setPosition(${Math.round(
                sprite.x
              )}, ${Math.round(sprite.y)} + ${slideConfig.distance});`;
              break;
          }
          code += `// Slide-in animation
  ${initialPos}
  this.tweens.add({
    targets: ${varName},
    x: ${Math.round(sprite.x)},
    y: ${Math.round(sprite.y)},
    duration: ${slideConfig.duration},
    ease: '${slideConfig.ease}',
    delay: ${totalDelay + (slideConfig.delay || 0)}
  });\n\n`;
        }

        if (sprite.animations.fadeIn.isEnabled) {
          const fadeConfig = sprite.animations.fadeIn.config;
          code += `// Fade-in animation
  ${varName}.setAlpha(0);
  this.tweens.add({
    targets: ${varName},
    alpha: 1,
    duration: ${fadeConfig.duration},
    ease: '${fadeConfig.ease}',
    delay: ${totalDelay + (fadeConfig.delay || 0)}
  });\n\n`;
        }

        // Add common animations
        if (sprite.animations.position.isEnabled) {
          const posConfig = sprite.animations.position.config;
          code += `// Position animation
  this.tweens.add({
    targets: ${varName},
    x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
    y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
    duration: ${posConfig.duration},
    repeat: ${posConfig.repeat},
    yoyo: ${posConfig.yoyo},
    ease: '${posConfig.ease}'
  });\n\n`;
        }

        if (sprite.animations.scale.isEnabled) {
          const scaleConfig = sprite.animations.scale.config;
          code += `// Scale animation
  this.tweens.add({
    targets: ${varName},
    scaleX: ${scaleConfig.scaleX},
    scaleY: ${scaleConfig.scaleY},
    duration: ${scaleConfig.duration},
    repeat: ${scaleConfig.repeat},
    yoyo: ${scaleConfig.yoyo},
    ease: '${scaleConfig.ease}'
  });\n\n`;
        }

        if (sprite.animations.transparency.isEnabled) {
          const alphaConfig = sprite.animations.transparency.config;
          code += `// Transparency animation
  this.tweens.add({
    targets: ${varName},
    alpha: ${alphaConfig.alpha},
    duration: ${alphaConfig.duration},
    repeat: ${alphaConfig.repeat},
    yoyo: ${alphaConfig.yoyo},
    ease: '${alphaConfig.ease}'
  });\n\n`;
        }

        if (sprite.animations.disappear?.isEnabled) {
          const disappearConfig = sprite.animations.disappear.config;
          code += `
    // Disappear animation
    this.time.delayedCall(${disappearConfig.delay}, () => {
      this.tweens.add({
        targets: ${varName},
        alpha: 0,
        duration: ${disappearConfig.duration},
        ease: '${disappearConfig.ease}',
        onComplete: () => {
          if (${varName} && ${varName}.destroy) {
            ${varName}.destroy();
          }
        }
      });
    });`;
        }

        // Add click actions
        if (sprite.clickAction?.enabled) {
          code += `// Click Action Setup
  ${varName}.setInteractive();
  ${varName}.on('pointerdown', function() {`;

          sprite.clickAction.actions.forEach((action) => {
            if (action.enabled) {
              switch (action.type) {
                case "add":
                  action.config.framesToAdd?.forEach((frameConfig, idx) => {
                    const clickFrameVarName = `clickFrame${counter}_${idx}`;
                    code += `
    const ${clickFrameVarName} = this.add
      .sprite(${Math.round(frameConfig.x)}, ${Math.round(
                      frameConfig.y
                    )}, 'spritesheetname', '${frameConfig.frameName}')
      .setOrigin(0, 0)
      .setScale(${frameConfig.scale})
      .setRotation(${((frameConfig.rotation || 0) * Math.PI) / 180})
      .setAlpha(${frameConfig.alpha || 1})
      .setData('parentId', ${sprite.id})
      .setData('frameConfig', ${JSON.stringify(frameConfig)});

      const startCommonAnimations = () => {
    // Position animation
    if (${clickFrameVarName}.getData('frameConfig').animations?.position?.isEnabled) {
      const config = ${clickFrameVarName}.getData('frameConfig').animations.position.config;
      this.tweens.add({
        targets: ${clickFrameVarName},
        x: ${frameConfig.x} + (config.x || 0) * 100,
        y: ${frameConfig.y} + (config.y || 0) * 100,
        duration: config.duration || 1000,
        repeat: config.repeat ?? -1,
        yoyo: config.yoyo ?? true,
        ease: config.ease || 'Linear'
      });
    }

    // Scale animation
    if (${clickFrameVarName}.getData('frameConfig').animations?.scale?.isEnabled) {
      const config = ${clickFrameVarName}.getData('frameConfig').animations.scale.config;
      this.tweens.add({
        targets: ${clickFrameVarName},
        scaleX: config.scaleX || 1,
        scaleY: config.scaleY || 1,
        duration: config.duration || 1000,
        repeat: config.repeat ?? -1,
        yoyo: config.yoyo ?? true,
        ease: config.ease || 'Linear'
      });
    }

    // Alpha animation
    if (${clickFrameVarName}.getData('frameConfig').animations?.alpha?.isEnabled) {
      const config = ${clickFrameVarName}.getData('frameConfig').animations.alpha.config;
      this.tweens.add({
        targets: ${clickFrameVarName},
        alpha: config.alpha || 1,
        duration: config.duration || 1000,
        repeat: config.repeat ?? -1,
        yoyo: config.yoyo ?? true,
        ease: config.ease || 'Linear'
      });
    }

    // Disappear animation
    if (${clickFrameVarName}.getData('frameConfig').animations?.disappear?.isEnabled) {
      const config = ${clickFrameVarName}.getData('frameConfig').animations.disappear.config;
      this.time.delayedCall(config.delay || 0, () => {
        this.tweens.add({
          targets: ${clickFrameVarName},
          alpha: 0,
          duration: config.duration || 1000,
          ease: config.ease || 'Linear',
          onComplete: () => ${clickFrameVarName}.destroy()
        });
      });
    }
  };

  // Handle initial animations (slide-in or fade-in)
  if (${clickFrameVarName}.getData('frameConfig').animations?.slideIn?.isEnabled) {
    const config = ${clickFrameVarName}.getData('frameConfig').animations.slideIn.config;
    let startX = ${frameConfig.x};
    let startY = ${frameConfig.y};
    
    switch (config.direction) {
      case 'left': startX -= config.distance; break;
      case 'right': startX += config.distance; break;
      case 'top': startY -= config.distance; break;
      case 'bottom': startY += config.distance; break;
    }
    
    ${clickFrameVarName}.setPosition(startX, startY);
    this.tweens.add({
      targets: ${clickFrameVarName},
      x: ${frameConfig.x},
      y: ${frameConfig.y},
      duration: config.duration || 1000,
      ease: config.ease || 'Linear',
      onComplete: startCommonAnimations
    });
  } else if (${clickFrameVarName}.getData('frameConfig').animations?.fadeIn?.isEnabled) {
    const config = ${clickFrameVarName}.getData('frameConfig').animations.fadeIn.config;
    ${clickFrameVarName}.setAlpha(0);
    this.tweens.add({
      targets: ${clickFrameVarName},
      alpha: 1,
      duration: config.duration || 1000,
      ease: config.ease || 'Linear',
      onComplete: startCommonAnimations
    });
  } else {
    startCommonAnimations();
  }`;
                  });
                  break;

                case "update":
                  action.config.frameToUpdate?.forEach((update, idx) => {
                    code += `
    const updateTarget${counter}_${idx} = this.children.list.find(
      child => child.getData('id') === ${update.targetId}
    );
    if (updateTarget${counter}_${idx}) {
    // Stop existing tweens
      this.tweens.getTweensOf(updateTarget${counter}_${idx}).forEach((tween) => {
        tween.stop();
        tween.remove();
      });
      ${
        update.newFrameName
          ? `updateTarget${counter}_${idx}.setTexture('spritesheetname', '${update.newFrameName}');`
          : ""
      }
      updateTarget${counter}_${idx}.setPosition(${update.x}, ${update.y});
      updateTarget${counter}_${idx}.setScale(${update.scale});
      updateTarget${counter}_${idx}.setRotation(${
                      ((update.rotation || 0) * Math.PI) / 180
                    });
      updateTarget${counter}_${idx}.setAlpha(${update.alpha || 1});
      // Handle animations
      const startAnimations = () => {
        // Position animation
        ${
          update.animations?.position?.isEnabled
            ? `
        this.tweens.add({
          targets: updateTarget${counter}_${idx},
          x: ${update.x} + ${Math.round(
                (update.animations.position.config.x || 0) * 100
              )},
          y: ${update.y} + ${Math.round(
                (update.animations.position.config.y || 0) * 100
              )},
          duration: ${update.animations.position.config.duration},
          repeat: ${update.animations.position.config.repeat},
          yoyo: ${update.animations.position.config.yoyo},
          ease: '${update.animations.position.config.ease}'
        });`
            : ""
        }

        // Scale animation
        ${
          update.animations?.scale?.isEnabled
            ? `
        this.tweens.add({
          targets: updateTarget${counter}_${idx},
          scaleX: ${update.animations.scale.config.scaleX},
          scaleY: ${update.animations.scale.config.scaleY},
          duration: ${update.animations.scale.config.duration},
          repeat: ${update.animations.scale.config.repeat},
          yoyo: ${update.animations.scale.config.yoyo},
          ease: '${update.animations.scale.config.ease}'
        });`
            : ""
        }

        // Transparency animation
        ${
          update.animations?.transparency?.isEnabled
            ? `
        this.tweens.add({
          targets: updateTarget${counter}_${idx},
          alpha: ${update.animations.transparency.config.alpha},
          duration: ${update.animations.transparency.config.duration},
          repeat: ${update.animations.transparency.config.repeat},
          yoyo: ${update.animations.transparency.config.yoyo},
          ease: '${update.animations.transparency.config.ease}'
        });`
            : ""
        }

        // Fade-in animation
        ${
          update.animations?.fadeIn?.isEnabled
            ? `
        updateTarget${counter}_${idx}.setAlpha(0);
        this.tweens.add({
          targets: updateTarget${counter}_${idx},
          alpha: 1,
          duration: ${update.animations.fadeIn.config.duration},
          ease: '${update.animations.fadeIn.config.ease}'
        });`
            : ""
        }

        // Disappear animation
        ${
          update.animations?.disappear?.isEnabled
            ? `
        this.time.delayedCall(${update.animations.disappear.config.delay}, () => {
          this.tweens.add({
            targets: updateTarget${counter}_${idx},
            alpha: 0,
            duration: ${update.animations.disappear.config.duration},
            ease: '${update.animations.disappear.config.ease}',
            onComplete: () => updateTarget${counter}_${idx}.destroy()
          });
        });`
            : ""
        }
      };

      // Handle slide-in animation
      ${
        update.animations?.slideIn?.isEnabled
          ? `
      let startX = ${update.x};
      let startY = ${update.y};
      switch ('${update.animations.slideIn.config.direction}') {
        case 'left': startX -= ${update.animations.slideIn.config.distance}; break;
        case 'right': startX += ${update.animations.slideIn.config.distance}; break;
        case 'top': startY -= ${update.animations.slideIn.config.distance}; break;
        case 'bottom': startY += ${update.animations.slideIn.config.distance}; break;
      }
      updateTarget${counter}_${idx}.setPosition(startX, startY);
      this.tweens.add({
        targets: updateTarget${counter}_${idx},
        x: ${update.x},
        y: ${update.y},
        duration: ${update.animations.slideIn.config.duration},
        ease: '${update.animations.slideIn.config.ease}',
        onComplete: startAnimations
      });`
          : `
      startAnimations();`
      }
    }`;
                  });
                  break;

                case "remove":
                  console.log("remove", action.config.frameToDelete);
                  action.config.framesToDelete?.forEach((frame, idx) => {
                    code += `
    const targetToRemove_${idx} = this.children.list.find(
      child => child.getData('id') === ${frame.targetId}
    );
    if (targetToRemove_${idx}) {
      // Stop any existing tweens
      this.tweens.getTweensOf(targetToRemove_${idx}).forEach((tween) => {
        tween.stop();
        tween.remove();
      });

      // Add fade out and destroy
      this.tweens.add({
        targets: targetToRemove_${idx},
        alpha: 0,
        duration: ${frame.fadeOutDuration || 500},
        delay: ${frame.delay || 0},
        ease: '${frame.ease || "Linear"}',
        onComplete: () => {
          if (targetToRemove_${idx} && targetToRemove_${idx}.destroy) {
            targetToRemove_${idx}.destroy();
          }
        }
      });
    }`;
                  });
                  break;
              }
            }
          });

          code += `\n}, this);\n\n`;
        }
      });

      // Calculate delay for next sequence
      const maxDuration = Math.max(
        ...sprites.map((sprite) => {
          let duration = 0;
          if (sprite.animations.slideIn.isEnabled) {
            duration = Math.max(
              duration,
              sprite.animations.slideIn.config.duration
            );
          }
          if (sprite.animations.fadeIn.isEnabled) {
            duration = Math.max(
              duration,
              sprite.animations.fadeIn.config.duration
            );
          }
          return duration;
        })
      );

      totalDelay += maxDuration + 1000;
      code += "\n";
    });

    return code;
  };

  // Add this new function near generatePhaserCode
  //   const generateAllPhaserCode = (sprites) => {
  //     // Group sprites by priority
  //     const groupedSprites = sprites.reduce((acc, sprite) => {
  //       const priority =
  //         sprite.animations.slideIn?.config?.priority ||
  //         sprite.animations.fadeIn?.config?.priority ||
  //         0;
  //       if (!acc[priority]) acc[priority] = [];
  //       acc[priority].push(sprite);
  //       return acc;
  //     }, {});

  //     // Sort priorities
  //     const priorities = Object.keys(groupedSprites).sort(
  //       (a, b) => Number(a) - Number(b)
  //     );

  //     let code = "// All Sprites and Animations\n\n";
  //     let totalDelay = 0;

  //     priorities.forEach((priority) => {
  //       const sprites = groupedSprites[priority];
  //       code += `// Sequence ${priority}\n`;

  //       sprites.forEach((sprite) => {
  //         const counter = sprites.indexOf(sprite) + 1;
  //         const varName = `sprite${counter}_seq${priority}`;

  //         code += `const ${varName} = this.add
  //   .sprite(${Math.round(sprite.x)}, ${Math.round(
  //           sprite.y
  //         )}, 'spritesheetname', '${sprite.frameName}')
  //   .setOrigin(0, 0)
  //   .setScale(${sprite.scale})
  //   .setData('id', ${sprite.id});\n\n`;

  //         if (sprite.animations.slideIn.isEnabled) {
  //           const slideConfig = sprite.animations.slideIn.config;
  //           let initialPos;
  //           switch (slideConfig.direction) {
  //             case "left":
  //               initialPos = `${varName}.setPosition(${Math.round(sprite.x)} - ${
  //                 slideConfig.distance
  //               }, ${Math.round(sprite.y)});`;
  //               break;
  //             case "right":
  //               initialPos = `${varName}.setPosition(${Math.round(sprite.x)} + ${
  //                 slideConfig.distance
  //               }, ${Math.round(sprite.y)});`;
  //               break;
  //             case "top":
  //               initialPos = `${varName}.setPosition(${Math.round(
  //                 sprite.x
  //               )}, ${Math.round(sprite.y)} - ${slideConfig.distance});`;
  //               break;
  //             case "bottom":
  //               initialPos = `${varName}.setPosition(${Math.round(
  //                 sprite.x
  //               )}, ${Math.round(sprite.y)} + ${slideConfig.distance});`;
  //               break;
  //           }

  //           code += `${initialPos}\n
  // this.time.delayedCall(${totalDelay}, () => {
  //   this.tweens.add({
  //     targets: ${varName},
  //     x: ${Math.round(sprite.x)},
  //     y: ${Math.round(sprite.y)},
  //     duration: ${slideConfig.duration},
  //     ease: '${slideConfig.ease}'
  //   });
  // });\n`;
  //         }

  //         if (sprite.animations.fadeIn.isEnabled) {
  //           const fadeConfig = sprite.animations.fadeIn.config;
  //           code += `${varName}.setAlpha(0);\n
  // this.time.delayedCall(${totalDelay}, () => {
  //   this.tweens.add({
  //     targets: ${varName},
  //     alpha: 1,
  //     duration: ${fadeConfig.duration},
  //     ease: '${fadeConfig.ease}'
  //   });
  // });\n`;
  //         }

  //         // Add common animations
  //         if (
  //           sprite.animations?.position?.isEnabled ||
  //           sprite.animations?.scale?.isEnabled ||
  //           sprite.animations?.transparency?.isEnabled
  //         ) {
  //           code += `\nthis.time.delayedCall(${totalDelay + 500}, () => {\n`;

  //           if (sprite.animations.position.isEnabled) {
  //             const posConfig = sprite.animations.position.config;
  //             code += `  this.tweens.add({
  //     targets: ${varName},
  //     x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
  //     y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
  //     duration: ${posConfig.duration},
  //     repeat: ${posConfig.repeat},
  //     yoyo: ${posConfig.yoyo},
  //     ease: '${posConfig.ease}'
  //   });\n`;
  //           }

  //           // Add scale and transparency animations similarly...

  //           code += `});\n`;
  //         }

  //         if (sprite.animations.disappear.isEnabled) {
  //           const disappearConfig = sprite.animations.disappear.config;
  //           code += `\nthis.time.delayedCall(${
  //             totalDelay + disappearConfig.delay
  //           }, () => {
  //     this.tweens.add({
  //       targets: ${varName},
  //       alpha: 0,
  //       duration: ${disappearConfig.duration},
  //       ease: '${disappearConfig.ease}',
  //       onComplete: () => ${varName}.destroy()
  //     });
  //   });\n`;
  //         }
  //         if (sprite.clickAction?.enabled) {
  //           if (sprite.clickAction.type === "add") {
  //             code += `\n// Click Action Setup
  //   ${varName}.setInteractive();
  //   ${varName}.on('pointerdown', function() {`;

  //             sprite.clickAction.config.framesToAdd.forEach(
  //               (frameConfig, idx) => {
  //                 const clickFrameVarName = `clickFrame${counter}_${idx}`;

  //                 code += `\n  const ${clickFrameVarName} = this.add
  //       .sprite(${Math.round(frameConfig.x)}, ${Math.round(
  //                   frameConfig.y
  //                 )}, 'spritesheetname', '${frameConfig.frameName}')
  //       .setOrigin(0, 0)
  //       .setScale(${frameConfig.scale || 1})
  //       .setRotation(${frameConfig.rotation || 0})
  //       .setAlpha(${frameConfig.alpha || 1});`;

  //                 // Add slide-in animation if enabled
  //                 if (frameConfig.animations?.slideIn?.isEnabled) {
  //                   const slideConfig = frameConfig.animations.slideIn.config;
  //                   let initialPos;
  //                   switch (slideConfig.direction) {
  //                     case "left":
  //                       initialPos = `${clickFrameVarName}.setPosition(${Math.round(
  //                         frameConfig.x
  //                       )} - ${slideConfig.distance}, ${Math.round(
  //                         frameConfig.y
  //                       )});`;
  //                       break;
  //                     case "right":
  //                       initialPos = `${clickFrameVarName}.setPosition(${Math.round(
  //                         frameConfig.x
  //                       )} + ${slideConfig.distance}, ${Math.round(
  //                         frameConfig.y
  //                       )});`;
  //                       break;
  //                     case "top":
  //                       initialPos = `${clickFrameVarName}.setPosition(${Math.round(
  //                         frameConfig.x
  //                       )}, ${Math.round(frameConfig.y)} - ${
  //                         slideConfig.distance
  //                       });`;
  //                       break;
  //                     case "bottom":
  //                       initialPos = `${clickFrameVarName}.setPosition(${Math.round(
  //                         frameConfig.x
  //                       )}, ${Math.round(frameConfig.y)} + ${
  //                         slideConfig.distance
  //                       });`;
  //                       break;
  //                   }

  //                   code += `\n  ${initialPos}
  //     this.tweens.add({
  //       targets: ${clickFrameVarName},
  //       x: ${Math.round(frameConfig.x)},
  //       y: ${Math.round(frameConfig.y)},
  //       duration: ${slideConfig.duration},
  //       ease: '${slideConfig.ease}'
  //     });`;
  //                 }

  //                 // Add fade-in animation if enabled
  //                 if (frameConfig.animations?.fadeIn?.isEnabled) {
  //                   const fadeConfig = frameConfig.animations.fadeIn.config;
  //                   code += `\n  ${clickFrameVarName}.setAlpha(0);
  //     this.tweens.add({
  //       targets: ${clickFrameVarName},
  //       alpha: 1,
  //       duration: ${fadeConfig.duration},
  //       ease: '${fadeConfig.ease}'
  //     });`;
  //                 }

  //                 // Add position animation if enabled
  //                 if (frameConfig.animations?.position?.isEnabled) {
  //                   const posConfig = frameConfig.animations.position.config;
  //                   code += `\n  this.tweens.add({
  //       targets: ${clickFrameVarName},
  //       x: ${Math.round(frameConfig.x)} + ${Math.round(posConfig.x * 100)},
  //       y: ${Math.round(frameConfig.y)} + ${Math.round(posConfig.y * 100)},
  //       duration: ${posConfig.duration},
  //       repeat: ${posConfig.repeat},
  //       yoyo: ${posConfig.yoyo},
  //       ease: '${posConfig.ease}'
  //     });`;
  //                 }

  //                 // Add scale animation if enabled
  //                 if (frameConfig.animations?.scale?.isEnabled) {
  //                   const scaleConfig = frameConfig.animations.scale.config;
  //                   code += `\n  this.tweens.add({
  //       targets: ${clickFrameVarName},
  //       scaleX: ${scaleConfig.scaleX},
  //       scaleY: ${scaleConfig.scaleY},
  //       duration: ${scaleConfig.duration},
  //       repeat: ${scaleConfig.repeat},
  //       yoyo: ${scaleConfig.yoyo},
  //       ease: '${scaleConfig.ease}'
  //     });`;
  //                 }

  //                 // Add disappear animation if enabled
  //                 if (frameConfig.animations?.disappear?.isEnabled) {
  //                   const disappearConfig =
  //                     frameConfig.animations.disappear.config;
  //                   code += `\n  this.time.delayedCall(${disappearConfig.delay}, () => {
  //       this.tweens.add({
  //         targets: ${clickFrameVarName},
  //         alpha: 0,
  //         duration: ${disappearConfig.duration},
  //         ease: '${disappearConfig.ease}',
  //         onComplete: () => ${clickFrameVarName}.destroy()
  //       });
  //     });`;
  //                 }
  //               }
  //             );

  //             code += `\n}, this);\n\n`;
  //           } else if (sprite.clickAction.type === "update") {
  //             code += `\n// Click Action Setup
  //   ${varName}.setInteractive();
  //   ${varName}.on('pointerdown', function() {`;
  //             sprite.clickAction.config.frameToUpdate?.forEach((update, idx) => {
  //               code += `\n  const targetSprite${counter}_${idx} = this.children.list.find(
  //     child => child.getData('id') === ${update.targetId}
  //   );

  //   if (targetSprite${counter}_${idx}) {
  //     ${
  //       update.newFrameName
  //         ? `targetSprite${counter}_${idx}.setTexture('spritesheetname', '${update.newFrameName}');`
  //         : ""
  //     }`;

  //               // Add slide-in animation if enabled
  //               if (update.animations?.slideIn?.isEnabled) {
  //                 const slideConfig = update.animations.slideIn.config;
  //                 let initialPos;
  //                 switch (slideConfig.direction) {
  //                   case "left":
  //                     initialPos = `targetSprite${counter}_${idx}.setPosition(${Math.round(
  //                       update.x
  //                     )} - ${slideConfig.distance}, ${Math.round(update.y)});`;
  //                     break;
  //                   case "right":
  //                     initialPos = `targetSprite${counter}_${idx}.setPosition(${Math.round(
  //                       update.x
  //                     )} + ${slideConfig.distance}, ${Math.round(update.y)});`;
  //                     break;
  //                   case "top":
  //                     initialPos = `targetSprite${counter}_${idx}.setPosition(${Math.round(
  //                       update.x
  //                     )}, ${Math.round(update.y)} - ${slideConfig.distance});`;
  //                     break;
  //                   case "bottom":
  //                     initialPos = `targetSprite${counter}_${idx}.setPosition(${Math.round(
  //                       update.x
  //                     )}, ${Math.round(update.y)} + ${slideConfig.distance});`;
  //                     break;
  //                 }

  //                 code += `\n    ${initialPos}
  //     this.tweens.add({
  //       targets: targetSprite${counter}_${idx},
  //       x: ${Math.round(update.x)},
  //       y: ${Math.round(update.y)},
  //       duration: ${slideConfig.duration},
  //       ease: '${slideConfig.ease}'
  //     });`;
  //               }

  //               // Add fade-in animation if enabled
  //               if (update.animations?.fadeIn?.isEnabled) {
  //                 const fadeConfig = update.animations.fadeIn.config;
  //                 code += `\n    targetSprite${counter}_${idx}.setAlpha(0);
  //     this.tweens.add({
  //       targets: targetSprite${counter}_${idx},
  //       alpha: 1,
  //       duration: ${fadeConfig.duration},
  //       ease: '${fadeConfig.ease}'
  //     });`;
  //               }

  //               // Add position animation if enabled
  //               if (update.animations?.position?.isEnabled) {
  //                 const posConfig = update.animations.position.config;
  //                 code += `\n    this.tweens.add({
  //       targets: targetSprite${counter}_${idx},
  //       x: ${Math.round(update.x)} + ${Math.round(posConfig.x * 100)},
  //       y: ${Math.round(update.y)} + ${Math.round(posConfig.y * 100)},
  //       duration: ${posConfig.duration},
  //       repeat: ${posConfig.repeat},
  //       yoyo: ${posConfig.yoyo},
  //       ease: '${posConfig.ease}'
  //     });`;
  //               }

  //               // Add scale animation if enabled
  //               if (update.animations?.scale?.isEnabled) {
  //                 const scaleConfig = update.animations.scale.config;
  //                 code += `\n    this.tweens.add({
  //       targets: targetSprite${counter}_${idx},
  //       scaleX: ${scaleConfig.scaleX},
  //       scaleY: ${scaleConfig.scaleY},
  //       duration: ${scaleConfig.duration},
  //       repeat: ${scaleConfig.repeat},
  //       yoyo: ${scaleConfig.yoyo},
  //       ease: '${scaleConfig.ease}'
  //     });`;
  //               }

  //               // Add disappear animation if enabled
  //               if (update.animations?.disappear?.isEnabled) {
  //                 const disappearConfig = update.animations.disappear.config;
  //                 code += `\n    this.time.delayedCall(${disappearConfig.delay}, () => {
  //       this.tweens.add({
  //         targets: targetSprite${counter}_${idx},
  //         alpha: 0,
  //         duration: ${disappearConfig.duration},
  //         ease: '${disappearConfig.ease}',
  //         onComplete: () => targetSprite${counter}_${idx}.destroy()
  //       });
  //     });`;
  //               }

  //               code += `
  //   }`;
  //             });
  //             code += `\n}, this);\n\n`;
  //           } else if (
  //             sprite.clickAction?.type === "remove" &&
  //             sprite.clickAction.config.framesToDelete?.length > 0
  //           ) {
  //             code += `\n// Click Action Setup
  //   ${varName}.setInteractive();
  //   ${varName}.on('pointerdown', function() {`;

  //             sprite.clickAction.config.framesToDelete.forEach(
  //               (frameConfig, idx) => {
  //                 code += `
  //     const targetSprite = this.children.list.find(
  //       child => child.getData('id') === ${frameConfig.targetId}
  //     );

  //     if (targetSprite) {
  //       this.tweens.add({
  //         targets: targetSprite,
  //         alpha: 0,
  //         duration: ${frameConfig.fadeOutDuration || 500},
  //         delay: ${frameConfig.delay || 0},
  //         ease: '${frameConfig.ease || "Linear"}',
  //         onComplete: () => targetSprite.destroy()
  //       });
  //     }`;
  //               }
  //             );

  //             code += `
  //   }, this);`;
  //           }
  //         }

  //         // code += "\n";
  //       });

  //       // Calculate delay for next sequence
  //       const maxDuration = Math.max(
  //         ...sprites.map((sprite) => {
  //           let duration = 0;
  //           if (sprite.animations.slideIn.isEnabled) {
  //             duration = Math.max(
  //               duration,
  //               sprite.animations.slideIn.config.duration
  //             );
  //           }
  //           if (sprite.animations.fadeIn.isEnabled) {
  //             duration = Math.max(
  //               duration,
  //               sprite.animations.fadeIn.config.duration
  //             );
  //           }
  //           if (sprite.animations.disappear.isEnabled) {
  //             duration = Math.max(
  //               duration,
  //               sprite.animations.disappear.config.delay +
  //                 sprite.animations.disappear.config.duration
  //             );
  //           }
  //           return duration;
  //         })
  //       );

  //       totalDelay += maxDuration + 1000; // Add 1 second gap between sequences
  //       code += "\n";
  //     });

  //     return code;
  //   };

  // Add this new function near handleCopyCode
  const handleCopyAllCode = () => {
    const code = generateAllPhaserCode(placedSprites);
    navigator.clipboard.writeText(code).then(() => {
      console.log("All sprite code copied to clipboard");
    });
  };

  // Add this new function to handle playback
  const handlePlay = () => {
    if (!game?.playground) return;

    setMode("play");
    setIsPlaying(true);
    const scene = game.playground;
    const spriteRefs = new Map();

    // Clear existing sprites
    scene.children.list
      .filter((child) => child.type === "Sprite")
      .forEach((sprite) => sprite.destroy());

    // Only create initial sprites (not click-action results)
    const initialSprites = placedSprites.filter((sprite) => {
      // Don't show sprites that were created from click actions
      if (sprite.isClickActionResult) return false;

      // Don't show sprites that are meant to be added on click
      const isClickActionTarget = placedSprites.some(
        (s) =>
          s.clickAction?.enabled &&
          s.clickAction.type === "add" &&
          s.clickAction.config.frameToAdd === sprite.frameName
      );

      return !isClickActionTarget;
    });

    // Group sprites by sequence
    const groupedSprites = initialSprites.reduce((acc, sprite) => {
      const sequence =
        sprite.animations.slideIn?.config?.priority ||
        sprite.animations.fadeIn?.config?.priority ||
        0;
      if (!acc[sequence]) acc[sequence] = [];
      acc[sequence].push(sprite);
      return acc;
    }, {});

    const sequences = Object.keys(groupedSprites).sort(
      (a, b) => Number(a) - Number(b)
    );
    let totalDelay = 0;

    sequences.forEach((sequence) => {
      const sprites = groupedSprites[sequence];

      scene.time.delayedCall(totalDelay, () => {
        sprites.forEach((sprite) => {
          if (!sprite.isClickActionResult) {
            const newSprite = scene.add
              .sprite(sprite.x, sprite.y, "charactersprite", sprite.frameName)
              .setOrigin(0, 0)
              .setScale(sprite.scale)
              .setRotation(sprite.rotation || 0)
              .setAlpha(sprite.alpha || 1)
              .setInteractive();

            spriteRefs.set(sprite.id, {
              sprite: newSprite,
              data: sprite,
            });

            if (sprite.clickAction?.enabled) {
              newSprite.on("pointerdown", function () {
                handlePreviewClick(sprite, spriteRefs, scene);
              });
            }

            handleSpriteAnimations(sprite, newSprite, scene);
          }
        });
      });

      totalDelay += calculateSequenceDuration(sprites);
    });
  };

  // const handlePreviewClick = (clickedSprite) => {
  //   const scene = game.playground;
  //   if (!scene || !clickedSprite.clickAction?.enabled) return;

  //   const { type, config } = clickedSprite.clickAction;

  //   switch (type) {
  //     case "update":
  //       if (!config.frameToUpdate) return;

  //       config.frameToUpdate.forEach((update) => {
  //         const targetSprite = scene.children.list.find(
  //           (child) => child.getData("id") === Number(update.targetId)
  //         );

  //         if (!targetSprite) return;

  //         // Update frame texture first if needed
  //         if (update.newFrameName) {
  //           targetSprite.setTexture("charactersprite", update.newFrameName);
  //         }

  //         // Handle custom animations first
  //         if (update.animations?.slideIn?.isEnabled) {
  //           const getInitialPosition = () => {
  //             const { direction, distance } = update.animations.slideIn.config;
  //             switch (direction) {
  //               case "left":
  //                 return { x: update.x - distance, y: update.y };
  //               case "right":
  //                 return { x: update.x + distance, y: update.y };
  //               case "top":
  //                 return { x: update.x, y: update.y - distance };
  //               case "bottom":
  //                 return { x: update.x, y: update.y + distance };
  //               default:
  //                 return { x: update.x, y: update.y };
  //             }
  //           };

  //           const initialPos = getInitialPosition();
  //           targetSprite.setPosition(initialPos.x, initialPos.y);

  //           scene.tweens.add({
  //             targets: targetSprite,
  //             x: update.x,
  //             y: update.y,
  //             duration: update.animations.slideIn.config.duration,
  //             ease: update.animations.slideIn.config.ease,
  //             onComplete: () =>
  //               handleCommonAnimations(
  //                 {
  //                   ...update,
  //                   baseX: update.x,
  //                   baseY: update.y,
  //                   animations: update.animations || {},
  //                 },
  //                 targetSprite,
  //                 scene
  //               ),
  //           });
  //         } else if (update.animations?.fadeIn?.isEnabled) {
  //           targetSprite.setAlpha(0);
  //           scene.tweens.add({
  //             targets: targetSprite,
  //             alpha: 1,
  //             duration: update.animations.fadeIn.config.duration,
  //             ease: update.animations.fadeIn.config.ease,
  //             onComplete: () =>
  //               handleCommonAnimations(
  //                 {
  //                   ...update,
  //                   baseX: update.x,
  //                   baseY: update.y,
  //                   animations: update.animations || {},
  //                 },
  //                 targetSprite,
  //                 scene
  //               ),
  //           });
  //         } else {
  //           // Set initial position and properties
  //           targetSprite.setPosition(update.x, update.y);
  //           targetSprite.setScale(update.scale);
  //           targetSprite.setRotation((update.rotation * Math.PI) / 180);
  //           targetSprite.setAlpha(update.alpha);

  //           // Handle common animations directly if no custom animations
  //           handleCommonAnimations(
  //             {
  //               ...update,
  //               baseX: update.x,
  //               baseY: update.y,
  //               animations: update.animations || {},
  //             },
  //             targetSprite,
  //             scene
  //           );
  //         }

  //         // Handle disappear animation separately
  //         if (update.animations?.disappear?.isEnabled) {
  //           scene.time.delayedCall(
  //             update.animations.disappear.config.delay,
  //             () => {
  //               scene.tweens.add({
  //                 targets: targetSprite,
  //                 alpha: 0,
  //                 duration: update.animations.disappear.config.duration,
  //                 ease: update.animations.disappear.config.ease,
  //                 onComplete: () => {
  //                   targetSprite.destroy();
  //                 },
  //               });
  //             }
  //           );
  //         }
  //       });
  //       break;

  //     case "add":
  //       // Keep existing add case
  //       if (
  //         Array.isArray(config.framesToAdd) &&
  //         config.framesToAdd.length > 0
  //       ) {
  //         config.framesToAdd.forEach((frameConfig) => {
  //           // Create the sprite at the original configured position
  //           const newSprite = scene.add
  //             .sprite(
  //               frameConfig.x,
  //               frameConfig.y,
  //               "charactersprite",
  //               frameConfig.frameName
  //             )
  //             .setOrigin(0, 0)
  //             .setScale(frameConfig.scale)
  //             .setRotation(frameConfig.rotation)
  //             .setAlpha(frameConfig.alpha)
  //             .setData("id", Date.now());

  //           // Handle animations without adding to placedSprites
  //           if (frameConfig.animations?.slideIn?.isEnabled) {
  //             const { direction, distance } =
  //               frameConfig.animations.slideIn.config;
  //             let initialPos = { x: frameConfig.x, y: frameConfig.y };

  //             switch (direction) {
  //               case "left":
  //                 initialPos.x = frameConfig.x - distance;
  //                 break;
  //               case "right":
  //                 initialPos.x = frameConfig.x + distance;
  //                 break;
  //               case "top":
  //                 initialPos.y = frameConfig.y - distance;
  //                 break;
  //               case "bottom":
  //                 initialPos.y = frameConfig.y + distance;
  //                 break;
  //             }

  //             newSprite.setPosition(initialPos.x, initialPos.y);
  //             scene.tweens.add({
  //               targets: newSprite,
  //               x: frameConfig.x,
  //               y: frameConfig.y,
  //               duration: frameConfig.animations.slideIn.config.duration,
  //               ease: frameConfig.animations.slideIn.config.ease,
  //               onComplete: () =>
  //                 handleCommonAnimations({ ...frameConfig }, newSprite, scene),
  //             });
  //           } else {
  //             handleCommonAnimations({ ...frameConfig }, newSprite, scene);
  //           }
  //         });
  //       }
  //       break;
  //     case "remove":
  //       if (
  //         Array.isArray(config.framesToDelete) &&
  //         config.framesToDelete.length > 0
  //       ) {
  //         config.framesToDelete.forEach((frameConfig) => {
  //           const targetSprite = scene.children.list.find(
  //             (child) => child.getData("id") === Number(frameConfig.targetId)
  //           );

  //           if (targetSprite) {
  //             scene.tweens.add({
  //               targets: targetSprite,
  //               alpha: 0,
  //               duration: frameConfig.fadeOutDuration || 500,
  //               delay: frameConfig.delay || 0,
  //               ease: frameConfig.ease || "Linear",
  //               onComplete: () => {
  //                 targetSprite.destroy();
  //               },
  //             });
  //           }
  //         });
  //       }
  //       break;
  //   }
  // };

  const handlePreviewClick = (clickedSprite) => {
    const scene = game.playground;
    if (!scene || !clickedSprite.clickAction?.enabled) return;

    // Execute all enabled actions in sequence
    clickedSprite.clickAction.actions.forEach((action) => {
      if (!action.enabled) return;

      switch (action.type) {
        case "add":
          if (
            Array.isArray(action.config.framesToAdd) &&
            action.config.framesToAdd.length > 0
          ) {
            action.config.framesToAdd.forEach((frameConfig) => {
              const newSprite = scene.add
                .sprite(
                  frameConfig.x,
                  frameConfig.y,
                  "charactersprite",
                  frameConfig.frameName
                )
                .setOrigin(0, 0)
                .setScale(frameConfig.scale || 1)
                .setRotation(frameConfig.rotation || 0)
                .setAlpha(frameConfig.alpha || 1);

              // Handle animations for the new sprite
              if (frameConfig.animations) {
                handleSpriteAnimations(frameConfig, newSprite, scene);
              }
            });
          }
          break;

        case "update":
          if (Array.isArray(action.config.frameToUpdate)) {
            action.config.frameToUpdate.forEach((update) => {
              const targetSprite = scene.children.list.find(
                (child) => child.getData("id") === Number(update.targetId)
              );

              if (targetSprite) {
                if (update.newFrameName) {
                  targetSprite.setTexture(
                    "charactersprite",
                    update.newFrameName
                  );
                }

                // Handle animations for the updated sprite
                if (update.animations) {
                  handleSpriteAnimations(update, targetSprite, scene);
                }
              }
            });
          }
          break;

        case "remove":
          if (Array.isArray(action.config.framesToDelete)) {
            action.config.framesToDelete.forEach((frameConfig) => {
              const targetSprites = scene.children.list.filter(
                (child) => 
                  child.getData("id") === Number(frameConfig.targetId) ||
                  (child.getData("frameConfig")?.frameName === frameConfig.frameName &&
                   child.getData("parentId") === frameConfig.parentId)
              );

              targetSprites.forEach(targetSprite => {
                if (targetSprite) {
                  scene.tweens.add({
                    targets: targetSprite,
                    alpha: 0,
                    duration: frameConfig.fadeOutDuration || 500,
                    delay: frameConfig.delay || 0,
                    ease: frameConfig.ease || "Linear",
                    onComplete: () => targetSprite.destroy()
                  });
                }
              });
            });
          }
          break;
      }
    });
  };

  const handleCommonAnimations = (spriteObj, target, scene) => {
    // Position Animation
    if (spriteObj.animations?.position?.isEnabled) {
      scene.tweens.add({
        targets: target,
        x: spriteObj.baseX + spriteObj.animations.position.config.x * 100,
        y: spriteObj.baseY + spriteObj.animations.position.config.y * 100,
        duration: spriteObj.animations.position.config.duration,
        repeat: spriteObj.animations.position.config.repeat,
        yoyo: spriteObj.animations.position.config.yoyo,
        ease: spriteObj.animations.position.config.ease,
      });
    }

    // Scale Animation
    if (spriteObj.animations?.scale?.isEnabled) {
      scene.tweens.add({
        targets: target,
        scaleX: spriteObj.animations.scale.config.scaleX,
        scaleY: spriteObj.animations.scale.config.scaleY,
        duration: spriteObj.animations.scale.config.duration,
        repeat: spriteObj.animations.scale.config.repeat,
        yoyo: spriteObj.animations.scale.config.yoyo,
        ease: spriteObj.animations.scale.config.ease,
      });
    }

    // Alpha Animation
    if (spriteObj.animations?.alpha?.isEnabled) {
      scene.tweens.add({
        targets: target,
        alpha: spriteObj.animations.alpha.config.alpha,
        duration: spriteObj.animations.alpha.config.duration,
        repeat: spriteObj.animations.alpha.config.repeat,
        yoyo: spriteObj.animations.alpha.config.yoyo,
        ease: spriteObj.animations.alpha.config.ease,
      });
    }
  };

  // Add duplicate function
  const handleDuplicate = (originalSprite) => {
    if (!game?.playground) return;

    const scene = game.playground;
    const offsetX = 20; // Offset for duplicate
    const offsetY = 20;

    const duplicateSprite = scene.add
      .sprite(
        originalSprite.x + offsetX,
        originalSprite.y + offsetY,
        "charactersprite",
        originalSprite.frameName
      )
      .setOrigin(0, 0)
      .setInteractive();

    const newSprite = {
      ...originalSprite,
      id: Date.now(),
      x: originalSprite.x + offsetX,
      y: originalSprite.y + offsetY,
      phaserSprite: duplicateSprite,
      clickAction: {
        ...originalSprite.clickAction,
        targetIds: [], // Reset target IDs for duplicate
      },
    };

    duplicateSprite.on("pointerdown", () => {
      if (newSprite.clickAction.enabled) {
        handleSpriteClick(newSprite);
      }
    });

    setPlacedSprites((prev) => [...prev, newSprite]);
  };

  // Add this useEffect to handle frame selection changes
  useEffect(() => {
    setCanPlaceSprite(true); // Enable sprite placement when frame changes
  }, [selectedFrame]);

  // Update the frame selection handler
  const handleFrameSelect = (e) => {
    setSelectedFrame(e.target.value);
    setCanPlaceSprite(true);
  };

  const handleSpriteAnimations = (sprite, target, scene) => {
    // Handle Slide-in Animation
    if (sprite.animations?.slideIn?.isEnabled) {
      const getInitialPosition = () => {
        const { direction, distance } = sprite.animations.slideIn.config;
        switch (direction) {
          case "left":
            return { x: sprite.x - distance, y: sprite.y };
          case "right":
            return { x: sprite.x + distance, y: sprite.y };
          case "top":
            return { x: sprite.x, y: sprite.y - distance };
          case "bottom":
            return { x: sprite.x, y: sprite.y + distance };
          default:
            return { x: sprite.x, y: sprite.y };
        }
      };

      const initialPos = getInitialPosition();
      target.setPosition(initialPos.x, initialPos.y);

      scene.tweens.add({
        targets: target,
        x: sprite.x,
        y: sprite.y,
        duration: sprite.animations.slideIn.config.duration,
        ease: sprite.animations.slideIn.config.ease,
        delay: sprite.animations.slideIn.config.delay,
        onComplete: () => handleCommonAnimations(sprite, target, scene),
      });
    } else if (sprite.animations?.fadeIn?.isEnabled) {
      target.setAlpha(0);
      scene.tweens.add({
        targets: target,
        alpha: 1,
        duration: sprite.animations.fadeIn.config.duration,
        ease: sprite.animations.fadeIn.config.ease,
        delay: sprite.animations.fadeIn.config.delay,
        onComplete: () => handleCommonAnimations(sprite, target, scene),
      });
    } else {
      handleCommonAnimations(sprite, target, scene);
    }

    // Handle Disappear Animation
    if (sprite.animations?.disappear?.isEnabled) {
      scene.time.delayedCall(sprite.animations.disappear.config.delay, () => {
        scene.tweens.add({
          targets: target,
          alpha: 0,
          duration: sprite.animations.disappear.config.duration,
          ease: sprite.animations.disappear.config.ease,
          onComplete: () => target.destroy(),
        });
      });
    }
  };

  const calculateSequenceDuration = (sprites) => {
    return Math.max(
      ...sprites.map((sprite) => {
        let duration = 0;

        // Add slide-in duration if enabled
        if (sprite.animations.slideIn.isEnabled) {
          duration = Math.max(
            duration,
            sprite.animations.slideIn.config.duration +
              sprite.animations.slideIn.config.delay
          );
        }

        // Add fade-in duration if enabled
        if (sprite.animations.fadeIn.isEnabled) {
          duration = Math.max(
            duration,
            sprite.animations.fadeIn.config.duration +
              sprite.animations.fadeIn.config.delay
          );
        }

        // Add disappear duration if enabled
        if (sprite.animations.disappear.isEnabled) {
          duration +=
            sprite.animations.disappear.config.delay +
            sprite.animations.disappear.config.duration;
        }

        return duration;
      }),
      0
    );
  };

  // Modify handleStopPreview to handle click action sprites
  const handleStopPreview = (scene) => {
    // Clear all sprites
    scene.children.list
      .filter((child) => child.type === "Sprite")
      .forEach((sprite) => sprite.destroy());

    // Only restore the original sprites
    const initialSprites = placedSprites;
    setPlacedSprites(initialSprites);

    setMode("edit");
    setIsPlaying(false);
    setCanPlaceSprite(true);
  };

  const saveCurrentState = () => {
    const state = {
      placedSprites: placedSprites.map((sprite) => ({
        id: sprite.id,
        frameName: sprite.frameName,
        x: sprite.x,
        y: sprite.y,
        scale: sprite.scale,
        rotation: sprite.rotation,
        alpha: sprite.alpha,
        animations: sprite.animations,
        clickAction: sprite.clickAction,
      })),
      selectedFrame,
      orientation,
      spritesheet: spritesheet?.src,
      spriteData,
      frameNames,
    };
    saveToLocalStorage(state);
  };

  // Add this useEffect after the game initialization useEffect
  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (!savedState || !game?.playground) return;

    const scene = game.playground;

    // First restore basic state
    setOrientation(savedState.orientation);
    setSelectedFrame(savedState.selectedFrame);
    setFrameNames(savedState.frameNames || []);
    setSpriteData(savedState.spriteData);

    // Then restore spritesheet
    if (savedState.spritesheet) {
      const img = new Image();
      img.onload = () => {
        setSpritesheet(img);

        if (scene.textures.exists("charactersprite")) {
          scene.textures.remove("charactersprite");
        }
        scene.textures.addImage("charactersprite", img);

        // Add frame data to Phaser texture
        if (savedState.spriteData) {
          Object.entries(savedState.spriteData.frames).forEach(
            ([key, frame]) => {
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
            }
          );

          // Clear existing sprites
          scene.children.list
            .filter((child) => child.type === "Sprite")
            .forEach((sprite) => sprite.destroy());

          // Now restore placed sprites
          if (savedState.placedSprites?.length > 0) {
            const restoredSprites = savedState.placedSprites.map(
              (savedSprite) => {
                const sprite = scene.add
                  .sprite(
                    savedSprite.x,
                    savedSprite.y,
                    "charactersprite",
                    savedSprite.frameName
                  )
                  .setOrigin(0, 0)
                  .setScale(savedSprite.scale)
                  .setRotation((savedSprite.rotation * Math.PI) / 180)
                  .setAlpha(savedSprite.alpha || 1)
                  .setInteractive()
                  .setData("id", savedSprite.id);

                scene.input.setDraggable(sprite);

                const newSprite = {
                  ...savedSprite,
                  phaserSprite: sprite,
                  animations:
                    savedSprite.animations || createDefaultAnimations(),
                };

                // Set up event listeners
                sprite.on("pointerdown", () => {
                  if (mode === "edit") {
                    handleSpriteClick(newSprite);
                  } else if (
                    mode === "play" &&
                    newSprite.clickAction?.enabled
                  ) {
                    handlePreviewClick(newSprite);
                  }
                });

                sprite.on("drag", (pointer, dragX, dragY) => {
                  sprite.setPosition(dragX, dragY);
                  newSprite.x = dragX;
                  newSprite.y = dragY;
                  saveCurrentState();
                });

                return newSprite;
              }
            );

            setPlacedSprites(restoredSprites);
          }
        }
      };
      img.src = savedState.spritesheet;
    }
  }, [game, mode]); // Add mode as dependency

  const clearPlaygroundState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlacedSprites([]);
    setSelectedFrame("");
    if (game?.playground) {
      const scene = game.playground;
      scene.children.list
        .filter((child) => child.type === "Sprite")
        .forEach((sprite) => sprite.destroy());
    }
  };

  // Add this new useEffect to handle state saving
  useEffect(() => {
    if (placedSprites.length > 0) {
      saveCurrentState();
    }
  }, [placedSprites]);

  return (
    <div className="flex w-full h-[calc(100vh-55px)] bg-[#1e1e1e] relative">
      <div
        ref={gameContainerRef}
        className="w-[calc(100%-300px)] bg-[#2d2d2d] flex justify-center"
        onClick={handleCanvasClick}
      />

      <div className="w-[300px] bg-[#252525] p-5 border-l border-[#333] h-full overflow-y-auto">
        {mode === "play" ? (
          <PlayModePanel onStopPreview={handleStopPreview} game={game} />
        ) : (
          <>
            {/* Existing edit mode controls */}
            {placedSprites.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCopyAllCode}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Copy All Sprites Code
                </button>
                <button
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className={`flex-1 ${
                    isPlaying
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white px-4 py-2 rounded transition-colors`}
                >
                  {isPlaying ? "Playing..." : "Play Preview"}
                </button>
              </div>
            )}

            {/* Rest of your existing edit mode controls */}
          </>
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
                onChange={handleFrameSelect}
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
                <div className="flex items-center gap-2">
                  <FramePreview frameName={selectedFrame} />
                  <button
                    className={`p-2 border rounded ${
                      !canPlaceSprite ? "bg-purple-500/20" : ""
                    }`}
                    onClick={() => setCanPlaceSprite(true)}
                  >
                    Place New
                  </button>
                </div>
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
                  className={`bg-[#333] p-3 rounded border ${
                    sprite.isDestroyed
                      ? "border-red-500 opacity-50"
                      : "border-[#444]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                      {sprite.frameName}
                      {sprite.isDestroyed && " (Destroyed)"}
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

                  <AnimationPanel
                    sprite={sprite}
                    game={game}
                    setPlacedSprites={setPlacedSprites}
                    placedSprites={placedSprites}
                    spriteData={spriteData}
                    onDuplicate={handleDuplicate}
                  />
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
