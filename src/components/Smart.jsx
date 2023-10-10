import React, { useState, useEffect } from 'react';
import api from '../api';
import googlePlayIcon from '../assets/google-play_318-566073.avif';
import appleIcon from '../assets/icon_appstore__ev0z770zyxoy_large_2x.png'

const Smart=()=>{
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedApp, setSelectedApp] = useState('');
    const [todos, setTodos] = useState([]);

    const gameOptions = [
      { name: 'My Home Design: Makeover Games', packageName: 'com.holycowstudio.my.home.design.makeover.games.dream.word.redecorate.masters.life.house.decorating' },
      { name: 'Design Home Dream House Games', packageName: 'com.holycowstudio.my.design.home.makeover.word.house.life.games.mansion.decorate.decor.masters' },
      { name: 'Design My Home: Makeover Games', packageName: 'com.holycowstudio.design.my.home.makeover.word.life' },
      { name: 'Home Design Dreams house games', packageName: 'com.holycowstudio.homedesigndreams' },
      { name: 'Video Game Tycoon idle clicker', packageName: 'com.holycowstudio.gamedevtycoon' },
      { name: 'My Home Design: Makeover Games', packageName: 'com.holycowstudio.my.home.design.makeover.games.dream.word.redecorate.masters.life.house.decorating' },
      { name: 'Smartphone Tycoon: Idle Phone', packageName: 'com.ns.idlesmartphonetycoon' },
      { name: 'My Home Design: My House Games', packageName: 'com.holycowstudio.my.home.design.makeover.luxury.interiors.word.dream.million.dollar.house.renovation' },
      { name: 'Tube Tycoon - Tubers Simulator', packageName: 'com.theholycowstudio.youtubertycoon' },
      { name: 'Hotel Tycoon Empire: Idle game', packageName: 'com.holycowstudio.idle.hotel.tycoon.clicker.tap.empire.incremental.games' },
      { name: 'Oil Tycoon 2: Idle Miner Game', packageName: 'com.holycowstudio.oiltycoon2' },
      { name: 'Idle Cafe Tycoon: Coffee Shop', packageName: 'com.holycowstudio.coffeetycoon' },
      { name: 'Mystery Island lost magic city', packageName: 'com.holycowstudio.mystery.island.design.match.decoration.lost.adventure' },
      { name: 'Oil Tycoon idle tap miner game', packageName: 'com.romit.sheikhoiltycoon' },
      { name: 'Cat Home Design: Makeover Game', packageName: 'com.holycowstudio.designyourcatroom' },
    ];
    const appleGameOptions = [
      { name: 'My Home Design Makeover Games', appId: '1613281084' },
      { name: 'My Home Design: Makeover Games', appId: '1665012099' },
      { name: 'My Home Design Luxury Makeover', appId: '1577895438' },
      { name: 'My Design Home Makeover: Words', appId: '1548087220' },
      { name: 'Hotel Tycoon Empire: Idle Game', appId: '1466034711' },
      { name: 'My Home Makeover Design: Words', appId: '1533382410' },
      { name: 'Design My Home Makeover: Words', appId: '1513798819' },
      { name: 'Mystery Island: Decor & Match3', appId: '1506174960' },
      { name: 'My Home Makeover: Dream Design', appId: '1481534752' },
      { name: 'Cat Home Design: Kitten House', appId: '1390206308' },
      { name: 'Smartphone Tycoon: Idle Empire', appId: '1429667316' },
      { name: 'My Room Design: Your Home 2019', appId: '1444542924' },
      { name: 'Oil Tycoon 2: Idle Empire Game', appId: '1441938955' },
      { name: 'Home Design Dreams: Your House', appId: '1432729968' },
      { name: 'Cafe Tycoon: Idle Empire Story', appId: '1294573637' }
    ];
    const handleSmartActions = async () => {
      try {
        setIsLoading(true); // Set loading state
        let fileContent = '';
  
        if (selectedApp === 'apple') {
           const response =await api.post('/fetchAppleComments',{appId: selectedGame.appId});
            console.log(response.data);
            const comments = response.data.data.map((comment) => ({
              userName: comment.attributes.reviewerNickname,
              userRating: comment.attributes.rating,
              comment: comment.attributes.body,
              date: new Date(comment.attributes.createdDate).toLocaleDateString('en-GB'),
              reply: null,
            }));
               // Read the content of the Apple text file
            fileContent = comments.map((comment) => comment.comment).join(' ');
        } else if (selectedApp === 'google') {
          // Provide the content of the Google text file here
          // fileContent = "Google Play Reviews: - Ads ads and more ads. At the start I loved this game. So much that I paid to go ad free. Well now instead of getting an ad aster every few rounds I get 3 ads that give me the option to skip after 5 secs. I get them after every game, on start up and then half of them crash the game. Total water off time and money. Don't bother. -I like this bc it's a word game instead of yet another match-3. I dislike how few points you earn for each level. It takes forever to earn enough to buy items, to the point where I lose interest in playing. Also it's another design game that only works if you choose all #1 decor choices, all #2, etc. so the room matches. Earning gems is pointless, we should be able to earn hints instead.-This started out fun because I was sick of match three games and it was different. It takes way too long to get anywhere because one puzzle earns you basically nothing and it takes forever to finish one design. I am deleting it now. Sad because I really enjoy the concept.-I love not having to put up with sinful ads. I can play as long as i wish without taking my own money to play. All the other games could benifit from you who created this game for people and not in it for just the money. I salute you. Only thing im having a hard time getting double my rewards. Lol there isnt an ad when u do need it.-I am only interested in the design aspects of games like this. This game was fun in the beginning, but the decor items became too expensive by level 45 (after 3 completed rooms). I spent more time on the word challenges than renovations. My gems were also held hostage for real money. Uninstalling.-Absolutely love this game. Only problem is that I've played all the levels so far and am waiting for new levels to be uploaded. Any news as to when this will happen?. Update: Changed to 5 star from 4 after your response of more levels soon :)";
         // Add your content here
         const response = await api.post('/fetchComments', { packageName: selectedGame.packageName });
         const comments = response.data.map(commentObj => commentObj.comment);
         fileContent = comments.join(' ');
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
        onClick={() => setSelectedApp('google')}
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
        onClick={() => setSelectedApp('apple')}
      >
        <img src={appleIcon} alt="Apple Play Icon" className="w-5 h-5 mr-1 inline" /> Apple Store
      </button>
          </div>
          {/* <div className="flex space-x-4">
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
          </div> */}
          <div className="flex-1">
    <label htmlFor="game-select" className="font-semibold block">
      Select Game:
    </label>
    {selectedApp === 'google' ? (
    <select
  id="game-select"
  name="game-select"
  className="border rounded p-2 w-full"
  value={selectedGame ? selectedGame.name : ''}
  onChange={(e) => {
    const selectedGameName = e.target.value;
    const game = gameOptions.find((game) => game.name === selectedGameName);
    setSelectedGame(game);
  }}
>
  <option value="">Select a game</option>
  {gameOptions.map((game, index) => (
    <option key={index} value={game.name}>
      {game.name}
    </option>
  ))}
</select> ):
( <select
              className="border rounded p-2 w-full"
              value={ selectedGame? selectedGame.name : ''}
              onChange={(e) =>{
                const selectedGameName=e.target.value;
                const game=appleGameOptions.find((game)=>game.name===selectedGameName);
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
)}
  </div>
        <button
          className="bg-[#f58174] hover:bg-[#eaa399] text-white px-6 py-3 rounded w-full"
          type="button"
          onClick={handleSmartActions}
        >
          {isLoading ? 'Loading...' : 'Smart Actions'}
        </button>
      </form>
      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Generated Actions:</h2>
          {/* <p>{response}</p> */}
          <div className="mt-4 mb-3">
    <h3 className="text-1xl font-bold mb-2">{selectedGame.name}</h3>
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


