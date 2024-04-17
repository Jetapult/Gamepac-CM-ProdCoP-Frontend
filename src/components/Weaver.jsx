import React, { useState } from "react";
import api from "../api";

const Weaver = () => {
  const [inputs, setInputs] = useState({
    theme: "",
    c1: "",
    c2: "",
    numberOfClues: "",
    numberOfParts: "",
    userRole: "",
    narratorRole: "",
    model: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Step 1: Add a loading state
  const [storyJSON, setStoryJSON] = useState(null);

  const [isLoadingMidjourney, setIsLoadingMidjourney] = useState(false);
  const [isLoadingWordLevels, setIsLoadingWordLevels] = useState(false);
  const [midjourneyPrompts, setMidjourneyPrompts] = useState([]);
  const [wordLevels, setWordLevels] = useState([]);

  const handleModelChange = (model) => {
    setInputs((prev) => ({ ...prev, model }));
  };
  const isFormValid = () => {
    // Check if all fields are filled and a model is selected
    return Object.values(inputs).every(value => value) && inputs.model;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill all the fields and select a model.");
      return;
    }
    setIsLoading(true); // Step 2: Start loading
    try {
      // Assuming your backend endpoint is "/aiStories" and it's a POST request
      const response = await api.post("/aiStories", inputs);
      setStoryJSON(response.data.storyJSON);
    } catch (error) {
      console.error("Error generating story:", error);
    }
    setIsLoading(false); // Stop loading regardless of the outcome
  };

  const handleGenerateMidjourneyPrompts = async () => {
    setIsLoadingMidjourney(true);
    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify({ storyParts: storyJSON.storyParts })], { type: 'application/json' });
      formData.append('jsonFile', blob, 'midjourneyPrompts.json');
  
      const response = await api.post("/generateMidjourneyPrompts", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMidjourneyPrompts(response.data.midjourneyPrompts); // Assuming the response structure
      setIsLoadingMidjourney(false);
      console.log(response);
      // Update your state or UI with the response
    } catch (error) {
      console.error("Error generating Midjourney prompts:", error);
    }
  };
  
  const handleGenerateWordLevels = async () => {
    setIsLoadingWordLevels(true);
    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify({ storyParts: storyJSON.storyParts })], { type: 'application/json' });
      formData.append('jsonFile', blob, 'wordLevels.json');
  
      const response = await api.post("/generateWordLevels", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setWordLevels(response.data.wordLevels); // Assuming the response structure
      setIsLoadingWordLevels(false);
      console.log(response);
      // Update your state or UI with the response
    } catch (error) {
      console.error("Error generating word levels:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 bg-white p-8 rounded-lg shadow">
  <form onSubmit={handleSubmit} className="space-y-6">
  <h2 className="text-2xl text-align-center font-bold mb-4">StoryWeaver</h2>
    <div>
      <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
      <input
        type="text"
        name="theme"
        id="theme"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        placeholder="Enter theme"
        onChange={handleChange}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="c1" className="block text-sm font-medium text-gray-700">Character 1</label>
        <input
          type="text"
          name="c1"
          id="c1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          placeholder="First color"
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="c2" className="block text-sm font-medium text-gray-700">Character 2</label>
        <input
          type="text"
          name="c2"
          id="c2"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          placeholder="Second color"
          onChange={handleChange}
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="numberOfClues" className="block text-sm font-medium text-gray-700">Number of Clues</label>
        <input
          type="number"
          name="numberOfClues"
          id="numberOfClues"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          placeholder="0"
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="numberOfParts" className="block text-sm font-medium text-gray-700">Number of Parts</label>
        <input
          type="number"
          name="numberOfParts"
          id="numberOfParts"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          placeholder="0"
          onChange={handleChange}
        />
      </div>
    </div>
    <div>
      <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">User Role</label>
      <input
        type="text"
        name="userRole"
        id="userRole"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        placeholder="Enter user role"
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="narratorRole" className="block text-sm font-medium text-gray-700">Narrator Role</label>
      <input
        type="text"
        name="narratorRole"
        id="narratorRole"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        placeholder="Enter narrator role"
        onChange={handleChange}
      />
    </div>
      <div className="flex justify-between my-4">
        <button
          type="button"
          onClick={() => handleModelChange('openai')}
          className={`px-4 py-2 text-white rounded focus:outline-none ${inputs.model === 'openai' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          GPT
        </button>
        <button
          type="button"
          onClick={() => handleModelChange('claude')}
          className={`px-4 py-2 text-white rounded focus:outline-none ${inputs.model === 'claude' ? 'bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
        >
          Claude
        </button>
      </div>
      <div className="flex justify-between">
      <button
        type="submit"
        name="model"
        value="openai"
        onClick={handleChange}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 blue-500 focus:ring-opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
          {/* Step 3: Display the loading indicator */}
          {isLoading && <p>Loading...</p>}
  
    {/* Display generated story parts */}
    {storyJSON && storyJSON.storyParts ? (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Generated Story:</h2>
        <div className="space-y-4">
          {storyJSON.storyParts.map((part, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold">Part {part.part}:</h3>
              <p>{part.narration}</p>
              {part.hiddenObjects && part.hiddenObjects.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Hidden Objects:</h4>
                  <ul className="list-disc list-inside">
                    {part.hiddenObjects.map((object, objIndex) => (
                      <li key={objIndex}>{object}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center ">
        {isLoadingMidjourney ? (
        <p>Loading Midjourney Prompts...</p>
      ) : (
        <button onClick={handleGenerateMidjourneyPrompts}   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 blue-500 focus:ring-opacity-50 flex space-around ">Generate Midjourney Prompts</button>
      )}

      {isLoadingWordLevels ? (
        <p>Loading Word Levels...</p>
      ) : (
        <button onClick={handleGenerateWordLevels}  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 blue-500 focus:ring-opacity-50  flex space-around">Generate Word Levels</button>
      )}
        </div>


      </div>
    ) : (
      <p>No story parts available to display.</p>
    )}
        {/* Displaying midjourney prompts */}
        {midjourneyPrompts.length > 0 && (
        <div>
          <h3>Midjourney Prompts:</h3>
          {midjourneyPrompts.map((level, index) => (
            <div key={index}>
              <h4>Part {level.part}:</h4>
              <p>{level.midjourneyPrompt}</p>
            </div>
          ))}
          {/* Render your midjourney prompts here */}
        </div>
      )}

      {/* Displaying word levels */}
      {wordLevels.length > 0 && (
        <div>
          <h3>Word Levels:</h3>
          {wordLevels.map((level, index) => (
            <div key={index}>
              <h4>Part {level.part}:</h4>
              <p>{level.wordLevel}</p>
            </div>
          ))}
        </div>
      )}
  </div>
  );
};

export default Weaver;
