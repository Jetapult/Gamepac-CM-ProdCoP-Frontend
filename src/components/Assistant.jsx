import React, { useState, useEffect } from 'react';
import googlePlayIcon from '../assets/google-play_318-566073.avif';
import appleIcon from '../assets/icon_appstore__ev0z770zyxoy_large_2x.png';
import api from '../api';

const Assistant=()=>{

      const [selectedApp, setSelectedApp] = useState('google');
      const [selectedGame, setSelectedGame] = useState('');
      const [comments, setComments] = useState([]);
      const [replies, setReplies] = useState([]);
    
      const gameOptions = ['My Home Design: Makeover Games', 'Design Home Dream House Games', 'Smartphone Tycoon: Idle Phone ']; // Add your game options here
    
      const handleFetchComments = async () => {
        try {
          let commentSource;
          if (selectedApp === 'google') {
            // Fetch Google Play comments (You can add actual API call here)
            commentSource = [
              "Ads ads and more ads. At the start I loved this game. So much that I paid to go ad free. Well now instead of getting an ad aster every few rounds I get 3 ads that give me the option to skip after 5 secs. I get them after every game, on start up and then half of them crash the game. Total water off time and money. Don't bother.",
              "I am only interested in the design aspects of games like this. This game was fun in the beginning, but the decor items became too expensive by level 45 (after 3 completed rooms). I spent more time on the word challenges than renovations. My gems were also held hostage for real money. Uninstalling.",
              "Absolutely love this game. Only problem is that I've played all the levels so far and am waiting for new levels to be uploaded. Any news as to when this will happen?. Update: Changed to 5 star from 4 after your response of more levels soon :)",
            ];
          } else if (selectedApp === 'apple') {
            // Fetch App Store comments (You can add actual API call here)
            commentSource = [
              "I started to play the game and for 1-3 days the game worked fine. But now when I open the game, a back screen appears for a few seconds and then the game closes automatically whereas it is running in the background. But the game never opens. I tried to reinstall the game but same thing happs. I loved the game as I played for 1-2 days. Please fix this isssue. else the game is amazing and addictive.",
              "Challenging levels on the App Store. Help needed!",
              "Awesome game, I love it.",
            ];
          }
    
          setComments(commentSource.slice(0, 3));
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };
    
      const handleFetchReply = async (comment) => {
        try {
          const response = await api.post('/replyAssistant', {
            comment: comment,
          });
    
          const reply = response.data.reply;
          setReplies([...replies, { comment, reply, posted: false }]);
        } catch (error) {
          console.error('Error fetching reply:', error);
        }
      };
    
      const handlePostReply = (index) => {
        const updatedReplies = [...replies];
        updatedReplies[index].posted = true;
        setReplies(updatedReplies);
        // Call the post functionality here
      };
    
      return (
        <div className="container mt-10 mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-3xl font-semibold text-center mb-6">Reply Assistant</h1>
          <div className="flex justify-center space-x-10 mb-4">
  
            <button
             className={`bg-${selectedApp === 'google' ? '[#f58174]' : 'gray-500'} hover:bg-${selectedApp === 'google' ? 'bg-[#eaa399]' : 'gray-600'} text-white px-4 py-2 rounded transition-transform flex items-center ${selectedApp === 'google' ? 'scale-150' : ''}`}
             onClick={() => setSelectedApp('google')}
            >
            <img src={googlePlayIcon} alt="Google Play Icon" className="w-6 h-6 mr-2" inline /> Google Play
            </button>

          <button
            className={`bg-${selectedApp === 'apple' ? '[#f58174]' : 'gray-500'} hover:bg-${selectedApp === 'apple' ? 'bg-[#eaa399]' : 'gray-600'} text-white px-4 py-2 rounded transition-transform flex items-center ${selectedApp === 'apple' ? 'scale-150' : ''}`}
             onClick={() => setSelectedApp('apple')}
          >
          <img src={appleIcon} alt="Apple Play Icon" className="w-6 h-6 mr-2" />
            App Store
          </button>

          </div>
          <div className="flex space-x-4 mb-4">
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
          <div className="mb-4">
            <label className="font-semibold block">Select Game:</label>
            <select
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
            className="bg-[#f58174] hover:bg-[#eaa399] text-white px-4 py-2 rounded mb-4"
            onClick={handleFetchComments}
          >
            Fetch Comments
          </button>
          <div>
            {comments.map((comment, index) => (
              <div key={index} className="bg-gray-100 p-4 mb-2 rounded-md">
                <p>User: {comment}</p>
                {replies[index] && <p className="text-gray-600 mt-1">Assistant: {replies[index].reply}</p>}
                <div className="flex mt-2">
                  <button
                    className="bg-[#f58174] hover:bg-[#eaa399] text-white px-4 py-2 rounded mr-2"
                    onClick={() => handleFetchReply(comment)}
                  >
                    Ask Assistant
                  </button>
                 {replies[index] && !replies[index].posted && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => handlePostReply(index)}
                    >
                      Post
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    
export default Assistant;

