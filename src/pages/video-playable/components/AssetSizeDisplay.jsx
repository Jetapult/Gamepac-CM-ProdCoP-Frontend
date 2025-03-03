import { useState, useEffect } from "react";
import { calculateTotalSize, compressAllAssets, formatBytes } from "../utils";
import { ArrowDownIcon, XMarkIcon } from "@heroicons/react/20/solid";

const AssetSizeDisplay = ({
  videoPlayable,
  setToastMessage,
  setVideoPlayable,
}) => {
  const [sizeInfo, setSizeInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCompressAssets, setShowCompressAssets] = useState(false);

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
        onClick={() => setShowCompressAssets(true)}
        className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Compress assets
      </button>
      {showCompressAssets && (
        <CompressAssetsPopup
          showCompressAssets={showCompressAssets}
          setShowCompressAssets={setShowCompressAssets}
          videoPlayable={videoPlayable}
          setToastMessage={setToastMessage}
          setVideoPlayable={setVideoPlayable}
        />
      )}
    </div>
  );
};

const CompressAssetsPopup = ({
  showCompressAssets,
  setShowCompressAssets,
  videoPlayable,
  setToastMessage,
  setVideoPlayable,
}) => {
  const [selectedAssets, setSelectedAssets] = useState({});
  const [sizeInfo, setSizeInfo] = useState(null);
  const [selectionType, setSelectionType] = useState("all"); // "all", "images", "audios"
  const [compressedAssets, setCompressedAssets] = useState({});
  const [isCompressed, setIsCompressed] = useState(false);
  const [compressedSizeInfo, setCompressedSizeInfo] = useState(null);

  useEffect(() => {
    // Calculate size whenever videoPlayable changes
    calculateTotalSize(videoPlayable).then((sizeInfo) => {
      setSizeInfo(sizeInfo);

      // Initialize all assets as selected
      const initialSelection = {};

      // Add images to selection
      sizeInfo.assets?.images.forEach((image) => {
        initialSelection[image.id] = true;
      });

      // Add audio to selection
      sizeInfo.assets?.audio.forEach((audio) => {
        initialSelection[audio.id] = true;
      });

      setSelectedAssets(initialSelection);
    });
  }, [videoPlayable]);

  const handleSelectAll = () => {
    const newSelection = {};
    sizeInfo.assets?.images.forEach((image) => {
      if (image.file_type === "image/gif") return;
      newSelection[image.id] = true;
    });
    sizeInfo.assets?.audio.forEach((audio) => {
      newSelection[audio.id] = true;
    });
    setSelectedAssets(newSelection);
    setSelectionType("all");
  };

  const handleSelectOnlyImages = () => {
    const newSelection = {};
    sizeInfo.assets?.images.forEach((image) => {
      newSelection[image.id] = true;
    });
    sizeInfo.assets?.audio.forEach((audio) => {
      newSelection[audio.id] = false;
    });
    setSelectedAssets(newSelection);
    setSelectionType("images");
  };

  const handleSelectOnlyAudios = () => {
    const newSelection = {};
    sizeInfo.assets?.images.forEach((image) => {
      newSelection[image.id] = false;
    });
    sizeInfo.assets?.audio.forEach((audio) => {
      newSelection[audio.id] = true;
    });
    setSelectedAssets(newSelection);
    setSelectionType("audios");
  };

  const handleAssetToggle = (image) => {
    if (image.file_type === "image/gif") return;
    setSelectedAssets((prev) => ({
      ...prev,
      [image.id]: !prev[image.id],
    }));
  };

  const handleCompress = async () => {
    // Filter only selected assets
    const assetsToCompress = {
      images:
        sizeInfo.assets?.images.filter((img) => selectedAssets[img.id]) || [],
      audio:
        sizeInfo.assets?.audio.filter((audio) => selectedAssets[audio.id]) ||
        [],
    };

    try {
      setToastMessage({
        show: true,
        message: "Compressing assets...",
        type: "info",
      });

      const compressedPlayable = await compressAllAssets(
        videoPlayable,
        assetsToCompress
      );

      // Extract compression stats from the result
      const newCompressedAssets = {};

      // Process all modifications to find compression stats
      compressedPlayable.modifications.forEach((mod) => {
        if (mod.sprites) {
          mod.sprites.forEach((sprite) => {
            if (sprite.compressionStats) {
                console.log(sprite.compressionStats,'sprite.compressionStats')
              newCompressedAssets[sprite.id] = {
                originalSize: sprite.compressionStats.originalSize,
                compressedSize: sprite.compressionStats.compressedSize,
                reductionPercentage:
                  sprite.compressionStats.reductionPercentage,
              };
            }
          });
        }
      });

      // Update state with compression results
      setCompressedAssets(newCompressedAssets);
      setVideoPlayable(compressedPlayable);
      setIsCompressed(true);

      // Calculate new total size after compression
      calculateTotalSize(compressedPlayable).then((newSizeInfo) => {
        setCompressedSizeInfo(newSizeInfo);
      });

      setToastMessage({
        show: true,
        message: "Assets compressed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error compressing assets:", error);
      setToastMessage({
        show: true,
        message: "Failed to compress assets. Please try again.",
        type: "error",
      });
    }
  };

  // Calculate total size reduction
  const calculateSizeReduction = () => {
    if (!sizeInfo || !compressedSizeInfo) return { bytes: 0, percentage: 0 };

    const originalSize = sizeInfo.total;
    const compressedSize = compressedSizeInfo.total;
    const reduction = originalSize - compressedSize;
    const percentage = Math.round((reduction / originalSize) * 100);

    return { bytes: reduction, percentage };
  };

  if (!sizeInfo) return null;

  const sizeReduction = calculateSizeReduction();

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold whitespace-pre-line">
              COMPRESS ASSETS
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowCompressAssets(false)}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <p className="mb-4">
              Compress image and audio assets, to reach the Ad Networks
              requirements for Playable Ad package size.
            </p>

            {/* Selection buttons */}
            <div className="flex gap-4 mb-4">
              <button
                className={`px-3 py-1 rounded ${
                  selectionType === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={handleSelectAll}
              >
                Select all
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectionType === "images"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={handleSelectOnlyImages}
              >
                Select only images
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectionType === "audios"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={handleSelectOnlyAudios}
              >
                Select only audios
              </button>
            </div>

            {/* Asset list */}
            <div className="max-h-[300px] overflow-y-auto">
              {/* Audio files */}
              {sizeInfo.assets?.audio.map((audio) => (
                <div
                  key={audio.id}
                  className="flex items-center justify-between px-1 border border-gray-200 mb-1 rounded"
                >
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={selectedAssets[audio.id] || false}
                      onChange={() => handleAssetToggle(audio.id)}
                      className="mr-2"
                    />
                    <span className="flex items-center text-sm">
                      <span className="text-purple-600 mr-2 w-8 text-center text-xs">
                        ♫
                      </span>
                      {audio.name}
                    </span>
                  </div>
                  <span className="font-medium text-xs">
                    {formatBytes(audio.size)}
                  </span>
                </div>
              ))}

              {/* Image files */}
              {sizeInfo.assets?.images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center justify-between px-1 border border-gray-200 mb-1 rounded"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAssets[image.id] || false}
                      onChange={() => handleAssetToggle(image)}
                      className="mr-2"
                      disabled={image.file_type === "image/gif"}
                    />
                    <span className="flex items-center text-sm">
                      {image.imageUrl ? (
                        <img
                          src={image.imageUrl}
                          alt={image.name}
                          className="w-8 h-6 object-contain rounded mr-2"
                        />
                      ) : (
                        <span className="text-blue-500 mr-2">🖼️</span>
                      )}
                      {image.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-xs">
                      {formatBytes(
                        compressedAssets[image.id]?.compressedSize || image.size
                      )}
                    </span>

                    {compressedAssets[image.id] && (
                      <span className="text-[#22bb33] ml-2 flex items-center text-xs font-bolder">
                        <ArrowDownIcon className="w-4 h-4 text-[#22bb33] mr-1 text-md" />
                        -{compressedAssets[image.id].reductionPercentage}%
                      </span>
                    )}

                    {image.file_type === "image/gif" && (
                      <span className="ml-2 text-gray-500 text-xs">
                        Cannot optimize
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Note: Image compression only affects the image quality, not its
                dimensions. The quality is set to 60, which is typically
                unnoticeable to the human eye but significantly reduces the
                image file size.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Note: MP3 audio files will be compressed to a 64kbps bitrate.
                WAV files will be converted to MP3 format with the same 64kbps
                bitrate.
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">ESTIMATED SIZE</span>
                  <span className="text-gray-600 text-lg">
                    {formatBytes(sizeInfo.total)}
                  </span>
                  {isCompressed && compressedSizeInfo && (
                    <span className="text-[#22bb33] ml-2 flex items-center text-sm font-bold">
                      <ArrowDownIcon className="w-4 h-4 text-[#22bb33] mr-1" />-
                      {sizeReduction.percentage}% 
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 border-t border-solid border-blueGray-200 p-4">
            <button
              className="bg-[#f3f3f3] text-[#000] px-4 py-2 rounded-md"
              onClick={() => setShowCompressAssets(false)}
            >
              Cancel
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              onClick={handleCompress}
            >
              Compress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetSizeDisplay;
