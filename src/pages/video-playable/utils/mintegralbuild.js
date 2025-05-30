import JSZip from 'jszip';
import { generateHtmlTemplate, blobToBase64 } from './index.js';

const generateMintegralHTML = (videoPlayable, assets) => {
  let htmlContent = generateHtmlTemplate(videoPlayable, assets);
  
  // 1. Update viewport meta tag for Mintegral requirements
  htmlContent = htmlContent.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0, minimum-scale=1.0,maximum-scale=1.0"/>'
  );
  
  // 2. Replace CDN script with local reference
  htmlContent = htmlContent.replace(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js"></script>',
    '<script src="pixi.min.js"></script>'
  );
  
  // 3. Add Mintegral-specific CSS styles
  const mintegralStyles = `
      body { 
        font-family: Arial, sans-serif;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      #game-container { 
        position: relative;
      }
      .loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        z-index: 999;
        text-align: center;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto 10px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }`;
  
  // Insert Mintegral styles before the closing </style> tag
  htmlContent = htmlContent.replace('</style>', mintegralStyles + '\n    </style>');
  
  // 4. Add loading indicator to the game container
  htmlContent = htmlContent.replace(
    '<div id="game-container"></div>',
    '<div id="game-container"><div class="loading-indicator" id="loading-indicator"><div class="spinner"></div>Loading...</div></div>'
  );
  
  // 5. Define Mintegral methods immediately in the head section
  const mintegralMethodsScript = `
    <script>
      window.gameReady = window.gameReady || function() {
        console.log('🎮 Mintegral gameReady called');
      };
      
      window.gameStart = window.gameStart || function() {
        console.log('🚀 Mintegral gameStart called');
      };
      
      window.gameEnd = window.gameEnd || function() {
        console.log('🏁 Mintegral gameEnd called');
      };
      
      window.gameClose = window.gameClose || function() {
        console.log('🔚 Mintegral gameClose called');
      };
      
      window.install = window.install || function() {
        console.log('📱 Mintegral install called');
      };
      
      window.mintegralMethodsReady = true;
      console.log('✅ Mintegral methods defined and ready for detection');
    </script>`;

  // Insert the methods script right after the opening <head> tag
  htmlContent = htmlContent.replace('<head>', '<head>' + mintegralMethodsScript);
  
  // 6. Create the main Mintegral integration script
  const mintegralIntegration = `
      var gameInitialized = false;
      var gameReadyCalled = false;
      var gameStartCalled = false;
      var gameEndCalled = false;
      
      window.gameStart = function() {
        console.log('🚀 MINTEGRAL CALLED: window.gameStart()');
        gameStartCalled = true;
        
        if (!gameInitialized) {
          startMintegralGame();
        }
      };

      window.gameClose = function() {
        console.log('🚀 MINTEGRAL CALLED: window.gameClose()');
        
        if (typeof videoElement !== 'undefined' && videoElement && !videoElement.paused) {
          videoElement.pause();
        }
        
        if (typeof audioElements !== 'undefined') {
          Object.keys(audioElements).forEach(function(id) {
            var audio = audioElements[id];
            if (audio && !audio.paused) {
              audio.pause();
            }
          });
        }
        
        if (typeof app !== 'undefined' && app) {
          app.ticker.stop();
        }
      };

      window.gameEnd = function() {
        console.log('🏁 MINTEGRAL CALLED: window.gameEnd()');
        gameEndCalled = true;
      };

      function handleMintegralStoreClick() {
        console.log('🛒 CALLING: window.install() - Store click');
        try {
          if (window.install && typeof window.install === 'function') {
            window.install();
            console.log('✅ SUCCESS: window.install() called');
          } else {
            console.warn('❌ window.install not available');
          }
        } catch (error) {
          console.error('❌ ERROR calling window.install():', error);
        }
      }

      function hideLoadingIndicator() {
        var loading = document.getElementById('loading-indicator');
        if (loading) {
          loading.style.display = 'none';
        }
      }
      
      function callMintegralGameReady() {
        if (gameReadyCalled) {
          console.log('⚠️ gameReady already called, skipping');
          return;
        }
        
        console.log('✅ CALLING: window.gameReady()');
        gameReadyCalled = true;
        
        try {
          if (typeof window.gameReady === 'function') {
            window.gameReady();
            console.log('✅ SUCCESS: window.gameReady() called');
          } else {
            console.warn('❌ window.gameReady not available');
          }
        } catch (error) {
          console.error('❌ ERROR calling window.gameReady():', error);
        }
      }

      function startMintegralGame() {
        try {
          console.log('🎮 Starting Mintegral game with existing functionality...');
          gameInitialized = true;
          
          hideLoadingIndicator();
          callMintegralGameReady();
          
          console.log('✅ Mintegral game started - letting original initialization proceed');
          
        } catch (error) {
          console.error("Error starting Mintegral game:", error);
          hideLoadingIndicator();
        }
      }

      function addMintegralVideoHooks() {
        var checkForVideo = setInterval(function() {
          if (typeof videoElement !== 'undefined' && videoElement) {
            clearInterval(checkForVideo);
            
            videoElement.addEventListener('ended', function() {
              if (!gameEndCalled && typeof window.gameEnd === 'function') {
                window.gameEnd();
                gameEndCalled = true;
              }
            });
            
            console.log('✅ Mintegral video hooks added');
          }
        }, 100);
        
        setTimeout(function() { 
          clearInterval(checkForVideo); 
        }, 10000);
      }

      function setupMintegralAutoStart() {
        setTimeout(function() {
          if (!gameStartCalled) {
            console.log('🔄 Auto-starting Mintegral game (gameStart not called)');
            startMintegralGame();
          }
        }, 1500);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          addMintegralVideoHooks();
          setupMintegralAutoStart();
        });
      } else {
        addMintegralVideoHooks();
        setupMintegralAutoStart();
      }`;
  
  // 7. Replace sprite click handling to include Mintegral CTA calls
  htmlContent = htmlContent.replace(
    /window\.open\(storeUrl, '_blank'\);/g,
    `if (window.install && typeof window.install === 'function') {
              window.install();
              console.log('✅ SUCCESS: window.install() called from sprite click');
            }
            window.open(storeUrl, '_blank');`
  );
  
  // 8. Replace other store URL handling with Mintegral install calls
  htmlContent = htmlContent.replace(
    /if \(typeof mraid !== "undefined"\) \{\s*mraid\.open\(storeUrl\);\s*\} else \{\s*window\.open\(storeUrl, '_blank'\);\s*\}/g,
    'handleMintegralStoreClick();'
  );
  
  // Replace Facebook CTA calls with Mintegral calls
  htmlContent = htmlContent.replace(
    /if \(typeof FbPlayableAd !== 'undefined'\) \{ FbPlayableAd\.onCTAClick\(\); \}/g,
    'handleMintegralStoreClick();'
  );
  
  // 9. Insert Mintegral JavaScript before the closing script tag
  htmlContent = htmlContent.replace(
    '</script>',
    mintegralIntegration + '\n      console.log("📄 Mintegral build ready, methods available for testing...");\n    </script>'
  );
  
  // 10. Add tracking to original initialization
  htmlContent = htmlContent.replace(
    /initVideo\(\)\.then\(/,
    'console.log("🎬 Original initVideo starting..."); initVideo().then('
  );
  
  return htmlContent;
};

