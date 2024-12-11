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
      if (spriteToDelete?.phaserSprite && !spriteToDelete.isDestroyed) {
        spriteToDelete.phaserSprite.destroy();
      }
      return prev.filter((sprite) => sprite.id !== id);
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
  console.log(sprite.frameName, 'frameName')

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

        if (sprite.animations.transparency.isEnabled) {
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

        if (sprite.animations.transparency.isEnabled) {
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

        if (sprite.animations.transparency.isEnabled) {
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

  // Add this new function near generatePhaserCode
  const generateAllPhaserCode = (sprites) => {
    // Group sprites by priority
    const groupedSprites = sprites.reduce((acc, sprite) => {
      const priority = sprite.animations.slideIn?.config?.priority || 
                      sprite.animations.fadeIn?.config?.priority || 0;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(sprite);
      return acc;
    }, {});

    // Sort priorities
    const priorities = Object.keys(groupedSprites).sort((a, b) => Number(a) - Number(b));
    
    let code = '// All Sprites and Animations\n\n';
    let totalDelay = 0;

    priorities.forEach((priority) => {
      const sprites = groupedSprites[priority];
      code += `// Sequence ${priority}\n`;
      
      sprites.forEach((sprite) => {
        const counter = sprites.indexOf(sprite) + 1;
        const varName = `sprite${counter}_seq${priority}`;
        
        code += `const ${varName} = this.add
  .sprite(${Math.round(sprite.x)}, ${Math.round(sprite.y)}, 'spritesheetname', '${sprite.frameName}')
  .setOrigin(0, 0)
  .setScale(${sprite.scale});\n\n`;

        if (sprite.animations.slideIn.isEnabled) {
          const slideConfig = sprite.animations.slideIn.config;
          let initialPos;
          switch (slideConfig.direction) {
            case "left":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)} - ${slideConfig.distance}, ${Math.round(sprite.y)});`;
              break;
            case "right":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)} + ${slideConfig.distance}, ${Math.round(sprite.y)});`;
              break;
            case "top":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)}, ${Math.round(sprite.y)} - ${slideConfig.distance});`;
              break;
            case "bottom":
              initialPos = `${varName}.setPosition(${Math.round(sprite.x)}, ${Math.round(sprite.y)} + ${slideConfig.distance});`;
              break;
          }
          
          code += `${initialPos}\n
this.time.delayedCall(${totalDelay}, () => {
  this.tweens.add({
    targets: ${varName},
    x: ${Math.round(sprite.x)},
    y: ${Math.round(sprite.y)},
    duration: ${slideConfig.duration},
    ease: '${slideConfig.ease}'
  });
});\n`;
        }

        if (sprite.animations.fadeIn.isEnabled) {
          const fadeConfig = sprite.animations.fadeIn.config;
          code += `${varName}.setAlpha(0);\n
this.time.delayedCall(${totalDelay}, () => {
  this.tweens.add({
    targets: ${varName},
    alpha: 1,
    duration: ${fadeConfig.duration},
    ease: '${fadeConfig.ease}'
  });
});\n`;
        }

        // Add common animations
        if (sprite.animations.position.isEnabled || 
            sprite.animations.scale.isEnabled || 
            sprite.animations.transparency.isEnabled) {
          code += `\nthis.time.delayedCall(${totalDelay + 500}, () => {\n`;
          
          if (sprite.animations.position.isEnabled) {
            const posConfig = sprite.animations.position.config;
            code += `  this.tweens.add({
    targets: ${varName},
    x: ${Math.round(sprite.x)} + ${Math.round(posConfig.x * 100)},
    y: ${Math.round(sprite.y)} + ${Math.round(posConfig.y * 100)},
    duration: ${posConfig.duration},
    repeat: ${posConfig.repeat},
    yoyo: ${posConfig.yoyo},
    ease: '${posConfig.ease}'
  });\n`;
          }

          // Add scale and transparency animations similarly...
          
          code += `});\n`;
        }

        if (sprite.animations.disappear.isEnabled) {
          const disappearConfig = sprite.animations.disappear.config;
          code += `\nthis.time.delayedCall(${totalDelay + disappearConfig.delay}, () => {
    this.tweens.add({
      targets: ${varName},
      alpha: 0,
      duration: ${disappearConfig.duration},
      ease: '${disappearConfig.ease}',
      onComplete: () => ${varName}.destroy()
    });
  });\n`;
        }
        
        code += '\n';
      });

      // Calculate delay for next sequence
      const maxDuration = Math.max(...sprites.map(sprite => {
        let duration = 0;
        if (sprite.animations.slideIn.isEnabled) {
          duration = Math.max(duration, sprite.animations.slideIn.config.duration);
        }
        if (sprite.animations.fadeIn.isEnabled) {
          duration = Math.max(duration, sprite.animations.fadeIn.config.duration);
        }
        if (sprite.animations.disappear.isEnabled) {
          duration = Math.max(duration, sprite.animations.disappear.config.delay + sprite.animations.disappear.config.duration);
        }
        return duration;
      }));

      totalDelay += maxDuration + 1000; // Add 1 second gap between sequences
      code += '\n';
    });

    return code;
  };

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
    
    setIsPlaying(true);
    const scene = game.playground;
    
    // Clear any existing preview sprites
    scene.children.list
      .filter(child => child.type === 'Sprite')
      .forEach(sprite => sprite.destroy());
    
    // Group sprites by their sequence number (using priority as sequence)
    const groupedSprites = placedSprites.reduce((acc, sprite) => {
      const sequence = sprite.animations.slideIn?.config?.priority || 
                      sprite.animations.fadeIn?.config?.priority || 0;
      if (!acc[sequence]) acc[sequence] = [];
      acc[sequence].push(sprite);
      return acc;
    }, {});

    const sequences = Object.keys(groupedSprites).sort((a, b) => Number(a) - Number(b));
    let totalDelay = 0;

    sequences.forEach((sequence) => {
      const sprites = groupedSprites[sequence];
      
      scene.time.delayedCall(totalDelay, () => {
        sprites.forEach(sprite => {
          const newSprite = scene.add
            .sprite(sprite.x, sprite.y, 'charactersprite', sprite.frameName)
            .setOrigin(0, 0)
            .setScale(sprite.scale)
            .setRotation(sprite.rotation || 0);

          // Handle slide-in animation
          if (sprite.animations.slideIn.isEnabled) {
            const slideConfig = sprite.animations.slideIn.config;
            let initialX = sprite.x;
            let initialY = sprite.y;
            
            switch (slideConfig.direction) {
              case "left":
                initialX = sprite.x - slideConfig.distance;
                break;
              case "right":
                initialX = sprite.x + slideConfig.distance;
                break;
              case "top":
                initialY = sprite.y - slideConfig.distance;
                break;
              case "bottom":
                initialY = sprite.y + slideConfig.distance;
                break;
            }
            
            newSprite.setPosition(initialX, initialY);
            
            scene.tweens.add({
              targets: newSprite,
              x: sprite.x,
              y: sprite.y,
              duration: slideConfig.duration,
              ease: slideConfig.ease,
              onComplete: () => handleCommonAnimations(sprite, newSprite, scene)
            });
          } else if (sprite.animations.fadeIn.isEnabled) {
            newSprite.setAlpha(0);
            scene.tweens.add({
              targets: newSprite,
              alpha: 1,
              duration: sprite.animations.fadeIn.config.duration,
              ease: sprite.animations.fadeIn.config.ease,
              onComplete: () => handleCommonAnimations(sprite, newSprite, scene)
            });
          } else {
            handleCommonAnimations(sprite, newSprite, scene);
          }

          // Handle disappear animation
          if (sprite.animations.disappear.isEnabled) {
            scene.time.delayedCall(sprite.animations.disappear.config.delay, () => {
              scene.tweens.add({
                targets: newSprite,
                alpha: 0,
                duration: sprite.animations.disappear.config.duration,
                ease: sprite.animations.disappear.config.ease,
                onComplete: () => newSprite.destroy()
              });
            });
          }
        });
      });

      // Calculate sequence duration including all animations
      const sequenceDuration = Math.max(...sprites.map(sprite => {
        let duration = 0;
        if (sprite.animations.slideIn.isEnabled) {
          duration = sprite.animations.slideIn.config.duration;
        }
        if (sprite.animations.fadeIn.isEnabled) {
          duration = sprite.animations.fadeIn.config.duration;
        }
        if (sprite.animations.disappear.isEnabled) {
          duration = sprite.animations.disappear.config.delay + 
                    sprite.animations.disappear.config.duration;
        }
        return duration;
      }));

      totalDelay += sequenceDuration + 1000; // Add 1 second gap between sequences
    });

    scene.time.delayedCall(totalDelay + 500, () => {
      setIsPlaying(false);
    });
  };

  // Add this helper function for common animations
  const handleCommonAnimations = (sprite, target, scene) => {
    if (sprite.animations.position.isEnabled) {
      scene.tweens.add({
        targets: target,
        x: sprite.x + Math.round(sprite.animations.position.config.x * 100),
        y: sprite.y + Math.round(sprite.animations.position.config.y * 100),
        duration: sprite.animations.position.config.duration,
        repeat: sprite.animations.position.config.repeat,
        yoyo: sprite.animations.position.config.yoyo,
        ease: sprite.animations.position.config.ease
      });
    }

    if (sprite.animations.scale.isEnabled) {
      scene.tweens.add({
        targets: target,
        scaleX: sprite.animations.scale.config.scaleX,
        scaleY: sprite.animations.scale.config.scaleY,
        duration: sprite.animations.scale.config.duration,
        repeat: sprite.animations.scale.config.repeat,
        yoyo: sprite.animations.scale.config.yoyo,
        ease: sprite.animations.scale.config.ease
      });
    }

    if (sprite.animations.transparency.isEnabled) {
      scene.tweens.add({
        targets: target,
        alpha: sprite.animations.transparency.config.alpha,
        duration: sprite.animations.transparency.config.duration,
        repeat: sprite.animations.transparency.config.repeat,
        yoyo: sprite.animations.transparency.config.yoyo,
        ease: sprite.animations.transparency.config.ease
      });
    }
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
          <div className="mb-6 flex gap-2">
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
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-4 py-2 rounded transition-colors`}
            >
              {isPlaying ? 'Playing...' : 'Play Preview'}
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
