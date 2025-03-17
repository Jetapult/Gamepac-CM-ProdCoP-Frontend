import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

const StoryPage = () => {
  const { id } = useParams();
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [midjourneyPrompts, setMidjourneyPrompts] = useState([]);
  const [wordLevels, setWordLevels] = useState([]);
  const [fileLink, setFileLink] = useState(null);
  const [isLoadingMidjourney, setIsLoadingMidjourney] = useState(false);
  const [isLoadingWordLevels, setIsLoadingWordLevels] = useState(false);
  const [generatedJSONLink, setGeneratedJSONLink] = useState(null);
  const [selectedWordLevels, setSelectedWordLevels] = useState([]);

  useEffect(() => {
    const fetchStoryData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/aiStories/${id}`);
        setStoryData(response.data);
      } catch (error) {
        console.error("Error fetching story data:", error);
      }
      setIsLoading(false);
    };
    fetchStoryData();
  }, [id]);

  useEffect(() => {
    if (storyData) {
      const { prompts, word_levels, file_link } = storyData;
      setMidjourneyPrompts(prompts || []);
      setWordLevels(word_levels || []);
      setFileLink(file_link || null);
    }
  }, [storyData]);

  const handleGenerateMidjourneyPrompts = async () => {
    setIsLoadingMidjourney(true);
    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(storyData.story_json)], {
        type: "application/json",
      });
      formData.append("jsonFile", blob, "midjourneyPrompts.json");
      formData.append("storyId", storyData.id);

      const response = await api.post("/generateMidjourneyPrompts", formData);
      setMidjourneyPrompts(response.data.midjourneyPrompts);
      setIsLoadingMidjourney(false);
    } catch (error) {
      console.error("Error generating Midjourney prompts:", error);
    }
  };

  const handleGenerateWordLevels = async () => {
    setIsLoadingWordLevels(true);
    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(storyData.story_json)], {
        type: "application/json",
      });
      formData.append("jsonFile", blob, "wordLevels.json");
      formData.append("storyId", storyData.id);

      const response = await api.post("/generateWordLevels", formData);
      setWordLevels(response.data.wordLevels);
      setIsLoadingWordLevels(false);
    } catch (error) {
      console.error("Error generating word levels:", error);
    }
  };
  const formatSelectedWordLevels = () => {
    const formattedWordLevels = {};

    selectedWordLevels.forEach((levelString) => {
      const [part, wordLevelString] = levelString.split(": ");
      const words = wordLevelString.split(", ");

      const originalHint = `Level ${part}`;
      const translatedHint = `Level ${part}`;

      console.log(words);
      const maxWordLength = Math.max(...words.map((word) => word.length));
      const rowSize = maxWordLength + 2;
      const columnSize = maxWordLength + 1;

      formattedWordLevels[part] = [
        { original_hint: originalHint, translated_hint: translatedHint, words },
        words.length,
        rowSize,
        columnSize,
      ];
    });

    return formattedWordLevels;
  };
  const handleWordLevelSelection = (level) => {
    const levelString = `${level.part}: ${level.wordLevel}`;
    const index = selectedWordLevels.indexOf(levelString);

    if (index > -1) {
      setSelectedWordLevels((prevLevels) =>
        prevLevels.filter((_, i) => i !== index)
      );
    } else {
      setSelectedWordLevels((prevLevels) => [...prevLevels, levelString]);
    }
  };

  const handleGenerateJSON = async () => {
    try {
      const formattedWordLevels = formatSelectedWordLevels();
      console.log("formattedWordLevels",formattedWordLevels);
      const response = await api.post("/generateJSON", {
        storyId: storyData.id,
        formattedWordLevels,
      });
      setGeneratedJSONLink(response.data.download_url);
    } catch (error) {
      console.error("Error generating JSON:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!storyData) {
    return <div>No story data found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
        Story Details
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-lg font-semibold">Theme:</p>
          <p>{storyData.theme}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Character 1:</p>
          <p>{storyData.character_1}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Character 2:</p>
          <p>{storyData.character_2}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Number of Clues:</p>
          <p>{storyData.number_of_clues}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Number of Parts:</p>
          <p>{storyData.number_of_parts}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">User Role:</p>
          <p>{storyData.user_role}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Narrator Role:</p>
          <p>{storyData.narrator_role}</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Story Parts</h2>
        {storyData.story_json.storyParts.map((part, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-md shadow-md mb-4"
          >
            <h3 className="text-xl font-semibold mb-2">Part {part.part}</h3>
            <p>{part.narration}</p>
          </div>
        ))}
      </div>
      {midjourneyPrompts && midjourneyPrompts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Midjourney Prompts</h2>
          <ul className="list-disc list-inside">
            {midjourneyPrompts.map((promptObj, index) => (
              <li key={index} className="mb-2">
                {promptObj.prompt}
              </li>
            ))}
          </ul>
        </div>
      )}
      {wordLevels && wordLevels.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Word Levels</h2>
          {wordLevels.map((level, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedWordLevels.includes(
                  `${level.part}: ${level.wordLevel}`
                )}
                onChange={() => handleWordLevelSelection(level)}
                className="mr-2"
              />
              <label>
                {level.part}: Level {level.wordLevel}
              </label>
            </div>
          ))}
        </div>
      )}
      <div className="mb-8">
        <button
          onClick={handleGenerateMidjourneyPrompts}
          disabled={isLoadingMidjourney}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
        >
          {isLoadingMidjourney
            ? "Generating Prompts..."
            : "Generate Midjourney Prompts"}
        </button>
        <button
          onClick={handleGenerateWordLevels}
          disabled={isLoadingWordLevels}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoadingWordLevels
            ? "Generating Word Levels..."
            : "Generate Word Levels"}
        </button>
      </div>
      {selectedWordLevels.length > 0 && (
        <div className="mb-8">
          <button
            onClick={handleGenerateJSON}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Generate JSON
          </button>
        </div>
      )}
      {generatedJSONLink && (
        <div className="mb-8">
          <a
            href={generatedJSONLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-700"
          >
            Download Generated JSON
          </a>
        </div>
      )}
      {fileLink && (
        <div>
          <a
            href={fileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-700"
          >
            Download Story JSON
          </a>
        </div>
      )}
    </div>
  );
};

export default StoryPage;