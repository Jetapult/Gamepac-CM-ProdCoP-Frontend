import React, { useEffect, useRef, useState } from "react";
import Overview from "./components/Overview";
import Onboarding from "./components/Onboarding";
import AIReplies from "./components/AIReplies";
import Campaign from "./components/Campaign";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { id: "overview", label: "Overview" },
  { id: "app-onboarding", label: "App Onboarding Setup" },
  { id: "ai-replies", label: "AI Replies" },
  // { id: "campaign", label: "Campaign Integration" },
];

const Docs = () => {
  const [activeMenu, setActiveMenu] = useState(menuItems[0].id);
  const navigate = useNavigate();

  const handleMenuClick = (id) => {
    navigate(`/docs/${id}`);
    setActiveMenu(id);
  };

  useEffect(() => {
    const pathSegment = location.pathname.split('/').pop();
    setActiveMenu(pathSegment);
  }, [location.pathname]);

  return (
    <div className="docs-container flex bg-[#ffffff]">
      <div className="menu w-1/5 p-3 sticky top-[58px] py-1/5 z-10 border-r border-r-[#e5e5e5] border-r-[1px] h-[calc(100vh-3.5rem)] pt-4 hidden sm:block">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item p-1.5 pl-5 cursor-pointer rounded hover:bg-black hover:text-[#B9FF66] mb-1 ${
              activeMenu === item.id ? "active bg-black text-[#B9FF66]" : ""
            }`}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="content w-full sm:w-4/5">
        {activeMenu === "overview" && <Overview />}
        {activeMenu === "app-onboarding" && <Onboarding />}
        {activeMenu === "ai-replies" && <AIReplies />}
        {/* {activeMenu === "campaign" && <Campaign />} */}
      </div>
    </div>
  );
};

export default Docs;
