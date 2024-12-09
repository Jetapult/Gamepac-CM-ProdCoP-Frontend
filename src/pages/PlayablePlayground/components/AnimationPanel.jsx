import React, { useEffect, useRef, useState } from "react";
import PositionAnimationPanel from "./PositionAnimationPanel";
import ScaleAnimationPanel from "./ScaleAnimationPanel";
import VisibilityAnimationPanel from "./VisibilityAnimationPanel";
import SlideInAnimationPanel from "./SlideInAnimationPanel";
import FadeInAnimationPanel from "./FadeInAnimationPanel";

const AnimationPanel = ({ sprite, game, setPlacedSprites }) => {
  const [activePanel, setActivePanel] = useState("");

  const updateAnimation = (type, updates) => {
    setPlacedSprites((prev) =>
      prev.map((s) => {
        if (s.id === sprite.id) {
          return {
            ...s,
            animations: {
              ...s.animations,
              [type]: {
                ...s.animations[type],
                ...updates,
              },
            },
          };
        }
        return s;
      })
    );
  };

  // Track base properties with useRef
  const baseProps = useRef({
    x: sprite.x,
    y: sprite.y,
    scale: sprite.scale,
    rotation: sprite.rotation,
    alpha: sprite.alpha,
  });

  // Store active tweens reference
  const activeTweens = useRef([]);

  // Update base properties when sprite properties change
  useEffect(() => {
    baseProps.current = {
      x: sprite.x,
      y: sprite.y,
      scale: sprite.scale,
      rotation: sprite.rotation,
      alpha: sprite.alpha,
    };
  }, [sprite.x, sprite.y, sprite.scale, sprite.rotation, sprite.alpha]);

  // Handle animations
  useEffect(() => {
    if (!game?.playground || !sprite.phaserSprite) return;

    const scene = game.playground;
    const target = sprite.phaserSprite;

    // Stop all active tweens
    activeTweens.current.forEach((tween) => {
      if (tween.isPlaying) {
        tween.stop();
      }
    });
    activeTweens.current = [];

    // Function to start common animations
    const startCommonAnimations = () => {
      // Position Animation
      if (sprite.animations.position.isEnabled) {
        const positionTween = scene.tweens.add({
          targets: target,
          x: baseProps.current.x + sprite.animations.position.config.x * 100,
          y: baseProps.current.y + sprite.animations.position.config.y * 100,
          duration: sprite.animations.position.config.duration,
          repeat: sprite.animations.position.config.repeat,
          yoyo: sprite.animations.position.config.yoyo,
          ease: sprite.animations.position.config.ease,
          onComplete: () => {
            if (!sprite.animations.position.isEnabled) {
              target.setPosition(baseProps.current.x, baseProps.current.y);
            }
          },
        });
        activeTweens.current.push(positionTween);
      }

      // Scale Animation
      if (sprite.animations.scale.isEnabled) {
        const scaleTween = scene.tweens.add({
          targets: target,
          scaleX: sprite.animations.scale.config.scaleX,
          scaleY: sprite.animations.scale.config.scaleY,
          duration: sprite.animations.scale.config.duration,
          repeat: sprite.animations.scale.config.repeat,
          yoyo: sprite.animations.scale.config.yoyo,
          ease: sprite.animations.scale.config.ease,
          onComplete: () => {
            if (!sprite.animations.scale.isEnabled) {
              target.setScale(baseProps.current.scale);
            }
          },
        });
        activeTweens.current.push(scaleTween);
      }

      // Transparency Animation
      if (sprite.animations.transparency.isEnabled) {
        const alphaTween = scene.tweens.add({
          targets: target,
          alpha: sprite.animations.transparency.config.alpha,
          duration: sprite.animations.transparency.config.duration,
          repeat: sprite.animations.transparency.config.repeat,
          yoyo: sprite.animations.transparency.config.yoyo,
          ease: sprite.animations.transparency.config.ease,
          onComplete: () => {
            if (!sprite.animations.transparency.isEnabled) {
              target.setAlpha(baseProps.current.alpha);
            }
          },
        });
        activeTweens.current.push(alphaTween);
      }
    };

    // Handle Slide-in Animation first
    if (sprite.animations.slideIn.isEnabled) {
      const getInitialPosition = () => {
        const { direction, distance } = sprite.animations.slideIn.config;
        switch (direction) {
          case 'left':
            return { x: baseProps.current.x - distance, y: baseProps.current.y };
          case 'right':
            return { x: baseProps.current.x + distance, y: baseProps.current.y };
          case 'top':
            return { x: baseProps.current.x, y: baseProps.current.y - distance };
          case 'bottom':
            return { x: baseProps.current.x, y: baseProps.current.y + distance };
          default:
            return { x: baseProps.current.x, y: baseProps.current.y };
        }
      };

      const initialPos = getInitialPosition();
      target.setPosition(initialPos.x, initialPos.y);

      const slideInTween = scene.tweens.add({
        targets: target,
        x: baseProps.current.x,
        y: baseProps.current.y,
        duration: sprite.animations.slideIn.config.duration,
        ease: sprite.animations.slideIn.config.ease,
        delay: sprite.animations.slideIn.config.priority * 200,
        onComplete: startCommonAnimations // Start common animations after slide-in completes
      });

      activeTweens.current.push(slideInTween);
    } else {
      // If no slide-in animation, start common animations immediately
      startCommonAnimations();
    }

    // Handle Fade-in Animation
    if (sprite.animations.fadeIn.isEnabled) {
      // Set initial alpha
      target.setAlpha(0);

      const fadeInTween = scene.tweens.add({
        targets: target,
        alpha: 1,
        duration: sprite.animations.fadeIn.config.duration,
        ease: sprite.animations.fadeIn.config.ease,
        delay: sprite.animations.fadeIn.config.priority * 200,
        onComplete: startCommonAnimations // Start common animations after fade-in completes
      });

      activeTweens.current.push(fadeInTween);
    } else if (!sprite.animations.slideIn.isEnabled) {
      // Only start common animations if neither slide-in nor fade-in are enabled
      startCommonAnimations();
    }

    // Cleanup function
    return () => {
      activeTweens.current.forEach((tween) => {
        if (tween.isPlaying) {
          tween.stop();
        }
      });
      // Reset to base properties on cleanup
      target.setPosition(baseProps.current.x, baseProps.current.y);
      target.setScale(baseProps.current.scale);
      target.setAlpha(baseProps.current.alpha);
    };
  }, [
    sprite.animations,
    game,
    sprite.phaserSprite,
    sprite.x,
    sprite.y,
    sprite.scale,
    sprite.alpha,
  ]);

  return (
    <div className="mt-4 border-t border-[#444] pt-4">
      <div className="flex gap-2 mb-4">
        <button
          className={`p-2 border rounded ${
            activePanel === "move"
              ? "border-purple-500 bg-purple-500/20"
              : "border-[#444]"
          } ${sprite.animations.position.isEnabled ? "bg-purple-500/10" : ""}`}
          onClick={() =>
            setActivePanel((prev) => (prev === "move" ? "" : "move"))
          }
        >
          <span className="text-white">↔️</span>
        </button>
        <button
          className={`p-2 border rounded ${
            activePanel === "scale"
              ? "border-purple-500 bg-purple-500/20"
              : "border-[#444]"
          } ${sprite.animations.scale.isEnabled ? "bg-purple-500/10" : ""}`}
          onClick={() =>
            setActivePanel((prev) => (prev === "scale" ? "" : "scale"))
          }
        >
          <span className="text-white">⤢</span>
        </button>
        <button
          className={`p-2 border rounded ${
            activePanel === "visibility"
              ? "border-purple-500 bg-purple-500/20"
              : "border-[#444]"
          } ${
            sprite.animations.transparency.isEnabled ? "bg-purple-500/10" : ""
          }`}
          onClick={() =>
            setActivePanel((prev) =>
              prev === "visibility" ? "" : "visibility"
            )
          }
        >
          <span className="text-white">👁</span>
        </button>
        <button
          className={`p-2 border rounded ${
            activePanel === "slideIn"
              ? "border-purple-500 bg-purple-500/20"
              : "border-[#444]"
          } ${sprite.animations.slideIn.isEnabled ? "bg-purple-500/10" : ""}`}
          onClick={() =>
            setActivePanel((prev) => (prev === "slideIn" ? "" : "slideIn"))
          }
        >
          <span className="text-white">↳</span>
        </button>
        <button
          className={`p-2 border rounded ${
            activePanel === "fadeIn"
              ? "border-purple-500 bg-purple-500/20"
              : "border-[#444]"
          } ${sprite.animations.fadeIn.isEnabled ? "bg-purple-500/10" : ""}`}
          onClick={() =>
            setActivePanel((prev) => (prev === "fadeIn" ? "" : "fadeIn"))
          }
        >
          <span className="text-white">🌓</span>
        </button>
      </div>

      {activePanel === "move" && (
        <PositionAnimationPanel
          config={sprite.animations.position.config}
          isEnabled={sprite.animations.position.isEnabled}
          onToggle={() =>
            updateAnimation("position", {
              isEnabled: !sprite.animations.position.isEnabled,
            })
          }
          onChange={(newConfig) =>
            updateAnimation("position", {
              config: { ...sprite.animations.position.config, ...newConfig },
            })
          }
        />
      )}
      {activePanel === "scale" && (
        <ScaleAnimationPanel
          config={sprite.animations.scale.config}
          isEnabled={sprite.animations.scale.isEnabled}
          onToggle={() =>
            updateAnimation("scale", {
              isEnabled: !sprite.animations.scale.isEnabled,
            })
          }
          onChange={(newConfig) =>
            updateAnimation("scale", {
              config: { ...sprite.animations.scale.config, ...newConfig },
            })
          }
        />
      )}
      {activePanel === "visibility" && (
        <VisibilityAnimationPanel
          config={sprite.animations.transparency.config}
          isEnabled={sprite.animations.transparency.isEnabled}
          onToggle={() =>
            updateAnimation("transparency", {
              isEnabled: !sprite.animations.transparency.isEnabled,
            })
          }
          onChange={(newConfig) =>
            updateAnimation("transparency", {
              config: {
                ...sprite.animations.transparency.config,
                ...newConfig,
              },
            })
          }
        />
      )}
      {activePanel === "slideIn" && (
        <SlideInAnimationPanel
          config={sprite.animations.slideIn.config}
          isEnabled={sprite.animations.slideIn.isEnabled}
          onToggle={() =>
            updateAnimation("slideIn", {
              isEnabled: !sprite.animations.slideIn.isEnabled,
            })
          }
          onChange={(newConfig) =>
            updateAnimation("slideIn", {
              config: { ...sprite.animations.slideIn.config, ...newConfig },
            })
          }
        />
      )}
      {activePanel === "fadeIn" && (
        <FadeInAnimationPanel
          config={sprite.animations.fadeIn.config}
          isEnabled={sprite.animations.fadeIn.isEnabled}
          onToggle={() =>
            updateAnimation("fadeIn", {
              isEnabled: !sprite.animations.fadeIn.isEnabled,
            })
          }
          onChange={(newConfig) =>
            updateAnimation("fadeIn", {
              config: { ...sprite.animations.fadeIn.config, ...newConfig },
            })
          }
        />
      )}
    </div>
  );
};

export default AnimationPanel;
