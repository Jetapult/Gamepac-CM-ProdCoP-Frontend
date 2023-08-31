import React, { useState,useEffect } from 'react';
import { auth } from "../config";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactMediaRecorder } from 'react-media-recorder';
import micImg from '../assets/podcast-6781921-5588632.png';

const Record = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl) => {
        // This callback will receive the blobUrl when recording stops
        console.log('Recording stopped. Blob URL:', blobUrl);
        sendAudioToBackend(blobUrl);
      },
    });

  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [user,setUser]=useState(null);
  const [userId, setUserId] = useState(null);
  const [token,setToken]=useState('');
  
  const navigate = useNavigate()
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => { 
          setUser(user);
          setUserId(user.uid);
          user.getIdToken().then((token)=>{
            setToken(token);
          })
          });
          return () => unsubscribe();
      }, []);
   const id=userId;
  const sendAudioToBackend = async (audioBlobUrl) => {
    try {
      setIsLoading(true);

      // Fetch the Blob from the audioBlobUrl
      const response = await fetch(audioBlobUrl);
      const audioBlob = await response.blob();
      console.log(audioBlob);

      // Create a FormData with the audioBlob
      const formData = new FormData();
      formData.append('file', audioBlob, 'recorded_audio.wav');
        // Step 1: Transcribe the audio
      const responseFromBackend = await axios.post('http://localhost:3000/recorder', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const t=responseFromBackend.data.transcription;
      console.log(t);
      setTranscription(responseFromBackend.data.transcription);
        // Step 2: Get the summary
        const summaryResponse = await axios.post('http://localhost:3000/summary', {
          transcription: t,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const sum = summaryResponse.data.summary;
        console.log(sum);
        const todoresponse = await axios.post('http://localhost:3000/todos', {
            transcription:t,
          },{
            headers: {
              Authorization: 'Bearer ' + token
            }
          });
        const todosList = todoresponse.data.todos;
        const saveData=await axios.post('http://localhost:3000/data',{id,transcription:t,sum,todosList,p:"Offline Recording",flag:"true",c:"BztHvB5KyJbR4vixf8r4HaRhb3D3"});
        const resId=saveData.data.actionId;
        console.log(resId);
        setActionId(resId);
        setIsLoading(false);
      // setIsLoading(false);
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      setIsLoading(false);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    clearBlobUrl();
  };

  return (
    <div className="border rounded-lg p-8 shadow-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        <img src={micImg} alt="Microphone Icon" className="h-24 text-gray-600" />
        <div className="flex items-center gap-4">
          {status === 'recording' ? (
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-transform hover:scale-105"
              onClick={handleStopRecording}
            >
              Stop Recording
            </button>
          ) : (
            <button
              className="bg-[#eaa399] hover:bg-[#f1efe7] hover:text-black text-white px-4 py-2 rounded transition-transform hover:scale-105"
              onClick={startRecording}
            >
              Start Recording
            </button>
          )}
        </div>
        {isLoading ? (
          <button className="bg-gray-500 text-white px-4 py-2 rounded" disabled>
            Loading...
          </button>
        ) : null}
         {actionId && (
<button className="w-full  bg-[#f1efe7] py-2 px-4 w-52 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-red-600" onClick={()=>navigate(`/actions/${actionId}`)}>View Action Items</button>
)}
      </div>
    </div>
  );
};

export default Record;
