import { useEffect, useState } from "react";
import dropdownIcon from "../../assets/icons8-dropdown.png";
import sparkles from "../../assets/sparkles.svg";
import download from "../../assets/download-button-svgrepo-com.svg";
import zoom from "../../assets/zoom-in.svg";
import upscale from "../../assets/upscale.svg";
import contrast from "../../assets/contrast.svg";
import potion from "../../assets/potion.svg";
import api from "../../api";
import InpaintingMode from "./InpaintingMode";
import StyleTransferMode from "./StyleTransferMode";
import InpaintingHistoryPage from "./InpaintingHistory";

export const AssetGenerator = () => {
  const [generatedData, setGeneratedData] = useState({
    images: [],
    prompt: "",
    date: "",
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState({
    name: "Flux Dev",
    endpoint: "fal-ai/flux/dev"
  });
  const [selectedGame, setSelectedGame] = useState({});
  const [selectedStyle, setSelectedStyle] = useState("vibrant");
  const [selectedDimension, setSelectedDimension] = useState("square_hd");
  const [selectedSize, setSelectedSize] = useState("Small");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [safetyChecker, setSafetyChecker] = useState("true");
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promptEnhancing, setPromptEnhancing] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [promptEnhanceMode, setPromptEnhanceMode] = useState("Auto");
  const [selectedContrast, setSelectedContrast] = useState("low");
  const [showPromptEnhanceDropdown, setShowPromptEnhanceDropdown] =
    useState(false);
  const [showContrastDropdown, setShowContrastDropdown] = useState(false);
  const [isInpaintingMode, setIsInpaintingMode] = useState(false);
  const [styleTransferMode, setStyleTransferMode] = useState(false);
  const [isUpscaleModalOpen, setIsUpscaleModalOpen] = useState(false);
  const [upscaleData, setUpscaleData] = useState({
    originalUrl: "",
    upscaledUrl: "",
    isLoading: false,
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectAssets, setProjectAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [mode, setMode] = useState("standard");

  // Add these new functions after other toggle functions
  const toggleProjectDropdown = () => {
    setShowProjectDropdown(!showProjectDropdown);
  };

  const toggleAssetDropdown = () => {
    setShowAssetDropdown(!showAssetDropdown);
  };

  // Add this function to handle project selection
  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setShowProjectDropdown(false);
    
    try {
      // Determine the endpoint based on project name
      const gameCode = project.name.includes("HDW") ? "HDW" : project.name.includes("MHM") ? "MHM" : "";
      if (!gameCode) {
        console.error("Unknown project type");
        return;
      }
      
      const response = await api.get(`/v1/assetGenerator/game-assets/${gameCode}`);
      console.log(response)
      if (response.data && response.data.data && response.data.data.assets) {
        // Transform the array of URLs into objects with id and url properties
        const assetObjects = response.data.data.assets.map((url, index) => {
          // Extract filename from URL - handle spaces in filenames properly
          const fileName = decodeURIComponent(url.split('/').pop().replace(/\.[^/.]+$/, ""));
          return {
            id: index + 1,
            name: fileName,
            url: url
          };
        });
        console.log(assetObjects)
        setProjectAssets(assetObjects);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching project assets:", error);
    }
  };
  const toggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
  };

  const toggleStyleDropdown = () => {
    setShowStyleDropdown(!showStyleDropdown);
  };

  const togglePromptEnhanceDropdown = () => {
    setShowPromptEnhanceDropdown(!showPromptEnhanceDropdown);
  };

  const toggleContrastDropdown = () => {
    setShowContrastDropdown(!showContrastDropdown);
  };

  const styleOptions = [
    "3d_render",
    "bokeh",
    "cinematic",
    "cinematic_concept",
    "creative",
    "dynamic",
    "fashion",
    "graphic_design_pop_art",
    "graphic_design_vector",
    "illustration",
    "macro",
    "minimalist",
    "moody",
    "portrait",
    "pro_bw_photography",
    "pro_color_photography",
    "pro_film_photography",
    "ray_traced",
    "sketch_bw",
    "sketch_color",
    "stock_photo",
    "vibrant",
    "watercolor",
  ];

  const handleGenerate = async () => {
    if (!prompt) {
      alert("Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/v1/assetGenerator/generate-image", {
        prompt: prompt,
        style: selectedStyle,
        dimension: selectedDimension,
        size: selectedSize,
        number: selectedNumber,
        safety_checker: safetyChecker,
        model: selectedModel.endpoint  // Add this line
      });
      if (response.status === 200) {
        setGeneratedData({
          images: response.data.data.data.images,
          prompt: prompt,
          date: new Date().toLocaleString(),
        });
        fetchHistory();
      }
    } catch (error) {
      console.error("Error generating images:", error);
      alert("An error occurred while generating images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt) {
      alert("Please enter a prompt to enhance");
      return;
    }
    setPromptEnhancing(true);
    try {
      const response = await api.post("/v1/assetGenerator/enhance-prompt", {
        prompt: prompt,
      });
      if (response.status === 200) {
        setPrompt(response.data.data.enhanced_prompt);
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      alert("An error occurred while enhancing the prompt. Please try again.");
    } finally {
      setPromptEnhancing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/v1/assetGenerator/history");
      if (response.status === 200) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullImage = (url) => {
    window.open(url, "_blank");
  };

  const upscaleImage = async (url) => {
    console.log(`upscaling ${url}`);
    setUpscaleData({
      originalUrl: url,
      upscaledUrl: "",
      isLoading: true,
    });
    setIsUpscaleModalOpen(true);

    try {
      const response = await api.post("/v1/assetGenerator/upscale-image", {
        image_url: url,
      });
      console.log(response);
      if (response.status === 200) {
        setUpscaleData((prev) => ({
          ...prev,
          upscaledUrl: response.data.data.data.images[0].url,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error upscaling image:", error);
      alert("An error occurred while upscaling the image. Please try again.");
      setIsUpscaleModalOpen(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle mode switching
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === "inpainting") {
      setIsInpaintingMode(true);
      setStyleTransferMode(false);
    } else if (newMode === "styleTransfer") {
      setIsInpaintingMode(false);
      setStyleTransferMode(true);
    } else if (newMode === "inpaintingHistory") {
      setIsInpaintingMode(false);
      setStyleTransferMode(false);
    } else {
      setIsInpaintingMode(false);
      setStyleTransferMode(false);
    }
  };

  return (
    <div className="bg-black h-screen w-full flex">
      <div className="fixed top-0 left-0 w-1/6 border-r border-gray-700 h-screen p-4 flex flex-col bg-black overflow-y-auto">
        <h2 className="text-white text-xl font-bold mb-4">Asset Generator</h2>
        <div
          onClick={toggleProjectDropdown}
          className="mb-2 flex items-center justify-between px-4 py-2 bg-purple-400 border border-slate-600 rounded-lg mt-1 hover:bg-slate-900 cursor-pointer"
        >
          <div className="flex-col">
            <div className="text-white text-sm">Project</div>
            <div className="text-white text-xs">
              {selectedProject ? selectedProject.name : "Select Project"}
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showProjectDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-4">
            {/* Replace this with your actual projects data */}
            {[
              { id: 1, name: "Project MHM" },
              { id: 2, name: "Project HDW" },
              // Add more projects as needed
            ].map((project) => (
              <div
                key={project.id}
                className="px-4 py-2 hover:bg-slate-900 cursor-pointer text-white text-sm"
                onClick={() => handleProjectSelect(project)}
              >
                {project.name}
              </div>
            ))}
          </div>
        )}

        {/* Fix styling for Asset Selection - Only show when a project is selected */}
        {selectedProject && (
          <div className="mb-4 relative">
            <div
              onClick={toggleAssetDropdown}
              className="flex items-center justify-between px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {selectedAsset && (
                  <div className="w-8 h-8 flex-shrink-0">
                    <img 
                      src={selectedAsset.url} 
                      alt={selectedAsset.name} 
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/32?text=Error';
                      }}
                    />
                  </div>
                )}
                <div className="flex-col overflow-hidden">
                  <div className="text-purple-400 text-sm">Project Assets</div>
                  <div className="text-white text-xs truncate">
                    {selectedAsset ? selectedAsset.name : "Select Asset"}
                  </div>
                </div>
              </div>
              <div className="flex items-center ml-2">
                <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
              </div>
            </div>
            {showAssetDropdown && selectedProject && (
              <div className="absolute border border-slate-600 rounded-md bg-black mb-4 max-h-80 overflow-y-auto z-50 w-full shadow-lg">
                {projectAssets.length > 0 ? (
                  projectAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="px-4 py-2 hover:bg-slate-900 cursor-pointer flex items-center"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowAssetDropdown(false);
                      }}
                    >
                      <div className="w-12 h-12 mr-3 flex-shrink-0">
                        <img 
                          src={asset.url} 
                          alt={asset.name} 
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/48?text=Error';
                          }}
                        />
                      </div>
                      <span className="text-white text-sm truncate">{asset.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400 text-sm">No assets found</div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          onClick={toggleModelDropdown}
          className="mb-2 flex items-center justify-between px-4 py-2 border border-slate-600 rounded-lg mt-1 hover:bg-slate-900 cursor-pointer"
        >
          <div className="flex-col">
            <div className="text-purple-400 text-sm">Model / Preset</div>
            <div className="text-white text-xs">{selectedModel.name}</div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showModelDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-4">
            {[
              { name: "Flux Dev", endpoint: "fal-ai/flux/dev" },
              { name: "Flux Pro 1.1", endpoint: "fal-ai/flux-pro/v1.1-ultra" }
            ].map((model, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-slate-900 cursor-pointer text-white text-sm"
                onClick={() => {
                  setSelectedModel(model);
                  setShowModelDropdown(false);
                }}
              >
                {model.name}
              </div>
            ))}
          </div>
        )}
        <div
          onClick={togglePromptEnhanceDropdown}
          className="mb-2 flex items-center justify-between px-3 py-1 border border-slate-600 rounded-lg hover:bg-slate-900 cursor-pointer"
        >
          <div className="flex items-center">
            <img src={sparkles} className="w-5 h-5 filter invert mr-2" />
            <div className="flex-col">
              <div className="text-slate-400 text-xs">Prompt Enhance</div>
              <div className="text-white text-sm">{promptEnhanceMode}</div>
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showPromptEnhanceDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-4">
            {["On", "Off", "Auto"].map((mode, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-slate-900 cursor-pointer text-white text-sm"
                onClick={() => {
                  setPromptEnhanceMode(mode);
                  setShowPromptEnhanceDropdown(false);
                }}
              >
                {mode}
              </div>
            ))}
          </div>
        )}
        <div
          onClick={toggleContrastDropdown}
          className="mb-2 flex items-center justify-between px-3 py-1 border border-slate-600 rounded-lg hover:bg-slate-900 cursor-pointer"
        >
          <div className="flex items-center">
            <img src={contrast} className="w-5 h-5 filter invert mr-2" />
            <div className="flex-col">
              <div className="text-slate-400 text-xs">Contrast</div>
              <div className="text-white text-sm">{selectedContrast}</div>
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showContrastDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-4">
            {["low", "medium", "high"].map((contrast, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-slate-900 cursor-pointer text-white text-sm"
                onClick={() => {
                  setSelectedContrast(contrast);
                  setShowContrastDropdown(false);
                }}
              >
                {contrast}
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <div
            onClick={toggleStyleDropdown}
            className="mb-2 flex items-center justify-between px-3 py-1 border border-slate-600 rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            <div className="flex items-center">
              <img src={potion} className="w-5 h-5 filter invert mr-2" />
              <div className="flex-col">
                <div className="text-slate-400 text-xs">Style</div>
                <div className="text-white text-sm">{selectedStyle}</div>
              </div>
            </div>
            <div className="flex items-center">
              <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
            </div>
          </div>
          {showStyleDropdown && (
            <div className="absolute top-full left-0 right-0 border border-slate-600 rounded-md bg-black mb-4 max-h-40 overflow-y-auto z-50">
              {styleOptions.map((style, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-slate-900 cursor-pointer text-white text-sm"
                  onClick={() => {
                    setSelectedStyle(style);
                    setShowStyleDropdown(false);
                  }}
                >
                  {style}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white text-sm">Dimensions</label>
          <div className="flex space-x-2">
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "square_hd"
                  ? "border-purple-400"
                  : "border-white hover:border-purple-400"
              }`}
              onClick={() => setSelectedDimension("square_hd")}
            >
              1:1
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "portrait_16_9"
                  ? "border-purple-400"
                  : "border-white hover:bg-purple-400"
              }`}
              onClick={() => setSelectedDimension("portrait_16_9")}
            >
              16:9P
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "landscape_16_9"
                  ? "border-purple-400"
                  : "border-white hover:border-purple-400"
              }`}
              onClick={() => setSelectedDimension("landscape_16_9")}
            >
              16:9L
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white text-sm">Image Size</label>
          <div className="flex space-x-2">
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Small"
                  ? "border-purple-400"
                  : "border-white hover:bg-purple-400"
              }`}
              onClick={() => setSelectedSize("Small")}
            >
              Small
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Medium"
                  ? "border-[#c24dd4]"
                  : "border-white hover:bg-purple-400"
              }`}
              onClick={() => setSelectedSize("Medium")}
            >
              Medium
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Large"
                  ? "border-purple-400"
                  : "border-white hover:border-purple-400"
              }`}
              onClick={() => setSelectedSize("Large")}
            >
              Large
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-white text-sm">
            {" "}
            Number of Images
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((number) => (
              <button
                key={number}
                className={`w-full p-2 rounded text-white text-xs border ${
                  selectedNumber === number
                    ? "border-purple-400"
                    : "border-white hover:border-purple-400"
                }`}
                onClick={() => setSelectedNumber(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-white text-sm">
            Enable Safety Checker
          </label>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={safetyChecker === "true"}
                onChange={() =>
                  setSafetyChecker(safetyChecker === "true" ? "false" : "true")
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-400 peer-focus:ring-2 peer-focus:ring-[#c24dd4] transition-colors duration-200"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-2 text-white text-xs">
              {safetyChecker === "true" ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-4">
            <button
              className={`w-full p-2 ${
                isInpaintingMode
                  ? "bg-purple-400 text-white"
                  : "bg-black border border-gray-700 text-white"
              } rounded text-sm hover:bg-gray-600`}
              onClick={() => handleModeSwitch("inpainting")}
            >
              Inpainting Mode
            </button>
          </div>

          <div>
            <button
              className={`w-full p-2 ${
                mode === "inpaintingHistory"
                  ? "bg-purple-400 text-white"
                  : "bg-black border border-gray-700 text-white"
              } rounded text-sm hover:bg-gray-600`}
              onClick={() => handleModeSwitch("inpaintingHistory")}
            >
              Inpainting History
            </button>
          </div>

          {(isInpaintingMode || styleTransferMode) && (
            <div className="mt-4">
              <button
                className="w-full p-2 bg-black border border-gray-700 rounded text-white text-sm hover:bg-gray-600"
                onClick={() => handleModeSwitch("standard")}
              >
                Return to Standard Mode
              </button>
            </div>
          )}
        </div>
      </div>
      {/* right container */}
      <div className="ml-[16.6667%] w-[83.3333%] h-screen overflow-y-auto p-4 flex flex-col items-center">
        {isInpaintingMode ? (
          <InpaintingMode selectedAsset={selectedAsset} />
        ) : styleTransferMode ? (
          <StyleTransferMode />
        ) : mode === "inpaintingHistory" ? (
          <InpaintingHistoryPage />
        ) : (
          <>
            <div className="bg-[#101622] w-3/4 h-36 border border-purple-400 rounded-lg flex flex-col justify-between p-2 mb-4">
              <textarea
                placeholder="Enter text here"
                className="w-full h-full p-2 text-slate-300 bg-[#101622] rounded-md resize-none"
                style={{ outline: "none" }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex flex-row items-center justify-end space-x-2">
                <div>
                  <button onClick={handleEnhancePrompt}>
                    {promptEnhancing ? (
                      <svg
                        className="animate-spin h-7 w-7 text-white"
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
                    ) : (
                      <img
                        src={sparkles}
                        alt="Enhance Prompt"
                        className="w-7 h-7 filter invert transition-transform duration-200 hover:scale-110"
                      />
                    )}
                  </button>
                </div>
                <button
                  className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-md rounded-md px-2 py-1 mt-2"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-col items-center">
                <span className="text-white text-sm"> Current Generation </span>
                <span className="text-gray-400 text-xs">
                  {generatedData.date}
                </span>
              </div>
              <div className="mt-3 w-full">
                <div
                  className="text-white text-sm max-w-full overflow-hidden text-ellipsis whitespace-pre-wrap break-words"
                  style={{ maxHeight: "3em", overflowY: "auto" }}
                >
                  {generatedData.prompt}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {generatedData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt="Generated"
                        className="w-300 h-300 object-cover hover:opacity-70"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-around items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => downloadImage(image.url.url)}>
                          <img
                            src={download}
                            alt="Download"
                            className="w-4 h-4 filter invert"
                          />
                        </button>
                        <button onClick={() => openFullImage(image.url.url)}>
                          <img
                            src={zoom}
                            alt="Zoom"
                            className="w-5 h-5 filter invert"
                          />
                        </button>
                        <button onClick={() => upscaleImage(image.url.url)}>
                          <img
                            src={upscale}
                            alt="Upscale"
                            className="w-5 h-5 filter invert"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center mt-8 w-full">
              <div className="mb-3 flex flex-col items-center w-full">
                <span className="text-white text-sm"> Generation History </span>
              </div>
              {history.length > 0 ? (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="mt-3 w-full border border-purple-400 rounded-lg p-2 mb-4"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="text-white text-sm max-w-[80%] overflow-hidden text-ellipsis whitespace-pre-wrap break-words"
                        style={{ maxHeight: "3em", overflowY: "auto" }}
                      >
                        {item.prompt}
                      </div>
                      <span className="text-gray-400 text-xs ml-2 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {item.image_data &&
                        item.image_data.map((imageData, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageData.image_url}
                              alt="Generated"
                              className="w-300 h-300 object-cover hover:opacity-70"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-around items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() =>
                                  downloadImage(imageData.image_url)
                                }
                              >
                                <img
                                  src={download}
                                  alt="Download"
                                  className="w-4 h-4 filter invert"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  openFullImage(imageData.image_url)
                                }
                              >
                                <img
                                  src={zoom}
                                  alt="Zoom"
                                  className="w-5 h-5 filter invert"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  upscaleImage(imageData.image_url)
                                }
                              >
                                <img
                                  src={upscale}
                                  alt="Upscale"
                                  className="w-5 h-5 filter invert"
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No history available.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upscale Modal */}
      {isUpscaleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#101622] border border-purple-400 rounded-lg p-4 w-4/5 max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Image Upscaling
              </h3>
              <button
                onClick={() => setIsUpscaleModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <p className="text-white text-sm mb-2">Original Image</p>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={upscaleData.originalUrl}
                    alt="Original"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white text-sm mb-2">Upscaled Image</p>
                <div className="border border-gray-700 rounded-lg overflow-hidden h-full flex items-center justify-center">
                  {upscaleData.isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <svg
                        className="animate-spin h-10 w-10 text-purple-400 mb-2"
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
                      <p className="text-white text-sm">Upscaling image...</p>
                    </div>
                  ) : upscaleData.upscaledUrl ? (
                    <img
                      src={upscaleData.upscaledUrl}
                      alt="Upscaled"
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm p-8">
                      Upscaled image will appear here
                    </p>
                  )}
                </div>
              </div>
            </div>

            {upscaleData.upscaledUrl && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => downloadImage(upscaleData.upscaledUrl)}
                  className="flex items-center bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-md px-3 py-2 mr-2"
                >
                  <img
                    src={download}
                    alt="Download"
                    className="w-4 h-4 filter invert mr-2"
                  />
                  Download
                </button>
                <button
                  onClick={() => openFullImage(upscaleData.upscaledUrl)}
                  className="flex items-center bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-md px-3 py-2"
                >
                  <img
                    src={zoom}
                    alt="View Full Size"
                    className="w-4 h-4 filter invert mr-2"
                  />
                  View Full Size
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
