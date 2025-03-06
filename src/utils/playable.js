import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function generateFullPhaserCode(scenes, savedState) {
  let code = `
  class PreloaderScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Preload' });
      this.loadComplete = false;
    }
  
    preload() {
      if (window.BACKGROUND_AUDIO) {
        this.load.audio('backgroundMusic', window.BACKGROUND_AUDIO);
      }
      
      const img = new Image();
      img.onload = () => {
        this.textures.addImage('spritesheetname', img);
        this.loadComplete = true;
      };
      img.src = window.SPRITE_DATA;
    }
  
    create() {
      if (this.loadComplete) {
        this.scene.start('Scene1');
      } else {
        this.time.delayedCall(100, () => this.create());
      }
    }
  }
  
  ${generateSceneClasses(scenes)}
  
  const config = {
    type: Phaser.AUTO,
    width: ${savedState?.orientation === "landscape" ? 1920 : 1080},
    height: ${savedState?.orientation === "landscape" ? 1080 : 1920},
    backgroundColor: "#111",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PreloaderScene, ${scenes.map((_, i) => `Scene${i + 1}`).join(", ")}]
  };
  
  window.game = new Phaser.Game(config);`;

  return code;
}

function generateSceneClasses(scenes) {
  return scenes
    .map(
      (scene, index) => `
  class Scene${index + 1} extends Phaser.Scene {
    constructor() {
      super({ key: 'Scene${index + 1}' });
      this.sprites = new Map();
    }
  
    create() {
      ${generateSpritesCode(scene.placedSprites || [])}
      ${generateTextsCode(scene.texts || [])}
    }
  }`
    )
    .join("\n\n");
}

function generateSpritesCode(sprites) {
  if (!sprites || sprites.length === 0) return "";

  const groupedSprites = sprites.reduce((acc, sprite) => {
    const priority = sprite.priority || 0;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(sprite);
    return acc;
  }, {});

  const priorities = Object.keys(groupedSprites).sort(
    (a, b) => Number(a) - Number(b)
  );
  let code = "";
  let totalDelay = 0;

  priorities.forEach((priority) => {
    const sprites = groupedSprites[priority];
    sprites.forEach((sprite, index) => {
      const varName = `sprite${index + 1}_seq${priority}`;

      // Base sprite creation
      code += generateBaseSpriteCode(sprite, varName);

      // Animations
      code += generateAnimationsCode(sprite, varName, totalDelay);

      // Click handlers
      if (sprite.clickAction?.enabled) {
        code += generateClickHandlerCode(sprite, varName);
      }
    });
  });

  return code;
}

function generateBaseSpriteCode(sprite, varName) {
  return `const ${varName} = this.add
      .sprite(${Math.round(sprite.x)}, ${Math.round(
    sprite.y
  )}, 'spritesheetname', '${sprite.frameName}')
      .setOrigin(0, 0)
      .setScale(${sprite.scale})
      .setRotation(${((sprite.rotation || 0) * Math.PI) / 180})
      .setAlpha(${sprite.alpha || 1})
      .setData('id', ${sprite.id});\n\n`;
}

function generateAnimationsCode(sprite, varName, totalDelay) {
  let code = "";

  if (sprite.animations?.position?.isEnabled) {
    const posConfig = sprite.animations.position.config;
    code += `
  // Position animation
  this.tweens.add({
    targets: ${varName},
    x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
    y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
    duration: ${posConfig.duration},
    repeat: ${posConfig.repeat},
    yoyo: ${posConfig.yoyo},
    ease: '${posConfig.ease}'
  });\n`;
  }

  if (sprite.animations?.scale?.isEnabled) {
    const scaleConfig = sprite.animations.scale.config;
    code += `
  // Scale animation
  this.tweens.add({
    targets: ${varName},
    scaleX: ${scaleConfig.scaleX},
    scaleY: ${scaleConfig.scaleY},
    duration: ${scaleConfig.duration},
    repeat: ${scaleConfig.repeat},
    yoyo: ${scaleConfig.yoyo},
    ease: '${scaleConfig.ease}'
  });\n`;
  }

  if (sprite.animations?.transparency?.isEnabled) {
    const alphaConfig = sprite.animations.transparency.config;
    code += `
  // Transparency animation
  this.tweens.add({
    targets: ${varName},
    alpha: ${alphaConfig.alpha},
    duration: ${alphaConfig.duration},
    repeat: ${alphaConfig.repeat},
    ease: '${alphaConfig.ease}'
  });\n`;
  }

  return code;
}

