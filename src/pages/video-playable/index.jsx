import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  GripVertical,
  Upload,
  Play,
  Pause,
  RotateCw,
  Plus,
  Hand,
  X,
  Star,
  Image,
} from "lucide-react";
import * as PIXI from "pixi.js";
import BreakVideoControls from "./components/BreakVideoControls";
import { initialState, initialSpriteState } from './state';

const timelineContainerStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "48px",
  backgroundColor: "#1f2937",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
};

const timelineStyle = {
  flex: 1,
  height: "4px",
  backgroundColor: "#374151",
  borderRadius: "2px",
  position: "relative",
  margin: "0 16px",
};

const timelineProgressStyle = {
  position: "absolute",
  height: "100%",
  backgroundColor: "#8b5cf6",
  borderRadius: "2px",
};

const timelineHandleStyle = {
  position: "absolute",
  width: "12px",
  height: "12px",
  backgroundColor: "#8b5cf6",
  borderRadius: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  cursor: "pointer",
};

const timelineBreakStyle = {
  position: "absolute",
  width: "0",
  height: "0",
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderBottom: "8px solid #0d3ce5",
  top: "10px",
  transform: "translate(-50%, -100%)",
  cursor: "pointer",
  zIndex: 2,
};

const timelineBreakActiveStyle = {
  ...timelineBreakStyle,
  borderBottom: "8px solid #8b5cf6",
};

