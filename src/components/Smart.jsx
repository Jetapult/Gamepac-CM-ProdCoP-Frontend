import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import googlePlayIcon from '../assets/google-play_318-566073.avif';
import appleIcon from '../assets/icon_appstore__ev0z770zyxoy_large_2x.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Smart=()=>{
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedApp, setSelectedApp] = useState('');
    const [todos, setTodos] = useState([]);

    const gameOptions = ['My Home Design: Makeover Games', 'Design Home Dream House Games', 'Smartphone Tycoon: Idle Phone ']; 
    const handleSmartActions = async (fileName) => {
      setSelectedApp(fileName);
      try {
        setIsLoading(true); // Set loading state
        let fileContent = '';
  
        if (fileName === 'apple') {
          // Read the content of the Apple text file
          fileContent = "Apple Store Reviews: - I started to play the game and for 1-3 days the game worked fine. But now when I open the game, a back screen appears for a few seconds and then the game closes automatically whereas it is running in the background. But the game never opens. I tried to reinstall the game but same thing happs. I loved the game as I played for 1-2 days. Please fix this isssue. else the game is amazing and addictive. - Awesome game, I love it.";
         
        } else if (fileName === 'google') {
          // Provide the content of the Google text file here
          fileContent = "Google Play Reviews: - Ads ads and more ads. At the start I loved this game. So much that I paid to go ad free. Well now instead of getting an ad aster every few rounds I get 3 ads that give me the option to skip after 5 secs. I get them after every game, on start up and then half of them crash the game. Total water off time and money. Don't bother. -I like this bc it's a word game instead of yet another match-3. I dislike how few points you earn for each level. It takes forever to earn enough to buy items, to the point where I lose interest in playing. Also it's another design game that only works if you choose all #1 decor choices, all #2, etc. so the room matches. Earning gems is pointless, we should be able to earn hints instead.-This started out fun because I was sick of match three games and it was different. It takes way too long to get anywhere because one puzzle earns you basically nothing and it takes forever to finish one design. I am deleting it now. Sad because I really enjoy the concept.-I love not having to put up with sinful ads. I can play as long as i wish without taking my own money to play. All the other games could benifit from you who created this game for people and not in it for just the money. I salute you. Only thing im having a hard time getting double my rewards. Lol there isnt an ad when u do need it.-I am only interested in the design aspects of games like this. This game was fun in the beginning, but the decor items became too expensive by level 45 (after 3 completed rooms). I spent more time on the word challenges than renovations. My gems were also held hostage for real money. Uninstalling.-Absolutely love this game. Only problem is that I've played all the levels so far and am waiting for new levels to be uploaded. Any news as to when this will happen?. Update: Changed to 5 star from 4 after your response of more levels soon :)";
         // Add your content here
        }
  
        const response = await api.post('/smartTranscribe', { comments: fileContent, game: selectedGame,});
  
        const generatedSummary = response.data.summary;
        const todoItems = generatedSummary.split('\n\n');
        setTodos(todoItems);
        console.log(generatedSummary);
        // setResponse(generatedSummary);
        setResponse(`Generated Smart Actions for ${selectedGame}:\n${generatedSummary}`);

      } catch (error) {
        console.error('Error generating Smart Actions:', error);
      } finally {
        setIsLoading(false); // Reset loading state for Google button // Clear loading state
      }
    };
    return(
        <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-semibold text-center mb-6">Smart Actions</h1>
        <form className="space-y-6">
          <div className="flex justify-center space-x-10">
             <button
        className={`bg-gray-500 text-white ${
          selectedApp === 'google' ? 'bg-red-400' : 'hover:bg-red-400'
        } px-4 py-2 rounded transition-transform ${
          selectedApp === 'google' ? 'scale-150' : 'hover:scale-150'
        } flex items-center`}
        type="button"
        onClick={() => handleSmartActions('google')}
      >
        <img src={googlePlayIcon} alt="Google Play Icon" className="w-5 h-5 mr-1 inline" /> Google Play
      </button>
      <button
        className={`bg-gray-500 text-white ${
          selectedApp === 'apple' ? 'bg-red-400' : 'hover:bg-red-400'
        } px-4 py-2 rounded transition-transform ${
          selectedApp === 'apple' ? 'scale-150' : 'hover:scale-150'
        } flex items-center`}
        type="button"
        onClick={() => handleSmartActions('apple')}
      >
        <img src={appleIcon} alt="Apple Play Icon" className="w-5 h-5 mr-1 inline" /> Apple Store
      </button>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="start-date" className="font-semibold block">
                Start Date:
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="end-date" className="font-semibold block">
                End Date:
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className="border rounded p-2 w-full"
              />
            </div>
          </div>
          <div className="flex-1">
    <label htmlFor="game-select" className="font-semibold block">
      Select Game:
    </label>
    <select
      id="game-select"
      name="game-select"
      className="border rounded p-2 w-full"
      value={selectedGame}
      onChange={(e) => setSelectedGame(e.target.value)}
    >
      <option value="">Select a game</option>
      {gameOptions.map((game, index) => (
        <option key={index} value={game}>
          {game}
        </option>
      ))}
    </select>
  </div>
        <button
          className="bg-[#f58174] hover:bg-[#eaa399] text-white px-6 py-3 rounded w-full"
          type="button"
        >
          {isLoading ? 'Loading...' : 'Smart Actions'}
        </button>
      </form>
      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Generated Actions:</h2>
          {/* <p>{response}</p> */}
          <div className="mt-4 mb-3">
    <h3 className="text-1xl font-bold mb-2">{selectedGame}</h3>
    <ul className="list-disc list-inside">
      {todos.map((item, index) => (
        <li key={index} className="mb-2 flex items-center">
          <label htmlFor={`todo-${index}`} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={`todo-${index}`}
              className="form-checkbox text-red-600 mr-2"
            />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
    </div>
        </div>
      )}
      </div>

  );
};

export default Smart;


