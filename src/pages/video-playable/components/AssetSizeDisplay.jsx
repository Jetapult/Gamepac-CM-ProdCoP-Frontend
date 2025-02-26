import { useState, useEffect } from "react";
import { calculateTotalSize, formatBytes } from "../utils";

const AssetSizeDisplay = ({ videoPlayable, onCompressAssets }) => {
  const [sizeInfo, setSizeInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Calculate size whenever videoPlayable changes
    calculateTotalSize(videoPlayable).then((sizeInfo) => {
      console.log(`Total size:`, sizeInfo);
      setSizeInfo(sizeInfo);
    });
  }, [videoPlayable]);

  if (!sizeInfo) return null;

  // Calculate percentages for the progress bar
  const libraryPercentage = Math.round(
    (sizeInfo.library / sizeInfo.total) * 100
  );
  const videoPercentage = Math.round((sizeInfo.video / sizeInfo.total) * 100);
  const assetsPercentage = 100 - libraryPercentage - videoPercentage;

  return (
    <div className="mt-6 mb-4 bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-white text-lg font-semibold">ESTIMATED SIZE</h3>
          <button
            className="ml-2 text-gray-400 hover:text-white"
            onClick={() => setShowDetails(!showDetails)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
        <span className="text-white text-xl font-bold">
          {formatBytes(sizeInfo.total)}
        </span>
      </div>

      {/* Main categories */}
      <div className="flex flex-col mt-2 text-xs">
        <div className="flex justify-between">
          <span className="text-pink-500">Library</span>
          <span className="text-gray-400">{formatBytes(sizeInfo.library)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-500">Video</span>
          <span className="text-gray-400">{formatBytes(sizeInfo.video)}</span>
        </div>

        {/* Individual assets */}
        {sizeInfo.assets?.images.map((image) => (
          <div key={image.id} className="flex justify-between">
            <span className="text-yellow-400">{image.name}</span>
            <span className="text-gray-400">{formatBytes(image.size)}</span>
          </div>
        ))}

        {sizeInfo.assets?.audio.map((audio) => (
          <div key={audio.id} className="flex justify-between">
            <span className="text-yellow-400">{audio.name}</span>
            <span className="text-gray-400">{formatBytes(audio.size)}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 flex rounded-full overflow-hidden mt-4">
        <div
          className="bg-pink-500"
          style={{ width: `${libraryPercentage}%` }}
        ></div>
        <div
          className="bg-green-500"
          style={{ width: `${videoPercentage}%` }}
        ></div>
        <div
          className="bg-yellow-500"
          style={{ width: `${assetsPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-pink-500 rounded-full mr-1"></div>
          <span className="text-pink-500">Library ({libraryPercentage}%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-green-500">Video ({videoPercentage}%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-yellow-500">Assets ({assetsPercentage}%)</span>
        </div>
      </div>

      {/* Compress button */}
      <button
        onClick={onCompressAssets}
        className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Compress assets
      </button>
    </div>
  );
};

export default AssetSizeDisplay;