export default function VideoPlayable() {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(20);
  const [adName, setAdName] = useState("");
  const [videoSource, setVideoSource] = useState(null);
  const [iosUrl, setIosUrl] = useState("");
  const [playstoreUrl, setPlaystoreUrl] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [orientation, setOrientation] = useState({ width: 375, height: 667 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const [activeBreakIndex, setActiveBreakIndex] = useState(-1);
  const [sprites, setSprites] = useState([]);
  const [tabs, setTabs] = useState([
    { 
      id: "general", 
      label: "General Properties", 
      type: "general" 
    }
  ]);
  const pixiContainerRef = useRef(null);
  const pixiAppRef = useRef(null);
  const videoSpriteRef = useRef(null);
  const spritesRef = useRef([]);
  const [isTimelineDragging, setIsTimelineDragging] = useState(false);
  const timelineRef = useRef(null);
  const breakAudioRef = useRef(null);
  const [breakAudioElement, setBreakAudioElement] = useState(null);

  const [videoPlayable, setVideoPlayable] = useState(initialState);

  const initialBreakState = {
    time: 0,
    backgroundMusic: {
      file: null,
      volume: 1,
      repeat: 1,
    },
    stopOnVideoResume: true,
    background: true,
    backgroundColor: "#000000",
    relativeToScreenSize: true,
    sprites: [],
  };

  const clearBreakContent = useCallback(() => {
    if (!pixiAppRef.current) return;

    // Clear all sprites
    spritesRef.current.forEach(sprite => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
    spritesRef.current = [];

    // Reset stage
    const app = pixiAppRef.current;
    app.stage.removeChildren();
    if (videoSpriteRef.current) {
      app.stage.addChild(videoSpriteRef.current);
    }
  }, []);

  const addTab = (type, time) => {
    const newTab = {
      id: `${type}-${Date.now()}`,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${time}ms)`,
      type,
      time,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const addBreak = useCallback((time) => {
    const newBreak = {
      ...initialBreakState,
      time: Math.round(time),
      background: true,
    };

    setVideoPlayable(prev => {
      const newBreaks = [...prev.breaks, newBreak].sort((a, b) => a.time - b.time);
      const breakIndex = newBreaks.findIndex(b => b.time === newBreak.time);
      
      setTimeout(() => {
        setActiveBreakIndex(breakIndex);
      }, 0);
      
      const newTabId = `break-${Date.now()}`;
      setTabs(prevTabs => [...prevTabs, {
        id: newTabId,
        type: 'break',
        breakIndex,
        time: newBreak.time
      }]);
      setActiveTab(newTabId);
      
      return {
        ...prev,
        breaks: newBreaks
      };
    });
  }, []);

  const addOverlay = () => {
    const time = Math.floor(currentTime);
    addTab("overlay", time);
  };

  const addEndScreen = () => {
    const time = Math.floor(currentTime);
    addTab("end", time);
  };

  const addSprite = (type, index, sprite) => {
    setVideoPlayable(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index 
          ? { ...item, sprites: [...item.sprites, sprite] }
          : item
      )
    }));
  };

  const handlePlayStateChange = (playing) => {
    setIsPlaying(playing);
    if (playing) {
      document.body.classList.add("video-playing");
    } else {
      document.body.classList.remove("video-playing");
    }
  };

  const stopBreakAudio = () => {
    if (breakAudioElement) {
      breakAudioElement.pause();
      breakAudioElement.currentTime = 0;
      breakAudioElement.remove();
      setBreakAudioElement(null);
    }
  };

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration * 1000);
    }
  };

  const handleBreakAudio = useCallback((currentBreak) => {
    if (!currentBreak.backgroundMusic?.file) return;
    
    // Stop any existing audio
    stopBreakAudio();

    // Create and play new audio
    const audio = new Audio(URL.createObjectURL(currentBreak.backgroundMusic.file));
    audio.volume = currentBreak.backgroundMusic.volume;
    audio.loop = currentBreak.backgroundMusic.repeat > 1;
    setBreakAudioElement(audio);
    
    audio.play().catch(error => {
      console.error('Error playing break audio:', error);
    });
  }, [stopBreakAudio]);


  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (!videoSpriteRef.current) return;

    const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;

    if (!isPlaying) {
      setIsPreviewMode(true);
      setIsPlaying(true);
      clearBreakContent();
      stopBreakAudio();
      setActiveBreakIndex(-1);
      videoElement.currentTime = 0;
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
    } else {
      videoElement.pause();
      setIsPlaying(false);
      setIsPreviewMode(false);
      stopBreakAudio();
      clearBreakContent();
    }
  }, [isPlaying, clearBreakContent, stopBreakAudio]);

  const toggleOrientation = () => {
    setOrientation((prev) => ({
      width: prev.height,
      height: prev.width,
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsPlaying(false);
      setVideoSource(file);
      setCurrentTime(0);
      setActiveBreakIndex(-1);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const container = e.currentTarget;
    const newPosition = (e.clientX / container.offsetWidth) * 100;
    setSplitPosition(Math.min(Math.max(newPosition, 20), 80));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTimelineMouseDown = (e) => {
    setIsTimelineDragging(true);
    updateVideoTime(e);
  };

  const handleTimelineMouseMove = (e) => {
    if (!isTimelineDragging) return;
    updateVideoTime(e);
  };

  const handleTimelineMouseUp = () => {
    setIsTimelineDragging(false);
  };

  const updateVideoTime = (e) => {
    if (!timelineRef.current || !videoSpriteRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = Math.round(Math.max(0, Math.min(position * duration, duration)));

    const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
    videoElement.currentTime = newTime / 1000;
    setCurrentTime(newTime);

    const breakIndex = videoPlayable.breaks.findIndex((breakPoint) => {
      const timeDiff = Math.abs(breakPoint.time - newTime);
      return timeDiff < 50 && newTime >= breakPoint.time;
    });

    if (breakIndex !== -1) {
      videoElement.currentTime = videoPlayable.breaks[breakIndex].time / 1000;
      setCurrentTime(videoPlayable.breaks[breakIndex].time);
      setActiveBreakIndex(breakIndex);
      setIsPlaying(false);
    } else {
      setActiveBreakIndex(-1);
    }
  };

  useEffect(() => {
    if (!pixiContainerRef.current || !videoSource) return;

    const app = new PIXI.Application({
      width: orientation.width,
      height: orientation.height,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const pixiCanvas = app.view;
    if (pixiCanvas instanceof HTMLCanvasElement) {
      pixiContainerRef.current.appendChild(pixiCanvas);
      pixiCanvas.style.position = "absolute";
      pixiCanvas.style.left = "50%";
      pixiCanvas.style.top = "50%";
      pixiCanvas.style.transform = "translate(-50%, -50%)";
    }

    pixiAppRef.current = app;

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.crossOrigin = "anonymous";
    videoElement.loop = false;
    videoElement.autoplay = false;
    videoElement.muted = false;
    videoElement.playsInline = true;
    videoElement.currentTime = 0;

    videoElement.addEventListener(
      "loadeddata",
      () => {
        videoElement.pause();
        setIsPlaying(false);
      },
      { once: true }
    );

    videoElement.addEventListener("timeupdate", () => {
      setCurrentTime(videoElement.currentTime * 1000);
    });

    videoElement.src = URL.createObjectURL(videoSource);

    videoElement.onloadedmetadata = () => {
      const texture = PIXI.Texture.from(videoElement);
      const videoSprite = new PIXI.Sprite(texture);

      videoSprite.anchor.set(0.5);
      videoSprite.position.set(app.screen.width / 2, app.screen.height / 2);

      const scaleX = app.screen.width / videoElement.videoWidth;
      const scaleY = app.screen.height / videoElement.videoHeight;
      const scale = Math.min(scaleX, scaleY);
      videoSprite.scale.set(scale);

      app.stage.removeChildren();
      app.stage.addChild(videoSprite);
      videoSpriteRef.current = videoSprite;

      setDuration(videoElement.duration * 1000);
      setCurrentTime(0);

      requestAnimationFrame(() => {
        videoElement.pause();
        setIsPlaying(false);
      });
    };

    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();
      }
      if (pixiAppRef.current) {
        if (
          pixiContainerRef.current &&
          pixiAppRef.current.view instanceof HTMLCanvasElement
        ) {
          pixiContainerRef.current.removeChild(pixiAppRef.current.view);
        }
        pixiAppRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
        pixiAppRef.current = null;
      }
      if (videoSpriteRef.current) {
        videoSpriteRef.current = null;
      }
    };
  }, [videoSource, orientation.width, orientation.height]);

  useEffect(() => {
    if (!videoRef.current) return;

    const handleTimeUpdate = () => {
      const time = videoRef.current.currentTime * 1000;
      setCurrentTime(time);

      const breakPoint = videoPlayable.breaks.find((b) => Math.abs(b.time - time) < 50);
      if (breakPoint) {
        videoRef.current.pause();
        handlePlayStateChange(false);
        setActiveBreakIndex(videoPlayable.breaks.indexOf(breakPoint));
      }
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () =>
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoPlayable.breaks]);

  useEffect(() => {
    if (!pixiAppRef.current || !videoSpriteRef.current) return;

    const app = pixiAppRef.current;
    const currentBreak = videoPlayable.breaks[activeBreakIndex];

    // Clear previous sprites
    spritesRef.current.forEach(sprite => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
    spritesRef.current = [];

    // Clear stage
    app.stage.removeChildren();
    app.stage.addChild(videoSpriteRef.current);

    if (currentBreak) {
      // Add background if enabled
      if (currentBreak.background) {
        const background = new PIXI.Graphics();
        background.beginFill(
          parseInt(currentBreak.backgroundColor.replace("#", "0x")),
          0.7
        );
        background.drawRect(0, 0, app.screen.width, app.screen.height);
        background.endFill();
        app.stage.addChild(background);
        spritesRef.current.push(background);
      }

      // Add sprites
      currentBreak.sprites.forEach(spriteData => {
        if (!spriteData.file) return;

        const sprite = PIXI.Sprite.from(spriteData.imageUrl);
        
        sprite.position.set(
          spriteData.position.x * app.screen.width,
          spriteData.position.y * app.screen.height
        );
        sprite.scale.set(spriteData.scale);
        sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
        sprite.rotation = spriteData.rotation * (Math.PI / 180);
        sprite.alpha = spriteData.transparency;

        // Make sprite interactive
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        
        sprite.on('pointerdown', () => {
          clearBreakContent();
          
          // Only stop audio if stopOnVideoResume is true
          if (currentBreak.stopOnVideoResume && currentBreak.backgroundMusic?.file) {
            stopBreakAudio();
          }
          
          const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
          videoElement.play()
            .then(() => {
              setIsPlaying(true);
              setActiveBreakIndex(-1);
            })
            .catch(error => {
              console.error('Error resuming video:', error);
            });
        });

        app.stage.addChild(sprite);
        spritesRef.current.push(sprite);
      });

      // Ensure video sprite is at the bottom
      app.stage.removeChild(videoSpriteRef.current);
      app.stage.addChildAt(videoSpriteRef.current, 0);
    }

    return () => {
      spritesRef.current.forEach(sprite => {
        if (sprite && sprite.destroy) {
          sprite.destroy();
        }
      });
      spritesRef.current = [];
    };
  }, [activeBreakIndex, videoPlayable.breaks]);

  useEffect(() => {
    if (!videoSpriteRef.current || !isPreviewMode || !isPlaying) return;

    const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
    let animationFrameId;

    const checkForBreaks = () => {
      const currentTimeMs = Math.floor(videoElement.currentTime * 1000);
      
      // Check for breaks
      const breakIndex = videoPlayable.breaks.findIndex((breakPoint) => {
        const timeDiff = Math.abs(breakPoint.time - currentTimeMs);
        return timeDiff < 50 && currentTimeMs >= breakPoint.time;
      });

      if (breakIndex !== -1 && breakIndex !== activeBreakIndex) {
        // Hit a break point
        videoElement.pause();
        setIsPlaying(false);
        
        const currentBreak = videoPlayable.breaks[breakIndex];
        
        // Show break content
        if (currentBreak.background) {
          const app = pixiAppRef.current;
          const background = new PIXI.Graphics();
          background.beginFill(parseInt(currentBreak.backgroundColor.replace("#", "0x")), 0.7);
          background.drawRect(0, 0, app.screen.width, app.screen.height);
          background.endFill();
          app.stage.addChild(background);
          spritesRef.current.push(background);
        }

        // Add sprites
        currentBreak.sprites.forEach(spriteData => {
          if (!spriteData.file) return;
          
          const sprite = PIXI.Sprite.from(spriteData.imageUrl);
          const app = pixiAppRef.current;
          
          sprite.position.set(
            spriteData.position.x * app.screen.width,
            spriteData.position.y * app.screen.height
          );
          sprite.scale.set(spriteData.scale);
          sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
          sprite.rotation = spriteData.rotation * (Math.PI / 180);
          sprite.alpha = spriteData.transparency;

          // Make sprite interactive
          sprite.eventMode = 'static';
          sprite.cursor = 'pointer';
          
          sprite.on('pointerdown', () => {
            clearBreakContent();
            if (currentBreak.backgroundMusic?.file) {
              stopBreakAudio();
            }
            
            const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
            videoElement.play()
              .then(() => {
                setIsPlaying(true);
                setActiveBreakIndex(-1);
              })
              .catch(error => {
                console.error('Error resuming video:', error);
              });
          });

          app.stage.addChild(sprite);
          spritesRef.current.push(sprite);
        });

        setActiveBreakIndex(breakIndex);

        // Play break audio if exists
        if (currentBreak.backgroundMusic?.file) {
          handleBreakAudio(currentBreak);
        }
      }

      animationFrameId = requestAnimationFrame(checkForBreaks);
    };

    checkForBreaks();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPreviewMode, isPlaying, videoPlayable.breaks, activeBreakIndex, clearBreakContent, stopBreakAudio, handleBreakAudio]);

  const showBreakContent = useCallback((breakPoint) => {
    if (!pixiAppRef.current || !videoSpriteRef.current) return;

    const app = pixiAppRef.current;
    clearBreakContent();

    // Add background if enabled
    if (breakPoint.background) {
      const background = new PIXI.Graphics();
      background.beginFill(parseInt(breakPoint.backgroundColor.replace("#", "0x")), 0.7);
      background.drawRect(0, 0, app.screen.width, app.screen.height);
      background.endFill();
      app.stage.addChild(background);
      spritesRef.current.push(background);
    }

    // Add sprites with click handlers
    breakPoint.sprites.forEach(spriteData => {
      if (!spriteData.file) return;

      const sprite = PIXI.Sprite.from(spriteData.imageUrl);
      sprite.position.set(
        spriteData.position.x * app.screen.width,
        spriteData.position.y * app.screen.height
      );
      sprite.scale.set(spriteData.scale);
      sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
      sprite.rotation = spriteData.rotation * (Math.PI / 180);
      sprite.alpha = spriteData.transparency;

      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      
      sprite.on('pointerdown', () => {
        clearBreakContent();
        stopBreakAudio();
        
        const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
        videoElement.play();
        setIsPlaying(true);
        setActiveBreakIndex(-1);
      });

      app.stage.addChild(sprite);
      spritesRef.current.push(sprite);
    });

    // Ensure video sprite is at the bottom
    app.stage.removeChild(videoSpriteRef.current);
    app.stage.addChildAt(videoSpriteRef.current, 0);
  }, [clearBreakContent, stopBreakAudio]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsTimelineDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isTimelineDragging) return;
      updateVideoTime(e);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isTimelineDragging, duration]);

  useEffect(() => {
    return () => {
      stopBreakAudio();
    };
  }, []);

  const renderSprite = (spriteData, type, parentId) => {
    if (!pixiAppRef.current || !spriteData.imageUrl) return;

    const texture = PIXI.Texture.from(spriteData.imageUrl);
    const sprite = new PIXI.Sprite(texture);

    applySpriteProperies(sprite, spriteData);

    pixiAppRef.current.stage.addChild(sprite);

    if (!spritesRef.current[type][parentId]) {
      spritesRef.current[type][parentId] = {};
    }
    spritesRef.current[type][parentId][spriteData.id] = sprite;

    return sprite;
  };

  const applySpriteProperies = (sprite, spriteData) => {
    if (!pixiAppRef.current) return;

    sprite.position.x = spriteData.position.x * pixiAppRef.current.screen.width;
    sprite.position.y = spriteData.position.y * pixiAppRef.current.screen.height;
    sprite.scale.set(spriteData.scale);
    sprite.rotation = spriteData.rotation * (Math.PI / 180);
    sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
    sprite.alpha = spriteData.transparency;
  };

  const spriteHandlers = useMemo(() => ({
    breaks: {
      sprite: (spriteData, breakId) => {
        if (!pixiAppRef.current || !videoSpriteRef.current) return;
        
        try {
          const app = pixiAppRef.current;
          const sprite = PIXI.Sprite.from(spriteData.imageUrl);

          sprite.scale.set(spriteData.scale);
          sprite.position.set(
            spriteData.position.x * app.screen.width,
            spriteData.position.y * app.screen.height
          );
          sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
          sprite.rotation = spriteData.rotation;
          sprite.alpha = spriteData.transparency;
          
          if (!spritesRef.current.breaks[breakId]) {
            spritesRef.current.breaks[breakId] = {};
          }
          spritesRef.current.breaks[breakId][spriteData.id] = sprite;

          app.stage.addChild(sprite);
          app.stage.removeChild(videoSpriteRef.current);
          app.stage.addChildAt(videoSpriteRef.current, 0);

        } catch (error) {
          console.error('Error creating sprite:', error);
        }
      },
      activateBreak: (breakIndex, breakPoint) => {
        if (!pixiAppRef.current || !videoSpriteRef.current) return;

        const app = pixiAppRef.current;

        clearBreakContent();

        if (breakPoint.background) {
          const background = new PIXI.Graphics();
          background.beginFill(
            parseInt(breakPoint.backgroundColor.replace("#", "0x")),
            0.7
          );
          background.drawRect(0, 0, app.screen.width, app.screen.height);
          background.endFill();
          app.stage.addChild(background);
        }

        if (spritesRef.current.breaks[breakIndex]) {
          Object.values(spritesRef.current.breaks[breakIndex]).forEach(sprite => {
            if (sprite && !app.stage.children.includes(sprite)) {
              app.stage.addChild(sprite);
            }
          });
        }

        app.stage.removeChild(videoSpriteRef.current);
        app.stage.addChildAt(videoSpriteRef.current, 0);

        setActiveBreakIndex(breakIndex);
      }
    },
    overlay: {
      sprite: (spriteData) => {
        // Add permanent overlay sprite
      },
      audio: (audioData) => {
        // Add permanent overlay audio
      }
    },
    endScreen: {
      sprite: (spriteData) => {
        // Add end screen sprite
      },
      overlay: (overlayData) => {
        // Add end screen overlay
      },
      audio: (audioData) => {
        // Add end screen audio
      }
    }
  }), [clearBreakContent]);

  useEffect(() => {
    Object.entries(spritesRef?.current?.breaks || {}).forEach(([breakId, sprites]) => {
      Object.values(sprites).forEach(sprite => {
        sprite.visible = parseInt(breakId) === activeBreakIndex;
      });
    });
  }, [activeBreakIndex]);

  useEffect(() => {
    if (pixiAppRef.current && videoSpriteRef.current) {
      pixiAppRef.current.stage.removeChild(videoSpriteRef.current);
      pixiAppRef.current.stage.addChildAt(videoSpriteRef.current, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      Object.values(spritesRef.current).forEach(typeContainer => {
        Object.values(typeContainer).forEach(parentContainer => {
          Object.values(parentContainer).forEach(sprite => {
            sprite.destroy();
          });
        });
      });
      spritesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!videoSpriteRef.current) return;

    const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
    
    const handleVideoEnd = () => {
      setIsPlaying(false);
      setIsPreviewMode(false);
      stopBreakAudio();
      clearBreakContent();
      setActiveBreakIndex(-1);
    };

    videoElement.addEventListener('ended', handleVideoEnd);
    
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [stopBreakAudio, clearBreakContent]);

  const renderExpandableButtons = () => (
    <div
      className={`absolute top-4 left-4 z-10 ${
        isPreviewMode ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="relative">
        <button
          onClick={() => !isPreviewMode && setIsExpanded(!isExpanded)}
          className={`w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white ${
            isPreviewMode ? "cursor-default" : "cursor-pointer"
          }`}
          disabled={isPreviewMode}
        >
          <Plus
            className={`w-6 h-6 transition-transform ${
              isExpanded ? "rotate-45" : ""
            }`}
          />
        </button>

        {isExpanded && !isPreviewMode && (
          <div className="absolute left-0 top-12 space-y-2">
            <button
              onClick={() => addBreak(currentTime)}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white"
              title="Add Break"
            >
              <Pause className="w-6 h-6" />
            </button>
            <button
              onClick={addEndScreen}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white"
              title="Add End Screen"
            >
              <Star className="w-6 h-6" />
            </button>
            <button
              onClick={addOverlay}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white"
              title="Add Permanent Overlay"
            >
              <Image className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex space-x-4 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            activeTab === tab.id ? "bg-gray-200" : ""
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.type === 'break' 
            ? `Break (${tab.time}ms)` 
            : tab.label}
        </button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (!activeTabData) return null;

    switch (activeTabData.type) {
      case "general":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Playable Ad Name
              </label>
              <input
                type="text"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter ad name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Video Source
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="flex items-center px-4 py-2 bg-primary text-white rounded cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </label>
                {videoSource && <span className="text-sm">Video uploaded</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                iOS App Store URL
              </label>
              <input
                type="url"
                value={iosUrl}
                onChange={(e) => setIosUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter iOS App Store URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Google Play Store URL
              </label>
              <input
                type="url"
                value={playstoreUrl}
                onChange={(e) => setPlaystoreUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Play Store URL"
              />
            </div>
          </div>
        );
      case "break":
        return (
          <BreakVideoControls
            activeTab={activeTabData}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
          />
        );
      case "overlay":
        return (
          <div className="space-y-4">
            <h3>Overlay Controls ({activeTabData.time}ms)</h3>
          </div>
        );
      case "end":
        return (
          <div className="space-y-4">
            <h3>End Screen Controls ({activeTabData.time}ms)</h3>
          </div>
        );
      default:
        return null;
    }
  };

  const renderBreakIndicators = useCallback(() => {
    if (!videoPlayable.breaks?.length) return null;

    return videoPlayable.breaks.map((breakPoint, index) => {
      const position = (breakPoint.time / duration) * 100;
      const isActive = activeTab?.breakIndex === index;

      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${position}%`,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = breakPoint.time / 1000;
              setCurrentTime(breakPoint.time);
              
              // Find and set the corresponding tab
              const breakTab = tabs.find(tab => tab.breakIndex === index);
              if (breakTab) {
                setActiveTab(breakTab.id);
              }
            }
          }}
          title={`Break at ${breakPoint.time}ms`}
        >
          <div
            style={isActive ? timelineBreakActiveStyle : timelineBreakStyle}
          />
        </div>
      );
    });
  }, [videoPlayable.breaks, duration, activeTab, tabs]);

  // Update SpriteEditor position handling
  const handleSpriteUpdate = (spriteIndex, updatedSprite) => {
    setVideoPlayable(prev => {
      const updatedBreaks = [...prev.breaks];
      const breakIndex = activeBreakIndex;
      
      if (breakIndex === -1) return prev;

      // Ensure position values are clamped between 0 and 1
      const clampedPosition = {
        x: Math.max(0, Math.min(1, updatedSprite.position.x)),
        y: Math.max(0, Math.min(1, updatedSprite.position.y))
      };

      updatedBreaks[breakIndex] = {
        ...updatedBreaks[breakIndex],
        sprites: updatedBreaks[breakIndex].sprites.map((sprite, index) =>
          index === spriteIndex 
            ? { ...updatedSprite, position: clampedPosition }
            : sprite
        )
      };
      return { ...prev, breaks: updatedBreaks };
    });
  };

  // Update the timeline click handler
  const handleTimelineClick = useCallback((e) => {
    if (!e.altKey || !videoRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const clickTime = Math.round(clickPosition * duration);
    
    addBreak(clickTime);
  }, [duration, addBreak]);

  return (
    <div
      className={`flex relative w-full h-[calc(100vh-56px)] ${
        isPlaying ? "playing" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{ width: `${splitPosition}%` }}
        className={`h-full bg-gray-100 overflow-hidden mx-4 rounded-xl ${
          isPreviewMode ? "pointer-events-none opacity-50 bg-gray-300" : ""
        }`}
      >
        {renderTabs()}
        {renderTabContent()}
      </div>

      <div
        className={`group absolute h-full flex items-center cursor-ew-resize ${
          isPreviewMode ? "pointer-events-none opacity-50" : ""
        }`}
        style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
        onMouseDown={!isPreviewMode ? handleMouseDown : undefined}
      >
        <div className="absolute w-4 h-full" />
        <div className="w-[1px] bg-primary/10 h-full" />
        <span className="absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-lg border border-primary/20 px-[0.5px] py-[2px]">
          <GripVertical size={12} strokeWidth={2} />
        </span>
      </div>

      <div style={{ width: `${100 - splitPosition}%` }} className="h-full">
        {videoSource && (
          <div className="h-full flex flex-col relative">
            <div className="flex-1 bg-gray-900">
              {renderExpandableButtons()}
              <div
                className="canvas-container"
                style={{
                  width: orientation.width + "px",
                  height: orientation.height + "px",
                  position: "relative",
                  margin: "auto",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  ref={pixiContainerRef}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
            <div
              className={`absolute top-4 right-4 bg-gray-800 rounded-lg p-2 ${
                isPreviewMode ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <button
                onClick={toggleOrientation}
                className="p-2 hover:bg-gray-700 rounded"
                disabled={isPreviewMode}
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>
              <div className="text-white text-xs mt-1">
                {orientation.width}x{orientation.height}
              </div>
            </div>
            <div style={timelineContainerStyle} className="video-controls">
              <button
                onClick={togglePlayPause}
                className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 ${
                  isPreviewMode && activeBreakIndex !== -1 ? 'opacity-50' : ''
                }`}
                disabled={isPreviewMode && activeBreakIndex !== -1}
              >
                {isPlaying || (isPreviewMode && activeBreakIndex !== -1) ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>

              <div
                ref={timelineRef}
                style={timelineStyle}
                className="relative cursor-pointer"
                onMouseDown={handleTimelineMouseDown}
              >
                <div
                  style={{
                    ...timelineProgressStyle,
                    width: `${(currentTime / duration) * 100}%`,
                  }}
                />
                <div
                  style={{
                    ...timelineHandleStyle,
                    left: `${(currentTime / duration) * 100}%`,
                  }}
                />
                {renderBreakIndicators()}
              </div>

              <div className="text-white text-sm ml-4">
                {Math.floor(currentTime)}ms / {Math.floor(duration)}ms
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = `
  .video-playing * {
    pointer-events: none;
  }

  .video-playing .canvas-container,
  .video-playing .canvas-container *,
  .video-playing .video-controls,
  .video-playing .video-controls * {
    pointer-events: auto !important;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
