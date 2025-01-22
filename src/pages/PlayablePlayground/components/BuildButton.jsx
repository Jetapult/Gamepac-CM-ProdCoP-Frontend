import React from "react";
import { generatePlayableBuild } from "../../../utils/playableBuild";

const BuildButton = ({ scenes, savedState }) => {
  const hasContent = scenes?.some(
    (scene) =>
      (scene.placedSprites && scene.placedSprites.length > 0) ||
      (scene.texts && scene.texts.length > 0)
  );

  if (!hasContent) return null;

  const handleBuild = async () => {
    try {
      await generatePlayableBuild(scenes, savedState);
    } catch (error) {
      console.error("Build generation error:", error);
    }
  };

  return (
    <button
      onClick={handleBuild}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Generate Playable Build
    </button>
  );
};

export default BuildButton;
