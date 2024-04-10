import icon from "../assets/icon.svg";
import { useState, useEffect } from "react";
import "./landing.css";
import { signInWithGogle } from "../config";
import { auth } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
// import image from '../assets/istockphoto-1190152805-612x612.jpg';
// import image from '../assets/2002.i515.009_contemporary_workspace_flat_icons-07.jpg';
import image from "../assets/meeting.webp";
function Landing() {
  const [user, setUser] = useState("");
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //   });
  //   return () => unsubscribe();
  // }, []);

  return (
    <div className="flex flex-col  justify-center">
      <div className="flex flex-col justify-center h-24 shrink-0 ml-24 mr-16 px-1">
        <div className="text-center text-white text-2xl font-light mt-5 mr-2 h-[40.33%] mb-3">
          GamePAC AI
        </div>
      </div>
      <img
        src={image}
        // src={istockphoto-1190152805-612x612}
        style={{ width: "650px", height: "450px" }}
        className="min-h-0 min-w-0 self-center mb-4"
      />
      {/* {!user && (
        <div className="flex space-x-10 justify-center space-between">
          <button
            className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-colors flex items-center gap-2 border border-gray-300 focus:outline-none focus:border-blue-400"
            onClick={signInWithGogle}
          >
            <FontAwesomeIcon
              icon={faGoogle}
              className="text-[#eaa399] text-lg"
            />
            <span className="font-medium text-lg">Sign in with Google</span>
          </button>
        </div>
      )} */}
    </div>
  );
}
export default Landing;
