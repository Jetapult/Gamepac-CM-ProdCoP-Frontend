import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SmartFeedback from "./components/SmartFeedback";
import ReviewInsights from "./components/ReviewInsights";

const menuItems = [
  { id: "smart-feedback", label: "Smart Feedback" },
  { id: "tags", label: "Tags" },
  { id: "templates", label: "Templates" },
  { id: "review-insights", label: "Review Insights" },
];

const OrganicUA = () => {
  const [activeMenu, setActiveMenu] = useState(menuItems[0].id);
  const navigate = useNavigate();
  const params = useParams();
  const studio_slug = params.studio_slug;

  const handleMenuClick = (id) => {
    navigate(studio_slug ? `/organic-ua/${id}/${studio_slug}` : `/organic-ua/${id}`);
    setActiveMenu(id);
  };

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const relevantSegment = studio_slug ? pathSegments[pathSegments.length - 2] : pathSegments.pop();
    setActiveMenu(relevantSegment);
  }, [studio_slug,location.pathname]);

  return (
    <div className="docs-container flex bg-[#ffffff]">
      <div className="menu w-40 p-3 sticky top-[58px] py-1/5 z-10 shadow-md h-[calc(100vh-3.5rem)] pt-4 hidden sm:block">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item p-1.5 pl-5 cursor-pointer rounded ${
              activeMenu === item.id ? "active bg-[#f0f6ff] text-[#1e96fc]" : ""
            }`}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="content w-full sm:w-4/5 p-6">
        {activeMenu === "smart-feedback" && <SmartFeedback studio_slug={studio_slug} />}
        {activeMenu === "review-insights" && <ReviewInsights packageName={"com.holycowstudio.my.home.design.makeover.games.dream.word.redecorate.masters.life.house.decorating"} />}
      </div>
    </div>
  );
};

export default OrganicUA;
