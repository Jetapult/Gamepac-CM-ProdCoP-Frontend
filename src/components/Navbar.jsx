import { useEffect, useRef, useState } from "react";
import { auth, signInWithGogle } from "../config";
// import image from '../assets/jetapult-favicon.png'
import image from "../assets/image.png";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import audioImg from "../assets/icons8-audio-48.png";
import textImg from "../assets/icons8-text-30.png";
import logoutImg from "../assets/icons8-logout-48.png";
import historyImg from "../assets/icons8-history-48.png";
import socialsImg from "../assets/icons8-social-50.png";
import holycowImg from "../assets/2x_Retina.png";
import loginImg from "../assets/icons8-login-50.png";
import img from "../assets/im.png";
import { useSelector } from "react-redux";
import { isAuthenticated, logout } from "../auth";
import AnalyticsPopup from "./AnalyticsPopup";
import { ChartBarSquareIcon } from "@heroicons/react/20/solid";
import SparklesIcon from "../assets/sparkles.svg";

function Navbar() {
  const userData = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAnalyticsPopup, setShowAnalyticsPopup] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const studioSlug = localStorage.getItem("selectedStudio");
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowUserDropdown(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const handleLogout = () => {
    logout();
    window.location.reload();
  };
  function getInitials(name) {
    if (name) {
      const words = name?.split(/\s+|-/);
      const initials = words
        ?.filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase());
      return initials?.join("");
    }
  }

  const handleOpenDropdown = () => {
    setDropdownOpen(true);
  };

  const handleCloseDropdown = () => {
    setDropdownOpen(false);
  };
  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="navbar bg-white flex justify-between items-center h-20 py-5 px-8 shadow-lg fixed top-0 left-0 right-0 z-50">
      <a
        className="flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src={userData?.studio_logo || image}
          alt="Icon"
          className="h-12 w-auto mr-2 text-gray-600 inline"
          style={{ marginBottom: "0 rem" }} // Adjust the margin as needed
        />
      </a>
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {isAuthenticated() ? (
          <>
            <ul className="text-gray-700">
              <li className="duration-150 hover:text-gray-900">
                <a
                  className="block cursor-pointer"
                  onClick={() =>
                    navigate(`/${studioSlug || userData?.slug}/dashboard`)
                  }
                >
                  Dashboard
                </a>
              </li>
            </ul>
            {userData?.studio_type?.includes("studio_manager") &&
              studioSlug === "holy-cow-studio" && (
                <ul>
                  <li className="duration-150 hover:text-gray-900">
                    <a
                      className="block"
                      onClick={() => setShowAnalyticsPopup(true)}
                    >
                      <div className="flex gap-2 items-center cursor-pointer">
                        <ChartBarSquareIcon className="w-5 h-5" />
                        Analytics
                      </div>
                    </a>
                  </li>
                </ul>
              )}
            {!userData?.studio_type?.includes("studio_manager") ||
            (studioSlug &&
              studioSlug !== userData?.slug &&
              userData?.studio_type?.includes("studio_manager")) ? (
              <div className="relative">
                <button
                  className="text-gray-700 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 md:text-gray-600 md:font-medium"
                  onMouseEnter={handleOpenDropdown}
                >
                  <div className="flex gap-2 items-center">
                    <img src={socialsImg} className="w-6 h-6" alt="Socials" />
                    Socials
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 inline"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
                {dropdownOpen && (
                  <div
                    className={`absolute bg-white border border-gray-300 mt-1 py-1 w-36 text-gray-800 rounded-lg shadow-lg whitespace-nowrap ${
                      dropdownOpen ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transition: "opacity 0.3s" }}
                    onMouseLeave={handleCloseDropdown}
                  >
                    <button
                      className="block px-2 md:px-4 py-2 hover:bg-gray-200 transition duration-200 w-full text-left"
                      onClick={() => {
                        navigate(
                          studioSlug ? `/${studioSlug}/assistant` : "/assistant"
                        );
                        handleToggleDropdown();
                      }}
                    >
                      Reply Assistant
                    </button>
                    <button
                      className="block px-2 md:px-4 py-2 hover:bg-gray-200 transition duration-200 w-full text-left"
                      onClick={() => {
                        navigate(
                          studioSlug ? `/${studioSlug}/smart` : "/smart"
                        );
                        handleToggleDropdown();
                      }}
                    >
                      Smart Actions
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
            <ul className="text-gray-700 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 md:text-gray-600 md:font-medium">
              {(!studioSlug || studioSlug === userData?.slug) && (
                <>
                  <li className="duration-150 hover:text-gray-900">
                    <a
                      className="block cursor-pointer"
                      onClick={() => navigate("/home")}
                    >
                      <div className="flex gap-2 items-center">
                        <img src={audioImg} className="w-6 h-6" />
                        Audio
                      </div>
                    </a>
                  </li>
                  <li className="duration-150 hover:text-gray-900">
                    <a
                      className="block cursor-pointer"
                      onClick={() => navigate("/online")}
                    >
                      <div className="flex gap-2 items-center">
                        <img src={textImg} className="w-6 h-6" />
                        Text
                      </div>
                    </a>
                  </li>
                  <li className="duration-150 hover:text-gray-900">
                    <a
                      className="block cursor-pointer"
                      onClick={() => navigate("/aiStories")}
                    >
                      <div className="flex gap-2 items-center">
                        <img src={img} className="w-6 h-6" />
                        Story Weaver 
                      </div>
                    </a>
                  </li>
                  {/* <li className="duration-150 hover:text-gray-900">
                    <a
                      className="block cursor-pointer"
                      onClick={() => navigate("/history")}
                    >
                      <div className="flex gap-2 items-center">
                        <img src={historyImg} className="w-6 h-6" />
                        History
                      </div>
                    </a>
                  </li> */}
                </>
              )}

              <li
                className="duration-150 hover:text-gray-900 relative"
                ref={wrapperRef}
              >
                <div
                  className="bg-[#f1f1f0] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <p className="text-xl font-bold">
                    {getInitials(userData?.name)}
                  </p>
                </div>
                {showUserDropdown && (
                  <div className="absolute bg-white border border-[0.5px] border-[#e5e5e5] right-0 w-[200px] rounded shadow-lg">
                    <div
                      className="flex gap-2 items-center cursor-pointer p-3 border-b border-b-[0.5px]"
                      onClick={() => {
                        navigate("/storiesHistory");
                        setShowUserDropdown(false);
                      }}
                    >
                      <img src={SparklesIcon} className="w-6 h-6" />
                      Story weaver History
                    </div>
                    <div
                      className="flex gap-2 items-center cursor-pointer p-3 border-b border-b-[0.5px]"
                      onClick={() => {
                        navigate("/history");
                        setShowUserDropdown(false);
                      }}
                    >
                      <img src={historyImg} className="w-6 h-6" />
                      Note taker History
                    </div>
                    <div
                      className="flex gap-2 items-center cursor-pointer p-3"
                      onClick={handleLogout}
                    >
                      <img src={logoutImg} className="w-6 h-6" />
                      Logout
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </>
        ) : (
          <a href="/login" className="block">
            <div className="flex gap-2 items-center">
              <img src={loginImg} className="w-6 h-6" />
              Login
            </div>
          </a>
        )}
      </div>
      {showAnalyticsPopup && (
        <AnalyticsPopup setShowModal={setShowAnalyticsPopup} />
      )}
    </div>
  );
}
export default Navbar;
