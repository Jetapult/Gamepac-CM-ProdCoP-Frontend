import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const generateHtmlTemplate = (videoPlayable, assets) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${videoPlayable.general?.adName || 'Playable Ad'}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js"></script>
    <style>
      body { margin: 0; overflow: hidden; background: #000; }
      #game-container { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="game-container"></div>
    <script>
      const ASSETS = ${JSON.stringify(assets)};
      const CONFIG = ${JSON.stringify(videoPlayable)};
      
      let app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resizeTo: window
      });
      
      document.getElementById('game-container').appendChild(app.view);

      let triggeredBreakIds = new Set();
      let activeBreakIndex = -1;
      let currentModifications = [];
      let audioElements = {};
      let videoElement;
      let videoSprite;
      let activeOverlay = null;

      // Global flag to control whether audio is allowed.
      let audioAllowed = false;

      // Listen for user interaction (e.g., click or touch)
      document.addEventListener('click', function enableAudio() {
        if (!audioAllowed) {
          audioAllowed = true;
          // Iterate over all audio elements that were created for modifications
          // and attempt to play those that are not already playing.
          Object.keys(audioElements).forEach(function(id) {
            const audio = audioElements[id];
            if (audio && audio.paused) {
              audio.play().catch(function(err) {
                console.error("Error playing audio on user interaction:", err);
              });
            }
          });
          // Optionally, remove the event listener if it's only needed once.
          document.removeEventListener('click', enableAudio);
        }
      });

      function clearModifications() {
        currentModifications.forEach(sprite => {
          if (sprite && sprite.parent) {
            sprite.parent.removeChild(sprite);
            sprite.destroy();
          }
        });
        currentModifications = [];
        
        // Stop all audio
        Object.values(audioElements).forEach(audio => {
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        audioElements = {};
      }

      function clearBreakModifications() {
        // Only clear modifications that are NOT overlays
        for (let i = currentModifications.length - 1; i >= 0; i--) {
          const modElement = currentModifications[i];
          if (modElement.__modType && modElement.__modType !== 'overlay') {
            if (modElement.parent) {
              modElement.parent.removeChild(modElement);
              modElement.destroy();
            }
            currentModifications.splice(i, 1);
          }
        }
        
        // Remove associated non-overlay audio elements.
        Object.keys(audioElements).forEach(key => {
          const mod = CONFIG.modifications.find(m => m.id === key);
          if (mod && mod.type !== 'overlay') {
            audioElements[key].pause();
            audioElements[key].currentTime = 0;
            delete audioElements[key];
          }
        });
      }

      function renderSprite(spriteData, modification) {
        const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
        
        // Set basic properties
        sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
        sprite.scale.set(spriteData.scale);
        sprite.rotation = spriteData.rotation;
        sprite.alpha = spriteData.transparency;
        
        // Calculate position taking modification.relativeToScreenSize into account
        const x = modification.relativeToScreenSize
          ? app.screen.width * spriteData.position.x
          : spriteData.position.x;
        const y = modification.relativeToScreenSize
          ? app.screen.height * spriteData.position.y
          : spriteData.position.y;
        sprite.position.set(x, y);
        
        // Save configuration for animations
        sprite.__spriteData = spriteData;
        
        // Handle click events (e.g. for store redirects)
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => {
          if (CONFIG.general.iosUrl || CONFIG.general.playstoreUrl) {
            window.location.href = CONFIG.general.iosUrl || CONFIG.general.playstoreUrl;
          }
        });

        app.stage.addChild(sprite);
        currentModifications.push(sprite);
      }

      function renderModification(mod) {
        // Instead of blindly clearing modifications here,
        // you might let overlays be rendered separately.
        // For non-overlay mods you can clear first.
        if (mod.type !== 'overlay') {
          clearModifications(); 
        }
        
        // Render background if needed
        if (mod.background) {
          const background = new PIXI.Graphics();
          // Tag it with mod type so we can filter later.
          background.__modType = mod.type;
          background.beginFill(
            parseInt(mod.backgroundColor.replace('#', '0x')),
            mod.transparency ?? 0.7
          );
          background.drawRect(0, 0, app.screen.width, app.screen.height);
          background.endFill();
          background.eventMode = 'static';
          background.cursor = 'pointer';
          app.stage.addChild(background);
          currentModifications.push(background);
        }
        
        // Render sprites for this modification
        if (mod.sprites && mod.sprites.length > 0) {
          mod.sprites.forEach(spriteData => {
            if (ASSETS.images[spriteData.id]) {
              const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
              // Tag this sprite with the mod's type:
              sprite.__modType = mod.type;
              sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
              sprite.scale.set(spriteData.scale);
              sprite.rotation = spriteData.rotation;
              sprite.alpha = spriteData.transparency;
              const x = mod.relativeToScreenSize
                ? app.screen.width * spriteData.position.x
                : spriteData.position.x;
              const y = mod.relativeToScreenSize
                ? app.screen.height * spriteData.position.y
                : spriteData.position.y;
              sprite.position.set(x, y);
              sprite.eventMode = 'static';
              sprite.cursor = 'pointer';
              // Save configuration (for later animations)
              sprite.__spriteData = spriteData;
              app.stage.addChild(sprite);
              currentModifications.push(sprite);
            }
          });
        }
        
        // Handle background music for this modification
        if (mod.backgroundMusic?.file && ASSETS.audio[mod.id] && !audioElements[mod.id]) {
          const audio = new Audio(ASSETS.audio[mod.id]);
          audio.volume = mod.backgroundMusic.volume ?? 1;
          audio.loop = mod.backgroundMusic.repeat !== 0;
          audioElements[mod.id] = audio;
          // Only start playback immediately if the user has already interacted.
          if (audioAllowed) {
            audio.play().catch(console.error);
          }
        }
        
        // If this is a break mod, add click handlers to resume video.
        if (mod.type === 'break') {
          currentModifications.forEach(element => {
            element.off && element.off('pointerdown');
            element.on('pointerdown', () => {
              if (activeBreakIndex !== -1) {
                const activeBreak = CONFIG.modifications[activeBreakIndex];
                if (activeBreak && audioElements[activeBreak.id]) {
                  audioElements[activeBreak.id].pause();
                  delete audioElements[activeBreak.id];
                }
                activeBreakIndex = -1;
                // Only remove break (non-overlay) elements on resume.
                clearBreakModifications();
                videoElement.play().catch(console.error);
              }
            });
          });
        }
      }

      function initVideo() {
        return new Promise((resolve, reject) => {
          videoElement = document.createElement('video');
          videoElement.src = ASSETS.video;
          videoElement.crossOrigin = "anonymous";
          videoElement.preload = "auto";
          // Temporarily mute to allow autoplay
          videoElement.muted = true;
          videoElement.playsInline = true;

          videoElement.addEventListener('loadedmetadata', () => {
            const videoBaseTexture = PIXI.BaseTexture.from(videoElement);
            const videoTexture = PIXI.Texture.from(videoBaseTexture);
            videoSprite = new PIXI.Sprite(videoTexture);
            
            const scaleX = app.screen.width / videoElement.videoWidth;
            const scaleY = app.screen.height / videoElement.videoHeight;
            const scale = Math.min(scaleX, scaleY);
            
            videoSprite.scale.set(scale);
            videoSprite.anchor.set(0.5);
            videoSprite.position.set(app.screen.width / 2, app.screen.height / 2);
            
            app.stage.addChild(videoSprite);
            resolve();
          });

          videoElement.addEventListener('error', reject);
        });
      }

      function handleVideoTimeUpdate() {
        const currentTime = videoElement.currentTime * 1000;

        // If a break is active, do nothing here.
        if (activeBreakIndex !== -1) return;

        // Check if a break modification should be triggered.
        const breakIndex = CONFIG.modifications.findIndex(mod =>
          mod.type === 'break' &&
          !triggeredBreakIds.has(mod.id) &&
          currentTime >= mod.time
        );

        if (breakIndex !== -1) {
          clearBreakModifications();
          videoElement.pause();
          activeBreakIndex = breakIndex;
          const currentBreak = CONFIG.modifications[breakIndex];
          triggeredBreakIds.add(currentBreak.id);

          // Render break-specific modifications.
          if (currentBreak.background) {
            const background = new PIXI.Graphics();
            background.__modType = currentBreak.type;
            background.beginFill(
              parseInt(currentBreak.backgroundColor.replace('#', '0x')),
              currentBreak.transparency ?? 0.7
            );
            background.drawRect(0, 0, app.screen.width, app.screen.height);
            background.endFill();
            background.eventMode = 'static';
            background.cursor = 'pointer';
            app.stage.addChild(background);
            currentModifications.push(background);
          }

          if (currentBreak.sprites && currentBreak.sprites.length > 0) {
            currentBreak.sprites.forEach(spriteData => {
              if (ASSETS.images[spriteData.id]) {
                const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
                sprite.__modType = currentBreak.type;
                sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
                sprite.scale.set(spriteData.scale);
                sprite.rotation = spriteData.rotation;
                sprite.alpha = spriteData.transparency;
                const x = currentBreak.relativeToScreenSize
                  ? app.screen.width * spriteData.position.x
                  : spriteData.position.x;
                const y = currentBreak.relativeToScreenSize
                  ? app.screen.height * spriteData.position.y
                  : spriteData.position.y;
                sprite.position.set(x, y);
                sprite.eventMode = 'static';
                sprite.cursor = 'pointer';
                sprite.__spriteData = spriteData;
                app.stage.addChild(sprite);
                currentModifications.push(sprite);
              }
            });
          }

          // Ensure the video sprite stays at the bottom.
          if (videoSprite && videoSprite.parent) {
            app.stage.removeChild(videoSprite);
            app.stage.addChildAt(videoSprite, 0);
          }

          if (currentBreak.backgroundMusic?.file && ASSETS.audio[currentBreak.id]) {
            const audio = new Audio(ASSETS.audio[currentBreak.id]);
            audio.volume = currentBreak.backgroundMusic.volume ?? 1;
            audio.loop = currentBreak.backgroundMusic.repeat !== 0;
            audioElements[currentBreak.id] = audio;
            // Only start playback immediately if the user has already interacted.
            if (audioAllowed) {
              audio.play().catch(console.error);
            }
          }

          // Add click handlers to break elements to resume the video.
          currentModifications.forEach(element => {
            element.off && element.off('pointerdown');
            element.on('pointerdown', () => {
              if (activeBreakIndex !== -1) {
                const activeBreak = CONFIG.modifications[activeBreakIndex];
                if (activeBreak && audioElements[activeBreak.id]) {
                  audioElements[activeBreak.id].pause();
                  delete audioElements[activeBreak.id];
                }
                activeBreakIndex = -1;
                clearBreakModifications();
                videoElement.play().catch(console.error);
              }
            });
          });

          // Exit early so overlay handling below is not executed.
          return;
        }

        // Handle overlay modifications (if any)
        const overlays = CONFIG.modifications.filter(
          mod => mod.type === 'overlay' &&
                 currentTime >= mod.startTime &&
                 currentTime <= mod.endTime
        );

        if (overlays.length > 0) {
          if (!activeOverlay || activeOverlay.id !== overlays[0].id) {
            clearModifications();
            activeOverlay = overlays[0];
            renderModification(activeOverlay);
          }
        } else {
          if (activeOverlay) {
            clearModifications();
            activeOverlay = null;
          }
        }

        // Handle end screen modifications, but DO NOT pause video or clear overlays.
        const endScreen = CONFIG.modifications.find(
          mod => mod.type === 'end_screen' && currentTime >= mod.time
        );
        
        if (endScreen) {
          clearEndScreenModifications();
          // Do not pause video here so playback continues.
          renderEndScreen(endScreen);
          return;
        }
      }

      // -- Animation ticker to update sprite animations --
      // This function uses a helper to get easing progress and then updates sprites
      function getEasedProgress(progress, easingType) {
        switch (easingType) {
          case 'easeInQuad':
            return progress * progress;
          case 'easeOutQuad':
            return 1 - (1 - progress) * (1 - progress);
          case 'easeInOutQuad':
            return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          case 'easeInCubic':
            return progress * progress * progress;
          case 'easeOutCubic':
            return 1 - Math.pow(1 - progress, 3);
          case 'easeInOutCubic':
            return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          default:
            return progress;
        }
      }

      function animationTicker() {
        const currentTime = Date.now();
        currentModifications.forEach(sprite => {
          if (sprite.__spriteData && sprite.__spriteData.animation) {
            const animData = sprite.__spriteData.animation;

            // Animate position
            if (animData.position && animData.position.enabled) {
              if (!sprite.__originalPosition) {
                sprite.__originalPosition = { x: sprite.position.x, y: sprite.position.y };
              }
              let progress = (currentTime % animData.position.duration) / animData.position.duration;
              let easedProgress = animData.position.easing !== 'linear' 
                ? getEasedProgress(progress, animData.position.easing) 
                : progress;
              if (animData.position.yoyo) {
                let cycle = Math.floor((currentTime % (animData.position.duration * 2)) / animData.position.duration);
                if (cycle === 1) easedProgress = 1 - easedProgress;
              }
              const startX = sprite.__originalPosition.x;
              const startY = sprite.__originalPosition.y;
              const destX = animData.position.destination && animData.position.destination.x !== undefined 
                ? animData.position.destination.x * app.screen.width 
                : startX;
              const destY = animData.position.destination && animData.position.destination.y !== undefined 
                ? animData.position.destination.y * app.screen.height 
                : startY;
              sprite.position.x = startX + (destX - startX) * easedProgress;
              sprite.position.y = startY + (destY - startY) * easedProgress;
            }

            // Animate scale
            if (animData.scale && animData.scale.enabled) {
              if (!sprite.__originalScale) {
                sprite.__originalScale = { x: sprite.scale.x, y: sprite.scale.y };
              }
              let progress = (currentTime % animData.scale.duration) / animData.scale.duration;
              let easedProgress = animData.scale.easing !== 'linear' 
                ? getEasedProgress(progress, animData.scale.easing) 
                : progress;
              if (animData.scale.yoyo) {
                let cycle = Math.floor((currentTime % (animData.scale.duration * 2)) / animData.scale.duration);
                if (cycle === 1) easedProgress = 1 - easedProgress;
              }
              const startScaleX = sprite.__originalScale.x;
              const startScaleY = sprite.__originalScale.y;
              const destScaleX = animData.scale.destination && animData.scale.destination.w !== undefined 
                ? animData.scale.destination.w 
                : startScaleX;
              const destScaleY = animData.scale.destination && animData.scale.destination.h !== undefined 
                ? animData.scale.destination.h 
                : startScaleY;
              sprite.scale.x = startScaleX + (destScaleX - startScaleX) * easedProgress;
              sprite.scale.y = startScaleY + (destScaleY - startScaleY) * easedProgress;
            }

            // Animate transparency
            if (animData.transparency && animData.transparency.enabled) {
              if (sprite.__originalAlpha === undefined) {
                sprite.__originalAlpha = sprite.alpha;
              }
              let progress = (currentTime % animData.transparency.duration) / animData.transparency.duration;
              let easedProgress = animData.transparency.easing !== 'linear' 
                ? getEasedProgress(progress, animData.transparency.easing) 
                : progress;
              if (animData.transparency.yoyo) {
                let cycle = Math.floor((currentTime % (animData.transparency.duration * 2)) / animData.transparency.duration);
                if (cycle === 1) easedProgress = 1 - easedProgress;
              }
              const startAlpha = sprite.__originalAlpha;
              const destAlpha = animData.transparency.destination !== undefined 
                ? animData.transparency.destination 
                : startAlpha;
              sprite.alpha = startAlpha + (destAlpha - startAlpha) * easedProgress;
            }
          }
        });
      }

      // Add our animation loop so that sprite animations update in the build
      app.ticker.add(animationTicker);
      // -- End Animation Ticker --

      initVideo().then(() => {
        videoElement.addEventListener('timeupdate', handleVideoTimeUpdate);
        
        // Try to play the video immediately.
        videoElement.play().then(() => {
          console.log("Video started playing automatically (muted).");
          
          // After playback starts, try to unmute after a brief delay.
          // This gives the video a chance to start so that the browser might allow unmuting.
          setTimeout(() => {
            try {
              videoElement.muted = false;
              console.log("Video unmuted programmatically.");
            } catch (unmuteError) {
              console.error("Failed to unmute video:", unmuteError);
            }
          }, 2000);
          
        }).catch((error) => {
          console.error("Auto-play failed:", error);
          // If autoplay failed even with muted=true (unlikely), you might consider attaching a fallback
          // handler to try again on user interaction. However, to meet your requirements, you shouldn't wait
          // for a user click.
        });
      }).catch(error => {
        console.error("Error initializing video:", error);
      });

      function clearEndScreenModifications() {
        for (let i = currentModifications.length - 1; i >= 0; i--) {
          const modElement = currentModifications[i];
          if (modElement.__modType && modElement.__modType === 'end_screen') {
            if (modElement.parent) {
              modElement.parent.removeChild(modElement);
              modElement.destroy();
            }
            currentModifications.splice(i, 1);
          }
        }
        Object.keys(audioElements).forEach(key => {
          const mod = CONFIG.modifications.find(m => m.id === key);
          if (mod && mod.type === 'end_screen') {
            audioElements[key].pause();
            audioElements[key].currentTime = 0;
            delete audioElements[key];
          }
        });
      }

      function renderEndScreen(mod) {
        // Render background if provided
        if (mod.background) {
          const background = new PIXI.Graphics();
          background.__modType = mod.type;
          background.beginFill(
            parseInt(mod.backgroundColor.replace('#', '0x')),
            mod.transparency ?? 0.7
          );
          background.drawRect(0, 0, app.screen.width, app.screen.height);
          background.endFill();
          background.eventMode = 'static';
          background.cursor = 'pointer';
          app.stage.addChild(background);
          currentModifications.push(background);
        }

        // Render modification sprites
        if (mod.sprites && mod.sprites.length > 0) {
          mod.sprites.forEach(spriteData => {
            if (ASSETS.images[spriteData.id]) {
              const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
              sprite.__modType = mod.type;
              sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
              sprite.scale.set(spriteData.scale);
              sprite.rotation = spriteData.rotation;
              sprite.alpha = spriteData.transparency;
              const x = mod.relativeToScreenSize
                ? app.screen.width * spriteData.position.x
                : spriteData.position.x;
              const y = mod.relativeToScreenSize
                ? app.screen.height * spriteData.position.y
                : spriteData.position.y;
              sprite.position.set(x, y);
              sprite.eventMode = 'static';
              sprite.cursor = 'pointer';
              sprite.__spriteData = spriteData;
              app.stage.addChild(sprite);
              currentModifications.push(sprite);
            }
          });
        }

        // Handle background music (if any)
        if (mod.backgroundMusic?.file && ASSETS.audio[mod.id] && !audioElements[mod.id]) {
          const audio = new Audio(ASSETS.audio[mod.id]);
          audio.volume = mod.backgroundMusic.volume ?? 1;
          audio.loop = mod.backgroundMusic.repeat !== 0;
          audioElements[mod.id] = audio;
          // Only start playback immediately if the user has already interacted.
          if (audioAllowed) {
            audio.play().catch(console.error);
          }
        }
      }
    </script>
</body>
</html>`;
};

export const buildPlayableAd = async (videoPlayable) => {
  try {
    const zip = new JSZip();
    const assets = {
      video: '',
      images: {},
      audio: {}
    };

    // Convert video to base64
    if (videoPlayable.general?.videoSource) {
      try {
        const videoBase64 = await blobToBase64(videoPlayable.general.videoSource);
        assets.video = videoBase64;
      } catch (error) {
        console.error('Error converting video:', error);
        throw new Error('Failed to process video source');
      }
    } else {
      throw new Error('No video source found in general properties');
    }

    // Convert all modification assets
    for (const mod of videoPlayable.modifications) {
      for (const sprite of mod.sprites) {
        if (sprite.file) {
          assets.images[sprite.id] = await blobToBase64(sprite.file);
        }
      }
      if (mod.backgroundMusic?.file) {
        assets.audio[mod.id] = await blobToBase64(mod.backgroundMusic.file);
      }
    }

    // Generate HTML file with animations
    const html = generateHtmlTemplate(videoPlayable, assets);
    zip.file('index.html', html);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${videoPlayable.general?.adName || 'playable-ad'}.zip`);
  } catch (error) {
    console.error('Error building playable ad:', error);
    throw error;
  }
};
