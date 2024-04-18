import React, { useState, useEffect } from "react";
import api from "../api";
import googlePlayIcon from "../assets/google-play_318-566073.avif";
import appleIcon from "../assets/icon_appstore__ev0z770zyxoy_large_2x.png";
import loadingIcon from "../assets/Spinner-1s-200px.svg";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const Smart = () => {
  const userData = useSelector((state) => state.user.user);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedApp, setSelectedApp] = useState("google");
  const [todos, setTodos] = useState([]);
  const [games, setGames] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const params = useParams();
  const studio_slug = params.studio_slug;

  const handleSmartActions = async () => {
    try {
      setIsLoading(true);

      if (!selectedApp) {
        alert("Please select an App"); // Alert if timeline is not selected for Google app
        return;
      }

      if (selectedApp === "google" && !selectedGame) {
        alert("Please select a Game"); // Alert if timeline is not selected for Google app
        return;
      }

      if (selectedApp === "apple" && !selectedGame) {
        alert("Please select a game."); // Alert if game is not selected for Apple app
        return;
      }
      const paramData = {
        current_page: 1,
        limit: 20,
        game_id: selectedGame.id,
      };
      if (startDate) {
        paramData.startDate = startDate;
      }
      if (endDate) {
        paramData.endDate = endDate;
      }

      const commentsResponse = await api.get(
        selectedApp === "apple"
          ? `/v1/organic-ua/fetch-app-store-reviews/${studio_slug || userData.studio_id}`
          : `/v1/organic-ua/google-reviews/${studio_slug || userData.studio_id}`,
        { params: paramData }
      );
      const comments = commentsResponse.data.data
        .map((comment) => selectedApp === "apple" ? comment.body : comment.comment)
        .join(" ");

      const response = await api.post("/smartTranscribe", {
        comments: comments,
        game: selectedGame,
      });

      const generatedSummary = response.data.summary;
      const todoItems = generatedSummary.split("\n\n");
      setTodos(todoItems);
      console.log(generatedSummary);
      // setResponse(generatedSummary);
      setResponse(
        `Generated Smart Actions for ${selectedGame}:\n${generatedSummary}`
      );
    } catch (error) {
      console.error("Error generating Smart Actions:", error);
    } finally {
      setIsLoading(false); // Reset loading state for Google button // Clear loading state
    }
  };

  const getGamesByStudioId = async () => {
    try {
      const games_response = await api.get(
        `/v1/games/studio/${
          studio_slug || userData.studio_id
        }?current_page=1&limit=50&game_type=${
          selectedApp === "apple" ? "appstore" : "playstore"
        }`
      );
      setGames(games_response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if(studio_slug) {
      getGamesByStudioId();
    }
  },[studio_slug])
  useEffect(() => {
    if (userData.studio_id && !studio_slug) {
      getGamesByStudioId();
    }
  }, [userData]);

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-semibold text-center mb-6">Smart Actions</h1>
      <form className="space-y-6">
        <div className="flex justify-center space-x-10">
          <button
            className={`bg-gray-500 text-white ${
              selectedApp === "google" ? "bg-red-400" : "hover:bg-red-400"
            } px-4 py-2 rounded transition-transform ${
              selectedApp === "google" ? "scale-150" : "hover:scale-150"
            } flex items-center`}
            type="button"
            onClick={() => setSelectedApp("google")}
          >
            <img
              src={googlePlayIcon}
              alt="Google Play Icon"
              className="w-5 h-5 mr-1 inline"
            />{" "}
            Google Play
          </button>
          <button
            className={`bg-gray-500 text-white ${
              selectedApp === "apple" ? "bg-red-400" : "hover:bg-red-400"
            } px-4 py-2 rounded transition-transform ${
              selectedApp === "apple" ? "scale-150" : "hover:scale-150"
            } flex items-center`}
            type="button"
            onClick={() => setSelectedApp("apple")}
          >
            <img
              src={appleIcon}
              alt="Apple Play Icon"
              className="w-5 h-5 mr-1 inline"
            />{" "}
            Apple Store
          </button>
        </div>
        <div className="mb-4">
          <label className="font-semibold block">Select Timeline:</label>
          <div className="flex">
            <div>
              <label className="font-semibold">Start Date:</label>
              <input
                type="date"
                className="border rounded p-2 mr-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold">End Date:</label>
              <input
                type="date"
                className="border rounded p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="game-select" className="font-semibold block">
            Select Game:
          </label>
          {/* {selectedApp === "google" ? (
            <select
              id="game-select"
              name="game-select"
              className="border rounded p-2 w-full"
              value={selectedGame ? selectedGame.name : ""}
              onChange={(e) => {
                const selectedGameName = e.target.value;
                const game = gameOptions.find(
                  (game) => game.name === selectedGameName
                );
                setSelectedGame(game);
              }}
              required
            >
              <option value="">Select a game</option>
              {gameOptions.map((game, index) => (
                <option key={index} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="border rounded p-2 w-full"
              value={selectedGame ? selectedGame.name : ""}
              onChange={(e) => {
                const selectedGameName = e.target.value;
                const game = appleGameOptions.find(
                  (game) => game.name === selectedGameName
                );
                setSelectedGame(game);
              }}
            >
              <option value="">Select a game</option>
              {appleGameOptions.map((game, index) => (
                <option key={index} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
          )} */}
          <select
            id="game-select"
            name="game-select"
            className="border rounded p-2 w-full"
            value={selectedGame ? selectedGame.game_name : ""}
            onChange={(e) => {
              const selectedGameName = e.target.value;
              const game = games.find(
                (game) => game.game_name === selectedGameName
              );
              setSelectedGame(game);
            }}
            required
          >
            <option value="">Select a game</option>
            {games.map((game, index) => (
              <option key={index} value={game.game_name}>
                {game.game_name} {game.short_names ? `(${game.short_names})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          className="bg-[#f58174] hover:bg-[#f26555] text-white px-6 py-3 rounded w-full"
          type="button"
          onClick={handleSmartActions}
        >
          {isLoading ? "Loading..." : "Get Smart Actions"}
        </button>
      </form>
      {isLoading ? (
        <div className="flex  items-center justify-center mt-3 ">
          <img src={loadingIcon} alt="Loading" className="w-12 h-12 mr-2" />
        </div>
      ) : (
        <div>
          {response && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Generated Actions:</h2>
              <div className="mt-4 mb-3">
                <h3 className="text-1xl font-bold mb-2">{selectedGame.name}</h3>
                <ul className="list-disc list-inside">
                  {todos.map((item, index) => (
                    <li key={index} className="mb-2 ">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Smart;
