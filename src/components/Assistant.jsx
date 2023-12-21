import React, { useState, useEffect } from 'react';
import googlePlayIcon from '../assets/google-play_318-566073.avif';
import appleIcon from '../assets/icon_appstore__ev0z770zyxoy_large_2x.png';
import api from '../api';
import axios from 'axios';
import loadingIcon from '../assets/Spinner-1s-200px.svg'

const Assistant=()=>{

      const [selectedApp, setSelectedApp] = useState('google');
      const [selectedGame, setSelectedGame] = useState(null);
      const [selectedTimeline,setSelectedTimeline]=useState('');
      const [comments, setComments] = useState([]);
      const [replies, setReplies] = useState([]);
      const [loading, setLoading] = useState(false);
      const [loadingReplyIndex, setLoadingReplyIndex] = useState(null);
      const [filteredComments,setFilteredComments]=useState([]);
      const [posting,setPosting]=useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [editingIndex, setEditingIndex] = useState(null);
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
      
      const handleFetchComments = async () => {
        try { 
          setLoading(true);
          let response;
          if (selectedApp === 'google') {
            response = await api.post('/fetchComments', { packageName: selectedGame.packageName });
          } else if (selectedApp === 'apple') {
            response = await api.post('/fetchAppleComments', { appId: selectedGame.appId});
          }
          const comments = formatComments(response.data);
          setComments(comments);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching comments:', error);
          setLoading(false);
        }
      };
      
      const formatComments = (data) => {
        if (selectedApp === 'google') {
          return data.map(comment => {
            let formattedComment;
            if (comment.originalLang) {
              formattedComment = {
                ...comment,
                comment: comment.originalLang,
                translatedComment: comment.comment,
                reviewId: comment.reviewId, // Store the reviewId

              };
            } else {
              formattedComment = {
                ...comment,
                translatedComment: null,
                reviewId: comment.reviewId, // Store the reviewId

              };
            }
            return formattedComment;
          });
          // return data.map(comment => ({ ...comment, reply: null }));
        } else if (selectedApp === 'apple') {
          return data.data.map((comment) => ({
            userName: comment.attributes.reviewerNickname,
            userRating: comment.attributes.rating,
            comment: comment.attributes.body,
            date: new Date(comment.attributes.createdDate).toLocaleDateString('en-GB'),
            reviewId: comment.id,
            reply: null,
          }));
        }
      };
      
    
      const handleFetchReply = async (comment, index) => {
        try {
          setLoadingReplyIndex(index);
          const response = await api.post('/replyAssistant', {
            comment: comment.comment,
          });
          const reply = response.data.reply;
    setComments(prevComments => {
      const newComments = [...prevComments];
      newComments[index] = { ...newComments[index], reply };
      return newComments;
    });
    setLoadingReplyIndex(null);
          // setReplies([...replies, { comment, reply, posted: false }]);
        } catch (error) {
          console.error('Error fetching reply:', error);
          setLoadingReplyIndex(null);
        }
      };
    
      const handlePostReply = async (index) => {
        if(selectedApp==='google')
        {
          setPosting(true);
        const comment = comments[index];
        const { reviewId, reply } = comment;        // Get the reviewId and reply
         const packageName = selectedGame.packageName; // Get the selected game's package name
         console.log(reviewId,packageName,reply);
         // Call the post functionality here, including the reviewId, packageName, and reply
         try {
           // Call the post functionality here, including the reviewId, packageName, and reply
           const response = await api.post('/postReply', {
             reviewId: reviewId,
             packageName: packageName,
             reply: reply,
           });
           // Display the response
           console.log(response.data);
           setPosting(false);
         } catch (error) {
           // Handle the error
           console.error('Error posting reply:', error);
           setPosting(false);
         }
        }
         else if (selectedApp === 'apple') {
         {  setPosting(true);
          const comment = comments[index];
         const { reviewId, reply } = comment;        // Get the reviewId and reply for the apple comment
         console.log(reviewId,reply);
         // Call the post functionality here, including the reviewId, packageName, and reply
         try {
           // Call the post functionality here, including the reviewId, packageName, and reply
           const response = await api.post('/postAppleReply', {
             reviewId: reviewId,
             reply: reply,
           });
           // Display the response
           console.log(response.data);
           setPosting(false);
         }catch (error) {
          // Handle the error
          console.error('Error posting reply:', error);
          setPosting(false);
        }
      }
    }


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
          <div className="mb-4">
          <label className="font-semibold block">Select Timeline:</label>
          {selectedApp=='google'?(
         
         <select 
         name="google-dropdown" id="" className="border rounded p-2 w-full"
         onChange={(e)=>setSelectedTimeline(e.target.value)}>
         <option value="week"> Weekly </option>
         <option value="all">All Time</option>
         </select>
          ):(
            <select name="google-dropdown" id="" className="border rounded p-2 w-full"
            onChange={(e)=>setSelectedTimeline(e.target.value)}>
            <option value="all">All Time</option>
            <option value="week"> Last Week</option>
            <option value="month"> Last Month</option>
            <option value="3-months"> Last 3 Months</option>
            </select>
            
          )}
          </div>
          <div className="mb-4">
            <label className="font-semibold block">Select Game:</label>
            {selectedApp === 'google' ? (
            <select
              className="border rounded p-2 w-full"
              value={selectedGame? selectedGame.name : ''}
              onChange={(e) =>{
                const selectedGameName=e.target.value;
                const game=gameOptions.find((game)=>game.name===selectedGameName);
                setSelectedGame(game);
                }}
            >
              <option value="">Select a game</option>
              {gameOptions.map((game, index) => (
                <option key={index} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
            ):( <select
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
            className="bg-[#f58174] hover:bg-[#f26555] text-white px-4 py-2 rounded mb-4"
            onClick={handleFetchComments}
          >
            Fetch Comments
          </button>
          {loading ? (
            <div className="flex items-center justify-center">
            <img src={loadingIcon} alt="Loading" className="w-12 h-12 mr-2" />
          </div>
          ):(
          <div>
            {comments.map((comment, index) => (
              <div key={index} className="bg-gray-100 p-4 mb-2 rounded-md">
                <p>User: {comment.userName}</p>
                <p>Rating: {comment.userRating}</p>
                <p>Comment: {comment.comment}</p>
                {comment.translatedComment && (
      <p>Translated Comment: {comment.translatedComment}</p>
    )}
                <p>Date:  {comment.date}</p>
                
                {loadingReplyIndex === index && <img src={loadingIcon} alt="Loading..." className="w-6 h-6 mr-2"/>}
                {comment.reply && (
       <div>
         {editingIndex !== index ? (
           <div>
             <p className="text-gray-600 mt-1">Assistant: {comment.reply}</p>
             <button
               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
               onClick={() => setEditingIndex(index)}
             >
               Edit
             </button>
           </div>
         ) : (
           <div>
             <textarea
               rows="4"
               cols="100"
               value={comment.reply}
               onChange={(e) => {
                 const newReply = e.target.value;
                 setComments((prevComments) => {
                   const newComments = [...prevComments];
                   newComments[index] = { ...newComments[index], reply: newReply };
                   return newComments;
                 });
               }}
             />
             <button
               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-3 rounded"
               onClick={() => setEditingIndex(null)}
             >
               Save
             </button>
           </div>
         )}
       </div>
        )}
    <div className="flex mt-2">
      <button
        className="bg-[#f58174] hover:bg-[#eaa399] text-white px-4 py-2 rounded mr-2"
        onClick={() => handleFetchReply(comment, index)}
      >
        Ask Assistant
      </button>
      {comment.reply && !comment.reply.posted && (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => handlePostReply(index)}
        >
          {posting? 'Posting' : 'Post'  }
          
        </button>
      )}
    </div>
              </div>
            ))}
          </div>
           )}
        </div>
      );
    };
    
    
export default Assistant;

