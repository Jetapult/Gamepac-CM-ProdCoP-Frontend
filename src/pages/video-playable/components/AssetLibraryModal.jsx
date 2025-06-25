import React, { useState, useEffect, useRef } from "react";
import { X, Loader } from "lucide-react";
import api from "../../../api";

let assetsCache = null;

const AssetLibraryModal = ({ isOpen, onClose, onSelectAsset }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [error, setError] = useState("");
  const [loadingAsset, setLoadingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState("Asset Catalog");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Add ref for file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === "Asset Catalog") {
      if (assetsCache) {
        setAssets(assetsCache);
        setFilteredAssets(assetsCache);
      } else {
        fetchAssets();
      }
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    let filtered = assets;

    // Filter by category (placeholder logic - you may need to categorize your assets)
    if (activeCategory !== "ALL") {
      // For now, we'll just show all assets regardless of category
      // You can implement actual categorization based on asset metadata
      filtered = assets;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((asset) =>
        asset.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [searchTerm, assets, activeCategory]);

  const fetchAssets = async (forceRefresh = false) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/v1/assetGenerator/playable-assets");
      if (response.data?.data) {
        const assetData = response.data.data;
        setAssets(assetData);
        setFilteredAssets(assetData);
        assetsCache = assetData;
      } else {
        setAssets([]);
        setFilteredAssets([]);
        assetsCache = [];
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("Failed to load assets. Please try again.");
      setAssets([]);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetClick = (asset) => {
    if (loadingAsset) return;

    if (selectedAsset === asset) {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedAsset) return;

    try {
      setError("");
      setLoadingAsset(selectedAsset);

      const urlParts = selectedAsset.split("/");
      const filename = urlParts[urlParts.length - 1] || "asset.png";

      let dataUrl;

      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          selectedAsset
        )}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();

        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (corsError) {
        console.error("CORS proxy failed:", corsError);
        dataUrl = selectedAsset;
      }

      const mockFile = new Proxy(
        {
          name: filename,
          type: "image/png",
          size: 1024,
          lastModified: Date.now(),
          webkitRelativePath: "",
          arrayBuffer: () =>
            Promise.reject(new Error("Not available for library assets")),
          slice: () =>
            Promise.reject(new Error("Not available for library assets")),
          stream: () =>
            Promise.reject(new Error("Not available for library assets")),
          text: () =>
            Promise.reject(new Error("Not available for library assets")),
          __isLibraryAsset: true,
        },
        {
          get(target, prop) {
            if (prop in target) {
              return target[prop];
            }
            return undefined;
          },
        }
      );

      onSelectAsset(mockFile, dataUrl);
      onClose();
    } catch (err) {
      console.error("Error processing asset:", err);
      setError(
        err.message || "Failed to load selected asset. Please try again."
      );
    } finally {
      setLoadingAsset(null);
    }
  };

  const getAssetName = (asset) => {
    const urlParts = asset.split("/");
    const filename = urlParts[urlParts.length - 1] || "asset";
    return filename.replace(/\.[^/.]+$/, ""); // Remove extension
  };

  // Add file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Create object URL for immediate use
    const imageUrl = URL.createObjectURL(file);

    // Call the onSelectAsset callback with the uploaded file
    onSelectAsset(file, imageUrl);
    onClose();
  };

  // Add drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Create object URL for immediate use
      const imageUrl = URL.createObjectURL(file);

      // Call the onSelectAsset callback with the dropped file
      onSelectAsset(file, imageUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">ASSET LIBRARY</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload area */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div
            className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-gray-100 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div>
              <p className="text-gray-600 mb-1">
                Upload your own asset. Drag and Drop your file or
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-purple-600 font-medium hover:text-purple-700 cursor-pointer">
                Browse
              </span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "Asset Catalog" ? (
            loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading assets...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => fetchAssets(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  {searchTerm
                    ? "No assets found matching your search."
                    : "No assets available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                {filteredAssets.map((asset, index) => (
                  <div
                    key={index}
                    className={`group relative cursor-pointer transition-all duration-200 ${
                      loadingAsset === asset
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className={`aspect-square relative overflow-hidden rounded-lg border border-gray-200 bg-white ${selectedAsset === asset ? "ring-2 ring-purple-600 bg-purple-50" : ""}`}>
                      <img
                        src={asset}
                        alt={getAssetName(asset)}
                        className="w-full h-full object-contain p-2"
                      />
                      {loadingAsset === asset && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center truncate">
                      {getAssetName(asset)}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "Assets in Project" ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Project assets will be shown here</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">AI generation feature coming soon</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              {loading
                ? "Loading..."
                : `${filteredAssets.length} assets available`}
              {selectedAsset && (
                <span className="ml-2 text-purple-600">• 1 selected</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedAsset || loadingAsset}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedAsset && !loadingAsset
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loadingAsset ? "Loading..." : "Select"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLibraryModal;
