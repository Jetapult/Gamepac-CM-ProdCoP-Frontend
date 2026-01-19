import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import {
  PlugCircle,
  AltArrowDown,
  AddSquare,
  Gamepad,
  UsersGroupTwoRounded,
  UserRounded,
  LinkCircle,
  Stars
} from "@solar-icons/react";
import { addStudioData, addStudios } from "../../store/reducer/adminSlice";
import puzzleIcon from "../../assets/super-agents/puzzle-icon.svg";

// Import components
import {
  CreateStudioModal,
  StudioSettings,
  StudioOnboardingSettings,
  GamesSettings,
  UsersSettings,
  ConnectionsSettings,
  IntegrationsSettings,
  StudioProfileSettings,
} from "./Settings/components";
import { Plus } from "lucide-react";

// Menu items configuration - visibility controlled by selected studio type
const getSettingsMenuItems = (isSelectedStudioManager, isUserStudioManager) => {
  const items = [
    { id: "studio", label: "Studio", icon: Gamepad, showForManager: true },
    { id: "games", label: "Games", icon: "puzzle", showForManager: false }, // Special case for SVG
    { id: "users", label: "Users", icon: UsersGroupTwoRounded, showForManager: true },
    { id: "studio-onboarding", label: "Studio onboarding", icon: UserRounded, showForManager: true },
    { id: "connections", label: "Connections", icon: PlugCircle, showForManager: true },
    { id: "integrations", label: "Integrations", icon: LinkCircle, showForManager: false },
    { id: "studio-profile", label: "Studio Profile", icon: UserRounded, showForManager: false },
    // { id: "billing", label: "Billing", icon: Stars, showForManager: false },
  ];

  // If logged-in user is studio manager AND selected studio is also a manager studio
  // Show only manager tabs (Users, Studio onboarding, Connections, Integrations)
  if (isUserStudioManager && isSelectedStudioManager) {
    return items.filter(item => item.showForManager);
  }

  // For regular studios (or when studio manager selects a regular studio)
  // Show all tabs except studio-onboarding
  return items.filter(item => item.id !== "studio-onboarding");
};

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = useSelector((state) => state.user.user);
  const studioList = useSelector((state) => state.admin.studios);
  const selectedStudio = useSelector((state) => state.admin.selectedStudio);
  const ContextStudioData = useSelector((state) => state.admin.ContextStudioData);

  const isUserStudioManager = userData?.studio_type?.includes("studio_manager");

  // Studio dropdown state
  const [showStudioDropdown, setShowStudioDropdown] = useState(false);
  const [selectedStudioLocal, setSelectedStudioLocal] = useState(null);
  const [showCreateStudioModal, setShowCreateStudioModal] = useState(false);
  const [toastMessage, setToastMessage] = useState({ show: false, message: "", type: "" });
  const studioDropdownRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const prevStudioIdRef = useRef(null);

  // Get section from URL (only once on mount)
  const initialSectionRef = useRef(() => {
    const path = location.pathname;
    const section = path.split("/").pop();
    return section && section !== "settings" ? section : "studio";
  });
  const [activeSection, setActiveSection] = useState(initialSectionRef.current());

  // Determine if selected studio is a manager studio
  const isSelectedStudioManager = selectedStudioLocal?.studio_type?.includes("studio_manager");

  // Get menu items based on selected studio type
  const settingsMenuItems = getSettingsMenuItems(isSelectedStudioManager, isUserStudioManager);

  // Initialize and validate section once studio is loaded
  useEffect(() => {
    if (selectedStudioLocal?.id && !isInitialized) {
      // First time studio is loaded - validate the URL section
      const isValidSection = settingsMenuItems.some((item) => item.id === activeSection);
      if (!isValidSection) {
        setActiveSection("studio");
        navigate(`/super-agent/settings/studio`, { replace: true });
      }
      setIsInitialized(true);
      prevStudioIdRef.current = selectedStudioLocal.id;
    }
  }, [selectedStudioLocal?.id, settingsMenuItems, isInitialized]);

  // When studio changes (after initial load), check if current tab is valid
  useEffect(() => {
    if (isInitialized && selectedStudioLocal?.id && prevStudioIdRef.current !== selectedStudioLocal.id) {
      // Studio changed - check if current tab is available
      const isCurrentTabAvailable = settingsMenuItems.some((item) => item.id === activeSection);
      if (!isCurrentTabAvailable) {
        // Current tab not available for this studio type, switch to "studio"
        setActiveSection("studio");
        navigate(`/super-agent/settings/studio`);
      }
      prevStudioIdRef.current = selectedStudioLocal.id;
    }
  }, [selectedStudioLocal?.id, settingsMenuItems, isInitialized]);

  // Initialize selected studio - prioritize already selected studio from Redux
  useEffect(() => {
    // Only for studio managers with studio list available
    if (isUserStudioManager && studioList?.length > 0) {
      if (!selectedStudioLocal) {
        // Priority: Redux selectedStudio > localStorage > first in list
        const storedSlug = localStorage.getItem("selectedStudio");
        const studio = selectedStudio?.id
          ? selectedStudio
          : studioList.find(s => s.slug === storedSlug) || studioList[0];
        setSelectedStudioLocal(studio);
        if (!selectedStudio?.id) {
          dispatch(addStudioData(studio));
        }
      }
    } else if (!isUserStudioManager && ContextStudioData?.id) {
      // For regular users, use their context studio
      setSelectedStudioLocal(ContextStudioData);
    }
  }, [studioList, selectedStudio, ContextStudioData, isUserStudioManager]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studioDropdownRef.current && !studioDropdownRef.current.contains(event.target)) {
        setShowStudioDropdown(false);
      }
    };
    if (showStudioDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStudioDropdown]);

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage.show) {
      const timer = setTimeout(() => {
        setToastMessage({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage.show]);

  const handleStudioSelect = (studio) => {
    setSelectedStudioLocal(studio);
    dispatch(addStudioData(studio));
    localStorage.setItem("selectedStudio", studio.slug);
    localStorage.setItem("selectedStudioId", studio.id);
    setShowStudioDropdown(false);
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/super-agent/settings/${sectionId}`);
  };

  const renderSettingsContent = () => {
    const studioData = selectedStudioLocal || ContextStudioData;

    switch (activeSection) {
      case "studio":
        return <StudioSettings studioData={studioData} setToastMessage={setToastMessage} />;
      case "games":
        return <GamesSettings studioData={studioData} />;
      case "users":
        return <UsersSettings studioData={studioData} />;
      case "studio-onboarding":
        return <StudioOnboardingSettings studioData={studioData} studios={studioList} />;
      case "connections":
        return <ConnectionsSettings studioData={studioData} />;
      case "integrations":
        return <IntegrationsSettings studioData={studioData} />;
      case "studio-profile":
        return <StudioProfileSettings studioData={studioData} />;
      case "billing":
        return <BillingSettings />;
      default:
        return <StudioSettings studioData={studioData} setToastMessage={setToastMessage} />;
    }
  };

  const BillingSettings = () => (
    <div className="flex flex-col gap-5">
      <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
        Billing
      </h3>
      <div className="border border-[#f6f6f6] rounded-lg p-6">
        <p className="font-urbanist text-[14px] text-[#6d6d6d]">
          Manage your billing and subscription settings here.
        </p>
      </div>
    </div>
  );

  // Show skeleton loader until studio is initialized
  if (!isInitialized) {
    return (
      <div className="relative flex w-full h-screen bg-white overflow-hidden font-urbanist">
        <Sidebar />
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Settings Sidebar Skeleton */}
          <div className="w-[290px] min-w-[290px] h-full bg-white border-r border-[#f6f6f6] py-6 px-4 flex flex-col gap-5">
            <h2 className="font-urbanist font-semibold text-[18px] text-[#141414]">
              Settings
            </h2>
            <nav className="flex flex-col gap-4 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 w-full rounded-lg">
                  <div className="w-9 h-9 bg-slate-200 rounded-[5px]"></div>
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </div>
              ))}
            </nav>
          </div>

          {/* Settings Content Skeleton */}
          <div className="flex-1 h-full overflow-y-auto">
            {/* Studio Selector Skeleton */}
            <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b border-[#f6f6f6] animate-pulse">
              <div className="h-[34px] bg-slate-200 rounded w-[360px]"></div>
            </div>

            {/* Content Skeleton */}
            <div className="px-8 py-5 animate-pulse">
              {/* Header skeleton */}
              <div className="flex items-center justify-between mb-5">
                <div className="h-6 bg-slate-200 rounded w-40"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
              </div>

              {/* Card skeleton */}
              <div className="border border-[#f6f6f6] rounded-xl p-6 bg-white flex flex-col gap-5">
                <div className="h-5 bg-slate-200 rounded w-36"></div>

                {/* Form fields skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                      <div className="h-11 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>

                {/* Textarea skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                  <div className="h-24 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden font-urbanist">
      <Sidebar />
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-[290px] min-w-[290px] h-full bg-white border-r border-[#f6f6f6] py-6 px-4 flex flex-col gap-5">
          <h2 className="font-urbanist font-semibold text-[18px] text-[#141414]">
            Settings
          </h2>
          <nav className="flex flex-col gap-4">
            {settingsMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`flex items-center gap-2 w-full rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#f6f6f6]"
                      : "bg-white hover:bg-[#f6f6f6]"
                  }`}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-[5px]">
                    {item.icon === "puzzle" ? (
                      <img src={puzzleIcon} alt="Games" className="w-6 h-6" />
                    ) : (
                      <IconComponent weight="Linear" size={24} color="#6D6D6D" />
                    )}
                  </div>
                  <span className="font-gilroy font-medium text-[16px] text-[#6d6d6d] leading-6">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 h-full overflow-y-auto">
          {/* Studio Selector Header - Only for studio managers */}
          {isUserStudioManager && studioList?.length > 0 && (
            <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b border-[#f6f6f6]">
              <div className="relative" ref={studioDropdownRef}>
                <button
                  onClick={() => setShowStudioDropdown(!showStudioDropdown)}
                  className="flex items-center justify-between w-[360px] px-[10px] py-[5px] bg-white border border-[#f6f6f6] rounded"
                >
                  <div className="flex items-center gap-2">
                    {selectedStudioLocal?.studio_logo && (
                      <div className="w-5 h-5 rounded-[3px] border border-[#f7f7f7] overflow-hidden">
                        <img
                          src={selectedStudioLocal.studio_logo}
                          alt={selectedStudioLocal.studio_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="font-medium text-[14px] text-[#141414]">
                      {selectedStudioLocal?.studio_name || "Select Studio"}
                    </span>
                  </div>
                  <AltArrowDown
                    weight="Linear"
                    size={16}
                    color="#6D6D6D"
                    className={`transition-transform ${showStudioDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Studio Dropdown */}
                {showStudioDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-[360px] bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {studioList.map((studio) => (
                      <button
                        key={studio.id}
                        onClick={() => handleStudioSelect(studio)}
                        className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-[#f6f6f6] transition-colors ${
                          selectedStudioLocal?.id === studio.id ? "bg-[#f1fcf6]" : ""
                        }`}
                      >
                        {studio.studio_logo && (
                          <div className="w-5 h-5 rounded-[3px] border border-[#f7f7f7] overflow-hidden shrink-0">
                            <img
                              src={studio.studio_logo}
                              alt={studio.studio_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-urbanist text-[14px] text-[#141414] truncate">
                          {studio.studio_name}
                        </span>
                        {selectedStudioLocal?.id === studio.id && (
                          <span className="ml-auto text-[#1f6744]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                    {/* Create Studio Button */}
                    <button
                      onClick={() => {
                        setShowStudioDropdown(false);
                        setShowCreateStudioModal(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#f6f6f6] transition-colors border-t border-[#f6f6f6]"
                    >
                      <Plus size={24} color="#1f6744" strokeWidth={1} />
                      <span className="font-urbanist font-medium text-[14px] text-[#1f6744]">
                        Create Studio
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`px-8 ${isUserStudioManager && studioList?.length > 0 ? "py-5" : "py-[66px]"}`}>
            <div className="max-w-full">
              {renderSettingsContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {toastMessage.show && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toastMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <p className="font-urbanist text-[14px]">{toastMessage.message}</p>
        </div>
      )}

      {/* Create Studio Modal */}
      {showCreateStudioModal && (
        <CreateStudioModal
          onClose={() => setShowCreateStudioModal(false)}
          onSuccess={(newStudio) => {
            // Add to Redux store
            dispatch(addStudios([...studioList, newStudio]));
            // Select the new studio
            setSelectedStudioLocal(newStudio);
            dispatch(addStudioData(newStudio));
            localStorage.setItem("selectedStudio", newStudio.slug);
            localStorage.setItem("selectedStudioId", newStudio.id);
            setShowCreateStudioModal(false);
            setToastMessage({
              show: true,
              message: "Studio created successfully",
              type: "success",
            });
          }}
        />
      )}
    </div>
  );
};

export default Settings;
