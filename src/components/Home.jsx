import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config";
import Record from "./Record";
import api from "../api";
import { useSelector } from "react-redux";
import Select from 'react-select';

const Home = () => {
  const userData = useSelector((state) => state.user.user);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [copy, setCopy] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState({});
  const [token, setToken] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/v1/users`);
        response.data.data.map(studio => {
          studio.options.map((user) => {
            user.label = user.name || user.email;
            user.value = user.id;
          })
        })
        setContributors(response.data.data);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };
    if (userData?.studio_id) {
      fetchUsers();
    }
  }, [userData]);
  const handlePurposeChange = (event) => {
    setSelectedPurpose(event.target.value);
  };
  const p = selectedPurpose;

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
  const c = selectedContributors.value;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (!file) {
      alert("Please select an MP3 file.");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Transcribe the audio
      const transcribeResponse = await api.post("/transcribe", formData);
      const transcription = transcribeResponse.data.transcription;
      setCopy(transcription);
      console.log(transcription);
      getSummaryTodosTitleandSave(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Error transcribing audio. Please try again.");
    }
  };

  const getSummaryTodosTitleandSave = async (transcription) => {
    // Step 2: Get the summary
    const summaryResponse = await api.post("/summary", {
      transcription,
    });
    const sum = summaryResponse.data.summary;
    console.log(sum);
    // Step 3: Set the summary in the state
    setSummary(sum);
    const response = await api.post("/todos", {
      transcription: transcription,
    });
    const todosList = response.data.todos;
    const titleResponse = await api.post("/title", {
      transcription: transcription,
    });
    const title = titleResponse.data.title;
    console.log(title);
    console.log(selectedContributors, "selectedContributors");
    const saveData = await api.post("/data", {
      user_id: userData.id.toString(),
      contributor_id: selectedContributors.value,
      transcription,
      sum,
      todosList,
      p,
      flag: "true",
      c,
      title,
    });
    const resId = saveData.data.actionId;
    console.log(resId);
    setActionId(resId);
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center pt-10">
      <div className="bg-white p-8 rounded-md shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Meeting Details</h2>
        <div className="mb-4">
          <label
            htmlFor="contributors"
            className="block text-sm font-medium text-gray-800"
          >
            Contributors
          </label>
          {/* {contributors.length > 0 && (
            <select
              id="contributors"
              name="contributors"
              value={selectedContributors}
              onChange={handleContributorsChange}
              className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="">Select a contributor</option>
              {contributors.map((contributor) => (
                <option key={contributor.id} value={contributor.id}>
                  {contributor.email}
                </option>
              ))}
            </select>
          )} */}
          <Select
            options={contributors}
            value={selectedContributors}
            onChange={(val) => setSelectedContributors(val)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="purpose"
            className="block text-sm font-medium text-gray-800"
          >
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
          <label
            htmlFor="label"
            className="block text-sm font-medium text-gray-800"
          >
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
                <label
                  htmlFor="mp3Recording"
                  className="block text-sm font-medium text-gray-800"
                >
                  Recorded File (m4a,mp3)
                </label>
                <input
                  type="file"
                  className="mt-1 w-full"
                  accept=".mp3, .m4a, .mp4"
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                className="w-1/2 bg-[#B9FF66] text-[#000] py-2 px-4 rounded-md hover:bg-[#000] hover:text-[#B9FF66] focus:outline-none focus:ring focus:border-gray-400"
              >
                Give Action Items
              </button>
            </form>
          </div>
          <Record
            selectedContributors={selectedContributors}
            selectedPurpose={selectedPurpose}
            label={label}
            user_id={userData.id}
            getSummaryTodosTitleandSave={getSummaryTodosTitleandSave}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
        {/* <RecordView/> */}
        <div className="mt-4">
        {isLoading ? (
          <button
            className="w-full bg-[#B9FF66] text-[#000] py-2 px-4 rounded-md cursor-not-allowed opacity-50"
            disabled
          >
            Loading...
          </button>
        ) : null}
        {!isLoading && actionId && (
          <button
            className="w-full  bg-[#B9FF66] py-2 px-4 rounded-md hover:bg-[#000] hover:text-[#B9FF66] focus:outline-none focus:ring focus:border-red-600"
            onClick={() =>
              navigate(`/actions/${actionId}`, { state: { label } })
            }
          >
            View Action Items
          </button>
        )}
      </div>
      </div>     
    </div>
  );
};
export default Home;
