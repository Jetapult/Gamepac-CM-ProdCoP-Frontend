import { useState, useRef, useEffect } from "react";
import api from "../../api";
import ImageEditor from "./imageEditor";

const InpaintingMode = ({ selectedAsset }) => {
  const [inpaintingPrompt, setInpaintingPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maskUrl, setMaskUrl] = useState("");
  const [inpaintingResult, setInpaintingResult] = useState(null);
  const [inpaintingLoading, setInpaintingLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(() => {
    if (selectedAsset && selectedAsset.url) {
      setImageUrl(selectedAsset.url);
    }
  }, [selectedAsset]);

  const handleInpaintingRun = async () => {
    if (!imageUrl || !maskUrl || !inpaintingPrompt) {
      alert("Please provide a prompt, image, and mask");
      return;
    }

    setInpaintingLoading(true);
    try {
      const formData = {
        prompt: inpaintingPrompt,
        image_url: imageUrl,
        mask_url: maskUrl,
      };

      const result = await api.post("/v1/assetGenerator/inpaint-image", formData);
      if (result.data?.data?.data?.images?.[0]?.url) {
        setInpaintingResult(result.data.data.data.images[0].url);
      }
    } catch (error) {
      console.error("Error in inpainting:", error);
      alert("An error occurred during inpainting. Please try again.");
    } finally {
      setInpaintingLoading(false);
    }
  };

  const resetInpainting = () => {
    setInpaintingPrompt("");
    setImageUrl("");
    setMaskUrl("");
    setInpaintingResult(null);
  };

  const handleMaskGenerated = (maskDataUrl) => {
    setMaskUrl(maskDataUrl);
  };

  return (
    <div className="w-full flex space-x-4">
      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Prompt</label>
          <textarea
            value={inpaintingPrompt}
            onChange={(e) => setInpaintingPrompt(e.target.value)}
            className="w-full h-24 p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md resize-none"
            placeholder="Enter your prompt for inpainting..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md"
            placeholder="Enter image URL..."
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-md cursor-pointer hover:opacity-80"
                onClick={() => setShowImageEditor(true)}
                onError={() => alert("Failed to load image. Please check the URL.")}
              />
              <p className="text-gray-400 text-xs mt-1">Click image to create mask</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Mask</label>
          <input
            type="text"
            value={maskUrl}
            onChange={(e) => setMaskUrl(e.target.value)}
            className="w-full p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md"
            placeholder="Enter mask URL or create mask by clicking the image..."
          />
          {maskUrl && (
            <div className="mt-2">
              <p className="text-gray-400 text-xs mb-1">Mask Preview:</p>
              <img
                src={maskUrl}
                alt="Mask Preview"
                className="max-w-full h-48 object-contain rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={resetInpainting}
            className="w-1/2 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={handleInpaintingRun}
            className="w-1/2 p-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-md"
          >
            Run
          </button>
        </div>
      </div>

      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4 flex items-center justify-center">
        {inpaintingLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#c24dd4] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white mt-4">Generating image...</span>
          </div>
        ) : inpaintingResult ? (
          <div className="w-full h-full flex flex-col items-center">
            <img
              src={inpaintingResult}
              alt="Inpainting Result"
              className="max-w-full max-h-[80vh] object-contain rounded-md"
            />
            <a
              href={inpaintingResult}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[#c24dd4] hover:text-purple-400 text-sm"
            >
              Open in new tab
            </a>
          </div>
        ) : (
          <div className="text-gray-400">Result will appear here</div>
        )}
      </div>

      {showImageEditor && (
        <ImageEditor
          imageUrl={imageUrl}
          onClose={() => setShowImageEditor(false)}
          onMaskGenerated={handleMaskGenerated}
        />
      )}
    </div>
  );
};

export default InpaintingMode;