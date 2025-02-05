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

      function renderSprite(spriteData, modification) {
        const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
        
        // Apply sprite properties
        sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
        sprite.scale.set(spriteData.scale);
        sprite.rotation = spriteData.rotation;
        sprite.alpha = spriteData.transparency;
        
        // Position relative to screen size
        const x = modification.relativeToScreenSize 
          ? app.screen.width * spriteData.position.x 
          : spriteData.position.x;
        const y = modification.relativeToScreenSize 
          ? app.screen.height * spriteData.position.y 
          : spriteData.position.y;
        
        sprite.position.set(x, y);
        
        // Handle click events for store redirects
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
        // Clear any previous modifications. (If you use this for overlays and end screens, ensure break modifications don't get cleared inadvertently.)
        clearModifications();

        // Render background.
        if (mod.background) {
          const background = new PIXI.Graphics();
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

        // Render sprites if any.
        if (mod.sprites && mod.sprites.length > 0) {
          mod.sprites.forEach(spriteData => {
            if (ASSETS.images[spriteData.id]) {
              const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
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
              app.stage.addChild(sprite);
              currentModifications.push(sprite);
            }
          });
        }

        // Handle background music.
        // For end screen modifications the goal is to auto-play without waiting for clicks.
        if (mod.backgroundMusic?.file && ASSETS.audio[mod.id] && !audioElements[mod.id]) {
          const audio = new Audio(ASSETS.audio[mod.id]);
          audio.volume = mod.backgroundMusic.volume ?? 1;
          audio.loop = mod.backgroundMusic.repeat !== 0;
          audioElements[mod.id] = audio;
          audio.play().catch(console.error);
        }

        // For break modifications, add the click handler to resume video.
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
                clearModifications();
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

        // If a break is currently active, do not re-trigger anything.
        if (activeBreakIndex !== -1) {
          return;
        }

        // Find a break modification that hasn't already been triggered.
        const breakIndex = CONFIG.modifications.findIndex(mod => 
          mod.type === 'break' && 
          !triggeredBreakIds.has(mod.id) &&
          currentTime >= mod.time
        );

        if (breakIndex !== -1) {
          videoElement.pause();
          activeBreakIndex = breakIndex;
          const currentBreak = CONFIG.modifications[breakIndex];
          
          // Mark this break as triggered
          triggeredBreakIds.add(currentBreak.id);

          // Clear any previous modifications.
          clearModifications();

          // Render break background if available.
          if (currentBreak.background) {
            const background = new PIXI.Graphics();
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

          // Render break sprites.
          if (currentBreak.sprites && currentBreak.sprites.length > 0) {
            currentBreak.sprites.forEach(spriteData => {
              if (ASSETS.images[spriteData.id]) {
                const sprite = new PIXI.Sprite(PIXI.Texture.from(ASSETS.images[spriteData.id]));
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
                app.stage.addChild(sprite);
                currentModifications.push(sprite);
              }
            });
          }

          // Ensure the video remains behind the break visuals.
          if (videoSprite && videoSprite.parent) {
            app.stage.removeChild(videoSprite);
            app.stage.addChildAt(videoSprite, 0);
          }

          // Play background music for the break immediately (if provided).
          if (currentBreak.backgroundMusic?.file && ASSETS.audio[currentBreak.id]) {
            const audio = new Audio(ASSETS.audio[currentBreak.id]);
            audio.volume = currentBreak.backgroundMusic.volume ?? 1;
            audio.loop = currentBreak.backgroundMusic.repeat !== 0;
            audioElements[currentBreak.id] = audio;
            audio.play().catch(console.error);
          }

          // Add a click handler on each modification element to resume playback.
          currentModifications.forEach(element => {
            // Remove any existing pointerdown handlers first.
            element.off && element.off('pointerdown');
            element.on('pointerdown', () => {
              if (activeBreakIndex !== -1) {
                const activeBreak = CONFIG.modifications[activeBreakIndex];
                if (activeBreak && audioElements[activeBreak.id]) {
                  audioElements[activeBreak.id].pause();
                  delete audioElements[activeBreak.id];
                }
                activeBreakIndex = -1;
                clearModifications();
                videoElement.play().catch(console.error);
              }
            });
          });

          return;
        }

        // Process overlays only when no break is active.
        const overlays = CONFIG.modifications.filter(
          mod => mod.type === 'overlay' &&
                 currentTime >= mod.startTime &&
                 currentTime <= mod.endTime
        );
        
        if (overlays.length > 0) {
          overlays.forEach(renderModification);
        } else {
          clearModifications();
        }

        // Handle end screen modifications.
        const endScreen = CONFIG.modifications.find(
          mod => mod.type === 'end_screen' && currentTime >= mod.time
        );
        
        if (endScreen) {
          videoElement.pause();
          renderModification(endScreen);
        }
      }

      // Initialize and start playback
      initVideo().then(() => {
        videoElement.addEventListener('timeupdate', handleVideoTimeUpdate);
        
        // Global click handler for breaks
        app.view.addEventListener('click', () => {
          if (activeBreakIndex !== -1) {
            const currentBreak = CONFIG.modifications[activeBreakIndex];
            if (currentBreak && audioElements[currentBreak.id]) {
              audioElements[currentBreak.id].pause();
              delete audioElements[currentBreak.id];
            }
            activeBreakIndex = -1;
            clearModifications();
            videoElement.play().catch(console.error);
          }
        });

        // Initial click to start
        const startPlayback = () => {
          videoElement.play().catch(() => {
            console.error('Failed to play video automatically');
            // Add visible play button or instructions
            const playButton = new PIXI.Text('Click to Play', {
              fill: 'white',
              fontSize: 24
            });
            playButton.anchor.set(0.5);
            playButton.position.set(app.screen.width / 2, app.screen.height / 2);
            playButton.eventMode = 'static';
            playButton.cursor = 'pointer';
            playButton.on('pointerdown', () => {
              videoElement.play().catch(console.error);
              app.stage.removeChild(playButton);
            });
            app.stage.addChild(playButton);
          });
          document.removeEventListener('click', startPlayback);
        };
        document.addEventListener('click', startPlayback, { once: true });
      }).catch(error => {
        console.error('Error initializing video:', error);
      });
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
      console.log('Video source:', videoPlayable.general.videoSource);
      try {
        const videoBase64 = await blobToBase64(videoPlayable.general.videoSource);
        assets.video = videoBase64;
      } catch (error) {
        console.error('Error converting video:', error);
        throw new Error('Failed to process video source');
      }
    } else {
      console.error('Video source object:', videoPlayable.general);
      throw new Error('No video source found in general properties');
    }

    // Convert all modification assets
    for (const mod of videoPlayable.modifications) {
      // Handle sprite images
      for (const sprite of mod.sprites) {
        if (sprite.file) {
          assets.images[sprite.id] = await blobToBase64(sprite.file);
        }
      }
      
      // Handle background music
      if (mod.backgroundMusic?.file) {
        assets.audio[mod.id] = await blobToBase64(mod.backgroundMusic.file);
      }
    }

    // Generate HTML file
    const html = generateHtmlTemplate(videoPlayable, assets);
    zip.file('index.html', html);

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${videoPlayable.general?.adName || 'playable-ad'}.zip`);
  } catch (error) {
    console.error('Error building playable ad:', error);
    throw error;
  }
};
