import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ORIENTATIONS } from "../Playground";

const PreviewModal = ({ isOpen, onClose, scenes, backgroundMusic, texts }) => {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (isOpen && gameContainerRef.current) {
      const savedState = JSON.parse(localStorage.getItem("playgroundState"));
      if (!savedState?.spritesheet || !savedState?.spriteData) return;

      const orientation = savedState.orientation || "landscape";
      const dimensions =
        orientation === "landscape"
          ? ORIENTATIONS.LANDSCAPE
          : ORIENTATIONS.PORTRAIT;

      class PlayableScene extends Phaser.Scene {
        constructor() {
          super({ key: "PlayableScene" });
          this.texturesLoaded = false;
          this.sprites = new Map();
          this.currentSceneId = 1;
        }

        getMobileOperatingSystem() {
          const userAgent = navigator.userAgent || navigator.vendor || window.opera;
          if (/android/i.test(userAgent)) return "Android";
          if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
          return "unknown";
        }
      
        trackClick() {
          const savedState = JSON.parse(localStorage.getItem("playgroundState"));
          const iosLink = savedState?.iosLink || 'https://apps.apple.com';
          const androidLink = savedState?.androidLink || 'https://play.google.com/store';
          const link = this.getMobileOperatingSystem() === "Android" ? androidLink : iosLink;
          window.open(link);
        }

        create() {
          if (!this.texturesLoaded) {
            const img = new Image();
            img.src = savedState.spritesheet;

            img.onload = () => {
              this.textures.addImage("charactersprite", img);

              Object.entries(savedState.spriteData.frames).forEach(
                ([key, frame]) => {
                  this.textures
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

              this.texturesLoaded = true;
              const firstScene = scenes.find((s) => s.id === 1);
              if (firstScene) {
                this.initScene(firstScene.id);
              }
            };
          } else {
            const firstScene = scenes.find((s) => s.id === 1);
            if (firstScene) {
              this.initScene(firstScene.id);
            }
          }
        }

        applyAnimations(gameSprite, sprite) {
          if (sprite.animations) {
            // Position Animation
            if (sprite.animations.position?.isEnabled) {
              const { x, y, duration, repeat, ease, yoyo } =
                sprite.animations.position.config;
              this.tweens.add({
                targets: gameSprite,
                x: gameSprite.x + x * 100,
                y: gameSprite.y + y * 100,
                duration,
                repeat,
                ease,
                yoyo,
              });
            }

            // Scale Animation
            if (sprite.animations.scale?.isEnabled) {
              const { scaleX, scaleY, duration, repeat, ease, yoyo } =
                sprite.animations.scale.config;
              this.tweens.add({
                targets: gameSprite,
                scaleX,
                scaleY,
                duration,
                repeat,
                ease,
                yoyo,
              });
            }

            // Transparency Animation
            if (sprite.animations.transparency?.isEnabled) {
              const { alpha, duration, repeat, ease, yoyo } =
                sprite.animations.transparency.config;
              this.tweens.add({
                targets: gameSprite,
                alpha,
                duration,
                repeat,
                ease,
                yoyo,
              });
            }

            // Slide In Animation
            if (sprite.animations.slideIn?.isEnabled) {
              const { direction, distance, duration, ease, delay } =
                sprite.animations.slideIn.config;
              const startX =
                direction === "left"
                  ? -distance
                  : direction === "right"
                  ? distance
                  : 0;
              const startY =
                direction === "up"
                  ? -distance
                  : direction === "down"
                  ? distance
                  : 0;

              gameSprite.x += startX;
              gameSprite.y += startY;

              this.tweens.add({
                targets: gameSprite,
                x: gameSprite.x - startX,
                y: gameSprite.y - startY,
                duration,
                ease,
                delay,
              });
            }

            // Fade In Animation
            if (sprite.animations.fadeIn?.isEnabled) {
              const { duration, ease, delay } = sprite.animations.fadeIn.config;
              gameSprite.alpha = 0;
              this.tweens.add({
                targets: gameSprite,
                alpha: sprite.alpha || 1,
                duration,
                ease,
                delay,
              });
            }

            // Disappear Animation
            if (sprite.animations.disappear?.isEnabled) {
              const { delay, duration, ease } =
                sprite.animations.disappear.config;
              this.tweens.add({
                targets: gameSprite,
                alpha: 0,
                delay,
                duration,
                ease,
                onComplete: () => {
                  gameSprite.destroy();
                },
              });
            }
          }
        }

        handleClickActions(gameSprite, sprite) {
          if (sprite.clickAction?.enabled) {
            gameSprite.setInteractive();
            gameSprite.on("pointerdown", () => {
              sprite.clickAction.actions?.forEach((action) => {
                if (!action.enabled) return;

                switch (action.type) {
                  case "sceneTransition":
                    if (action.config?.targetSceneId) {
                      this.initScene(action.config.targetSceneId);
                    }
                    break;
                  case "update":
                    if (action.config?.frameToUpdate) {
                      action.config.frameToUpdate.forEach((update) => {
                        const targetSprite = this.sprites.get(
                          Number(update.targetId)
                        );
                        if (targetSprite) {
                          // Stop existing tweens
                          this.tweens
                            .getTweensOf(targetSprite)
                            .forEach((tween) => {
                              tween.stop();
                              tween.remove();
                            });

                          // Update sprite properties first (reference: ClickActionPanel lines 1014-1032)
                          if (update.newFrameName) {
                            targetSprite.setTexture(
                              "charactersprite",
                              update.newFrameName
                            );
                          }
                          if (update.x !== undefined)
                            targetSprite.x = Number(update.x);
                          if (update.y !== undefined)
                            targetSprite.y = Number(update.y);
                          if (update.scale !== undefined)
                            targetSprite.setScale(Number(update.scale));
                          if (update.rotation !== undefined) {
                            targetSprite.setRotation(
                              (Number(update.rotation) * Math.PI) / 180
                            );
                          }
                          if (update.alpha !== undefined)
                            targetSprite.setAlpha(Number(update.alpha));

                          // Handle entrance animations and other animations
                          if (update.animations?.slideIn?.isEnabled) {
                            const { direction, distance, duration, ease } =
                              update.animations.slideIn.config;
                            const baseX = targetSprite.x;
                            const baseY = targetSprite.y;

                            switch (direction) {
                              case "left":
                                targetSprite.x = baseX - (distance || 0);
                                break;
                              case "right":
                                targetSprite.x = baseX + (distance || 0);
                                break;
                              case "top":
                                targetSprite.y = baseY - (distance || 0);
                                break;
                              case "bottom":
                                targetSprite.y = baseY + (distance || 0);
                                break;
                            }

                            this.tweens.add({
                              targets: targetSprite,
                              x: baseX,
                              y: baseY,
                              duration: duration || 1000,
                              ease: ease || "Linear",
                              onComplete: () =>
                                this.applyAnimations(targetSprite, update),
                            });
                          } else if (update.animations?.fadeIn?.isEnabled) {
                            const { duration, ease } =
                              update.animations.fadeIn.config;
                            const currentAlpha = targetSprite.alpha;
                            targetSprite.setAlpha(0);
                            this.tweens.add({
                              targets: targetSprite,
                              alpha: currentAlpha,
                              duration: duration || 1000,
                              ease: ease || "Linear",
                              onComplete: () =>
                                this.applyAnimations(targetSprite, update),
                            });
                          } else {
                            this.applyAnimations(targetSprite, update);
                          }
                        }
                      });
                    }
                    break;
                  case "add":
                    if (action.config?.framesToAdd) {
                      action.config.framesToAdd.forEach((frameToAdd) => {
                        const newSprite = this.add
                          .sprite(
                            frameToAdd.x,
                            frameToAdd.y,
                            "charactersprite",
                            frameToAdd.frameName
                          )
                          .setOrigin(0, 0)
                          .setScale(frameToAdd.scale || 1)
                          .setAlpha(frameToAdd.alpha || 1)
                          .setRotation(
                            ((frameToAdd.rotation || 0) * Math.PI) / 180
                          );

                        this.sprites.set(frameToAdd.id, newSprite);

                        // Apply animations to the new sprite
                        if (frameToAdd.animations) {
                          this.applyAnimations(newSprite, frameToAdd);
                        }
                      });
                    }
                    break;
                  case "remove":
                    if (action.config?.framesToDelete) {
                      action.config.framesToDelete.forEach((frameId) => {
                        const spriteToRemove = this.sprites.get(frameId);
                        if (spriteToRemove) {
                          // Apply disappear animation if configured
                          const disappearConfig = sprite.animations?.disappear;
                          if (disappearConfig?.isEnabled) {
                            this.tweens.add({
                              targets: spriteToRemove,
                              alpha: 0,
                              duration: disappearConfig.config.duration || 1000,
                              ease: disappearConfig.config.ease || "Linear",
                              onComplete: () => {
                                spriteToRemove.destroy();
                                this.sprites.delete(frameId);
                              },
                            });
                          } else {
                            spriteToRemove.destroy();
                            this.sprites.delete(frameId);
                          }
                        }
                      });
                    }
                    break;
                }
              });
            });
          }
        }

        initScene(sceneId) {
          this.currentSceneId = sceneId;
          this.sprites.forEach((sprite) => sprite.destroy());
          this.sprites.clear();

          const currentScene = scenes.find((s) => s.id === sceneId);
          if (!currentScene) return;

          if (sceneId === scenes.length) {
            const zone = this.add.zone(0, 0, this.game.config.width, this.game.config.height);
            zone.setOrigin(0, 0);
            zone.setInteractive();
            zone.on('pointerdown', () => this.trackClick());
          }

          // Group sprites by priority
          const groupedSprites = currentScene.placedSprites.reduce(
            (acc, sprite) => {
              const priority = Math.max(
                sprite.animations?.slideIn?.config?.priority || 0,
                sprite.animations?.fadeIn?.config?.priority || 0
              );
              if (!acc[priority]) acc[priority] = [];
              acc[priority].push(sprite);
              return acc;
            },
            {}
          );

          // Sort priorities
          const priorities = Object.keys(groupedSprites).sort(
            (a, b) => Number(a) - Number(b)
          );
          let totalDelay = 0;

          // Create and animate sprites sequence by sequence
          priorities.forEach((priority, sequenceIndex) => {
            const sprites = groupedSprites[priority];

            // Delay the creation and animation of each sequence
            this.time.delayedCall(totalDelay, () => {
              sprites.forEach((sprite) => {
                const gameSprite = this.add
                  .sprite(
                    sprite.x,
                    sprite.y,
                    "charactersprite",
                    sprite.frameName
                  )
                  .setOrigin(0, 0)
                  .setScale(sprite.scale || 1)
                  .setAlpha(sprite.alpha || 1)
                  .setRotation(((sprite.rotation || 0) * Math.PI) / 180);

                gameSprite.setData("id", sprite.id);
                this.sprites.set(sprite.id, gameSprite);

                this.applyAnimations(gameSprite, sprite);
                this.handleClickActions(gameSprite, sprite);
              });
            });

            // Calculate delay for next sequence
            const maxDuration = Math.max(
              ...sprites.map((sprite) => {
                const slideDuration = sprite.animations?.slideIn?.isEnabled
                  ? sprite.animations.slideIn.config.duration || 1000
                  : 0;
                const fadeDuration = sprite.animations?.fadeIn?.isEnabled
                  ? sprite.animations.fadeIn.config.duration || 1000
                  : 0;
                return Math.max(slideDuration, fadeDuration);
              })
            );

            totalDelay += maxDuration + 500; // Add 500ms gap between sequences
          });

          // Clear existing text objects
          this.children.list
            .filter((child) => child.type === "Text")
            .forEach((text) => text.destroy());

          // Sort texts by sequence number (add this property in TextPanel)
          const sortedTexts = [...(currentScene?.texts || [])].sort(
            (a, b) => (a.sequence || 0) - (b.sequence || 0)
          );

          sortedTexts.forEach((text, index) => {
            const textObject = this.add
              .text(text.x, text.y, text.content, {
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
                wordWrap: { width: 800 },
              })
              .setDepth(1000);

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

            // Start with full opacity if persistent, otherwise start invisible
            textObject.setAlpha(text.persistent ? 1 : 0);

            if (!text.persistent) {
              // Show text immediately with fade in
              this.tweens.add({
                targets: textObject,
                alpha: 1,
                duration: 200, // Reduced duration for faster appearance
                onComplete: () => {
                  // Hide text after display duration
                  this.time.delayedCall(text.displayDuration || 2000, () => {
                    this.tweens.add({
                      targets: textObject,
                      alpha: 0,
                      duration: 200, // Reduced duration for faster fade out
                      onComplete: () => textObject.destroy(),
                    });
                  });
                },
              });
            }
          });
        }
      }

      const config = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: "#000000",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: dimensions.width,
          height: dimensions.height,
          min: {
            width: dimensions.width / 4,
            height: dimensions.height / 4,
          },
          max: {
            width: dimensions.width,
            height: dimensions.height,
          },
        },
        scene: PlayableScene,
      };

      gameInstanceRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl font-bold z-50 bg-purple-600 p-2 rounded-full hover:bg-purple-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <div
        ref={gameContainerRef}
        className="w-full h-full"
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          margin: "auto",
        }}
      />
    </div>
  );
};

export default PreviewModal;
