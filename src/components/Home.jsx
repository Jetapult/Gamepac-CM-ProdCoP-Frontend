import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config";
import Record from './Record';
import api from '../api';

const Home = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [copy,setCopy]=useState('');
  const navigate = useNavigate();
  const [user,setUser]=useState(null);
  const [userId, setUserId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState('');
  const [token,setToken]=useState('');
  const [label, setLabel] = useState('');
 

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users', {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        setContributors(response.data);
      } catch (error) {
        console.error('Error fetching contributors:', error);
      }
    };

    fetchUsers();
  }, [token]);
  const id=userId;
  const handlePurposeChange = (event) => {
    setSelectedPurpose(event.target.value);
  };
  const p=selectedPurpose;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };
  const handleLabelChange = (event) => {
    setLabel(event.target.value);
  };
  const handleContributorsChange = (event) => {
    console.log(event.target.value);
    setSelectedContributors(event.target.value);
  };
  const c=selectedContributors;


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (!file) {
      alert('Please select an MP3 file.');
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Transcribe the audio
      const transcribeResponse = await api.post('/transcribe', formData,{
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      const transcription = transcribeResponse.data.transcription;
      setCopy(transcription);
      console.log(transcription);

      // Step 2: Get the summary
      const summaryResponse = await api.post('/summary', {
        transcription,
      },{
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      const sum = summaryResponse.data.summary;
      console.log(sum);
      // Step 3: Set the summary in the state
      setSummary(sum);
      const response = await api.post('/todos', {
          transcription,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const todosList = response.data.todos;
        const titleResponse = await api.post('/title', {
          transcription,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const title=titleResponse.data.title;
        console.log(title);
      const saveData=await api.post('/data',{id,transcription,sum,todosList,p,flag:"true",c,title});
      const resId=saveData.data.actionId;
      console.log(resId);
      setActionId(resId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error transcribing audio. Please try again.');
    }
  };


    return (
     
        
    <div className="flex justify-center pt-10">
       <div className="bg-white p-8 rounded-md shadow-md max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold mb-4">Meeting Details</h2>
    <div className="mb-4">
      <label htmlFor="contributors" className="block text-sm font-medium text-gray-800">
        Contributors
      </label>
      {contributors.length > 0 && (
        <select
          id="contributors"
          name="contributors"
          value={selectedContributors}
          onChange={handleContributorsChange}
          className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
        >
          <option value="">Select a contributor</option>
          {contributors.map((contributor) => (
            <option key={contributor.uid} value={contributor.uid}>
              {contributor.email}
            </option>
          ))}
        </select>
      )}
    </div>
    <div className="mb-4">
      <label htmlFor="purpose" className="block text-sm font-medium text-gray-800">
        Purpose
      </label>
      <select
        id="purpose"
        name="purpose"
        value={selectedPurpose}
        onChange={handlePurposeChange}
        className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
      >
        <option value="">Select a purpose</option>
        <option value="Investment">Investment</option>
        <option value="Hiring">Hiring</option>
        <option value="Game Analysis">Game Analysis</option>
        <option value="Product Analysis">Product Analysis</option>
        <option value="Brainstorming">Brainstorming</option>
        <option value="Marketing">Marketing</option>
        <option value="Performance Review">Performance Review</option>
        
      </select>
    </div>
    <div className="mb-4">
      <label htmlFor="label" className="block text-sm font-medium text-gray-800">
        Label
      </label>
      <input
        id="label"
        name="label"
        type="text"
        value={label}
        onChange={handleLabelChange}
        className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
        required
      />
      </div>
      <div className="flex items-center justify-between">
  <div className="mb-2 mt-2 border rounded-lg p-8 shadow-md mx-3">
    <form onSubmit={handleSubmit}>
    <div className="mb-4">
        <label  htmlFor="mp3Recording" className="block text-sm font-medium text-gray-800">Recorded File (m4a,mp3)</label>
        <input type="file" className="mt-1 w-full" accept=".mp3, .m4a" onChange={handleFileChange} />
      </div>
      <button type="submit" className="w-1/2 bg-[#f58174] text-white py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-gray-400" >Give Action Items</button>
    </form>
  </div>
  <Record 
  id={id}
  selectedContributors={selectedContributors}
  selectedPurpose={selectedPurpose}
  label={label}
  />
</div>
    {/* <RecordView/> */}
  </div>
   
    <div>
    {isLoading? (
  <button className="w-full bg-[#f1efe7] py-2 px-4 rounded-md cursor-not-allowed opacity-50" disabled>Loading...</button>
) :null}
       {actionId && (
          <button className="w-full  bg-[#f1efe7] py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-red-600" onClick={()=>navigate(`/actions/${actionId}`, { state: { label } })}>View Action Items</button>
      )}

  </div>
  </div>
        
    )
}
export default Home;

