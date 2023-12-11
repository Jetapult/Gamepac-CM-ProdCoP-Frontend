import React, { useState,useEffect } from 'react';
import { auth } from "../config";
import { useNavigate } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import './recording.css'
import micImg from '../assets/podcast-6781921-5588632.png';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import api from '../api';

const Record = (props) => {
  console.log(process.env.REACT_APP_AWS_BUCKET_NAME);
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl) => {
        // This callback will receive the blobUrl when recording stops
        console.log('Recording stopped. Blob URL:', blobUrl);
        sendAudioToBackend(blobUrl);
      },
    });
    const config = {
      bucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
      dirName: 'audio',
      region: process.env.REACT_APP_AWS_BUCKET_REGION,
    };
 
    const s3Client = new S3Client({
      region: process.env.REACT_APP_AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
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
   const uploadFileToS3 = async (bucketName, key, body, contentType) => {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    };
  
    try {
      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);
      console.log("File uploaded successfully:", response);
      return response;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  };
  const sendAudioToBackend = async (audioBlobUrl) => {
    try {
      setIsLoading(true);
      const response = await fetch(audioBlobUrl);
      const audioBlob = await response.blob();
      const audioFileName = `recorded_audio_${Date.now()}.wav`;
      console.log((audioBlob.size/ (1024 * 1024)).toFixed(2) + ' MB');
      const uploadResult = await uploadFileToS3(config.bucketName, audioFileName, audioBlob, 'audio/wav');
      const s3Key=audioFileName;
      console.log(s3Key);
      const responseFromBackend = await api.post('/recorder', {s3Key:s3Key});
      const t=responseFromBackend.data.transcription;
      console.log(t);
      setTranscription(responseFromBackend.data.transcription);
        // Step 2: Get the summary
        const summaryResponse = await api.post('/summary', {
          transcription: t,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const sum = summaryResponse.data.summary;
        console.log(sum);
        const todoresponse = await api.post('/todos', {
            transcription:t,
          },{
            headers: {
              Authorization: 'Bearer ' + token
            }
          });
        const todosList = todoresponse.data.todos;
        const titleResponse = await api.post('/title', {
          transcription,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const title=titleResponse.data.title;
        const saveData=await api.post('/data',{id,transcription:t,sum,todosList,p:props.selectedPurpose,flag:"true",c:props.selectedContributors,title});
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
  const label=props.label;

  return (
    <div className=" border rounded-lg p-8 shadow-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        <img src={micImg} alt="Microphone Icon" className="h-24 text-gray-600" />
        <div className="flex items-center gap-4">
          {status === 'recording' ? (
            <div className='flex'>
            <div class="contain">
            <div class="recording-circle"></div>
          </div>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-transform hover:scale-105"
              onClick={handleStopRecording}
            >
              Stop Recording
            </button>
            </div>
          ) : (
            <button
              className=" bg-[#f58174] hover:bg-[#f1efe7] hover:text-black text-white px-4 py-2 rounded transition-transform hover:scale-105"
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
<button className="w-full  bg-[#f1efe7] py-2 px-4 w-52 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-red-600" onClick={()=>navigate(`/actions/${actionId}`,{ state: { label } })}>View Action Items</button>
)}
      </div>
    </div>
  );
};

export default Record;
