import { useEffect, useRef, useState, useCallback, useContext } from "react";
import Phaser from "phaser";
import AnimationPanel from "./components/AnimationPanel";
import SceneManager from "./components/scenes/SceneManager";
import SceneManagerButton from "./components/scenes/SceneManagerButton";
import PreviewModal from "./components/PreviewModal";
import TextPanel from "./components/TextPanel";
import BuildButton from "./components/BuildButton";
import OrientationSelector from "./components/OrientationSelector";

const STORAGE_KEY = "playgroundState";

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

export const ORIENTATIONS = {
  LANDSCAPE: {
    width: 1920,
    height: 1080,
  },
  PORTRAIT: {
    width: 1080,
    height: 1920,
  },
};

const Playground = () => {
  const gameContainerRef = useRef(null);
  const [game, setGame] = useState(null);
  const [spritesheet, setSpritesheet] = useState(null);
  const [spriteData, setSpriteData] = useState(null);
  const [frameNames, setFrameNames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState("");
  const [orientation, setOrientation] = useState("landscape");
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlaceSprite, setCanPlaceSprite] = useState(true);
  const [scenes, setScenes] = useState([
    {
      id: 1,
      name: "Scene 1",
      placedSprites: [],
      texts: [],
      isActive: true,
    },
  ]);
  const [activeSceneId, setActiveSceneId] = useState(1);
  const [isSceneManagerOpen, setIsSceneManagerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Update the addText function to include new properties
  const addText = () => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === activeSceneId) {
          return {
            ...scene,
            texts: [
              ...(scene.texts || []),
              {
                id: Date.now(),
                content: "New Text",
                fontFamily: "Arial",
                fontSize: 24,
                fontWeight: "normal",
                align: "left",
                color: "#ffffff",
                x: 100,
                y: 100,
                delay: 0,
                persistent: true,
              },
            ],
          };
        }
        return scene;
      })
    );
  };

  const updateText = (id, updates) => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === activeSceneId && scene.texts) {
          return {
            ...scene,
            texts: scene.texts.map((text) =>
              text.id === id ? { ...text, ...updates } : text
            ),
          };
        }
        return scene;
      })
    );
  };

  const deleteText = (id) => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === activeSceneId && scene.texts) {
          return {
            ...scene,
            texts: scene.texts.filter((text) => text.id !== id),
          };
        }
        return scene;
      })
    );
  };

  const toggleBackgroundMusic = () => {
    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement
        .play()
        .then(() => setIsAudioPlaying(true))
        .catch((error) => console.log("Audio playback failed:", error));
    } else {
      audioElement.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleBackgroundMusicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(event.target.result);
      audio.loop = true;
      setBackgroundMusic(event.target.result);
      setAudioElement(audio);
      saveCurrentState();
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioElement && audioElement.paused) {
        audioElement.play().catch((error) => {
          console.log("Audio playback failed:", error);
        });
      }
      // Remove the event listener after first interaction
      document.removeEventListener("click", handleUserInteraction);
    };

    if (audioElement) {
      // Add event listener for user interaction
      document.addEventListener("click", handleUserInteraction);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        document.removeEventListener("click", handleUserInteraction);
      }
    };
  }, [audioElement]);

  const getActiveScene = () => scenes.find((s) => s.id === activeSceneId);
  const getActivePlacedSprites = () => getActiveScene()?.placedSprites || [];
  const placedSprites = getActivePlacedSprites();

  const updatePlacedSprites = (updaterFn) => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) =>
        scene.id === activeSceneId
          ? { ...scene, placedSprites: updaterFn(scene.placedSprites) }
          : scene
      )
    );
  };

  const handleAddScene = () => {
    const newId = Math.max(...scenes.map((s) => s.id)) + 1;
    setScenes([
      ...scenes,
      {
        id: newId,
        name: `Scene ${newId}`,
        placedSprites: [],
        isActive: false,
        nextSceneId: null,
      },
    ]);
  };

  const handleDeleteScene = (id) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((s) => s.id !== id));
    if (activeSceneId === id) {
      setActiveSceneId(scenes[0].id);
    }
  };

  const handleSceneNameChange = (id, newName) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  const handleSceneSelect = (sceneId) => {
    if (game?.playground) {
      const scene = game.playground;
      scene.children.list
        .filter((child) => child.type === "Sprite")
        .forEach((sprite) => sprite.destroy());

      const targetScene = scenes.find((s) => s.id === sceneId);

      if (targetScene?.placedSprites?.length > 0) {
        targetScene.placedSprites.forEach((savedSprite) => {
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
            .setInteractive();

          scene.input.setDraggable(sprite);
          sprite.setData("id", savedSprite.id);

          sprite.on("pointerdown", () => handleSpriteClick(savedSprite));
          sprite.on("drag", (pointer, dragX, dragY) => {
            sprite.setPosition(dragX, dragY);
            updateSpritePosition(savedSprite.id, dragX, dragY);
          });
        });
      }
    }
    setActiveSceneId(sceneId);
  };

  const handleSceneTransition = (targetSceneId) => {
    if (!game?.playground) return;

    const scene = game.playground;
    scene.children.list
      .filter((child) => child.type === "Sprite")
      .forEach((sprite) => sprite.destroy());

    setActiveSceneId(targetSceneId);

    const targetScene = scenes.find((s) => s.id === targetSceneId);
    if (targetScene?.placedSprites?.length > 0) {
      targetScene.placedSprites.forEach((savedSprite) => {
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
          .setAlpha(savedSprite.alpha || 1);
      });
    }
  };

  const handleUpdateTransition = (sceneId, nextSceneId, spriteId) => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              placedSprites: scene.placedSprites.map((sprite) =>
                sprite.id === Number(spriteId)
                  ? {
                      ...sprite,
                      clickAction: {
                        enabled: true,
                        actions: [
                          {
                            type: "sceneTransition",
                            enabled: true,
                            config: {
                              targetSceneId: Number(nextSceneId),
                            },
                          },
                        ],
                      },
                    }
                  : sprite
              ),
            }
          : scene
      )
    );
  };

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const dimensions = orientation === "landscape" 
    ? ORIENTATIONS.LANDSCAPE 
    : ORIENTATIONS.PORTRAIT;

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
          this.input.enabled = true;

          // Play background music if exists
          if (backgroundMusic && audioElement) {
            // Add user interaction check
            this.input.on(
              "pointerdown",
              () => {
                if (audioElement.paused) {
                  audioElement.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                  });
                }
              },
              this
            );
          }
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, [orientation, backgroundMusic, audioElement]);

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "landscape" ? "portrait" : "landscape"));
  };

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

  const handleCanvasClick = (e) => {
    if (!game || !spritesheet || !selectedFrame) return;
    const scene = game.playground;
    const rect = e.target.getBoundingClientRect();

    // Get dimensions based on orientation
    const dimensions =
      orientation === "landscape"
        ? ORIENTATIONS.LANDSCAPE
        : ORIENTATIONS.PORTRAIT;

    // Calculate coordinates based on orientation
    const x = (e.clientX - rect.left) * (dimensions.width / rect.width);
    const y = (e.clientY - rect.top) * (dimensions.height / rect.height); 

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

      const previewSprite = scene.add
        .sprite(x, y, "charactersprite", frameConfig.frameName)
        .setOrigin(0, 0)
        .setScale(frameConfig.scale || 1)
        .setAlpha(1)
        .setData("id", Date.now());

      previewSprite.setData("frameConfig", frameConfig);
      previewSprite.setData("parentId", clickActionSprite.id);

      updatePlacedSprites((prev) =>
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

    if (selectedFrame && canPlaceSprite) {
      const sprite = scene.add
        .sprite(x, y, "charactersprite", selectedFrame)
        .setOrigin(0, 0)
        .setInteractive({ draggable: true })
        .setScale(1)
        .setAlpha(1)
        .setData("id", Date.now());

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

      sprite.on("pointerdown", () => {
        handleSpriteClick(newSprite);
      });

      sprite.on("drag", (pointer, dragX, dragY) => {
        sprite.setPosition(dragX, dragY);
        newSprite.x = dragX;
        newSprite.y = dragY;
        updatePlacedSprites((prev) =>
          prev.map((s) =>
            s.id === newSprite.id ? { ...s, x: dragX, y: dragY } : s
          )
        );
      });
      updatePlacedSprites((prev) => [...prev, newSprite]);
      setCanPlaceSprite(false);
      saveCurrentState();
    }
  };

  const handleSpriteClick = (clickedSprite) => {
    if (!game?.playground) return;
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

            updatePlacedSprites((prev) => [...prev, spriteObj]);
          });
        }
        break;
      case "update":
        const { frameToUpdate } = clickedSprite.clickAction.config;

        frameToUpdate.forEach((update) => {
          const targetSprite = placedSprites.find(
            (s) => s.id === Number(update.targetId)
          )?.phaserSprite;
          if (!targetSprite) return;

          if (update.newFrameName) {
            targetSprite.setTexture("charactersprite", update.newFrameName);
          }

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
                  updatePlacedSprites((prev) =>
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

  const updateSpritePosition = (id, newX, newY) => {
    updatePlacedSprites((prev) => {
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

  const updateSpriteScale = (id, newScale) => {
    updatePlacedSprites((prev) =>
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

  const updateSpriteRotation = (id, newRotation) => {
    updatePlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === id) {
          const rotationInRadians = (Number(newRotation) * Math.PI) / 180;
          sprite.phaserSprite.setRotation(rotationInRadians);
          return {
            ...sprite,
            rotation: Number(newRotation),
          };
        }
        return sprite;
      })
    );
    saveCurrentState();
  };

  const updateSpriteTransparency = (id, newAlpha) => {
    updatePlacedSprites((prev) =>
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

  const updateSpritePriority = (spriteId, priority) => {
    updatePlacedSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === spriteId) {
          return {
            ...sprite,
            priority: parseInt(priority),
          };
        }
        return sprite;
      })
    );
    saveCurrentState();
  };

  const deleteSprite = useCallback(
    (id) => {
      setScenes((prevScenes) =>
        prevScenes.map((scene) => {
          if (scene.id === activeSceneId) {
            return {
              ...scene,
              placedSprites: scene.placedSprites.filter(
                (sprite) => sprite.id !== id
              ),
            };
          }
          return scene;
        })
      );

      if (game?.playground) {
        const spriteToDelete = game.playground.children.list.find(
          (child) => child.getData("id") === id
        );
        if (spriteToDelete) {
          spriteToDelete.destroy();
        }
      }

      saveCurrentState();
    },
    [game, activeSceneId]
  );

  const generatePhaserCode = (sprite) => {
    const counter = placedSprites.findIndex((s) => s.id === sprite.id) + 1;
    const varName = `sprite${counter}`;

    let code = `// ${sprite.frameName} sprite
const ${varName} = this.add
  .sprite(${Math.round(sprite.x)}, ${Math.round(
      sprite.y
    )}, 'spritesheetname', '${sprite.frameName}')
  .setOrigin(0, 0)
  .setScale(${sprite.scale})`;
    console.log(sprite.frameName, "frameName");

    if (sprite.animations) {
      if (sprite.animations.slideIn.isEnabled) {
        const slideConfig = sprite.animations.slideIn.config;
        let initialX, initialY;

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

        code += `\n\n// Create slide-in tween with callback for common animations
const slideInTween${counter} = this.tweens.add({
  targets: ${varName},
  x: ${Math.round(sprite.x)},
  y: ${Math.round(sprite.y)},
  duration: ${slideConfig.duration},
  ease: '${slideConfig.ease}',
  delay: ${slideConfig.priority * 200}, // Delay based on priority
  onComplete: function() {`;

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
      console.log("Code copied to clipboard");
    });
  };

  const generateAllPhaserCode = (sprites) => {
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

        code += `const ${varName} = this.add
    .sprite(${Math.round(sprite.x)}, ${Math.round(
          sprite.y
        )}, 'spritesheetname', '${sprite.frameName}')
    .setOrigin(0, 0)
    .setScale(${sprite.scale})
    .setRotation(${((sprite.rotation || 0) * Math.PI) / 180})
    .setAlpha(${sprite.alpha || 1})
    .setData('id', ${sprite.id});\n\n`;

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

  const handleCopyAllCode = () => {
    const code = generateAllPhaserCode(placedSprites);
    navigator.clipboard.writeText(code).then(() => {
      console.log("All sprite code copied to clipboard");
    });
  };

  const handleCommonAnimations = (spriteObj, target, scene) => {
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

  const handleDuplicate = (originalSprite) => {
    if (!game?.playground) return;

    const scene = game.playground;
    const offsetX = 20;
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
        targetIds: [],
      },
    };

    duplicateSprite.on("pointerdown", () => {
      if (newSprite.clickAction.enabled) {
        handleSpriteClick(newSprite);
      }
    });

    updatePlacedSprites((prev) => [...prev, newSprite]);
  };

  useEffect(() => {
    setCanPlaceSprite(true);
  }, [selectedFrame]);

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

  const handleStopPreview = (scene) => {
    // Clear all sprites
    scene.children.list
      .filter((child) => child.type === "Sprite")
      .forEach((sprite) => sprite.destroy());

    // Only restore the original sprites
    const initialSprites = placedSprites;
    updatePlacedSprites(initialSprites);
    setIsPlaying(false);
    setCanPlaceSprite(true);
  };

  const saveCurrentState = () => {
    const state = {
      scenes: scenes.map((scene) => ({
        ...scene,
        placedSprites: scene.placedSprites.map((sprite) => ({
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
      })),
      activeSceneId,
      selectedFrame,
      orientation,
      spritesheet: spritesheet?.src,
      spriteData,
      frameNames,
      backgroundMusic,
    };
    saveToLocalStorage(state);
  };

  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (!savedState || !game?.playground) return;

    const scene = game.playground;

    setScenes(
      savedState.scenes || [
        {
          id: 1,
          name: "Scene 1",
          placedSprites: [],
          isActive: true,
        },
      ]
    );
    setActiveSceneId(savedState.activeSceneId || 1);
    setOrientation(savedState.orientation || "landscape");
    setSelectedFrame(savedState.selectedFrame);
    setFrameNames(savedState.frameNames || []);
    setSpriteData(savedState.spriteData);
    if (savedState?.backgroundMusic) {
      const audio = new Audio(savedState.backgroundMusic);
      audio.loop = true;
      setBackgroundMusic(savedState.backgroundMusic);
      setAudioElement(audio);
    }

    if (savedState.spritesheet) {
      const img = new Image();
      img.onload = () => {
        setSpritesheet(img);

        if (scene.textures.exists("charactersprite")) {
          scene.textures.remove("charactersprite");
        }
        scene.textures.addImage("charactersprite", img);

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

          scene.children.list
            .filter((child) => child.type === "Sprite")
            .forEach((sprite) => sprite.destroy());

          const activeScene = savedState.scenes.find(
            (s) => s.id === savedState.activeSceneId
          );
          if (activeScene?.placedSprites?.length > 0) {
            const restoredSprites = activeScene.placedSprites.map(
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

                sprite.on("pointerdown", () => {
                  handleSpriteClick(newSprite);
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

            setScenes((prevScenes) =>
              prevScenes.map((s) =>
                s.id === savedState.activeSceneId
                  ? { ...s, placedSprites: restoredSprites }
                  : s
              )
            );
          }
        }
      };
      img.src = savedState.spritesheet;
    }
  }, [game]);

  const clearPlaygroundState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setScenes([
      {
        id: 1,
        name: "Scene 1",
        placedSprites: [],
        isActive: true,
      },
    ]);
    setActiveSceneId(1);
    setSelectedFrame("");
    if (game?.playground) {
      const scene = game.playground;
      scene.children.list
        .filter((child) => child.type === "Sprite")
        .forEach((sprite) => sprite.destroy());
    }
  };

  useEffect(() => {
    if (placedSprites.length > 0) {
      saveCurrentState();
    }
  }, [placedSprites]);

  useEffect(() => {
    if (!game?.playground) return;

    const scene = game.playground;
    const activeScene = scenes.find((s) => s.id === activeSceneId);

    // Clear existing text objects
    scene.children.list
      .filter((child) => child.type === "Text")
      .forEach((text) => text.destroy());

    // Render new text objects
    activeScene?.texts?.forEach((text) => {
      const textObject = scene.add.text(text.x, text.y, text.content, {
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        color: text.color,
        fontStyle:
          text.fontWeight === "bold"
            ? "bold"
            : text.fontWeight === "bolder"
            ? "bold"
            : text.fontWeight === "lighter"
            ? "lighter"
            : "normal",
        align: text.align,
        wordWrap: { width: 800 }, // Add word wrap to make alignment visible
      });

      // Set origin based on alignment
      switch (text.align) {
        case "center":
          textObject.setOrigin(0.5, 0);
          break;
        case "right":
          textObject.setOrigin(1, 0);
          break;
        default:
          textObject.setOrigin(0, 0);
      }

      textObject.setInteractive({ draggable: true });

      scene.input.setDraggable(textObject);

      textObject.on("drag", (pointer, dragX, dragY) => {
        textObject.setPosition(dragX, dragY);
        updateText(text.id, { x: dragX, y: dragY });
      });
    });
  }, [game, scenes, activeSceneId]);

  return (
    <div className="flex w-full h-[calc(100vh-55px)] bg-[#1e1e1e] relative">
      <SceneManagerButton
        onToggle={() => setIsSceneManagerOpen(!isSceneManagerOpen)}
        isOpen={isSceneManagerOpen}
      />
      <SceneManager
        scenes={scenes}
        activeSceneId={activeSceneId}
        onSceneSelect={handleSceneSelect}
        onAddScene={handleAddScene}
        onDeleteScene={handleDeleteScene}
        onSceneNameChange={handleSceneNameChange}
        isOpen={isSceneManagerOpen}
        onClose={() => setIsSceneManagerOpen(false)}
        handleUpdateTransition={handleUpdateTransition}
      />
      <div
        ref={gameContainerRef}
        className="w-[calc(100%-300px)] bg-[#2d2d2d] flex justify-center"
        onClick={handleCanvasClick}
      />

      <div className="w-[300px] bg-[#252525] p-5 border-l border-[#333] h-full overflow-y-auto">
        {placedSprites.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopyAllCode}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Copy All Sprites Code
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors mb-2"
            >
              Preview Playable
            </button>
          </div>
        )}

        <BuildButton scenes={scenes} savedState={loadFromLocalStorage()} />

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
          <div className="mb-4">
            <label className="block text-white mb-2">Background Music:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleBackgroundMusicUpload}
              className="w-full p-2 bg-[#333] border border-[#444] text-white rounded hover:border-[#555]"
            />
            {audioElement && (
              <button
                onClick={toggleBackgroundMusic}
                className={`px-4 py-2 rounded ${
                  isAudioPlaying
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isAudioPlaying ? "Pause" : "Play"}
              </button>
            )}
          </div>
        </div>

       {!scenes.some((scene) => scene.placedSprites.length > 0) && <OrientationSelector
          orientation={orientation}
          onOrientationChange={setOrientation}
          disabled={scenes.some((scene) => scene.placedSprites.length > 0)}
        />}

        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-4">Text Elements</h3>
          <button
            onClick={addText}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors mb-4"
          >
            Add Text
          </button>

          {scenes
            .find((s) => s.id === activeSceneId)
            ?.texts?.map((text) => (
              <div key={text.id} className="bg-[#333] p-4 rounded mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-medium">Text Element</h4>
                  <button
                    onClick={() => deleteText(text.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <TextPanel
                  text={text}
                  updateText={(updates) => updateText(text.id, updates)}
                />
              </div>
            ))}
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

                  <div className="mb-3">
                    <label className="block text-white text-xs mb-1">
                      Render Priority:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={sprite.priority || 0}
                        onChange={(e) =>
                          updateSpritePriority(
                            sprite.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                      <input
                        type="number"
                        value={sprite.priority || 0}
                        onChange={(e) =>
                          updateSpritePriority(
                            sprite.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 p-1.5 bg-[#222] border border-[#444] text-white rounded text-sm"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>

                  <AnimationPanel
                    sprite={sprite}
                    game={game}
                    updatePlacedSprites={updatePlacedSprites}
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
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        scenes={scenes}
        backgroundMusic={backgroundMusic}
        texts={scenes.find((s) => s.id === activeSceneId)?.texts || []}
      />
    </div>
  );
};

export default Playground;
