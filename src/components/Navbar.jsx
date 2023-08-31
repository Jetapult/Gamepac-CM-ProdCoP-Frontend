
import { useEffect, useState } from 'react';
import { auth,signInWithGogle } from '../config';
// import image from '../assets/jetapult-favicon.png'
import image from '../assets/image.png'
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import audioImg from '../assets/icons8-audio-48.png';
import textImg from '../assets/icons8-text-30.png'
import logoutImg from '../assets/icons8-logout-48.png'
import historyImg from '../assets/icons8-history-48.png'
import socialsImg from '../assets/icons8-social-50.png'
import holycowImg from '../assets/2x_Retina.png';
import loginImg from '../assets/icons8-login-50.png'

function Navbar(){
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [state, setState] = useState(false);
  const [user,setUser]=useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => { 
      setUser(user);
    });
    return () => unsubscribe();
}, []);
const handleLogout = () => {
  auth.signOut().then(() => {
    window.location.href='./'
  }).catch((error) => {
    console.log(error.message);
  });
};


const handleToggleMobileMenu = () => {
  setMobileMenuOpen(!mobileMenuOpen);
};
const handleToggleDropdown = () => {
  setDropdownOpen(!dropdownOpen);
};

const handleToggleMenu = () => {
  setMenuOpen(!menuOpen);
};
    return (
<div className="navbar bg-white flex justify-between items-end h-20 py-5 px-16">
  <a href="/" className="flex items-center">
    <div className="text-4xl bg-transparent">
      <img
        src={image}
        alt="Icon"
        className="h-12 w-auto mr-2 text-gray-600 inline"
        style={{ marginBottom: '0 rem' }} // Adjust the margin as needed
      />
    </div>
  </a>
 <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
  {user ? (
    <>
      <div className="relative" >
        <button
          className="text-gray-700 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 md:text-gray-600 md:font-medium"
          onMouseEnter={handleToggleDropdown}
          onMouseLeave={() => setTimeout(() => handleToggleDropdown(false), 500)}
          // onClick={handleToggleDropdown}
        >
          <div className="flex gap-2 items-center" >
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
          <ul className="absolute bg-white border border-gray-300 mt-1 py-1 w-36 text-gray-800 rounded-lg shadow-lg whitespace-nowrap">
            <li>
              <button
                className="block px-2 md:px-4 py-2 hover:bg-gray-200 transition duration-200 w-full text-left"
                onClick={() => {navigate('/smart')}}
              >
                Smart Actions
              </button>
            </li>
            <li>
              <button
                className="block px-2 md:px-4 py-2 hover:bg-gray-200 transition duration-200 w-full text-left"
                onClick={() => navigate('/assistant')}
              >
                Reply Assistant
              </button>
            </li>
          </ul>
        )}
      </div>
      <ul className="text-gray-700 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 md:text-gray-600 md:font-medium">
          <li className="duration-150 hover:text-gray-900">
          <a href="/home" className="block">
          <div className="flex gap-2 items-center">
                    <img src={audioImg} className="w-6 h-6" />
                      Audio
                     
              </div>
              </a>
            </li>
            <li className="duration-150 hover:text-gray-900">
          <a href="/online" className="block">
          <div className="flex gap-2 items-center">
                    <img src={textImg} className="w-6 h-6" />
                      Text
                     
              </div>
              </a>
            </li>
            <li className="duration-150 hover:text-gray-900">
          <a href="/history" className="block">
          <div className="flex gap-2 items-center">
                    <img src={historyImg} className="w-6 h-6" />
                     History
                     
              </div>
              </a>
            </li>
            <li className="duration-150 hover:text-gray-900">
          <a href="/logout" className="block">
          <div className="flex gap-2 items-center" onClick={handleLogout}>
                    <img src={logoutImg} className="w-6 h-6" />
                      Logout
                     
              </div>
              </a>
            </li>
      </ul>
      {/* <a href="/home" className="text-lg md:text-xl font-light hover:text-gray-500 transition-colors duration-200">
        <div className="flex items-center space-x-1">
          <img src={audioImg} className="w-4 h-4 md:w-6 md:h-6" alt="Audio" />
          Audio
        </div>
      </a> */}
      {/* <a href="/online" className="text-lg md:text-xl font-light hover:text-gray-500 transition-colors duration-200">
        <div className="flex items-center space-x-1">
          <img src={textImg} className="w-4 h-4 md:w-6 md:h-6" alt="Text" />
          Text
        </div>
      </a> */}
      {/* <a href="/history" className="text-lg md:text-xl font-light hover:text-gray-500 transition-colors duration-200">
        <div className="flex items-center space-x-1">
          <img src={historyImg} className="w-4 h-4 md:w-6 md:h-6" alt="History" />
          History
        </div>
      </a> */}
      {/* <div
        className="whitespace-nowrap text-lg md:text-xl font-light cursor-pointer hover:text-gray-500 transition-colors duration-200"
        onClick={handleLogout}
      >
        <div className="flex items-center space-x-1">
          <img src={logoutImg} className="w-4 h-4 md:w-6 md:h-6" alt="Logout" />
          Logout
        </div>
      
      </div> */}
      
    </>
  ) : (
    // <a href="/" className="whitespace-nowrap text-lg md:text-xl font-light hover:text-gray-500 transition-colors duration-200">
    //   Login
    // </a>
    <a href="/" className="block">
    <div className="flex gap-2 items-center">
              <img src={loginImg} className="w-6 h-6" />
               Login
               
        </div>
        </a>
  )}
</div>
</div>

    )
}
export default Navbar;
