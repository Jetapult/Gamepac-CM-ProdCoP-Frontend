import { useEffect, useState } from "react";
import dropdownIcon from "../../assets/icons8-dropdown.png";
import sparkles from "../../assets/sparkles.svg";
import download from "../../assets/download-button-svgrepo-com.svg";
import zoom from "../../assets/zoom-in.svg";
import upscale from "../../assets/upscale.svg";
import contrast from "../../assets/contrast.svg";
import potion from "../../assets/potion.svg";
import api from "../../api";

export const AssetGenerator = () => {
  const [generatedData, setGeneratedData] = useState({
    images: [],
    prompt: "",
    date: "",
  });
  const [selectedMode, setSelectedMode] = useState("vibrant");
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
  const [selectedContrast, setSelectedContrast]=useState('low')
  const [showPromptEnhanceDropdown, setShowPromptEnhanceDropdown] =
    useState(false);
  const [showContrastDropdown, setShowContrastDropdown]=useState(false);
  const toggleStyleDropdown = () => {
    setShowStyleDropdown(!showStyleDropdown);
  };
  const togglePromptEnhanceDropdown = () => {
    setShowPromptEnhanceDropdown(!showPromptEnhanceDropdown);
  };
  const toggleContrastDropdown =()=>{
    setShowContrastDropdown(!showContrastDropdown)
  }

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
  ];

  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullImage = (url) => {
    window.open(url, "_blank");
  };

  const upscaleImage = (url) => {
    // Implement your upscale logic here
    console.log(`Upscaling image: ${url}`);
  };

  const handleEnhancePrompt = async () => {
    setPromptEnhancing(true); // Start loading
    try {
      console.log("inside enhance prompt");
      const result = await api.post("/v1/assetGenerator/enhance-prompt", {
        prompt,
        selectedMode,
      });
      const enhancedPrompt = result.data.data.enhanced_prompt;
      setPrompt(enhancedPrompt);
      console.log(enhancedPrompt);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    } finally {
      setPromptEnhancing(false); // Stop loading
    }
  };
  const handleGenerate = async () => {
    console.log("generate button clicked");
    setLoading(true);
    const formData = {
      prompt: prompt,
      style: selectedStyle,
      image_size: selectedDimension,
      num_inference_steps: 50,
      guidance_scale: 7.5,
      num_images: selectedNumber,
      enable_safety_checker: safetyChecker === "true",
    };
    console.log(JSON.stringify(formData));
    try {
      const result = await api.post(
        "/v1/assetGenerator/generate-image",
        formData
      );
      const images = result.data.data.data.images;
      const generationPrompt = result.data.data.data.prompt;
      const generationDate = new Date().toLocaleDateString();
      console.log(generationDate);

      setGeneratedData({
        images,
        prompt: generationPrompt,
        date: generationDate,
      });
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await api.get("/v1/assetGenerator/history");
        console.log("History API result:", result);
        setHistory(result.data.data);
      } catch (error) {
        console.error("Error fetching generation history:", error);
      }
    };
    fetchHistory();
  }, []);
  return (
    <div className="bg-black h-screen  w-full flex">
      <div class="fixed top-0 left-0 w-1/6 border-r border-gray-700 h-full p-4 flex flex-col bg-black">
        <h2 class="text-white text-xl font-bold mb-4">Asset Generator</h2>

        <div class="mb-4 flex flex-row justify-between px-4 py-2 border border-slate-600 rounded-lg mt-1 ">
          <div className="flex-col">
            <div className="text-[#c24dd4] text-sm "> Model / Preset</div>
            <div className="text-white text-xs"> Flux Dev </div>
          </div>
          {/* <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-5 h-5" />
          </div> */}
        </div>
        <div
          class={`mb-${
            showPromptEnhanceDropdown ? "1" : "2"
          } flex items-center justify-between px-3 py-1 border border-slate-600 rounded-lg hover:bg-slate-900`}
        >
          <div className="flex items-center">
            <img src={sparkles} className="w-5 h-5 filter invert mr-2" />
            <div className="flex-col">
              <div className="text-slate-400 text-xs">Prompt Enhance</div>
              <button
                className="text-white text-sm"
                onClick={togglePromptEnhanceDropdown}
              >
                {promptEnhanceMode}
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showPromptEnhanceDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-2">
            {["On", "Off", "Auto"].map((mode, index) => (
              <div
                key={mode}
                className={`p-2 hover:bg-slate-900 cursor-pointer text-white text-xs ${
                  index < 2 ? "border-b border-slate-600" : ""
                }`}
                onClick={() => {
                  setPromptEnhanceMode(mode);
                  setShowPromptEnhanceDropdown(false);
                }}
              >
                {mode}
                <div className="text-gray-400 text-xs mt-1">
                  {mode === "Auto" &&
                    "When activated shorter prompts will be automatically enhanced."}
                  {mode === "On" &&
                    "When on, prompts will always be refined to improve outputs."}
                  {mode === "Off" &&
                    "When off, your prompt will not be modified."}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          className={`mb-${
            showStyleDropdown ? "1" : "2"
          } flex items-center justify-between w-full border border-slate-600 rounded-lg p-2 hover:bg-slate-900`}
        >
          <div className="flex items-center">
            <img src={potion} className="w-5 h-5 filter invert mr-2" />
            <div className="flex flex-col">
              <div className="text-slate-400 text-xs">Style</div>
              <button
                className="text-white text-sm"
                onClick={toggleStyleDropdown}
              >
                {selectedStyle}
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {/* border border-slate-600 rounded-lg  */}
        {showStyleDropdown && (
          <div className="border border-slate-600 max-h-80 overflow-auto rounded-md  w-100 mb-2">
            {styleOptions.map((style) => (
              <div
                key={style}
                className="p-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
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
        <div
          className={`mb-${
            showContrastDropdown ? "1" : "2"
          } flex items-center justify-between w-full border border-slate-600 rounded-lg p-2 hover:bg-slate-900`}
        >
          <div className="flex items-center">
            <img src={contrast} className="w-5 h-5 filter invert mr-2" />
            <div className="flex flex-col">
              <div className="text-slate-400 text-xs">Contrast</div>
              <button
                className="text-white text-sm"
                onClick={toggleContrastDropdown}
              >
                {selectedContrast}
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <img src={dropdownIcon} alt="Dropdown Icon" className="w-4 h-4" />
          </div>
        </div>
        {showContrastDropdown && (
          <div className="border border-slate-600 rounded-md bg-black mb-2">
            {["Low", "Medium", "High"].map((level, index) => (
              <div
                key={level}
                className={`p-2 hover:bg-slate-900 cursor-pointer text-white text-sm ${
                  index < 2 ? "border-b border-slate-600" : ""
                }`}
                onClick={() => {
                  setSelectedContrast(level);
                  setShowContrastDropdown(false);
                }}
              >
                <div>{level}</div>
              </div>
            ))}
          </div>
        )}

        <div class="mb-4">
          <label class="block mb-2 text-white text-sm">Generation Mode</label>
          <div class="flex space-x-2">
            <button
              className={`w-full p-1 px-2 rounded text-white  text-xs border ${
                selectedMode === "Fast"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedMode("Fast")}
            >
              Fast
            </button>
            <button
              className={`w-full p-1 px-2 rounded text-white  text-xs border ${
                selectedMode === "Quality"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedMode("Quality")}
            >
              Quality
            </button>
            <button
              className={`w-full p-1 px-2 rounded text-white  text-xs border ${
                selectedMode === "Ultra"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedMode("Ultra")}
            >
              Ultra
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-white text-sm">Image Dimensions</label>
          <div class="flex space-x-2">
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "landscape_4_3"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedDimension("landscape_4_3")}
            >
              4:3L
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "square_hd"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedDimension("square_hd")}
            >
              1:1
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "portrait_16_9"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedDimension("portrait_16_9")}
            >
              16:9P
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedDimension === "landscape_16_9"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedDimension("landscape_16_9")}
            >
              16:9L
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-white text-sm">Image Size</label>
          <div class="flex space-x-2">
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Small"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedSize("Small")}
            >
              Small
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Medium"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedSize("Medium")}
            >
              Medium
            </button>
            <button
              className={`w-full p-2 rounded text-white text-xs border ${
                selectedSize === "Large"
                  ? "border-[#c24dd4]"
                  : "border-white hover:border-[#c24dd4]"
              }`}
              onClick={() => setSelectedSize("Large")}
            >
              Large
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block mb-2 text-white text-sm"> Number of Images</label>
          <div class="flex space-x-2">
            {[1, 2, 3, 4].map((number) => (
              <button
                key={number}
                className={`w-full p-2 rounded text-white text-xs border ${
                  selectedNumber === number
                    ? "border-[#c24dd4]"
                    : "border-white hover:border-[#c24dd4]"
                }`}
                onClick={() => setSelectedNumber(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
        <div class="mb-6">
          <label class="block mb-2 text-white text-sm">
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
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#c24dd4] peer-focus:ring-2 peer-focus:ring-[#c24dd4] transition-colors duration-200"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-2 text-white text-xs">
              {safetyChecker === "true" ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        {/* <div className="mt-3">
          <div class="mb-4">
            <button class="w-full p-2 bg-black border border-gray-700 rounded text-white text-sm hover:bg-gray-600">
              Advanced Settings
            </button>
          </div>

          <div>
            <button class="w-full p-2 bg-black border border-gray-700 rounded text-white text-sm hover:bg-gray-600">
              Add to Collection
            </button>
          </div>
        </div> */}
      </div>
      {/* right container */}
      <div className="ml-[16.6667%] w-[83.3333%] h-screen overflow-y-auto p-4 flex flex-col items-center">
        <div className="bg-[#101622] w-3/4 h-36 border border-[#c24dd4] rounded-lg flex flex-col justify-between p-2 mb-4">
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
            <span className="text-gray-400 text-xs">{generatedData.date}</span>
          </div>
          <div className="mt-3 w-full">
            <div
              className="text-white text-sm truncate"
              title={generatedData.prompt}
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
                    <button onClick={() => downloadImage(image.url)}>
                      <img
                        src={download}
                        alt="Download"
                        className="w-4 h-4 filter invert"
                      />
                    </button>
                    <button onClick={() => openFullImage(image.url)}>
                      <img
                        src={zoom}
                        alt="Zoom"
                        className="w-5 h-5 filter invert"
                      />
                    </button>
                    <button onClick={() => upscaleImage(image.url)}>
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
                className="mt-3 w-full border border-[#c24dd4] rounded-lg p-2 mb-4"
              >
                <div className="flex justify-between items-center">
                  <div
                    className="text-white text-sm truncate"
                    title={item.prompt}
                  >
                    {item.prompt}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {item.image_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt="Generated"
                        className="w-300 h-300 object-cover hover:opacity-70"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-around items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => downloadImage(url)}>
                          <img
                            src={download}
                            alt="Download"
                            className="w-4 h-4 filter invert"
                          />
                        </button>
                        <button onClick={() => openFullImage(url)}>
                          <img
                            src={zoom}
                            alt="Zoom"
                            className="w-5 h-5 filter invert"
                          />
                        </button>
                        <button onClick={() => upscaleImage(url)}>
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
      </div>
    </div>
  );
};
