import { useEffect, useRef, useState } from "react";
import { auth, signInWithGogle } from "../config";
import image from "../assets/jetLogo.png";
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
import { useDispatch, useSelector } from "react-redux";
import { isAuthenticated, logout } from "../auth";
import AnalyticsPopup from "./AnalyticsPopup";
import { ChartBarSquareIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { SparklesIcon } from "@heroicons/react/24/outline";
import ReactPopover from "./Popover";
import { addStudioData } from "../store/reducer/adminSlice";
import { BotMessageSquare, PanelRight } from "lucide-react";
import { Chatbot } from "../pages/GamepacAIAssistant/chatbot";

function Navbar() {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const adminData = useSelector((state) => state.admin.selectedStudio);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAnalyticsPopup, setShowAnalyticsPopup] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNoteTakerDropdown, setShowNoteTakerDropdown] = useState(false);
  const [showChatbotDropdown, setShowChatbotDropdown] = useState(false);
  const studioSlug = localStorage.getItem("selectedStudio");
  const wrapperRef = useRef(null);
  const dispatch = useDispatch();
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowUserDropdown(false);
          setShowNoteTakerDropdown(false);
          setDropdownOpen(false);
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

  useEffect(() => {
    if (studios.length) {
      const studioData = studios.filter((x) => x.slug === studioSlug)[0];
      if (studioData) {
        const updatedStudioData = {
          ...studioData,
          studio_logo: studioData.studio_logo || image,
        };
        dispatch(addStudioData(updatedStudioData));
      }
    }
  }, [studios]);

  return (
    <>
      <div className="navbar bg-white flex justify-between items-center h-14 py-4 px-8 shadow-lg fixed top-0 left-0 right-0 z-50">
        <a
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          {studioSlug ? (
            <>
              {adminData.studio_logo && (
                <img
                  src={adminData.studio_logo}
                  alt="Icon"
                  className={`w-auto h-10 mr-2 text-gray-600 inline`}
                  style={{ marginBottom: "0 rem" }}
                />
              )}
            </>
          ) : (
            <img
              src={
                studioSlug
                  ? adminData.studio_logo
                  : userData?.studio_logo || image
              }
              alt="Icon"
              className={`w-auto h-10 mr-2 text-gray-600 inline`}
              style={{ marginBottom: "0 rem" }}
            />
          )}
        </a>
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          {isAuthenticated() ? (
            <>
              <ul className="text-gray-7000 relative flex flex-row gap-6">
                <li>
                  <span className="cursor-pointer" onClick={() => setShowChatbotDropdown(!showChatbotDropdown)}>{showChatbotDropdown ? <PanelRight className="w-6 h-6" /> : <BotMessageSquare className="w-6 h-6" />}</span>
                </li>
                <li
                  className={`duration-150 hover:text-gray-500 hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:rounded-full ${
                    location.pathname.includes("dashboard")
                      ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black after:absolute after:bottom-[-16px] after:rounded-full"
                      : ""
                  }`}
                >
                  <a
                    className="block cursor-pointer"
                    onClick={() =>
                      navigate(`/${studioSlug || userData?.slug}/dashboard`)
                    }
                  >
                    Home
                  </a>
                </li>
              </ul>
              {/* {userData?.studio_type?.includes("studio_manager") &&
                studioSlug?.includes("holy-cow-studio") && (
                  <ul>
                    <li
                      className={`relative duration-150 hover:text-gray-500 hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[50%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                        location.pathname.includes("analytics")
                          ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black after:absolute after:bottom-[-16px] after:left-[50%] after:translate-x-[-50%] after:rounded-full"
                          : ""
                      }`}
                    >
                      <a
                        className="block cursor-pointer"
                        onClick={() =>
                          navigate(`/${studioSlug || userData?.slug}/analytics`)
                        }
                      >
                        <div className="flex gap-2 items-center">Analytics</div>
                      </a>
                    </li>
                  </ul>
                )}
              {!userData?.studio_type?.includes("studio_manager") ||
              (studioSlug &&
                studioSlug !== userData?.slug &&
                userData?.studio_type?.includes("studio_manager")) ? (
                <>
                  <div
                    className={`duration-150 hover:text-gray-500 relative ai-tools hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[50%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                      location.pathname.includes("organic-ua")
                        ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black after:absolute after:bottom-[-16px] after:left-[50%] after:translate-x-[-50%] after:rounded-full"
                        : ""
                    }`}
                  >
                    <a
                      className="block cursor-pointer"
                      onClick={() =>
                        navigate(
                          studioSlug
                            ? `/organic-ua/smart-feedback/${studioSlug}`
                            : "/organic-ua/smart-feedback"
                        )
                      }
                    >
                      <div className="flex gap-2 items-center">Socials</div>
                    </a>
                  </div>
                  <div
                    className={`duration-150 hover:text-gray-500 relative ai-tools hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[50%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                      location.pathname.includes("ua-intelligence")
                        ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black after:absolute after:bottom-[-16px] after:left-[50%] after:translate-x-[-50%] after:rounded-full"
                        : ""
                    }`}
                  >
                    <a
                      className="block cursor-pointer"
                      onClick={() =>
                        navigate(`/ua-intelligence`)
                      }
                    >
                      <div className="flex gap-2 items-center">UA Intel</div>
                    </a>
                  </div>
                </>
              ) : (
                <></>
              )} */}
              <ul className="justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 ">
                {/* {(!studioSlug || studioSlug === userData?.slug) &&
                  !userData.studio_type?.includes("external_studio") && (
                    <>
                      <li
                        className={`cursor-pointer duration-150 hover:text-gray-500 relative cursor-pointer notetaker hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[46%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                          location.pathname.includes("note-taker") ||
                          location.pathname.includes("online")
                            ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black after:absolute after:bottom-[-16px] after:left-[46%] after:translate-x-[-50%] after:rounded-full"
                            : ""
                        }`}
                        ref={wrapperRef}
                      >
                        <a
                          className="block"
                          onClick={() => {
                            setShowNoteTakerDropdown(!showNoteTakerDropdown);
                            setDropdownOpen(false);
                            setShowUserDropdown(false);
                          }}
                        >
                          Note Taker
                          <ChevronDownIcon className="w-5 h-5 inline ml-1" />
                        </a>
                        {showNoteTakerDropdown && (
                          <div
                            className="absolute bg-white border border-[0.5px] border-[#e5e5e5] left-0 w-[200px] rounded shadow-lg top-[30px] z-10"
                            ref={wrapperRef}
                          >
                            <div
                              className="flex gap-2 items-center cursor-pointer p-3 border-b border-b-[0.5px]"
                              onClick={() => {
                                navigate("/note-taker");
                                setShowNoteTakerDropdown(false);
                              }}
                            >
                              <img src={audioImg} className="w-6 h-6" />
                              Audio Recording
                            </div>
                            <div
                              className="flex gap-2 items-center cursor-pointer p-3"
                              onClick={() => {
                                navigate("/online");
                                setShowNoteTakerDropdown(false);
                              }}
                            >
                              <img src={textImg} className="w-6 h-6" />
                              Text Transcribe
                            </div>
                          </div>
                        )}
                      </li>
                    </>
                  )}
                {!userData.studio_type?.includes("external_studio") && (
                  <li
                    className={`cursor-pointer duration-150 hover:text-gray-500 relative ai-tools hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[50%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                      location.pathname.includes("ai-")
                        ? "text-black font-bold after:content-[''] after:h-[3px] after:w-10 after:bg-black  after:absolute after:bottom-[-16px] after:left-[50%] after:translate-x-[-50%] after:rounded-full"
                        : ""
                    }`}
                  >
                    <a className="block" onClick={() => navigate("/ai-tools")}>
                      AI Tools
                    </a>
                  </li>
                )}
                {userData.studio_type?.includes("external_studio") && (
                  <ReactPopover trigger="hover" content={<p>Coming soon</p>}>
                    <div className="flex gap-2 items-center cursor-pointer">
                      AI Tools
                    </div>
                  </ReactPopover>
                )}
                <li
                  className={`duration-150 cursor-pointer hover:text-gray-500 relative ai-tools hover:after:content-[''] hover:after:h-[3px] hover:after:w-10 hover:after:bg-gray-500 hover:after:absolute hover:after:bottom-[-16px] hover:after:left-[50%] hover:after:translate-x-[-50%] hover:after:rounded-full ${
                    location.pathname.includes("docs")
                      ? "text-black after:content-[''] after:h-[3px] after:w-10 after:bg-black font-bold after:absolute after:bottom-[-16px] after:left-[50%] after:translate-x-[-50%] after:rounded-full"
                      : ""
                  }`}
                >
                  <a
                    className="block"
                    onClick={() => navigate("/docs/overview")}
                  >
                    Docs
                  </a>
                </li> */}
                <li
                  className="duration-150 text-black hover:text-gray-900 relative"
                  ref={wrapperRef}
                >
                  <div
                    className="bg-[#f1f1f0] w-9 h-9 shadow rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown);
                      setDropdownOpen(false);
                      setShowNoteTakerDropdown(false);
                    }}
                  >
                    <p className="text-lg font-black pt-[1.5px]">
                      {getInitials(userData?.name)}
                    </p>
                  </div>
                  {showUserDropdown && (
                    <div
                      className="absolute bg-white border border-[0.5px] border-[#e5e5e5] right-0 w-[200px] rounded shadow-lg top-[30px]"
                      ref={wrapperRef}
                    >
                      {!userData.studio_type?.includes("external_studio") && (
                        <>
                          <div
                            className="flex gap-2 items-center cursor-pointer p-3 border-b border-b-[0.5px]"
                            onClick={() => {
                              navigate("/storiesHistory");
                              setShowUserDropdown(false);
                            }}
                          >
                            <SparklesIcon className="w-6 h-6 inline" />
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
                        </>
                      )}
                      <div
                        className="flex gap-2 items-center cursor-pointer p-3"
                        onClick={handleLogout}
                      >
                        <img src={logoutImg} className="w-6 h-6" />
                        Logout
                      </div>
                      <div
                        className="text-center cursor-pointer p-3 border-t border-t-[0.5px]"
                        onClick={() => {
                          navigate("/updates");
                          setShowUserDropdown(false);
                        }}
                      >
                        <p className="text-sm">Updates</p>
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
        {showChatbotDropdown && (
          <Chatbot setShowChatbotDropdown={setShowChatbotDropdown} userData={userData} studios={studios} />
        )}
      </div>
    </>
  );
}
export default Navbar;
