import { useState, useEffect } from "react";
import on from "../assets/icons8-online-64.png";
import off from "../assets/icons8-phonelink-ring-40.png";
import { auth, signInWithGogle } from "../config";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useSelector } from "react-redux";

const History = () => {
  const user = useSelector((state) => state.user.user);
  const [display, setDisplay] = useState("");
  const [userData, setUserData] = useState([]);
  const [cName, setC] = useState("");
  const navigate = useNavigate();
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //     setDisplay(user.displayName || "User");
  //   });
  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    if (user.id) {
      // Fetch data from the backend for the logged-in user's UID
      api
        .get(`/notes/${user.id}`)
        .then((response) => {
          setUserData(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [user]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      timeZone: "Asia/Kolkata", // Set the timezone to Indian Standard Time (IST)
    };
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div>
      <div>
        {user ? (
          <h1 className="font-['League Spartan'] text-center pt-5">
            Hi {display}, you can access your Past Actions here!
          </h1>
        ) : (
          <h1>Please Login to access your Minutes.</h1>
        )}
      </div>

      <div className="bg-white mt-5 flex justify-center shadow-md rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#eaa399] text-white">
              <th className="px-4 py-2">Sl No</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Uploader</th>
              <th className="px-4 py-2">Purpose</th>
              <th className="px-4 py-2">Action Items</th>
              <th className="px-4 py-2">Contributor</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((data, index) => (
              <tr
                key={data.id}
                className={index % 2 === 0 ? "bg-gray-100" : ""}
              >
                <td className="border px-4 py-2">{index + 1}</td>
                {/* <td className="border px-4 py-2">{user.displayName}</td> */}
                <td className="border px-4 py-2">{data.title}</td>
                <td className="border px-4 py-2">
                  {formatTimestamp(data.timestamp)}
                </td>
                <td className="border px-4 py-2">{data.uploader_name}</td>
                <td className="border px-4 py-2">{data.purpose}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-[#eaa399] hover:bg-[#f58174] text-white px-2 py-1 rounded"
                    onClick={() => navigate(`/actions/${data.id}`)}
                  >
                    View Action
                  </button>
                </td>
                <td className="border px-4 py-2">{data.contributor_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
