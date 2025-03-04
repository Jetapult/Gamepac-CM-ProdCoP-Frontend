import { useState, useRef, useEffect } from "react";
import api from "../../api";

const InpaintingMode = () => {
  const [inpaintingPrompt, setInpaintingPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maskUrl, setMaskUrl] = useState("");
  const [inpaintingResult, setInpaintingResult] = useState(null);
  const [inpaintingLoading, setInpaintingLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [maskImageData, setMaskImageData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [brushSize, setBrushSize] = useState(20);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const preloadImageRef = useRef(null);
  const originalImageDataRef = useRef(null); // Store the original image data

  const handleInpaintingRun = async () => {
    if (!imageUrl || (!maskImageData && !maskUrl) || !inpaintingPrompt) {
      alert("Please provide a prompt, image, and either create a mask or provide a mask URL");
      return;
    }

    setInpaintingLoading(true);
    try {
      const formData = {
        prompt: inpaintingPrompt,
        image_url: imageUrl,
        mask_url: maskImageData || maskUrl,
      };

      const result = await api.post("/v1/assetGenerator/inpaint-image", formData);
      console.log(result.data.data.data);
      if (result.data?.data?.data?.images?.[0]?.url) {
        setInpaintingResult(result.data.data.data.images[0].url);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error in inpainting:", error);
      alert("An error occurred during inpainting. Please try again.");
    } finally {
      setInpaintingLoading(false);
    }
  };

  const resetInpainting = () => {
    console.log("reset inpainting");
    setInpaintingPrompt("");
    setImageUrl("");
    setMaskUrl("");
    setMaskImageData(null);
    setInpaintingResult(null);
    setImageLoaded(false);
    preloadImageRef.current = null;
    originalImageDataRef.current = null;
  };

  // Preload image before showing editor
  const preloadImage = () => {
    console.log("Starting image preload process");
    setIsPreloading(true);

    // Create a new image element for preloading
    const preloadImg = new Image();
    preloadImg.crossOrigin = "anonymous";

    preloadImg.onload = () => {
      console.log("Image preloaded successfully");
      console.log(
        "Preloaded image dimensions:",
        preloadImg.naturalWidth,
        "x",
        preloadImg.naturalHeight
      );

      if (preloadImg.naturalWidth === 0 || preloadImg.naturalHeight === 0) {
        console.error("Preloaded image has invalid dimensions");
        setIsPreloading(false);
        alert(
          "The image could not be loaded properly. Please try a different image."
        );
        return;
      }

      preloadImageRef.current = preloadImg;
      setIsPreloading(false);
      setShowImageEditor(true);
    };

    preloadImg.onerror = (err) => {
      console.error("Error preloading image:", err);
      setIsPreloading(false);
      alert("Failed to load the image. Please check the URL and try again.");
    };

    console.log("Setting image source to:", imageUrl);
    preloadImg.src = imageUrl;
  };

  // Add useEffect to handle image loading
  useEffect(() => {
    if (showImageEditor && preloadImageRef.current && canvasRef.current) {
      console.log("Using preloaded image for canvas in useEffect");
      setupCanvas(preloadImageRef.current);
    }
  }, [showImageEditor]);

  // Add a new useEffect to ensure canvas is set up when it becomes available
  useEffect(() => {
    if (
      showImageEditor &&
      canvasRef.current &&
      preloadImageRef.current &&
      !imageLoaded
    ) {
      console.log("Canvas ref is now available, setting up canvas");
      setupCanvas(preloadImageRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageEditor, imageLoaded]);

  // Add a direct approach to load the image when the modal is shown
  useEffect(() => {
    if (showImageEditor) {
      // Try to load the image directly into the canvas
      const loadImageDirectly = () => {
        if (canvasRef.current && imageUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            console.log("Direct image load successful");
            setupCanvas(img);
          };
          img.onerror = (err) => {
            console.error("Error in direct image load:", err);
          };
          img.src = imageUrl;
        }
      };

      // Try immediately and also with a small delay
      loadImageDirectly();
      setTimeout(loadImageDirectly, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageEditor]);

  const handleImageLoad = () => {
    console.log("Image loaded in editor");
    console.log(
      "Image dimensions:",
      imageRef.current.naturalWidth,
      "x",
      imageRef.current.naturalHeight
    );
    setImageLoaded(true);

    // If we don't have a preloaded image, initialize the canvas now
    if (!preloadImageRef.current) {
      initializeCanvas();
    }
  };

  const initializeCanvas = () => {
    console.log("initialising canvas");
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) {
      console.error("Canvas or image reference not available");
      return;
    }

    if (!img.complete) {
      console.log("Image not loaded yet, waiting...");
      return;
    }

    setupCanvas(img);
  };

  const setupCanvas = (img) => {
    console.log("setup canvas");

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas reference not available");
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Get the actual image dimensions
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    console.log(`Image dimensions: ${imgWidth}x${imgHeight}`);

    if (imgWidth === 0 || imgHeight === 0) {
      console.error("Invalid image dimensions");
      return;
    }

    // Set canvas dimensions to match the image
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      console.log("Image drawn to canvas");

      // Store the original image data for later use
      originalImageDataRef.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Set drawing properties
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Semi-transparent red for better visibility

      // Mark image as loaded
      setImageLoaded(true);
    } catch (error) {
      console.error("Error setting up canvas:", error);
      alert(
        "There was an error setting up the canvas. Please try again with a different image."
      );
    }
  };

  const startDrawing = (e) => {
    console.log("start drawing");
    e.preventDefault(); // Prevent default behavior

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate position relative to canvas
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Set drawing properties before starting to draw
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";

    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent default behavior

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate position relative to canvas with scaling factor
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    console.log("stop drawing");
    setIsDrawing(false);
  };

  const generateMask = () => {
    console.log("generating mask");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Create a temporary canvas for the mask
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

    // Copy the current canvas to the temp canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Get the image data
    const imageData = tempCtx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );
    const data = imageData.data;

    // Get the original image data
    const originalData = originalImageDataRef.current.data;

    // Convert to black and white mask
    for (let i = 0; i < data.length; i += 4) {
      // Compare with original image to detect drawn areas
      if (
        Math.abs(data[i] - originalData[i]) > 50 ||
        Math.abs(data[i + 1] - originalData[i + 1]) > 50 ||
        Math.abs(data[i + 2] - originalData[i + 2]) > 50
      ) {
        // Set to white (255, 255, 255) for the mask
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        // Set to black (0, 0, 0) for the mask
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
      // Keep alpha channel
      data[i + 3] = 255;
    }

    // Put the modified image data back
    tempCtx.putImageData(imageData, 0, 0);

    // Convert to data URL
    const maskDataUrl = tempCanvas.toDataURL("image/png");
    setMaskImageData(maskDataUrl);
    setMaskUrl(maskDataUrl);

    // Close the editor
    setShowImageEditor(false);
  };

  const resetCanvas = () => {
    console.log("resetting canvas");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Clear everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the original image
    if (originalImageDataRef.current) {
      ctx.putImageData(originalImageDataRef.current, 0, 0);
    } else if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
  };

  const updateBrushSize = (size) => {
    setBrushSize(size);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineWidth = size;
    }
  };

  const ImageEditorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#101622] p-4 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">Create Mask</h3>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Draw to create mask</span>
            <button
              onClick={() => {
                console.log("Closing image editor");
                setShowImageEditor(false);
              }}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="text-gray-400 text-sm mb-2">
          Draw over the areas you want to inpaint. The red overlay shows where
          the mask will be applied.
        </div>
        <div className="relative overflow-auto">
          {/* Keep the hidden image for reference */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Source"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="cursor-crosshair rounded-lg"
            style={{
              background: "#101622",
              maxWidth: "100%",
              height: "auto",
              display: "block",
              border: "1px solid #333",
            }}
          />
          {/* Add a debug message if canvas is empty */}
          {showImageEditor && !imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
              Loading image...
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Brush Size:</span>
            <input
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => updateBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-gray-400 text-sm">{brushSize}px</span>
            <div
              className="ml-2 rounded-full bg-red-500 opacity-50"
              style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                minWidth: "10px",
                minHeight: "10px",
              }}
            ></div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetCanvas}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={generateMask}
              className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded"
            >
              Apply Mask
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex space-x-4">
      {/* Left Box - Inputs */}
      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Prompt</label>
          <textarea
            value={inpaintingPrompt}
            onChange={(e) => setInpaintingPrompt(e.target.value)}
            className="w-full h-24 p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md resize-none"
            style={{ outline: "none" }}
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
            style={{ outline: "none" }}
            placeholder="Enter image URL..."
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-md cursor-pointer hover:opacity-80"
                onClick={() => {
                  setImageLoaded(false);
                  preloadImage();
                }}
              />
              <p className="text-gray-400 text-xs mt-1">
                {isPreloading
                  ? "Loading image..."
                  : "Click image to create mask"}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Mask</label>
          <div className="space-y-2">
            <input
              type="text"
              value={maskUrl}
              onChange={(e) => setMaskUrl(e.target.value)}
              className="w-full p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md"
              style={{ outline: "none" }}
              placeholder="Enter mask URL or create mask by clicking on the image above..."
            />
            {imageUrl && !maskUrl && !maskImageData && (
              <p className="text-gray-400 text-xs">
                You can either enter a mask URL directly or click on the image above to draw a mask
              </p>
            )}
            {maskImageData && (
              <div className="mt-2">
                <p className="text-gray-400 text-xs mb-1">Generated Mask:</p>
                <img
                  src={maskImageData}
                  alt="Mask Preview"
                  className="max-w-full h-48 object-contain rounded-md"
                />
              </div>
            )}
            {maskUrl && !maskImageData && (
              <div className="mt-2">
                <p className="text-gray-400 text-xs mb-1">Mask Preview:</p>
                <img
                  src={maskUrl}
                  alt="Mask Preview"
                  className="max-w-full h-48 object-contain rounded-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    alert('Failed to load mask image. Please check the URL.');
                  }}
                />
              </div>
            )}
          </div>
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

      {/* Right Box - Result */}
      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4 flex items-center justify-center">
        {inpaintingLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#c24dd4] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 bg-[#c24dd4] rounded-full animate-pulse"></div>
              </div>
            </div>
            <span className="text-white mt-4">Generating image...</span>
            <span className="text-gray-400 text-sm mt-1">This may take a few seconds</span>
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
      {showImageEditor && <ImageEditorModal />}
    </div>
  );
};

export default InpaintingMode;
