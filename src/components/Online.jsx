import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config';

const Online = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState('');
  const [token,setToken]=useState('');

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
  

  const id = userId;

  const handlePurposeChange = (event) => {
    setSelectedPurpose(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
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
      alert('Please select a text file.');
      return;
    }

    // Read the text file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const transcription = event.target.result;
    //   setSummary(transcription);

      if (!selectedPurpose) {
        alert('Please select a purpose.');
        return;
      }

      try {
        // Step 1: Get the summary
        const summaryResponse = await api.post('/summary', {
          transcription,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const sum = summaryResponse.data.summary;
        console.log(sum);
        
        const response = await api.post('/todos', {
          transcription,
        },{
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const todosList = response.data.todos;

        // Step 2: Save the data to the data table
        const data = {
          id,
          transcription,
          sum,
          todosList,
          p: selectedPurpose,
          flag:"false",
          c,
        };

        const saveData = await api.post('/data', data);
        const resId = saveData.data.actionId;
        setActionId(resId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error summarizing text:', error);
        alert('Error summarizing text. Please try again.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="flex justify-center pt-10">
      <div className="bg-white p-8  font-['League Spartan'] rounded-md shadow-md w-96 mx-auto ">
        <h2 className="text-2xl font-bold mb-4">Text to Brief</h2>
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label htmlFor="contributors" className="block font-['League Spartan'] text-sm font-medium text-gray-800">
              Contributors
            </label>
            {contributors.length > 0 && (
            <select
              id="contributors"
              name="contributors"
              value={selectedContributors}
              onChange={handleContributorsChange}
              className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-red-400">
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
              className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-red-400"
            >
              <option value="">Select a purpose</option>
              <option value="Investment">Investment</option>
              <option value="Hiring">Hiring</option>
              <option value="Game Analysis">Game Analysis</option>
              <option value="Share Holders Connect">Share Holders Connect</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="textFile" className="block text-sm font-medium text-gray-800">
              Upload Text File
            </label>
            <input
              type="file"
              id="textFile"
              name="textFile"
              accept=".txt"
              onChange={handleFileChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:border-gray-400"
          >
            Give Action Items
          </button>
        </form>
      </div>
      <div>
      {isLoading? (
  <button className="w-full bg-[#f1efe7]  py-2 px-4 rounded-md cursor-not-allowed opacity-50" disabled>Loading...</button>
) :null}
        {actionId && (
          <button
            className="w-full bg-[#f1efe7]  py-2 px-4 rounded-md hover:bg-[#eaa399] focus:outline-none focus:ring focus:bg-[#eaa399]"
            onClick={() => navigate(`/actions/${actionId}`)}
          >
            View Action Items
          </button>
        )}
      </div>

    </div>
  );
};

export default Online;
