import React, { useState, useEffect } from "react";
import api from "../api";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Weaver = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [storyId, setStoryId] = useState(null);
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
  const handleModelChange = (model) => {
    setInputs((prev) => ({ ...prev, model }));
  };
  const isFormValid = () => {
    // Check if all fields are filled and a model is selected
    return Object.values(inputs).every((value) => value) && inputs.model;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.id) {
      alert("Please log in first");
      return;
    }
    if (!isFormValid()) {
      alert("Please fill all the fields and select a model.");
      return;
    }
    setIsLoading(true); // Step 2: Start loading
    try {
      // Assuming your backend endpoint is "/aiStories" and it's a POST request
      const requestBody = { ...inputs, userId: user.id };
      const response = await api.post("/aiStories", requestBody);
      console.log(response.data);
      setStoryId(response.data.storyId);
      // setStoryJSON(response.data.storyJSON);
    } catch (error) {
      console.error("Error generating story:", error);
    }
    setIsLoading(false); // Stop loading regardless of the outcome
  };
  return (
    <div className="container mx-auto px-4 my-10">
      <h1
        className="py-4
            text-4xl text-center font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        Story Weaver
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label htmlFor="theme" className="block text-gray-700 font-bold mb-2">
            Theme
          </label>
          <input
            type="text"
            name="theme"
            id="theme"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter theme"
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="c1"
                className="block text-gray-700 font-bold mb-2"
              >
                Character 1
              </label>
              <input
                type="text"
                name="c1"
                id="c1"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="First character"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="c2"
                className="block text-gray-700 font-bold mb-2"
              >
                Character 2
              </label>
              <input
                type="text"
                name="c2"
                id="c2"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Second character"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="numberOfClues"
                className="block text-gray-700 font-bold mb-2"
              >
                Number of Clues
              </label>
              <input
                type="number"
                name="numberOfClues"
                id="numberOfClues"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="numberOfParts"
                className="block text-gray-700 font-bold mb-2"
              >
                Number of Parts
              </label>
              <input
                type="number"
                name="numberOfParts"
                id="numberOfParts"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="userRole"
            className="block text-gray-700 font-bold mb-2"
          >
            User Role
          </label>
          <input
            type="text"
            name="userRole"
            id="userRole"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter user role"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="narratorRole"
            className="block text-gray-700 font-bold mb-2"
          >
            Narrator Role
          </label>
          <input
            type="text"
            name="narratorRole"
            id="narratorRole"
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter narrator role"
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => handleModelChange("openai")}
              className={`px-4 py-2 font-bold rounded ${
                inputs.model === "openai"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              GPT
            </button>
            <button
              type="button"
              onClick={() => handleModelChange("claude")}
              className={`px-4 py-2 font-bold rounded ${
                inputs.model === "claude"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Claude
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
      {isLoading && <p className="mt-4 text-center">Loading...</p>}
      {!isLoading && storyId && (
        <button
          className="mt-6 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => navigate(`/aiStories/${storyId}`)}
        >
          View Story
        </button>
      )}
    </div>
  );
};
export default Weaver;