// Export the build function with PIXI.js bundling
export const buildMintegralPlayable = async (videoPlayable) => {
  try {
    const zip = new JSZip();
    
    // Create assets object with all the assets (same as main build)
    const assets = {
      video: "",
      images: {},
      audio: {},
    };

    // Convert video to base64
    if (videoPlayable.general?.videoSource) {
      try {
        const videoBase64 = await blobToBase64(videoPlayable.general.videoSource);
        assets.video = videoBase64;
      } catch (error) {
        console.error("Error converting video:", error);
        throw new Error("Failed to process video source");
      }
    }

    // Convert all modification assets (same as main build)
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

    // Download and bundle PIXI.js locally
    try {
      console.log("Downloading PIXI.js library...");
      const pixiResponse = await fetch("https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js");
      if (!pixiResponse.ok) {
        throw new Error(`Failed to fetch PIXI.js: ${pixiResponse.statusText}`);
      }
      const pixiContent = await pixiResponse.text();
      zip.file("pixi.min.js", pixiContent);
    } catch (error) {
      console.error("Error downloading PIXI.js:", error);
      throw new Error("Failed to download PIXI.js library");
    }

    // Generate the HTML file using the full-featured template
    const htmlContent = generateMintegralHTML(videoPlayable, assets);
    zip.file("index.html", htmlContent);

    // Add basic manifest
    const manifest = {
      "name": videoPlayable.general?.adName || "Playable Ad",
      "version": "1.0.0"
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Generate zip
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  } catch (error) {
    console.error("Error building Mintegral playable:", error);
    throw error;
  }
};

