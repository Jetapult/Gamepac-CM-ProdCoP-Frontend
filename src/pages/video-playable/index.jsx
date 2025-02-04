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
import ModificationControls from "./components/ModificationControls";
import { baseModificationState, initialState, ModificationType } from "./state";

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
    },
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

  const addTab = (type, time) => {
    let newTab;
    switch (type) {
      case "break":
        newTab = { ...initialBreakState, time };
        setVideoPlayable((prev) => ({
          ...prev,
          breaks: [...prev.breaks, newTab].sort((a, b) => a.time - b.time),
        }));
        break;
      case "overlay":
        newTab = { ...initialOverlayState, startTime: time };
        setVideoPlayable((prev) => ({
          ...prev,
          overlays: [...prev.overlays, newTab],
        }));
        break;
      default:
        break;
    }
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
      };
      setTabs((prevTabs) => [
        ...prevTabs,
        {
          id: newTabId,
          type: ModificationType.BREAK,
          modificationIndex,
          time: newBreak.time,
        },
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
    const time = Math.floor(currentTime);
    const newEndScreen = {
      ...baseModificationState,
      type: ModificationType.END_SCREEN,
      id: Date.now(),
      time: time, // This is when the end screen appears
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
      const modificationIndex = newModifications.findIndex(
        (m) => m.id === newEndScreen.id
      );
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

  const handleBreakAudio = useCallback(
    (currentBreak) => {
      if (!currentBreak.backgroundMusic?.file) return;

      // Stop any existing audio
      stopBreakAudio();

      // Create and play new audio
      const audio = new Audio(
        URL.createObjectURL(currentBreak.backgroundMusic.file)
      );
      audio.volume = currentBreak.backgroundMusic.volume;
      audio.loop = currentBreak.backgroundMusic.repeat > 1;
      setBreakAudioElement(audio);

      audio.play().catch((error) => {
        console.error("Error playing break audio:", error);
      });
    },
    [stopBreakAudio]
  );
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
      currentBreak.sprites.forEach((spriteData) => {
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

      // Ensure video sprite is at the bottom
      app.stage.removeChild(videoSpriteRef.current);
      app.stage.addChildAt(videoSpriteRef.current, 0);
    }

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
            0.7
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
    // When preview mode is turned off, clean up any active audio.
    if (!isPreviewMode) {
      Object.keys(audioElementsRef.current).forEach((modId) => {
        const audio = audioElementsRef.current[modId];
        if (audio) {
          stopModificationAudio(audio);
          delete audioElementsRef.current[modId];
        }
      });
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
    <div className="flex space-x-4 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            activeTab.id === tab.id ? "bg-gray-200" : ""
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.type === "break" ? `Break (${tab.time}ms)` : tab.label}
        </button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab.id);
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
          <ModificationControls
            activeTab={activeTabData}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
          />
        );
      case "overlay":
        return (
          <ModificationControls
            activeTab={activeTab}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
          />
        );
      case "end_screen":
        return (
          <ModificationControls
            activeTab={activeTab}
            videoPlayable={videoPlayable}
            setVideoPlayable={setVideoPlayable}
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
    
    // setActiveTab(newTab);
    // if (modification.type === ModificationType.BREAK) {
    //   setActiveBreakIndex(index);
    // }
  };

  const renderSprite = (spriteData, modification) => {
    if (!pixiAppRef.current) return;
    const app = pixiAppRef.current;
    const sprite = PIXI.Sprite.from(spriteData.imageUrl);

    sprite.position.set(
      spriteData.position.x * app.screen.width,
      spriteData.position.y * app.screen.height
    );
    sprite.scale.set(spriteData.scale);
    sprite.anchor.set(spriteData.anchor.x, spriteData.anchor.y);
    sprite.rotation = spriteData.rotation * (Math.PI / 180);
    sprite.alpha = spriteData.transparency;

    // If this sprite is being rendered as part of an overlay modification, tag it.
    if (modification && modification.type === ModificationType.OVERLAY) {
      sprite.__isOverlay = true;
    }

    app.stage.addChild(sprite);
    spritesRef.current.push(sprite);
  };

  useEffect(() => {
    // Render overlay and end-screen modifications over the video in preview or edit mode.
    if (
      isPreviewMode ||
      activeTab?.type === ModificationType.OVERLAY ||
      activeTab?.type === ModificationType.END_SCREEN
    ) {
      clearOverlayContent();
      if (pixiAppRef.current) {
        let modificationsToRender = [];
        if (isPreviewMode) {
          modificationsToRender = videoPlayable.modifications.filter((mod) => {
            if (mod.type === ModificationType.OVERLAY) {
              return currentTime >= mod.startTime && currentTime <= mod.endTime;
            }
            if (mod.type === ModificationType.END_SCREEN) {
              return currentTime >= mod.time;
            }
            return false;
          });
        } else {
          const mod = videoPlayable.modifications[activeTab.modificationIndex];
          if (mod) modificationsToRender = [mod];
        }
        modificationsToRender.forEach((mod) => {
          if (!mod) return;
          // Play background music if provided and not already playing.
          if (isPreviewMode && mod.backgroundMusic?.file && !audioElementsRef.current[mod.id]) {
            const audio = playModificationAudio(mod);
            if (audio) {
              audioElementsRef.current[mod.id] = audio;
            }
          }
          // Render background if enabled.
          if (mod.background) {
            const background = new PIXI.Graphics();
            background.beginFill(
              parseInt(mod.backgroundColor.replace("#", "0x")),
              0.7
            );
            background.drawRect(
              0,
              0,
              pixiAppRef.current.screen.width,
              pixiAppRef.current.screen.height
            );
            background.endFill();
            // Mark as an overlay component.
            background.__isOverlay = true;
            pixiAppRef.current.stage.addChild(background);
            spritesRef.current.push(background);
          }
          // Render each sprite for the modification.
          mod.sprites.forEach((spriteData) => {
            renderSprite(spriteData, mod);
          });
        });
      }
    }
  }, [isPreviewMode, videoPlayable.modifications, activeTab, currentTime]);

  useEffect(() => {
    if (!isPreviewMode) return;
    // Build a set of active modification IDs (from overlays in preview mode).
    const activeModIds = new Set();
    if (isPreviewMode) {
      videoPlayable.modifications.forEach((mod) => {
        if (mod.type === ModificationType.OVERLAY && currentTime >= mod.startTime && currentTime <= mod.endTime) {
          activeModIds.add(mod.id);
        }
      });
    }
    // For each audio element stored, if its mod is no longer active, stop its audio.
    Object.keys(audioElementsRef.current).forEach((modId) => {
      // modId comes in as a string; convert it if necessary.
      if (!activeModIds.has(Number(modId))) {
        stopModificationAudio(audioElementsRef.current[modId]);
        delete audioElementsRef.current[modId];
      }
    });
  }, [currentTime, isPreviewMode, videoPlayable.modifications]);

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
                  isPreviewMode && activeBreakIndex !== -1 ? "opacity-50" : ""
                }`}
                disabled={isPreviewMode && activeBreakIndex !== -1}
                title="preview"
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
