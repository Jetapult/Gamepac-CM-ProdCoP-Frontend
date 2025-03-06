import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  X,
  Plus,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import api from "../../../api";
import TypewriterLoader from "../../../components/TypewriterLoader/TypewriterLoader";
import moment from "moment";

const AdCopyGenerator = ({ game }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adCopiesCount, setAdCopiesCount] = useState(3);
  const [includeHeadlines, setIncludeHeadlines] = useState(true);
  const [adCopyStyles, setAdCopyStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [adCopies, setAdCopies] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedItem, setCopiedItem] = useState({ index: null, type: null });
  const [generatedCopies, setGeneratedCopies] = useState([]);

  const handleIncrement = () => {
    if (adCopiesCount < 10) {
      setAdCopiesCount(adCopiesCount + 1);
    }
  };

  const handleDecrement = () => {
    if (adCopiesCount > 1) {
      setAdCopiesCount(adCopiesCount - 1);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectADStyle = (tone) => {
    setSelectedStyle(tone);
    setIsDropdownOpen(false);
  };

  const handleCopyText = (text, index, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedItem({ index, type });
        setTimeout(() => {
          setCopiedItem({ index: null, type: null });
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      const payload = {
        game_id: game.id,
        studio_id: game.studio_id,
        style: selectedStyle.value,
        language: "en",
        quantity: adCopiesCount,
        include_headlines: includeHeadlines,
      };

      const response = await api.post("/v1/aso-assistant/ad-copies", payload);

      const data = response.data.data;
      setGeneratedCopies(data?.assets);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating ad copies:", error);
      setIsGenerating(false);
    }
  };

  const getAdCopyStyles = async () => {
    try {
      const response = await api.get("v1/aso-assistant/ad-copy-styles");
      const data = response.data.data;
      setAdCopyStyles(data);
    } catch (error) {
      console.error("Error fetching ad copy styles:", error);
    }
  };

  const getAdCopies = async () => {
    try {
      const response = await api.get(
        `/v1/aso-assistant/ad-copies/${game.id}/history`
      );
      const data = response.data.data;
      setAdCopies(data);
    } catch (error) {
      console.error("Error fetching ad copies:", error);
    }
  };

  useEffect(() => {
    getAdCopyStyles();
    getAdCopies();
  }, []);

  return (
    <div className="w-full max-w-[800px]">
      {generatedCopies?.length > 0 && (
        <div className="text-center">
          <h1 className="text-xl font-bold mb-6 text-center">
            Your new ad copies are ready!
          </h1>
          <div className="grid grid-cols-1 w-1/2 mx-auto gap-6">
            {generatedCopies?.map((copy, index) => (
              <CopyCard
                copy={copy}
                index={index}
                key={index}
                handleCopyText={handleCopyText}
                copiedItem={copiedItem}
              />
            ))}
          </div>
          <button
            className="my-4 bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black font-medium py-2 px-6 rounded-md transition-colors"
            onClick={() => {
              setAdCopies((prev) => [...generatedCopies, ...prev]);
              setGeneratedCopies([]);
            }}
          >
            Got it
          </button>
        </div>
      )}
      <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm relative mb-8">
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-md">
            <div className="flex flex-col items-center">
              <TypewriterLoader className="w-10 h-10 text-[#b9ff66] animate-spin" />
              <p className="mt-2 text-gray-700">Generating ad copies...</p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold mb-6">Generate new ad copies</h1>

        <div className="border-t border-gray-200 pt-4 pb-4">
          <div className="flex items-start mb-6">
            <div className="relative w-full max-w-md">
              <div
                className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer ${
                  isDropdownOpen ? "rounded-b-none" : ""
                }`}
                onClick={toggleDropdown}
              >
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
                  <span>{selectedStyle?.name || "Choose Style"}</span>
                </div>
                <ChevronRight
                  className={`transform transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </div>

              <div
                className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out ${
                  isDropdownOpen
                    ? "max-h-[300px] opacity-100 mt-0"
                    : "max-h-0 opacity-0 border-none"
                }`}
              >
                <div className="p-2 bg-white">
                  {adCopyStyles?.map((tone) => (
                    <div
                      key={tone.id}
                      className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
                        selectedStyle?.id === tone.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => selectADStyle(tone)}
                    >
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-2"></div>
                        <span>{tone.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center ml-4">
              <X className="text-gray-400 mr-2" size={18} />
              <span className="text-gray-700 mr-2">AMOUNT OF AD COPIES</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                  onClick={handleDecrement}
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 py-1">{adCopiesCount}</span>
                <button
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                  onClick={handleIncrement}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={includeHeadlines}
                  onChange={() => setIncludeHeadlines(!includeHeadlines)}
                />
                <div
                  className={`w-5 h-5 border rounded ${
                    includeHeadlines
                      ? "bg-[#b9ff66] border-[#84cc16]"
                      : "border-gray-300"
                  }`}
                >
                  {includeHeadlines && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-[#4d7c0f] mx-auto"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-2 text-gray-700">Include headlines</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 flex justify-end">
          {selectedStyle?.id ? (
            <button
              className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] hover:from-[#84cc16] hover:to-[#4d7c0f] text-black font-medium py-2 px-6 rounded-md transition-colors"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          ) : (
            <>
              <button
                className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black font-medium py-2 px-6 rounded-md transition-colors opacity-50"
                data-tooltip-id="my-tooltip-1"
              >
                Generate
              </button>
              <ReactTooltip
                id="my-tooltip-1"
                place="bottom"
                className=""
                content="Pick a style first"
              />
            </>
          )}
        </div>
      </div>

      {adCopies?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adCopies?.map((copy, index) => (
            <CopyCard
              copy={copy}
              index={index}
              key={index}
              handleCopyText={handleCopyText}
              copiedItem={copiedItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CopyCard = ({ copy, handleCopyText, copiedItem, index }) => {
  return (
    <div className="relative border rounded-md bg-white shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#b9ff66] to-[#84cc16]"></div>

      <div className="p-4 border-b border-gray-100 relative group ml-1">
        <button
          className="text-gray-400 hover:text-gray-600 p-1 absolute top-2 right-2"
          data-tooltip-id={`copy-${copy?.id}`}
        >
          <Info size={18} />
        </button>
        <ReactTooltip
          id={`copy-${copy?.id}`}
          place="bottom"
          className=""
          content={`${copy.style}\n
        ${moment(copy.created_at).format("DD/MM/YYYY, hh:mmA")}`}
        />
        <div className="flex items-center mb-2">
          <span className="bg-[#f0f9ff] text-[#0369a1] text-sm px-3 py-1 rounded-md inline-block font-medium">Copy</span>
          <div className="hidden group-hover:flex items-center pl-3">
            {copiedItem.index === index && copiedItem.type === "body" ? (
              <span className="text-[#4d7c0f] text-sm mr-2 flex items-center">
                <Check size={14} className="mr-1" /> Copied
              </span>
            ) : (
              <button
                className="text-gray-400 hover:text-[#84cc16]"
                onClick={() => handleCopyText(copy.body, index, "body")}
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-800">{copy.body}</p>
      </div>

      {copy.headline && (
        <div className="p-4 bg-gray-50 relative group ml-1">
          <div className="flex items-center mb-2">
            <div className="bg-[#e9f5d1] text-[#4d7c0f] px-3 py-1 rounded-md inline-block text-sm font-medium">
              Headline
            </div>
            <div className="hidden group-hover:flex items-center pl-3">
              {copiedItem.index === index && copiedItem.type === "headline" ? (
                <span className="text-[#4d7c0f] text-sm mr-2 flex items-center">
                  <Check size={14} className="mr-1" /> Copied
                </span>
              ) : (
                <button
                  className="text-gray-400 hover:text-[#84cc16]"
                  onClick={() =>
                    handleCopyText(copy.headline, index, "headline")
                  }
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-800 font-medium">{copy.headline}</p>
        </div>
      )}

      {/* <div className="flex justify-end p-2 bg-gray-50 border-t border-gray-100 ml-1">
    <button className="text-gray-400 hover:text-gray-600 p-1">
      <ThumbsDown size={18} />
    </button>
    <button className="text-gray-400 hover:text-gray-600 p-1 mx-1">
      <ThumbsUp size={18} />
    </button>
    <button className="text-gray-400 hover:text-gray-600 p-1">
      <Info size={18} />
    </button>
  </div> */}
    </div>
  );
};

export default AdCopyGenerator;
