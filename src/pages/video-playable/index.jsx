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
  Square,
  Download
} from "lucide-react";
import * as PIXI from "pixi.js";
import ModificationControls from "./components/ModificationControls";
import { baseModificationState, initialState, ModificationType } from "./state";
import { buildPlayableAd } from "./utils";

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

const getEasedProgress = (progress, easingType) => {
  switch (easingType) {
    case 'easeInQuad':
      return progress * progress;
    case 'easeOutQuad':
      return 1 - (1 - progress) * (1 - progress);
    case 'easeInOutQuad':
      return progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'easeInCubic':
      return progress * progress * progress;
    case 'easeOutCubic':
      return 1 - Math.pow(1 - progress, 3);
    case 'easeInOutCubic':
      return progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    default:
      return progress; // linear
  }
};

export default function VideoPlayable() {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(20);
  const [adName, setAdName] = useState("");
  const [videoSource, setVideoSource] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [iosUrl, setIosUrl] = useState("");
  const [playstoreUrl, setPlaystoreUrl] = useState("");
  const [activeTab, setActiveTab] = useState({
    id: "general",
    type: "general",
    modificationIndex: -1
  });
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [orientation, setOrientation] = useState({ width: 375, height: 667 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeBreakIndex, setActiveBreakIndex] = useState(-1);
  const [tabs, setTabs] = useState([
    {
      id: "general",
      type: "general",
      modificationIndex: -1,
      label: "General Properties"
    }
  ]);
  const pixiContainerRef = useRef(null);
  const pixiAppRef = useRef(null);
  const videoSpriteRef = useRef(null);
  const spritesRef = useRef([]);
  const [isTimelineDragging, setIsTimelineDragging] = useState(false);
  const timelineRef = useRef(null);
  const [breakAudioElement, setBreakAudioElement] = useState(null);

  const [videoPlayable, setVideoPlayable] = useState(initialState);

  // Create a ref that will hold the active audio elements keyed by modification id.
  const audioElementsRef = useRef({});
  // On mount, initialize the PIXI app and attach its canvas to the right container
  useEffect(() => {
    if (pixiContainerRef.current) {
      const width = pixiContainerRef.current.clientWidth;
      const height = pixiContainerRef.current.clientHeight;
      pixiAppRef.current = new PIXI.Application({
        width,
        height,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
      });
      // Enable zIndex sorting so the children are ordered according to their zIndex values
      pixiAppRef.current.stage.sortableChildren = true;
      // Append the canvas to the container
      pixiContainerRef.current.appendChild(pixiAppRef.current.view);
    }
  }, []);

  // Helper to play background music for a modification.
  const playModificationAudio = (modification) => {
    if (
      modification.backgroundMusic &&
      modification.backgroundMusic.file
    ) {
      // Check if the file is a Blob (from an upload) or a URL string.
      const fileOrUrl = modification.backgroundMusic.file;
      const audioSrc = fileOrUrl instanceof Blob
        ? URL.createObjectURL(fileOrUrl)
        : fileOrUrl;

      const audio = new Audio(audioSrc);
      audio.volume = modification.backgroundMusic.volume ?? 1;
      // If repeat is set (non‑zero), use looping.
      audio.loop = modification.backgroundMusic.repeat !== 0;
      audio.play().catch((err) => console.error("Audio play error:", err));
      return audio;
    }
    return null;
  };

  // Helper to stop an audio element.
  const stopModificationAudio = (audio) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const clearBreakContent = useCallback(() => {
    if (!pixiAppRef.current) return;

    // Clear all sprites
    spritesRef.current.forEach((sprite) => {
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

  const clearOverlayContent = () => {
    if (!pixiAppRef.current) return;
    // Remove any child marked as an overlay from the stage.
    spritesRef.current = spritesRef.current.filter(child => {
      if (child.__isOverlay) {
        pixiAppRef.current.stage.removeChild(child);
        return false;
      }
      return true;
    });
  };

  const addBreak = useCallback((time) => {
    const newBreak = {
      ...baseModificationState,
      type: ModificationType.BREAK,
      id: Date.now(),
      time: Math.round(time),
      background: true,
      stopOnVideoResume: true,
    };

    setVideoPlayable((prev) => {
      const newModifications = [...prev.modifications, newBreak].sort(
        (a, b) => a.time - b.time
      );
      const modificationIndex = newModifications.findIndex(
        (m) => m.id === newBreak.id
      );

      setTimeout(() => {
        setActiveBreakIndex(modificationIndex);
      }, 0);

      const newTabId = `modification-${newBreak.id}`;
      const newTab = {
        id: newTabId,
        type: ModificationType.BREAK,
        modificationIndex,
        time: newBreak.time,
        label: `Break (${newBreak.time}ms)`,
      };
      setTabs((prevTabs) => [
        ...prevTabs,
        newTab,
      ]);
      setActiveTab(newTab);

      return {
        ...prev,
        modifications: newModifications,
      };
    });
  }, []);

  const addOverlay = () => {
    const time = Math.floor(currentTime);
    const newOverlay = {
      ...baseModificationState,
      type: ModificationType.OVERLAY,
      id: Date.now(),
      startTime: time,
      time: time,
      endTime: duration,
      stopOnVideoResume: false,
      background: true,
      backgroundColor: "#000000",
      backgroundMusic: {
        file: null,
        volume: 1,
        repeat: 0,
      },
      sprites: [],
      relativeToScreenSize: true,
    };

    setVideoPlayable(prev => {
      const newModifications = [...prev.modifications, newOverlay];
      const modificationIndex = newModifications.findIndex(m => m.id === newOverlay.id);
      
      const newTabId = `modification-${newOverlay.id}`;
      const newTab = {
        id: newTabId,
        type: ModificationType.OVERLAY,
        modificationIndex,
        time: newOverlay.startTime,
        label: `overlay (${newOverlay.startTime}ms)`
      };
      
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTab(newTab);  // Pass the full tab object
      
      return {
        ...prev,
        modifications: newModifications
      };
    });
  };

  const addEndScreen = () => {
    // For a custom trigger time, you might use the current playhead time or a user-specified value.
    const time = Math.floor(currentTime); // Or a different value if needed.
    const newEndScreen = {
      ...baseModificationState,
      type: ModificationType.END_SCREEN,
      id: Date.now(),
      time: time, // Set the trigger time for the end screen.
      background: true,
      backgroundColor: "#000000",
      backgroundMusic: {
        file: null,
        volume: 1,
        repeat: 0,
      },
      sprites: [],
      relativeToScreenSize: true,
    };

    setVideoPlayable((prev) => {
      const newModifications = [...prev.modifications, newEndScreen];
      const modificationIndex = newModifications.findIndex((m) => m.id === newEndScreen.id);
      setTabs((prevTabs) => [
        ...prevTabs,
        {
          id: `modification-${newEndScreen.id}`,
          type: ModificationType.END_SCREEN,
          modificationIndex,
          time: newEndScreen.time,
          label: `End Screen (${newEndScreen.time}ms)`,
        },
      ]);
      setActiveTab({
        id: `modification-${newEndScreen.id}`,
        type: ModificationType.END_SCREEN,
        modificationIndex,
      });
      return { ...prev, modifications: newModifications };
    });
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

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (!videoSpriteRef.current) return;

    const videoElement =
      videoSpriteRef.current.texture.baseTexture.resource.source;

    if (!isPlaying) {
      setIsPreviewMode(true);
      setIsPlaying(true);
      clearBreakContent();
      stopBreakAudio();
      setActiveBreakIndex(-1);
      videoElement.currentTime = 0;
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error);
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
      setVideoPlayable(prev => ({
        ...prev,
        general: {
          ...prev.general,
          videoSource: file
        }
      }));
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
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

  const updateVideoTime = (e) => {
    if (!timelineRef.current || !videoSpriteRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = Math.round(
      Math.max(0, Math.min(position * duration, duration))
    );

    const videoElement =
      videoSpriteRef.current.texture.baseTexture.resource.source;
    videoElement.currentTime = newTime / 1000;
    setCurrentTime(newTime);

    const breakIndex = videoPlayable.modifications.findIndex((breakPoint) => {
      const timeDiff = Math.abs(breakPoint.time - newTime);
      return timeDiff < 50 && newTime >= breakPoint.time;
    });

    if (breakIndex !== -1) {
      videoElement.currentTime =
        videoPlayable.modifications[breakIndex].time / 1000;
      setCurrentTime(videoPlayable.modifications[breakIndex].time);
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
      // Set video sprite to lowest zIndex so it remains behind all overlays and breakpoints
      videoSprite.zIndex = 0;
      app.stage.removeChildren();
      app.stage.addChild(videoSprite);
      videoSpriteRef.current = videoSprite;

      // IMPORTANT: assign the video element so that videoRef is not null.
      videoRef.current = videoElement;

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

      if (isPlaying) {
        // Handle breaks
        const breakPoint = videoPlayable.modifications.find(
          (mod) => mod.type === ModificationType.BREAK && Math.abs(mod.time - time) < 50
        );

        if (breakPoint) {
          videoRef.current.pause();
          handlePlayStateChange(false);
          setActiveBreakIndex(videoPlayable.modifications.indexOf(breakPoint));
          return;
        }

        // Handle overlays
        const activeOverlays = videoPlayable.modifications.filter(
          (mod) => 
            mod.type === ModificationType.OVERLAY && 
            time >= mod.startTime && 
            time <= mod.endTime
        );

        clearBreakContent();
        if (activeOverlays.length > 0) {
          renderModifications(activeOverlays);
        }
      }
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () =>
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoPlayable.modifications]);

  useEffect(() => {
    if (!pixiAppRef.current || !videoSpriteRef.current) return;

    const app = pixiAppRef.current;
    const currentBreak = videoPlayable.modifications[activeBreakIndex];

    // Clear previous sprites
    spritesRef.current.forEach((sprite) => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
    spritesRef.current = [];

    // Clear stage and add the video sprite first
    app.stage.removeChildren();
    app.stage.addChild(videoSpriteRef.current);

    if (currentBreak) {
      // Add breakpoint background (with a higher zIndex than end screen overlays)
      if (currentBreak.background) {
        const background = new PIXI.Graphics();
        background.beginFill(
          parseInt(currentBreak.backgroundColor.replace("#", "0x")),
          currentBreak.transparency ?? 0.7
        );
        background.drawRect(0, 0, app.screen.width, app.screen.height);
        background.endFill();
        // Set breakpoint background zIndex (now updated to 5)
        background.zIndex = 5;
        app.stage.addChild(background);
        spritesRef.current.push(background);
      }

      // Add breakpoint sprites (with even higher zIndex)
      currentBreak.sprites.forEach((spriteData) => {
        if (!spriteData.file) return;

        const sprite = PIXI.Sprite.from(spriteData.imageUrl);
        sprite.__spriteId = spriteData.id;

        sprite.position.set(
          spriteData.position.x * app.screen.width,
          spriteData.position.y * app.screen.height
        );
        sprite.scale.set(spriteData.scale);
        sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
        sprite.rotation = spriteData.rotation * (Math.PI / 180);
        sprite.alpha = spriteData.transparency;

        // Make sprite interactive
        sprite.eventMode = "static";
        sprite.cursor = "pointer";

        // Set breakpoint sprite zIndex (now updated to 6)
        sprite.zIndex = 6;

        sprite.on("pointerdown", () => {
          clearBreakContent();
          if (
            currentBreak.stopOnVideoResume &&
            currentBreak.backgroundMusic?.file &&
            audioElementsRef.current[currentBreak.id]
          ) {
            stopModificationAudio(audioElementsRef.current[currentBreak.id]);
            delete audioElementsRef.current[currentBreak.id];
          }
          const videoElement =
            videoSpriteRef.current.texture.baseTexture.resource.source;
          videoElement
            .play()
            .then(() => {
              setIsPlaying(true);
              setActiveBreakIndex(-1);
            })
            .catch((error) => {
              console.error("Error resuming video:", error);
            });
        });

        app.stage.addChild(sprite);
        spritesRef.current.push(sprite);
      });

      // Ensure the video sprite is at the bottom
      videoSpriteRef.current.zIndex = 0;
      app.stage.removeChild(videoSpriteRef.current);
      app.stage.addChildAt(videoSpriteRef.current, 0);
    }
    // Sort the children so that the assigned zIndex values take effect
    app.stage.sortChildren();

    return () => {
      spritesRef.current.forEach((sprite) => {
        if (sprite && sprite.destroy) {
          sprite.destroy();
        }
      });
      spritesRef.current = [];
    };
  }, [activeBreakIndex, videoPlayable.modifications]);

  useEffect(() => {
    if (!videoSpriteRef.current || !isPreviewMode || !isPlaying) return;

    const videoElement = videoSpriteRef.current.texture.baseTexture.resource.source;
    let animationFrameId;

    const checkForBreaks = () => {
      const currentTimeMs = Math.floor(videoElement.currentTime * 1000);

      // Only consider modifications that are of type BREAK.
      const breakIndex = videoPlayable.modifications.findIndex((mod) => {
        if (mod.type !== ModificationType.BREAK) return false;
        const timeDiff = Math.abs(mod.time - currentTimeMs);
        return timeDiff < 50 && currentTimeMs >= mod.time;
      });

      if (breakIndex !== -1 && breakIndex !== activeBreakIndex) {
        // A break (not an overlay) has been reached.
        videoElement.pause();
        setIsPlaying(false);
        const currentBreak = videoPlayable.modifications[breakIndex];

        // Render break background if enabled.
        if (currentBreak.background) {
          const app = pixiAppRef.current;
          const background = new PIXI.Graphics();
          background.beginFill(
            parseInt(currentBreak.backgroundColor.replace("#", "0x")),
            currentBreak.transparency ?? 0.7
          );
          background.drawRect(0, 0, app.screen.width, app.screen.height);
          background.endFill();
          app.stage.addChild(background);
          spritesRef.current.push(background);
        }

        // Start playing break background music if available and not already playing.
        if (currentBreak.backgroundMusic?.file && !audioElementsRef.current[currentBreak.id]) {
          setTimeout(() => {
          const audio = playModificationAudio(currentBreak);
          if (audio) {
              audioElementsRef.current[currentBreak.id] = audio;
            }
          }, 100);
        }

        // Render break sprites.
        currentBreak.sprites.forEach((spriteData) => {
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

          // Make the sprite interactive: on pointerdown resume video.
          sprite.eventMode = "static";
          sprite.cursor = "pointer";
          sprite.on("pointerdown", () => {
            clearBreakContent();
            // Only stop audio if stopOnVideoResume is true and audio is playing.
            if (
              currentBreak.stopOnVideoResume &&
              currentBreak.backgroundMusic?.file &&
              audioElementsRef.current[currentBreak.id]
            ) {
              stopModificationAudio(audioElementsRef.current[currentBreak.id]);
              delete audioElementsRef.current[currentBreak.id];
            }
            const videoElement =
              videoSpriteRef.current.texture.baseTexture.resource.source;
            videoElement
              .play()
              .then(() => {
                setIsPlaying(true);
                setActiveBreakIndex(-1);
              })
              .catch((error) => {
                console.error("Error resuming video:", error);
              });
          });

          app.stage.addChild(sprite);
          spritesRef.current.push(sprite);
        });

        // Ensure the video sprite remains at the bottom.
        const app = pixiAppRef.current;
        app.stage.removeChild(videoSpriteRef.current);
        app.stage.addChildAt(videoSpriteRef.current, 0);

        setActiveBreakIndex(breakIndex);
      }
      animationFrameId = requestAnimationFrame(checkForBreaks);
    };

    animationFrameId = requestAnimationFrame(checkForBreaks);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isPreviewMode,
    isPlaying,
    videoPlayable.modifications,
    activeBreakIndex,
    clearBreakContent,
    stopBreakAudio,
  ]);

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

  useEffect(() => {
    Object.entries(spritesRef?.current?.breaks || {}).forEach(
      ([breakId, sprites]) => {
        Object.values(sprites).forEach((sprite) => {
          sprite.visible = parseInt(breakId) === activeBreakIndex;
        });
      }
    );
  }, [activeBreakIndex]);

  useEffect(() => {
    if (pixiAppRef.current && videoSpriteRef.current) {
      pixiAppRef.current.stage.removeChild(videoSpriteRef.current);
      pixiAppRef.current.stage.addChildAt(videoSpriteRef.current, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      Object.values(spritesRef.current).forEach((typeContainer) => {
        Object.values(typeContainer).forEach((parentContainer) => {
          Object.values(parentContainer).forEach((sprite) => {
            sprite.destroy();
          });
        });
      });
      spritesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!videoSpriteRef.current) return;

    const videoElement =
      videoSpriteRef.current.texture.baseTexture.resource.source;

    const handleVideoEnd = () => {
      setIsPlaying(false);
      setIsPreviewMode(false);
      stopBreakAudio();
      clearBreakContent();
      setActiveBreakIndex(-1);
    };

    videoElement.addEventListener("ended", handleVideoEnd);

    return () => {
      videoElement.removeEventListener("ended", handleVideoEnd);
    };
  }, [stopBreakAudio, clearBreakContent]);

  useEffect(() => {
    if (!isPreviewMode) return;
    const activeModIds = new Set();
    videoPlayable.modifications.forEach((mod) => {
      if (
        mod.type === ModificationType.OVERLAY &&
        currentTime >= mod.startTime &&
        currentTime <= mod.endTime
      ) {
        activeModIds.add(mod.id);
      }
      if (mod.type === ModificationType.END_SCREEN && currentTime > mod.time && mod.time <= duration) {
        activeModIds.add(mod.id);
      }
    });
    Object.keys(audioElementsRef.current).forEach((modId) => {
      if (!activeModIds.has(Number(modId))) {
        stopModificationAudio(audioElementsRef.current[modId]);
        delete audioElementsRef.current[modId];
      }
    });
  }, [currentTime, isPreviewMode, videoPlayable.modifications]);

  useEffect(() => {
    if (!isPreviewMode) {
      // Stop all active modification audios when preview is off.
      Object.keys(audioElementsRef.current).forEach((modId) => {
        stopModificationAudio(audioElementsRef.current[modId]);
      });
      // Clear the audio elements reference.
      audioElementsRef.current = {};
    }
  }, [isPreviewMode]);

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
    <div className="flex space-x-4 mb-6 overflow-x-auto bg-[#252627] py-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center">
          <button
            className={`px-2 py-2 rounded bg-transparent ${
              activeTab.id === tab.id ? "text-white" : "text-[#b5b5b5] hover:text-white"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </button>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab.id);
    if (!activeTabData) return null;

    switch (activeTabData.type) {
      case "general":
        return (
          <div className="space-y-4 p-4">
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
                {videoSource && <span className="text-sm text-white">Video uploaded</span>}
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
          <ModificationControls
            activeTab={activeTabData}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
            handleRemoveTab={handleRemoveTab}
          />
        );
      case "overlay":
        return (
          <ModificationControls
            activeTab={activeTab}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
            handleRemoveTab={handleRemoveTab}
          />
        );
      case "end_screen":
        return (
          <ModificationControls
            activeTab={activeTab}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
            handleRemoveTab={handleRemoveTab}
          />
        );
      default:
        return null;
    }
  };

  const renderModificationIndicators = () => {
    return videoPlayable.modifications.map((modification, index) => {
      const isActive = index === activeBreakIndex;

      // Base triangle indicator style
      const baseIndicatorStyle = {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: '12px solid',
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        zIndex: 2
      };

      // Calculate position based on modification type
      const position = modification.type === ModificationType.OVERLAY 
        ? modification.startTime 
        : modification.time;

      const style = {
        ...baseIndicatorStyle,
        borderBottomColor: isActive ? '#8B5CF6' : '#4B5563',
        left: `${(position / duration) * 100}%`,
      };

      // Add duration bar for overlay type
      if (modification.type === ModificationType.OVERLAY) {
        const durationBar = {
          position: 'absolute',
          height: '2px',
          backgroundColor: '#4B5563',
          left: `${(modification.startTime / duration) * 100}%`,
          width: `${((modification.endTime - modification.startTime) / duration) * 100}%`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        };

        return (
          <div key={modification.id}>
            <div style={style} onClick={() => handleModificationClick(index, modification)} />
            <div style={durationBar} />
          </div>
        );
      }

      return (
        <div
          key={modification.id}
          style={style}
          onClick={() => handleModificationClick(index, modification)}
        />
      );
    });
  };

  // Update the timeline click handler
  const handleTimelineClick = useCallback(
    (e) => {
      if (!e.altKey || !videoRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const clickTime = Math.round(clickPosition * duration);

      addBreak(clickTime);
    },
    [duration, addBreak]
  );

  const handleModificationClick = (index, modification) => {
    const newTab = {
      id: `modification-${modification.id}`,
      type: modification.type,
      modificationIndex: index,
      time: modification.type === ModificationType.OVERLAY 
        ? modification.startTime 
        : modification.time,
    };
    setActiveTab(newTab);
    if (modification.type === ModificationType.BREAK) {
      setActiveBreakIndex(index);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Find the corresponding modification
    const modification = videoPlayable.modifications[tab.modificationIndex];
    
    // Set the time based on modification type
    const time = modification.type === ModificationType.OVERLAY 
      ? modification.startTime 
      : modification.time;
    
    // Update timeline position
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time / 1000;
    }

    // If switching to a break modification, set its index
    // If switching to any other type, clear the break index
    if (modification.type === ModificationType.BREAK) {
      setActiveBreakIndex(tab.modificationIndex);
    } else {
      setActiveBreakIndex(-1);
      clearBreakContent();
    }
  };

  const renderSprite = (spriteData, modification) => {
    if (!pixiAppRef.current) return;
    const app = pixiAppRef.current;
    const sprite = PIXI.Sprite.from(spriteData.imageUrl);

    // Tag the sprite with its ID for later lookup.
    sprite.__spriteId = spriteData.id;

    sprite.position.set(
      spriteData.position.x * app.screen.width,
      spriteData.position.y * app.screen.height
    );
    sprite.scale.set(spriteData.scale);
    sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
    sprite.rotation = spriteData.rotation * (Math.PI / 180);
    sprite.alpha = spriteData.transparency;

    // Assign zIndex based on modification type:
    // Permanent overlay sprite → zIndex = 2  
    // End screen sprite → zIndex = 4
    if (modification) {
      sprite.__isOverlay = true;
      sprite.zIndex = modification.type === ModificationType.END_SCREEN ? 4 : 2;
    }

    app.stage.addChild(sprite);
    spritesRef.current.push(sprite);
  };

  useEffect(() => {
    clearOverlayContent();
    if (!pixiAppRef.current) return;

    let modificationsToRender = [];

    // If we're in edit mode but the user is dragging the timeline, override activeTab and show nothing.
    if (!isPreviewMode && isTimelineDragging) {
      modificationsToRender = [];
    }
    // In preview mode, render based on timeline time.
    else if (isPreviewMode) {
      const permanentOverlayMods = videoPlayable.modifications.filter((mod) => {
        return (
          mod.type === ModificationType.OVERLAY &&
          currentTime >= mod.startTime &&
          currentTime <= mod.endTime
        );
      });
      const endScreenMods = videoPlayable.modifications.filter((mod) => {
        return mod.type === ModificationType.END_SCREEN && currentTime >= mod.time;
      });
      modificationsToRender = [...permanentOverlayMods, ...endScreenMods];
    }
    // In edit mode, if the user explicitly activated a module via the tab (or indicator),
    // show that one modification.
    else if (
      activeTab &&
      (activeTab.type === ModificationType.OVERLAY ||
        activeTab.type === ModificationType.END_SCREEN)
    ) {
      modificationsToRender = [videoPlayable.modifications[activeTab.modificationIndex]];
    }

    // Render each modification in the list.
    modificationsToRender.forEach((mod) => {
      // Handle audio as before.
      if (isPreviewMode && mod.backgroundMusic?.file && !audioElementsRef.current[mod.id]) {
        const audio = playModificationAudio(mod);
        if (audio) {
          audioElementsRef.current[mod.id] = audio;
        }
      }
      // Render background (keep zIndex and other settings intact).
      if (mod.background) {
        const background = new PIXI.Graphics();
        background.beginFill(
          parseInt(mod.backgroundColor.replace("#", "0x")),
          mod.transparency ?? 0.7
        );
        background.drawRect(
          0,
          0,
          pixiAppRef.current.screen.width,
          pixiAppRef.current.screen.height
        );
        background.endFill();
        background.__isOverlay = true;
        // Permanent overlay background → zIndex 1, End screen → zIndex 3.
        background.zIndex = mod.type === ModificationType.END_SCREEN ? 3 : 1;
        pixiAppRef.current.stage.addChild(background);
        spritesRef.current.push(background);
      }
      // Render sprites (preserving zIndex, animations, etc.)
      mod.sprites.forEach((spriteData) => renderSprite(spriteData, mod));
    });
    pixiAppRef.current.stage.sortChildren();
  }, [
    isPreviewMode,
    isTimelineDragging,
    activeTab,
    currentTime,
    videoPlayable.modifications,
    duration,
    clearOverlayContent,
  ]);

  // Add this new effect after your other useEffects
  useEffect(() => {
    if (!pixiAppRef.current) return;
    const app = pixiAppRef.current;
    const startTime = Date.now();

    const animationTicker = (delta) => {
      // Get active modifications based on type and state
      const activeModifications = videoPlayable.modifications.filter(mod => {
        switch (mod.type) {
          case ModificationType.BREAK:
            return activeBreakIndex !== -1;
          case ModificationType.OVERLAY:
            // Show overlay if it has any enabled animations
            return mod.sprites.some(sprite => 
              sprite.animation?.position?.enabled || 
              sprite.animation?.scale?.enabled || 
              sprite.animation?.transparency?.enabled
            );
          case ModificationType.END_SCREEN:
            // Show end screen if it has any enabled animations
            return mod.sprites.some(sprite => 
              sprite.animation?.position?.enabled || 
              sprite.animation?.scale?.enabled || 
              sprite.animation?.transparency?.enabled
            );
          default:
            return false;
        }
      });

      // Process animations for active modifications
      activeModifications.forEach(modification => {
        modification.sprites.forEach(spriteData => {
          const sprite = app.stage.children.find(child => child.__spriteId === spriteData.id);
          if (!sprite) return;

          sprite.visible = true;

          // Handle animations if they are enabled, regardless of time
          if (spriteData.animation?.position?.enabled) {
            const anim = spriteData.animation.position;
            handleAnimation(sprite, spriteData, 'position', anim);
          }

          if (spriteData.animation?.scale?.enabled) {
            const anim = spriteData.animation.scale;
            handleAnimation(sprite, spriteData, 'scale', anim);
          }

          if (spriteData.animation?.transparency?.enabled) {
            const anim = spriteData.animation.transparency;
            handleAnimation(sprite, spriteData, 'transparency', anim);
          }
        });
      });
    };

    // Helper function to handle different types of animations
    const handleAnimation = (sprite, spriteData, type, anim) => {
      const currentTime = Date.now();
      const progress = (currentTime % anim.duration) / anim.duration;
      let easedProgress = anim.easing !== 'linear' ? 
        getEasedProgress(progress, anim.easing) : progress;

      if (anim.yoyo) {
        const cycle = Math.floor((currentTime % (anim.duration * 2)) / anim.duration);
        if (cycle === 1) easedProgress = 1 - easedProgress;
      }

      switch (type) {
        case 'position':
          const startX = spriteData.position.x * app.screen.width;
          const startY = spriteData.position.y * app.screen.height;
          const endX = (anim.destination?.x || spriteData.position.x) * app.screen.width;
          const endY = (anim.destination?.y || spriteData.position.y) * app.screen.height;
          sprite.position.x = startX + (endX - startX) * easedProgress;
          sprite.position.y = startY + (endY - startY) * easedProgress;
          break;

        case 'scale':
          const startScale = spriteData.scale;
          sprite.scale.x = startScale + (anim.destination.w - startScale) * easedProgress;
          sprite.scale.y = startScale + (anim.destination.h - startScale) * easedProgress;
          break;

        case 'transparency':
          const startAlpha = spriteData.transparency;
          sprite.alpha = startAlpha + (anim.destination - startAlpha) * easedProgress;
          break;
      }
    };

    app.ticker.add(animationTicker);
    return () => app.ticker.remove(animationTicker);
  }, [activeBreakIndex, videoPlayable.modifications]);

  const renderBuildButton = () => (
    <button
      onClick={() => {
        console.log('VideoPlayable state:', videoPlayable); // Add this debug log
        buildPlayableAd(videoPlayable);
      }}
      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
      disabled={!videoSource}
    >
      <Download className="w-4 h-4" />
      Build Playable Ad
    </button>
  );
  
  const handleRemoveTab = (tabToRemove) => {
    setVideoPlayable(prev => {
      const newModifications = prev.modifications.filter((_, index) => 
        index !== tabToRemove.modificationIndex
      );
      
      setTabs(prevTabs => 
        prevTabs
          .filter(tab => tab.id !== tabToRemove.id)
          .map(tab => {
            if (tab.modificationIndex > tabToRemove.modificationIndex) {
              return {
                ...tab,
                modificationIndex: tab.modificationIndex - 1
              };
            }
            return tab;
          })
      );

      if (activeTab.id === tabToRemove.id) {
        const generalTab = tabs.find(tab => tab.type === 'general');
        setActiveTab(generalTab);
      }

      return {
        ...prev,
        modifications: newModifications
      };
    });
  };

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
        className={`h-full bg-black overflow-hidden ${
          isPreviewMode ? "pointer-events-none opacity-50 bg-gray-300" : ""
        }`}
      >
        {renderTabs()}
        {renderBuildButton()}
        {renderTabContent()}
      </div>

      <div
        className={`group absolute h-full flex items-center cursor-ew-resize z-50 ${
          isPreviewMode ? "pointer-events-none opacity-50" : ""
        }`}
        style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
        onMouseDown={!isPreviewMode ? handleMouseDown : undefined}
      >
        <div className="absolute w-4 h-full" />
        <div className="w-[1px] bg-primary/10 h-full" />
        <span className="absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-lg border border-primary/20 px-[0.5px] py-[2px]">
          <GripVertical size={12} strokeWidth={2} color="white" />
        </span>
      </div>

      <div style={{ width: `${100 - splitPosition}%` }} className="h-full relative bg-gray-900">
        {!videoSource ? (
          // Show upload prompt when no video is selected
          <div className="flex flex-col items-center justify-center h-full text-white">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center cursor-pointer p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors"
            >
              <Upload className="w-12 h-12 mb-4" />
              <span className="text-lg">Upload Video</span>
              <span className="text-sm text-gray-400 mt-2">Drag and drop or click to select</span>
            </label>
          </div>
        ) : (
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
                  isPreviewMode && activeBreakIndex !== -1 ? "opacity-50" : ""
                }`}
                disabled={isPreviewMode && activeBreakIndex !== -1}
                title="preview"
              >
                {isPlaying || (isPreviewMode && activeBreakIndex !== -1) ? (
                  <Square />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>

              <div
                ref={timelineRef}
                style={timelineStyle}
                className="relative cursor-pointer"
                onMouseDown={handleTimelineMouseDown}
                onClick={handleTimelineClick}
              >
                <div
                  style={{
                    ...timelineProgressStyle,
                    width: `${(currentTime / duration) * 100}%`,
                  }}
                />
                {renderModificationIndicators()}
                <div
                  style={{
                    ...timelineHandleStyle,
                    left: `${(currentTime / duration) * 100}%`,
                  }}
                />
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
