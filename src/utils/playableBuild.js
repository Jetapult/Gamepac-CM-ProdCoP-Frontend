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
    this.backgroundMusic = null;
  }

  getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
    return "unknown";
  }

  trackClick() {
    const iosLink = "${savedState.iosLink || 'https://apps.apple.com'}";
    const androidLink = "${savedState.androidLink || 'https://play.google.com/store'}";
    
    const link = this.getMobileOperatingSystem() === "Android" ? androidLink : iosLink;
    
    if (typeof mraid !== "undefined") {
      mraid.open(link);
    } else {
      window.open(link);
    }
  }

  handleLastSceneClick() {
    const lastScene = ${JSON.stringify(scenes)}.length;
    if (this.currentSceneId === lastScene) {
      this.trackClick();
    }
  }

  preload() {
    // Audio handling similar to PreloaderScene
    if (window.BACKGROUND_AUDIO) {
      this.sound.decodeAudio('backgroundMusic', window.BACKGROUND_AUDIO);
    }

    const img = new Image();
    img.onload = () => {
      this.textures.addImage('spritesheetname', img);
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

    // Add audio decode listener
    this.sound.on('decoded', () => {
      if (this.sound.locked) {
        this.sound.once('unlocked', () => {
          this.startBackgroundMusic();
        });
      } else {
        this.startBackgroundMusic();
      }
    }, this);
  }

  create() {
    if (this.texturesLoaded) {
      this.initScene(1);
    }
  }

  startBackgroundMusic() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
      this.backgroundMusic.play();
    }
  }

  initScene(sceneId) {
    // Clear existing sprites
    this.sprites.forEach(sprite => sprite.destroy());
    this.sprites.clear();
    
    this.currentSceneId = sceneId;
    const currentScene = ${JSON.stringify(scenes)}.find(s => s.id === sceneId);
    if (!currentScene) return;

    // If this is the last scene, add a full-screen interactive zone first
    if (sceneId === ${scenes.length}) {
      const zone = this.add.zone(0, 0, this.game.config.width, this.game.config.height);
      zone.setOrigin(0, 0);
      zone.setInteractive();
      zone.on('pointerdown', () => this.trackClick());
    }

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
      this.handleLastSceneClick();
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
    
    // Convert spritesheet to base64 with Parcel's data-url transformer
    const response = await fetch(savedState.spritesheet);
    const blob = await response.blob();
    const reader = new FileReader();
    
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    const base64Spritesheet = await base64Promise;
    const orientation = savedState.orientation || 'landscape';
    
    const dimensions = orientation === 'landscape' 
      ? { width: 1920, height: 1080 }
      : { width: 1080, height: 1920 };

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
    <meta name="ad.orientation" content="${orientation}">
    <meta name="ad.size" content="width=${dimensions.width},height=${dimensions.height}">
    <meta name="mraid.version" content="3.0">
    <title>Playable Ad</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <style>
        body {
            width: 100%;
            height: 100%;
            background: #000;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        * {
            padding: 0;
            margin: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <script>
        window.SPRITE_DATA = "${base64Spritesheet}";
        window.BACKGROUND_AUDIO = "${savedState.backgroundMusic || ''}";
        
        ${generateMainSceneCode(scenes, savedState)}

        const config = {
            type: Phaser.AUTO,
            width: ${dimensions.width},
            height: ${dimensions.height},
            backgroundColor: "#111",
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                orientation: Phaser.Scale.${orientation.toUpperCase()}
            },
            scene: MainScene
        };

        if (window.mraid) {
            window.mraid.addEventListener('ready', () => {
                window.game = new Phaser.Game(config);
            });
        } else {
            window.game = new Phaser.Game(config);
        }
    </script>
</body>
</html>`;

    zip.file("index.html", html);
    const content = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    });
    saveAs(content, "playable-ad.zip");
  } catch (error) {
    console.error("Build generation error:", error);
    throw error;
  }
}
