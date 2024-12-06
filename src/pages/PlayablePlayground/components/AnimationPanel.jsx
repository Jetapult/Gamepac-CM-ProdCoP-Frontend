import React, { useEffect, useRef, useState } from "react";
import PositionAnimationPanel from "./PositionAnimationPanel";
import ScaleAnimationPanel from "./ScaleAnimationPanel";
import VisibilityAnimationPanel from "./VisibilityAnimationPanel";

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
    } else {
      target.setPosition(baseProps.current.x, baseProps.current.y);
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
    } else {
      target.setScale(baseProps.current.scale);
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
    } else {
      target.setAlpha(baseProps.current.alpha);
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
    </div>
  );
};

export default AnimationPanel;
