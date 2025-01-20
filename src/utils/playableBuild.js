import JSZip from "jszip";
import { saveAs } from "file-saver";

function generateMainSceneCode(scenes, savedState) {
  let code = `
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Main' });
    this.sprites = new Map();
    this.currentSceneId = 1;
    this.texturesLoaded = false;
  }

  preload() {
    const img = new Image();
    img.onload = () => {
      this.textures.addImage('spritesheetname', img);
      
      // Initialize sprite frames
      const spriteFrames = ${JSON.stringify(savedState.spriteData.frames)};
      Object.entries(spriteFrames).forEach(([key, frame]) => {
        this.textures.get('spritesheetname').add(
          key,
          0,
          frame.frame.x,
          frame.frame.y,
          frame.frame.w,
          frame.frame.h
        );
      });
      
      this.texturesLoaded = true;
      this.initScene(1);
    };
    img.src = window.SPRITE_DATA;
  }

  create() {
    if (this.texturesLoaded) {
      this.initScene(1);
    }
  }

  initScene(sceneId) {
    this.currentSceneId = sceneId;
    this.sprites.forEach(sprite => sprite.destroy());
    this.sprites.clear();

    const currentScene = ${JSON.stringify(scenes)}.find(s => s.id === sceneId);
    if (!currentScene) return;

    // Group sprites by priority
    const groupedSprites = currentScene.placedSprites.reduce((acc, sprite) => {
      const priority = Math.max(
        sprite.animations?.slideIn?.config?.priority || 0,
        sprite.animations?.fadeIn?.config?.priority || 0
      );
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(sprite);
      return acc;
    }, {});

    // Sort priorities
    const priorities = Object.keys(groupedSprites).sort((a, b) => Number(a) - Number(b));
    let totalDelay = 0;

    // Create and animate sprites sequence by sequence
    priorities.forEach((priority, sequenceIndex) => {
      const sprites = groupedSprites[priority];
      
      this.time.delayedCall(totalDelay, () => {
        sprites.forEach(sprite => {
          const gameSprite = this.add.sprite(
            sprite.x,
            sprite.y,
            'spritesheetname',
            sprite.frameName
          )
          .setOrigin(0, 0)
          .setScale(sprite.scale || 1)
          .setAlpha(sprite.alpha || 1)
          .setRotation((sprite.rotation || 0) * Math.PI / 180);

          this.sprites.set(sprite.id, gameSprite);
          
          this.applyAnimations(gameSprite, sprite);
          this.handleClickActions(gameSprite, sprite);
        });
      });

      // Calculate delay for next sequence
      const maxDuration = Math.max(
        ...sprites.map(sprite => {
          const slideDuration = sprite.animations?.slideIn?.isEnabled ? 
            (sprite.animations.slideIn.config.duration || 1000) : 0;
          const fadeDuration = sprite.animations?.fadeIn?.isEnabled ? 
            (sprite.animations.fadeIn.config.duration || 1000) : 0;
          return Math.max(slideDuration, fadeDuration);
        })
      );

      totalDelay += maxDuration + 500; // Add 500ms gap between sequences
    });

    // Clear existing text objects
    this.children.list
      .filter((child) => child.type === "Text")
      .forEach((text) => text.destroy());

    // Sort texts by sequence number
    const sortedTexts = [...(currentScene?.texts || [])].sort(
      (a, b) => (a.sequence || 0) - (b.sequence || 0)
    );

    sortedTexts.forEach((text) => {
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

  applyAnimations(gameSprite, sprite) {
    if (!sprite.animations) return;

    // Slide In Animation
    if (sprite.animations.slideIn?.isEnabled) {
      const config = sprite.animations.slideIn.config;
      let startX = sprite.x;
      let startY = sprite.y;
      
      switch (config.direction) {
        case 'left': startX -= config.distance; break;
        case 'right': startX += config.distance; break;
        case 'top': startY -= config.distance; break;
        case 'bottom': startY += config.distance; break;
      }
      
      gameSprite.setPosition(startX, startY);
      this.tweens.add({
        targets: gameSprite,
        x: sprite.x,
        y: sprite.y,
        duration: config.duration,
        ease: config.ease,
        delay: config.delay
      });
    }

    // Fade In Animation
    if (sprite.animations.fadeIn?.isEnabled) {
      gameSprite.setAlpha(0);
      this.tweens.add({
        targets: gameSprite,
        alpha: sprite.alpha || 1,
        duration: sprite.animations.fadeIn.config.duration,
        ease: sprite.animations.fadeIn.config.ease,
        delay: sprite.animations.fadeIn.config.delay
      });
    }

    // Position Animation
    if (sprite.animations.position?.isEnabled) {
      this.tweens.add({
        targets: gameSprite,
        x: gameSprite.x + (sprite.animations.position.config.x * 100),
        y: gameSprite.y + (sprite.animations.position.config.y * 100),
        duration: sprite.animations.position.config.duration,
        repeat: sprite.animations.position.config.repeat,
        ease: sprite.animations.position.config.ease,
        yoyo: sprite.animations.position.config.yoyo
      });
    }

    // Scale Animation
    if (sprite.animations.scale?.isEnabled) {
      this.tweens.add({
        targets: gameSprite,
        scaleX: sprite.animations.scale.config.scaleX,
        scaleY: sprite.animations.scale.config.scaleY,
        duration: sprite.animations.scale.config.duration,
        repeat: sprite.animations.scale.config.repeat,
        ease: sprite.animations.scale.config.ease,
        yoyo: sprite.animations.scale.config.yoyo
      });
    }

    // Transparency Animation
    if (sprite.animations.transparency?.isEnabled) {
      this.tweens.add({
        targets: gameSprite,
        alpha: sprite.animations.transparency.config.alpha,
        duration: sprite.animations.transparency.config.duration,
        repeat: sprite.animations.transparency.config.repeat,
        ease: sprite.animations.transparency.config.ease,
        yoyo: sprite.animations.transparency.config.yoyo
      });
    }

    // Disappear Animation
    if (sprite.animations.disappear?.isEnabled) {
      this.time.delayedCall(sprite.animations.disappear.config.delay, () => {
        this.tweens.add({
          targets: gameSprite,
          alpha: 0,
          duration: sprite.animations.disappear.config.duration,
          ease: sprite.animations.disappear.config.ease,
          onComplete: () => gameSprite.destroy()
        });
      });
    }
  }

  handleClickActions(gameSprite, sprite) {
    if (!sprite.clickAction?.enabled) return;

    gameSprite.setInteractive();
    gameSprite.on('pointerdown', () => {
      sprite.clickAction.actions?.forEach(action => {
        if (!action.enabled) return;
        
        switch (action.type) {
          case 'sceneTransition':
            if (action.config?.targetSceneId) {
              this.initScene(action.config.targetSceneId);
            }
            break;

          case 'update':
            if (action.config?.frameToUpdate) {
              action.config.frameToUpdate.forEach(update => {
                const targetSprite = this.sprites.get(Number(update.targetId));
                if (targetSprite) {
                  // Stop existing tweens
                  this.tweens.getTweensOf(targetSprite).forEach(tween => {
                    tween.stop();
                    tween.remove();
                  });

                  if (update.newFrameName) {
                    targetSprite.setTexture('spritesheetname', update.newFrameName);
                  }
                  if (update.x !== undefined) targetSprite.x = Number(update.x);
                  if (update.y !== undefined) targetSprite.y = Number(update.y);
                  if (update.scale !== undefined) targetSprite.setScale(Number(update.scale));
                  if (update.rotation !== undefined) {
                    targetSprite.setRotation((Number(update.rotation) * Math.PI) / 180);
                  }
                  if (update.alpha !== undefined) targetSprite.setAlpha(Number(update.alpha));

                  this.applyAnimations(targetSprite, update);
                }
              });
            }
            break;

          case 'add':
            if (action.config?.framesToAdd) {
              action.config.framesToAdd.forEach(frameToAdd => {
                const newSprite = this.add.sprite(
                  frameToAdd.x,
                  frameToAdd.y,
                  'spritesheetname',
                  frameToAdd.frameName
                )
                .setOrigin(0, 0)
                .setScale(frameToAdd.scale || 1)
                .setAlpha(frameToAdd.alpha || 1)
                .setRotation((frameToAdd.rotation || 0) * Math.PI / 180);

                this.sprites.set(frameToAdd.id, newSprite);
                this.applyAnimations(newSprite, frameToAdd);
              });
            }
            break;

          case 'remove':
            if (action.config?.framesToDelete) {
              action.config.framesToDelete.forEach(frameId => {
                const spriteToRemove = this.sprites.get(frameId);
                if (spriteToRemove) {
                  if (sprite.animations?.disappear?.isEnabled) {
                    this.tweens.add({
                      targets: spriteToRemove,
                      alpha: 0,
                      duration: sprite.animations.disappear.config.duration || 1000,
                      ease: sprite.animations.disappear.config.ease || 'Linear',
                      onComplete: () => {
                        spriteToRemove.destroy();
                        this.sprites.delete(frameId);
                      }
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
}`;

  return code;
}

export async function generatePlayableBuild(scenes, savedState) {
  try {
    const zip = new JSZip();
    
    // Convert spritesheet to base64
    const response = await fetch(savedState.spritesheet);
    const blob = await response.blob();
    const reader = new FileReader();
    
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    const base64Spritesheet = await base64Promise;
    const orientation = savedState.orientation || 'landscape';
    
    // Define dimensions based on orientation
    const dimensions = orientation === 'landscape' 
      ? { width: 1920, height: 1080 }
      : { width: 1080, height: 1920 };

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Playable Ad</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <style>
        body { margin: 0; padding: 0; background: #000; }
        canvas { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <script>
        window.SPRITE_DATA = "${base64Spritesheet}";
        
        ${generateMainSceneCode(scenes, savedState)}

        const config = {
            type: Phaser.AUTO,
            width: ${dimensions.width},
            height: ${dimensions.height},
            backgroundColor: "#111",
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: ${dimensions.width},
                height: ${dimensions.height},
            },
            scene: MainScene
        };

        window.onload = () => new Phaser.Game(config);
    </script>
</body>
</html>`;

    zip.file("index.html", html);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "playable-ad.zip");
  } catch (error) {
    console.error("Build generation error:", error);
    throw error;
  }
}