function generateClickHandlerCode(sprite, varName) {
  if (!sprite.clickAction) return "";

  let code = "";
  sprite.clickAction.actions.forEach((action) => {
    switch (action.type) {
      case "add":
        code += generateAddAction(action);
        break;
      case "update":
        code += generateUpdateAction(action);
        break;
      case "remove":
        code += generateRemoveAction(action);
        break;
    }
  });

  return code;
}

function generateAddAction(action) {
  if (!action.config?.framesToAdd) return "";

  return action.config.framesToAdd
    .map(
      (frame) => `
      const ${frame.id}_sprite = this.add.sprite(${frame.x}, ${
        frame.y
      }, 'spritesheetname', '${frame.frameName}')
        .setOrigin(0, 0)
        .setScale(${frame.scale || 1})
        .setAlpha(${frame.alpha || 1})
        .setRotation(${frame.rotation || 0})
        .setDepth(${frame.priority || 0})
        .setData('parentId', ${action.config.parentId})
        .setData('frameConfig', ${JSON.stringify(frame)});
  
      this.sprites.set('${frame.id}', ${frame.id}_sprite);
    `
    )
    .join("\n");
}

function generateUpdateAction(action) {
  if (!action.config?.frameToUpdate) return "";

  return action.config.frameToUpdate
    .map(
      (update) => `
      const updateTarget_${update.targetId} = this.children.list.find(
        child => child.getData('id') === ${update.targetId}
      );
      if (updateTarget_${update.targetId}) {
        // Stop existing tweens
        this.tweens.getTweensOf(updateTarget_${
          update.targetId
        }).forEach((tween) => {
          tween.stop();
          tween.remove();
        });
        ${
          update.newFrameName
            ? `updateTarget_${update.targetId}.setTexture('spritesheetname', '${update.newFrameName}');`
            : ""
        }
        updateTarget_${update.targetId}.setPosition(${update.x}, ${update.y});
        updateTarget_${update.targetId}.setScale(${update.scale});
        updateTarget_${update.targetId}.setRotation(${
        ((update.rotation || 0) * Math.PI) / 180
      });
        updateTarget_${update.targetId}.setAlpha(${update.alpha || 1});
        // Handle animations
        const startAnimations = () => {
          // Position animation
          ${
            update.animations?.position?.isEnabled
              ? `
          this.tweens.add({
            targets: updateTarget_${update.targetId},
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
            targets: updateTarget_${update.targetId},
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
            targets: updateTarget_${update.targetId},
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
          updateTarget_${update.targetId}.setAlpha(0);
          this.tweens.add({
            targets: updateTarget_${update.targetId},
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
              targets: updateTarget_${update.targetId},
              alpha: 0,
              duration: ${update.animations.disappear.config.duration},
              ease: '${update.animations.disappear.config.ease}',
              onComplete: () => updateTarget_${update.targetId}.destroy()
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
        updateTarget_${update.targetId}.setPosition(startX, startY);
        this.tweens.add({
          targets: updateTarget_${update.targetId},
          x: ${update.x},
          y: ${update.y},
          duration: ${update.animations.slideIn.config.duration},
          ease: '${update.animations.slideIn.config.ease}',
          onComplete: startAnimations
        });`
            : `
        startAnimations();`
        }
      }
    `
    )
    .join("\n");
}

function generateRemoveAction(action) {
  if (!action.config?.framesToDelete) return "";

  return action.config.framesToDelete
    .map(
      (frame) => `
      const targetToRemove_${frame.targetId} = this.children.list.find(
        child => child.getData('id') === ${frame.targetId}
      );
      if (targetToRemove_${frame.targetId}) {
        // Stop any existing tweens
        this.tweens.getTweensOf(targetToRemove_${
          frame.targetId
        }).forEach((tween) => {
          tween.stop();
          tween.remove();
        });
  
        // Add fade out and destroy
        this.tweens.add({
          targets: targetToRemove_${frame.targetId},
          alpha: 0,
          duration: ${frame.fadeOutDuration || 500},
          delay: ${frame.delay || 0},
          ease: '${frame.ease || "Linear"}',
          onComplete: () => {
            if (targetToRemove_${frame.targetId} && targetToRemove_${
        frame.targetId
      }.destroy) {
              targetToRemove_${frame.targetId}.destroy();
            }
          }
        });
      }
    `
    )
    .join("\n");
}

export function generateTextsCode(texts) {
  return (
    texts
      ?.map(
        (text) => `
      this.add.text(${text.x}, ${text.y}, '${text.content}', {
        fontFamily: '${text.fontFamily}',
        fontSize: ${text.fontSize},
        color: '${text.color}',
        fontWeight: '${text.fontWeight}',
        align: '${text.align}'
      })
      .setAlpha(${text.persistent ? 1 : 0})
      .setDepth(${text.sequence || 0});
    `
      )
      .join("\n") || ""
  );
}

function generatePreloaderScene() {
  return `
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
    this.loadComplete = false;
  }

  preload() {
    const img = new Image();
    img.onload = () => {
      this.textures.addImage('spritesheetname', img);
      this.loadComplete = true;
    };
    img.src = window.SPRITE_DATA;

    if (window.BACKGROUND_AUDIO) {
      this.load.audio('backgroundMusic', window.BACKGROUND_AUDIO);
    }
  }

  create() {
    if (this.loadComplete) {
      this.scene.start('Scene1');
    } else {
      this.time.delayedCall(100, () => this.create());
    }
  }
}`;
}

function generateMainScene(scenes, savedState) {
  return `
export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Main' });
    this.sprites = new Map();
  }

  create() {
    ${generateSpritesCode(scenes)}
    ${generateClickHandlers(scenes)}
    ${generateSceneTransitions(scenes)}
  }
}`;
}

function generateSpriteCode(sprite, index, sceneIndex) {
  const varName = `sprite${index + 1}_scene${sceneIndex}`;
  let code = `const ${varName} = this.add.sprite(${Math.round(sprite.x)}, ${Math.round(sprite.y)}, 'spritesheetname', '${sprite.frameName}')
    .setOrigin(0, 0)
    .setScale(${sprite.scale})
    .setRotation(${((sprite.rotation || 0) * Math.PI) / 180})
    .setAlpha(${sprite.alpha || 1});\n`;

  // Add animations
  code += generateAnimationCode(sprite, varName);
  return code;
}

export async function generatePhaserApp(scenes, savedState) {
  try {
    const zip = new JSZip();
    
    // Create folder structure
    const src = zip.folder("src");
    const scenes_folder = src.folder("scenes");
    const assets = zip.folder("assets");

    // Add package.json
    zip.file("package.json", JSON.stringify({
      name: "phaser-playable",
      version: "1.0.0",
      private: true,
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      dependencies: {
        "phaser": "^3.87.0"
      },
      devDependencies: {
        "vite": "^4.4.5"
      }
    }, null, 2));

    // Add index.html
    zip.file("index.html", generateIndexHtml());

    // Add main.js
    src.file("main.js", generateMainJs(savedState));

    // Add scene files
    scenes_folder.file("PreloaderScene.js", generatePreloaderScene());
    scenes_folder.file("MainScene.js", generateMainScene(scenes, savedState));

    // Add assets
    if (savedState.spritesheet) {
      assets.file("spritesheet.png", savedState.spritesheet.split(',')[1], {base64: true});
    }
    if (savedState.backgroundMusic) {
      assets.file("background.mp3", savedState.backgroundMusic.split(',')[1], {base64: true});
    }

    // Generate and download zip
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "phaser-playable.zip");
  } catch (error) {
    console.error("Failed to generate Phaser app:", error);
    throw error;
  }
}
