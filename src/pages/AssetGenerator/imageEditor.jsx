import { useState, useRef, useEffect } from "react";
import api from "../../api";

const ImageEditor = ({ imageUrl, onClose, onMaskGenerated }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      imageRef.current = img;
      setupCanvas(img);
    };

    return () => {
      setIsDrawing(false);
    };
  }, [imageUrl]);

  const setupCanvas = (img) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();

    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fillStyle = "white";
    maskCtx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    const img = imageRef.current;

    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  };

  const uploadMaskToS3 = async () => {
    try {
      setIsUploading(true);
      const maskCanvas = maskCanvasRef.current;
      const maskDataUrl = maskCanvas.toDataURL("image/png");

      // Convert base64 to Blob
      const byteString = atob(maskDataUrl.split(",")[1]);
      const mimeString = maskDataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Create a File object from the Blob
      const file = new File([blob], "mask.png", { type: "image/png" });

      // Upload to backend
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/v1/assetGenerator/upload-mask",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.url) {
        return response.data.url; // Expecting the S3 URL from backend
      }
      throw new Error("No URL returned from upload");
    } catch (error) {
      console.error("Error uploading mask:", error);
      alert("Failed to upload mask. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const generateMask = async () => {
    const s3Url = await uploadMaskToS3();
    if (s3Url) {
      onMaskGenerated(s3Url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#101622] p-4 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">Create Mask</h3>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>
        <div className="text-gray-400 text-sm mb-2">
          Draw over the areas you want to inpaint
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair rounded-lg"
            style={{ maxWidth: "100%", border: "1px solid #333" }}
          />
          <canvas ref={maskCanvasRef} className="hidden" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              Uploading mask...
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Brush Size:</span>
            <input
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-gray-400 text-sm">{brushSize}px</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetCanvas}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              disabled={isUploading}
            >
              Reset
            </button>
            <button
              onClick={generateMask}
              className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Apply Mask"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;