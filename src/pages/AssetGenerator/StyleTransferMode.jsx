import { useState } from "react";
import api from "../../api";

const StyleTransferMode = () => {
  const [styleTransferPrompt, setStyleTransferPrompt] = useState("");
  const [styleImageUrl, setStyleImageUrl] = useState("");
  const [styleTransferResult, setStyleTransferResult] = useState(null);
  const [styleTransferLoading, setStyleTransferLoading] = useState(false);

  const handleStyleTransferRun = async () => {
    if (!styleImageUrl || !styleTransferPrompt) {
      alert("Please provide both a prompt and a style image");
      return;
    }

    setStyleTransferLoading(true);
    try {
      const formData = {
        prompt: styleTransferPrompt,
        style_image_url: styleImageUrl,
      };

      const response = await api.post(
        "/v1/assetGenerator/transfer-style",
        formData
      );
      console.log("API Response:", response);

      // Check the response structure and extract the base64 image data
      let imageData;
      if (response.data && response.data.result) {
        imageData = response.data.result;
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.result
      ) {
        imageData = response.data.data.result;
      } else {
        console.error("Unexpected response format:", response.data);
        alert("Received an invalid response format from the server.");
        setStyleTransferLoading(false);
        return;
      }

      // Ensure the base64 string has the correct format for an image source
      if (imageData && typeof imageData === "string") {
        if (!imageData.startsWith("data:image")) {
          imageData = `data:image/png;base64,${imageData}`;
        }
        setStyleTransferResult(imageData);
      } else {
        console.error("Invalid image data:", imageData);
        alert("Received invalid image data from the server.");
      }
    } catch (error) {
      console.error("Error in style transfer:", error);
      alert("An error occurred during style transfer. Please try again.");
    } finally {
      setStyleTransferLoading(false);
    }
  };
  const resetStyleTransfer = () => {
    setStyleTransferPrompt("");
    setStyleImageUrl("");
    setStyleTransferResult(null);
  };

  return (
    <div className="w-full flex space-x-4">
      {/* Left Box - Style Transfer Inputs */}
      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Prompt</label>
          <textarea
            value={styleTransferPrompt}
            onChange={(e) => setStyleTransferPrompt(e.target.value)}
            className="w-full h-24 p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md resize-none"
            style={{ outline: "none" }}
            placeholder="Enter your prompt for style transfer..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">
            Style Image URL
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={styleImageUrl}
              onChange={(e) => setStyleImageUrl(e.target.value)}
              className="flex-1 p-2 text-slate-300 bg-[#101622] border border-gray-700 rounded-md"
              style={{ outline: "none" }}
              placeholder="Enter style image URL..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setStyleImageUrl(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="styleImageUpload"
            />
            <button
              onClick={() =>
                document.getElementById("styleImageUpload").click()
              }
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Browse
            </button>
          </div>
          {styleImageUrl && (
            <div className="mt-2">
              <img
                src={styleImageUrl}
                alt="Style Preview"
                className="max-w-full h-48 object-contain rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={resetStyleTransfer}
            className="w-1/2 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={handleStyleTransferRun}
            className="w-1/2 p-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-md"
            disabled={styleTransferLoading}
          >
            {styleTransferLoading ? "Processing..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Right Box - Style Transfer Result */}
      <div className="w-1/2 bg-[#101622] border border-[#c24dd4] rounded-lg p-4 flex items-center justify-center">
        {styleTransferLoading ? (
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-[#c24dd4] mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span className="text-white">Processing...</span>
          </div>
        ) : styleTransferResult ? (
          <img
            src={styleTransferResult}
            alt="Style Transfer Result"
            className="max-w-full max-h-full object-contain rounded-md"
          />
        ) : (
          <div className="text-gray-400">Result will appear here</div>
        )}
      </div>
    </div>
  );
};

export default StyleTransferMode;
