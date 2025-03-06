import React, { useEffect, useState } from "react";
import api from "../../../api";
import moment from "moment";
import { ChevronRight, Copy, CheckIcon } from "lucide-react";
import TypewriterLoader from "../../../components/TypewriterLoader/TypewriterLoader";

const TextFieldWithCopy = ({ label, text, minHeight = "min-h-10" }) => {
  const [copied, setCopied] = useState(false);

  const cleanFormattingMarkers = (text) => {
    if (!text) return "";
    let cleanedText = text.replace(/\*\*/g, "");
    cleanedText = cleanedText.replace(/^"/, "");
    cleanedText = cleanedText.replace(/"$/, "");
    return cleanedText;
  };

  const handleCopyText = (text) => {
    const textToCopy = text ? String(text) : "";
    const cleanedText = cleanFormattingMarkers(textToCopy);

    navigator.clipboard
      .writeText(cleanedText)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const renderFormattedText = (text) => {
    if (!text) return "";

    const lines = text.split(/(?=- (?:\*\*)?[A-Z])/g);

    return (
      <div className="whitespace-pre-line">
        {lines.map((line, lineIndex) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
              {parts.map((part, partIndex) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  // Remove the ** markers and render as bold
                  const boldText = part.substring(2, part.length - 2);
                  return <span key={partIndex}>{boldText}</span>;
                }
                // Regular text
                return <span key={partIndex}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-2 mb-4 relative group">
      <div className="w-1/6 flex flex-col items-end">
        <p className="text-sm w-[150px] text-right">{label}</p>
      </div>
      <div
        className={`w-full ${minHeight} p-2 border border-gray-300 rounded-md`}
        placeholder="Enter your text here..."
      >
        {renderFormattedText(text)}
      </div>
      <div className="absolute top-2 right-2 flex items-center">
        {copied && (
          <span className="text-gray-500 text-md mr-2 flex items-center">
            <CheckIcon className="w-5 h-5 mr-1" /> Copied!
          </span>
        )}
        <span
          className={`cursor-pointer hidden group-hover:block ${
            copied ? "block" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleCopyText(text);
          }}
        >
          <Copy className="text-gray-500" />
        </span>
      </div>
    </div>
  );
};

const AsoTextGenerator = ({ selectedGame }) => {
  const [asoText, setAsoText] = useState([]);
  const [selectedAsoText, setSelectedAsoText] = useState({});
  const [showiteration, setShowiteration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousAsoText, setPreviousAsoText] = useState(null);

  const generateAsoText = async () => {
    try {
      setPreviousAsoText(selectedAsoText);
      setSelectedAsoText({});
      setIsGenerating(true);
      const payload = {
        game_id: parseInt(selectedGame?.id),
        studio_id: parseInt(selectedGame?.studio_id),
      };
      const asoTextresponse = await api.post(
        `/v1/aso-assistant/aso-texts`,
        payload
      );
      setAsoText((prev) => [asoTextresponse.data.data, ...prev]);
      setSelectedAsoText(asoTextresponse.data.data);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating Aso Text:", error);
      setSelectedAsoText(previousAsoText);
      setIsGenerating(false);
    }
  };

  const getAsoTextHistory = async () => {
    try {
      const asoTextHistoryResponse = await api.get(
        `/v1/aso-assistant/aso-texts/${selectedGame?.id}/history`
      );
      setAsoText(asoTextHistoryResponse.data.data);
      setSelectedAsoText(asoTextHistoryResponse.data.data[0]);
    } catch (error) {
      console.error("Error generating Aso Text:", error);
    }
  };

  useEffect(() => {
    if (selectedGame?.id) {
      getAsoTextHistory();
    }
  }, [selectedGame]);

  return (
    <div className="border border-gray-200 rounded-md p-4 w-[800px]">
      <h1 className="text-xl font-bold mb-4">App Store Optimization</h1>
      {selectedAsoText?.id && <div className="flex gap-2 mb-4">
        <div className="w-1/6 flex flex-col items-end">
          <p>Iteration</p>
        </div>
        <div className="w-1/3 relative">
          <div
            className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer ${
              showiteration ? "rounded-b-none" : ""
            }`}
            onClick={() => setShowiteration(!showiteration)}
          >
            <div className="flex items-center">
              <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
              <span>{moment(selectedAsoText?.created_at).format("YYYY-MM-DD, hh:mm A")}</span>
            </div>
            <ChevronRight
              className={`transform transition-transform duration-300 ${
                showiteration ? "rotate-90" : ""
              }`}
            />
          </div>
          <div
            className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out ${
              showiteration
                ? "max-h-[300px] opacity-100 mt-0"
                : "max-h-0 opacity-0 border-none"
            }`}
          >
            <div className="p-2 bg-white">
              {asoText.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
                    selectedAsoText?.id === item.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedAsoText(item)}
                >
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-2"></div>
                    <span>{moment(item?.created_at).format("YYYY-MM-DD, hh:mm A")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>}

      <div className="relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
              <TypewriterLoader />
              <p className="mt-2 text-gray-700">Generating ASO text...</p>
            </div>
          </div>
        )}

        <TextFieldWithCopy
          label="Long Description"
          text={selectedAsoText?.assets?.long_description}
          minHeight="min-h-20"
        />

        <TextFieldWithCopy
          label="Short Description"
          text={selectedAsoText?.assets?.short_description}
        />

        <TextFieldWithCopy
          label="Subtitle"
          text={selectedAsoText?.assets?.subtitle}
        />

        <TextFieldWithCopy
          label="Keywords"
          text={selectedAsoText?.assets?.keywords}
        />
      </div>

      <div className="text-end">
        {!isGenerating && (
          <button
            className="ml-auto bg-gradient-to-r from-[#b9ff66] to-[#84cc16] hover:from-[#84cc16] hover:to-[#4d7c0f] text-black font-medium py-2 px-6 rounded-md transition-colors"
            onClick={generateAsoText}
          >
            Generate
          </button>
        )}
      </div>
    </div>
  );
};

export default AsoTextGenerator;
