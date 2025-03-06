import React from 'react';
import { generatePhaserApp } from '../../../utils/playable';

const CopyCodeButton = ({ scenes, savedState }) => {
  const handleCopyCode = async () => {
    try {
      await generatePhaserApp(scenes, savedState);
      console.log("Phaser app generated successfully");
    } catch (error) {
      console.error("Failed to generate Phaser app:", error);
    }
  };

  return (
    <button
      onClick={handleCopyCode}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
    >
      Download Phaser App
    </button>
  );
};

export default CopyCodeButton;
