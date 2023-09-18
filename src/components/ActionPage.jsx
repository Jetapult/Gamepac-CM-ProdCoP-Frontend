import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Test from './test';
import api from '../api';


const ActionPage = () => {
  const location = useLocation();
  const label = location.state?.label || '';
  const { id } = useParams();
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [todos, setTodos] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    // Fetch the data for the given ID from the backend
    api.get(`/data/${id}`)
      .then((response) => {
        const data = response.data;
        console.log(data);
        setTranscription(data.transcript);
        setSummary(data.summary);
        const todosList = data.todos;
        const todoItems = todosList.split('\n');
        setTodos(todoItems);
      })
      .catch((error) => {
        console.error('Error fetching action data:', error);
      });
  }, [id]);

  const getDataForGoogleDoc = () => {
    return {
      label,
      summary,
      todos
    };
  };

  return (
    <div className='mx-auto p-4'>
      <div className="mt-6">
        <h1 className="text-1xl font-bold mb-2">Summary:</h1>
        <div className="bg-[#f1efe7] p-4 rounded-md shadow-md">
          <p className="text-gray-800">{summary}</p>
        </div>
      </div>
      {todos.length > 0 && (
  <div className="mt-4 mb-3">
    <h3 className="text-1xl font-bold mb-2">Todo List:</h3>
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
    <div className="mt-4">
        {/* Button to toggle the transcript dropdown */}
        <button
          className="bg-[#f1efe7] py-2 px-4 rounded-md hover:scale-105 focus:outline-none focus:ring focus:border-gray-400"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          View Transcript
        </button>
        {showTranscript && (
          // Transcript dropdown
          <div className="mt-4">
            <h1>Transcription:</h1>
            <p>{transcription}</p>
          </div>
        )}
      </div>
  </div>
)}
<div className='mx-auto p-4'>
      <Test getDataForGoogleDoc={getDataForGoogleDoc} />
    </div>

    </div>
  );
};

export default ActionPage;
