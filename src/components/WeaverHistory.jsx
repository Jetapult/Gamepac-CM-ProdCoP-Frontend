import { useNavigate } from "react-router-dom";
import api from "../api";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const WeaverHistory = () => {
  const user = useSelector((state) => state.user.user);
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.id) {
      // Fetch data from the backend for the logged-in user's UID
      api
        .get(`/storyHistory/${user.id}`)
        .then((response) => {
          setUserData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [user]);

  const handleView = (storyId) => {
    navigate(`/aiStories/${storyId}`);
  };

  const handleDownload = (fileLink) => {
    window.open(fileLink, "_blank");
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Kolkata",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  return (
    <div className="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="px-2 py-4 text-4xl text-center font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Story Weaver History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          View and manage all the stories you've created.
        </p>

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                  scope="col"
                >
                  Sl No
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                  scope="col"
                >
                  Title
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                  scope="col"
                >
                  No of Parts
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                  scope="col"
                >
                  Created At
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                  scope="col"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {userData.map((story, index) => (
                <tr key={story.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {story.theme}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {story.number_of_parts}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(story.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-500 mr-4"
                      onClick={() => handleView(story.id)}
                    >
                      View
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-500"
                      onClick={() => handleDownload(story.file_link)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeaverHistory;
