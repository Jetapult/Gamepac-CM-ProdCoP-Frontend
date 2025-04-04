import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import api from '../../../api';

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
        sprite.rotation = spriteData.rotation * (Math.PI / 180);
        sprite.alpha = spriteData.transparency;
        
        // Tag this sprite with the mod's type
        sprite.__modType = modification.type;
        
        // Calculate position based on video bounds
        let x, y;
        
        // Get video dimensions and position
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Calculate video scale to fit in the app screen
        const scaleX = app.screen.width / videoWidth;
        const scaleY = app.screen.height / videoHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate video bounds (same calculation as in initVideo)
        const scaledVideoWidth = videoWidth * scale;
        const scaledVideoHeight = videoHeight * scale;
        const videoX = (app.screen.width - scaledVideoWidth) / 2;
        const videoY = (app.screen.height - scaledVideoHeight) / 2;
        
        // Position sprite relative to video bounds
        x = videoX + (scaledVideoWidth * spriteData.position.x);
        y = videoY + (scaledVideoHeight * spriteData.position.y);
        
        sprite.position.set(x, y);
        
        // Save configuration for animations
        sprite.__spriteData = spriteData;
        
        // Update the click handling
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointertap', (event) => {
          event.stopPropagation();
          
          if (spriteData.onClickAction === 'open-store-url') {
            // Detect OS
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isAndroid = /android/i.test(userAgent);
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
            
            // Get appropriate store URL based on OS
            const storeUrl = isAndroid ? CONFIG.general.playstoreUrl : CONFIG.general.iosUrl;
            
            if (storeUrl) {
              // Use MRAID if available, otherwise fallback to window.open
              if (typeof mraid !== "undefined") {
                mraid.open(storeUrl);
              } else {
                window.open(storeUrl, '_blank');
              }
            } else {
              console.warn('No store URL configured for ' + (isAndroid ? 'Android' : 'iOS'));
            }
          } else if (spriteData.onClickAction === 'resume-video') {
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
          }
        });

        app.stage.addChild(sprite);
        currentModifications.push(sprite);
        return sprite;
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
              renderSprite(spriteData, mod);
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
            // Only add the resume video handler if the element is not a sprite
            // or if it's a sprite with resume-video action
            element.on('pointerdown', () => {
              // Skip if this is a sprite with a different click action
              if (element.__spriteData && element.__spriteData.onClickAction !== 'resume-video') {
                return;
              }

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
        const currentTime = Math.floor(videoElement.currentTime * 1000);

        // If a break is active, do nothing here.
        if (activeBreakIndex !== -1) return;

        // Check if a break modification should be triggered.
        const TOLERANCE_MS = 50; // 50ms tolerance
        const breakIndex = CONFIG.modifications.findIndex(mod =>
          mod.type === 'break' &&
          !triggeredBreakIds.has(mod.id) &&
          currentTime >= (mod.time - TOLERANCE_MS)
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
                renderSprite(spriteData, currentBreak);
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

      // Add animation start times tracking
      let animationStartTimes = {};

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

      function handleAnimation(sprite, spriteData, type, anim) {
        const currentTime = Date.now();
        
        // Initialize animation tracking
        if (!sprite.__animationStartTimes) {
          sprite.__animationStartTimes = {};
        }
        
        if (!sprite.__animationStartTimes[type]) {
          sprite.__animationStartTimes[type] = currentTime;
        }
        
        // Check if animation should stop based on repeat value
        if (anim.repeat !== undefined && anim.repeat !== -1) {
          // Calculate elapsed time and completed cycles
          const elapsedTime = currentTime - sprite.__animationStartTimes[type];
          const completedCycles = Math.floor(elapsedTime / anim.duration);
          
          // If we've completed all repeats, set to final state and stop
          if (completedCycles > anim.repeat) {
            // Set to final state based on animation type
            switch (type) {
              case 'position': {
                // Use the exact destination coordinates with fallback
                const endX = (anim.destination && anim.destination.x !== undefined)
                  ? anim.destination.x * app.screen.width
                  : spriteData.position.x * app.screen.width;
                const endY = (anim.destination && anim.destination.y !== undefined)
                  ? anim.destination.y * app.screen.height
                  : spriteData.position.y * app.screen.height;
                sprite.position.x = endX;
                sprite.position.y = endY;
                break;
              }
              case 'scale': {
                sprite.scale.x = anim.destination.w;
                sprite.scale.y = anim.destination.h;
                break;
              }
              case 'transparency': {
                sprite.alpha = anim.destination;
                break;
              }
            }
            return; // Skip further animation processing
          }
        }
        
        // Continue with the existing animation logic
        const progress = (currentTime % anim.duration) / anim.duration;
        let easedProgress = anim.easing !== 'linear'
          ? getEasedProgress(progress, anim.easing)
          : progress;

        if (anim.yoyo) {
          const cycle = Math.floor((currentTime % (anim.duration * 2)) / anim.duration);
          if (cycle === 1) easedProgress = 1 - easedProgress;
        }

        switch (type) {
          case 'position': {
            // If the sprite is relative to screen, then switch to doing the interpolation
            // in the video sprite's normalized coordinate space. This ensures that both
            // starting and destination positions use the same basis.
            if (sprite.__spriteData.positionRelativeToScreen && typeof videoSprite !== 'undefined') {
              // Get the video boundaries (the drawing area for the video)
              const videoBounds = videoSprite.getBounds();

              // Determine the original relative position.
              // (If needed, cache it so that we don't try to convert the absolute rendered position.)
              if (!sprite.__originalRelPosition) {
                // Here we assume the sprite was originally rendered by converting the normalized
                // spriteData.position using screen dimensions, so we recover the normalized
                // values from spriteData directly.
                sprite.__originalRelPosition = {
                  x: spriteData.position.x,
                  y: spriteData.position.y
                };
              }
              const origRelPos = sprite.__originalRelPosition;

              // The intended target position (normalized) comes from the animation's destination.
              // If no destination is provided, we fall back to the original.
              const targetRelX = (anim.destination && anim.destination.x !== undefined)
                ? anim.destination.x
                : origRelPos.x;
              const targetRelY = (anim.destination && anim.destination.y !== undefined)
                ? anim.destination.y
                : origRelPos.y;

              // Interpolate in normalized space
              const newRelX = origRelPos.x + (targetRelX - origRelPos.x) * easedProgress;
              const newRelY = origRelPos.y + (targetRelY - origRelPos.y) * easedProgress;

              // Convert back to absolute coordinates using the video's bounds.
              sprite.position.x = videoBounds.x + videoBounds.width * newRelX;
              sprite.position.y = videoBounds.y + videoBounds.height * newRelY;
            } else {
              // Fallback: use full-screen coordinates (the same as in the editor)
              const startX = spriteData.position.x * app.screen.width;
              const startY = spriteData.position.y * app.screen.height;
              const endX = (anim.destination && anim.destination.x !== undefined
                            ? anim.destination.x
                            : spriteData.position.x) * app.screen.width;
              const endY = (anim.destination && anim.destination.y !== undefined
                            ? anim.destination.y
                            : spriteData.position.y) * app.screen.height;
              sprite.position.x = startX + (endX - startX) * easedProgress;
              sprite.position.y = startY + (endY - startY) * easedProgress;
            }
            break;
          }
          case 'scale': {
            // Store original position before scaling
            const originalX = sprite.position.x;
            const originalY = sprite.position.y;
            
            // Apply scale
            const startScale = spriteData.scale;
            const newScaleX = startScale + (anim.destination.w - startScale) * easedProgress;
            const newScaleY = startScale + (anim.destination.h - startScale) * easedProgress;
            
            sprite.scale.x = newScaleX;
            sprite.scale.y = newScaleY;
            
            // For sprites positioned relative to screen, we need to recalculate position
            // after scaling to make sure it stays in the correct place
            if (sprite.__spriteData?.positionRelativeToScreen && typeof videoSprite !== 'undefined') {
              // Get the video boundaries
              const videoBounds = videoSprite.getBounds();
              
              // Recover the normalized position values directly from spriteData
              const normalizedX = spriteData.position.x;
              const normalizedY = spriteData.position.y;
              
              // Apply the normalized coordinates using video bounds
              sprite.position.x = videoBounds.x + videoBounds.width * normalizedX;
              sprite.position.y = videoBounds.y + videoBounds.height * normalizedY;
            } else {
              // For sprites not relative to screen, restore the original position
              sprite.position.x = originalX;
              sprite.position.y = originalY;
            }
            
            break;
          }
          case 'transparency': {
            const startAlpha = spriteData.transparency;
            sprite.alpha = startAlpha + (anim.destination - startAlpha) * easedProgress;
            break;
          }
        }
      }

      function animationTicker() {
        const currentTime = Date.now();
        currentModifications.forEach(sprite => {
          if (sprite.__spriteData && sprite.__spriteData.animation) {
            const animData = sprite.__spriteData.animation;
            
            // Animate position
            if (animData.position && animData.position.enabled) {
              handleAnimation(sprite, sprite.__spriteData, 'position', animData.position);
            }

            // Animate scale
            if (animData.scale && animData.scale.enabled) {
              handleAnimation(sprite, sprite.__spriteData, 'scale', animData.scale);
            }

            // Animate transparency
            if (animData.transparency && animData.transparency.enabled) {
              handleAnimation(sprite, sprite.__spriteData, 'transparency', animData.transparency);
            }
          }
        });
      }

      // Add our animation loop so that sprite animations update in the build
      app.ticker.add(animationTicker);
      // -- End Animation Ticker --

      initVideo().then(() => {
        videoElement.addEventListener('timeupdate', handleVideoTimeUpdate);
        
        // Try to play the video immediately (muted)
        videoElement.play().then(() => {
          console.log("Video started playing automatically (muted).");
          
          // Keep the video muted until user interaction
          // Don't try to unmute programmatically as it will fail
        }).catch((error) => {
          console.error("Auto-play failed:", error);
          
          // Add a fallback UI element to start playback on interaction
          const playButton = document.createElement('div');
          playButton.style.position = 'absolute';
          playButton.style.top = '50%';
          playButton.style.left = '50%';
          playButton.style.transform = 'translate(-50%, -50%)';
          playButton.style.background = 'rgba(0,0,0,0.5)';
          playButton.style.color = 'white';
          playButton.style.padding = '20px';
          playButton.style.borderRadius = '10px';
          playButton.style.cursor = 'pointer';
          playButton.style.zIndex = '1000';
          playButton.innerHTML = 'Tap to Play';
          document.body.appendChild(playButton);
          
          playButton.addEventListener('click', () => {
            videoElement.play().catch(console.error);
            document.body.removeChild(playButton);
          });
        });
        
        // Add a document-level click handler to unmute the video on first interaction
        document.addEventListener('click', function enableAudio() {
          if (videoElement.muted) {
            videoElement.muted = false;
            console.log("Video unmuted on user interaction");
            
            // Also ensure video is playing
            if (videoElement.paused) {
              videoElement.play().catch(console.error);
            }
            
            // Remove this listener after first use
            document.removeEventListener('click', enableAudio);
          }
          
          // This will also enable all other audio elements
          audioAllowed = true;
          Object.values(audioElements).forEach(audio => {
            if (audio && audio.paused) {
              audio.play().catch(err => console.error("Error playing audio:", err));
            }
          });
        }, { once: true }); // Use { once: true } to automatically remove after first trigger

        // Add this after your initVideo() call
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            // Pause video when tab is not visible
            if (!videoElement.paused) {
              videoElement.pause();
            }
          } else {
            // Resume video when tab becomes visible again (only if it was playing before)
            if (videoElement.paused && !activeBreakIndex !== -1) {
              videoElement.play().catch(console.error);
            }
          }
        });

        // Add this in your initVideo().then() callback
        videoElement.addEventListener('ended', () => {
          // When video ends, show end screen if available
          const endScreen = CONFIG.modifications.find(mod => mod.type === 'end_screen');
          if (endScreen) {
            clearEndScreenModifications();
            renderEndScreen(endScreen);
          }
        });

        // Add this to your document click handler
        videoElement.addEventListener('pause', (event) => {
          // If video was paused by the browser (not by our code)
          if (activeBreakIndex === -1 && !event.isTrusted) {
            // Try to resume playback after a short delay
            setTimeout(() => {
              videoElement.play().catch(err => {
                console.warn("Could not auto-resume video:", err);
              });
            }, 300);
          }
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
              // Convert degrees to radians for rotation
              sprite.rotation = spriteData.rotation * (Math.PI / 180);
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
              sprite.on('pointertap', (event) => {
                event.stopPropagation();
                
                if (spriteData.onClickAction === 'open-store-url') {
                  // Detect OS
                  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                  const isAndroid = /android/i.test(userAgent);
                  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                  
                  // Get appropriate store URL based on OS
                  const storeUrl = isAndroid ? CONFIG.general.playstoreUrl : CONFIG.general.iosUrl;
                  
                  if (storeUrl) {
                    // Use MRAID if available, otherwise fallback to window.open
                    if (typeof mraid !== "undefined") {
                      mraid.open(storeUrl);
                    } else {
                      window.open(storeUrl, '_blank');
                    }
                  } else {
                    console.warn('No store URL configured for ' + (isAndroid ? 'Android' : 'iOS'));
                  }
                } else if (spriteData.onClickAction === 'resume-video') {
                  // Only resume video if this is a break sprite
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
                }
              });
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

/**
 * Utility functions for calculating asset sizes
 */

// Convert bytes to human-readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get file size from a Blob or File object
export const getFileSize = (file) => {
  if (!file) return 0;
  return file.size || 0;
};

// Function to get the actual PIXI.js library size
async function getPixiJsSize() {
  try {
    const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js', { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 512 * 1024; // fallback to 512KB
  } catch (error) {
    console.warn('Could not fetch PIXI.js size, using estimate', error);
    return 512 * 1024; // fallback to 512KB
  }
}

// Cache the library size to avoid repeated network requests
let cachedLibrarySize = null;

// Calculate total size of all assets in the playable ad
export const calculateTotalSize = async (videoPlayable) => {
  // Hardcode library size to 512KB instead of fetching
  // // Get library size (PIXI.js) - fetch once and cache
  // if (cachedLibrarySize === null) {
  //   cachedLibrarySize = await getPixiJsSize();
  // }
  // const librarySize = cachedLibrarySize;
  const librarySize = 512 * 1024;

  // Initialize result object
  const result = {
    library: librarySize,
    video: 0,
    images: 0,
    audio: 0,
    html: 15 * 1024, // Estimate for HTML template size (15KB)
    total: librarySize,
    assets: {
      images: [],
      audio: []
    }
  };

  // Calculate video size with base64 overhead
  if (videoPlayable.general?.videoSource) {
    const videoSize = videoPlayable.general.videoSource.size || 0;
    // Add ~33% for base64 encoding overhead
    const videoSizeWithOverhead = Math.ceil(videoSize * 1.33);
    result.video = videoSizeWithOverhead;
    result.total += videoSizeWithOverhead;
  }

  // Process all modifications without base64 overhead
  if (videoPlayable.modifications) {
    videoPlayable.modifications.forEach(mod => {
      // Process sprites (images)
      if (mod.sprites && mod.sprites.length > 0) {
        mod.sprites.forEach(sprite => {
          if (sprite.file) {
            const spriteSize = sprite.file.size || 0;
            result.images += spriteSize;
            result.total += spriteSize;
            
            // Add to detailed assets list
            result.assets.images.push({
              id: sprite.id,
              name: sprite.file.name || `image-${sprite.id.toString().slice(-5)}.${sprite.isGif ? 'gif' : 'png'}`,
              size: spriteSize,
              imageUrl: sprite.imageUrl,
              file_type: sprite.file.type
            });
          }
        });
      }
      
      // Process background music (audio)
      if (mod.backgroundMusic?.file) {
        const audioSize = mod.backgroundMusic.file.size || 0;
        result.audio += audioSize;
        result.total += audioSize;
        
        // Add to detailed assets list
        result.assets.audio.push({
          id: mod.id,
          name: mod.backgroundMusic.file.name || `audio-${mod.id.toString().slice(-5)}.mp3`,
          size: audioSize
        });
      }
    });
  }

  // Add HTML template size to total
  result.total += result.html;
  
  // Add ZIP overhead estimate (headers, structure) - approximately 2-5%
  const zipOverhead = Math.ceil(result.total * 0.05);
  result.zipOverhead = zipOverhead;
  result.total += zipOverhead;

  return result;
};

/**
 * Utility functions for compressing assets
 */

// Simple image compression using canvas
export const compressImage = async (imageFile, quality = 0.7, maxWidth = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          
          // Create a new file from the blob
          const compressedFile = new File([blob], imageFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    // Load image from file
    img.src = URL.createObjectURL(imageFile);
  });
};

// Add this function to fetch and compress an image via your backend API
export const compressImageWithTinyPNG = async (imageFile) => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Send the file to your backend compression endpoint
    const response = await api.post('v1/assetGenerator/compress-image', formData);
    console.log(response,'result')
    if (response.status !== 200) {
      throw new Error(`Image compression failed: ${response.statusText}`);
    }

    const result = response.data;
    
    // Convert the base64 string back to a File object
    const binaryString = atob(result.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a new File object with the same name as the original
    const compressedFile = new File([bytes], imageFile.name, {
      type: imageFile.type,
      lastModified: Date.now()
    });
    
    return {
      file: compressedFile,
      originalSize: result.initialSize,
      compressedSize: result.compressedSize,
      reductionPercentage: result.reductionPercentage
    };
  } catch (error) {
    console.error('TinyPNG compression failed:', error);
    throw error;
  }
};

// Update the compressAllAssets function to use the TinyPNG API
export const compressAllAssets = async (videoPlayable, selectedAssets) => {
  // Create a deep copy of the videoPlayable object
  const compressedPlayable = JSON.parse(JSON.stringify(videoPlayable));
  
  // We need to manually copy the File/Blob objects since they don't stringify
  if (videoPlayable.general?.videoSource) {
    compressedPlayable.general.videoSource = videoPlayable.general.videoSource;
  }
  
  // Get selected asset IDs for quick lookup
  const selectedImageIds = new Set(selectedAssets.images.map(img => img.id));
  const selectedAudioIds = new Set(selectedAssets.audio.map(audio => audio.id));
  
  // Process all modifications
  for (let i = 0; i < videoPlayable.modifications.length; i++) {
    const mod = videoPlayable.modifications[i];
    
    // Process sprites (images)
    if (mod.sprites && mod.sprites.length > 0) {
      for (let j = 0; j < mod.sprites.length; j++) {
        const sprite = mod.sprites[j];
        
        // Check if this sprite was selected for compression
        if (sprite.file && selectedImageIds.has(sprite.id) && sprite.file.type !== 'image/gif') {
          try {
            // Compress the image using TinyPNG
            const compressionResult = await compressImageWithTinyPNG(sprite.file);
            
            // Update the sprite with the compressed image
            compressedPlayable.modifications[i].sprites[j].file = compressionResult.file;
            
            // Store compression stats
            compressedPlayable.modifications[i].sprites[j].compressionStats = {
              originalSize: compressionResult.originalSize,
              compressedSize: compressionResult.compressedSize,
              reductionPercentage: compressionResult.reductionPercentage
            };
          } catch (error) {
            console.error(`Failed to compress image for sprite ${sprite.id}:`, error);
            // Keep the original file on error
            compressedPlayable.modifications[i].sprites[j].file = sprite.file;
          }
        } else {
          // Copy the original file for non-selected sprites
          compressedPlayable.modifications[i].sprites[j].file = sprite.file;
        }
      }
    }
    
    // Process background music (audio)
    if (mod.backgroundMusic?.file) {
      // Currently we just copy audio files as-is since audio compression is more complex
      // If selected for compression, you could add audio compression logic here
      compressedPlayable.modifications[i].backgroundMusic.file = mod.backgroundMusic.file;
    }
  }
  
  return compressedPlayable;
};
