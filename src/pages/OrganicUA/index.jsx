import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SmartFeedback from "./components/smartFeedback/SmartFeedback";
import ReviewInsights from "./components/ReviewInsights";
import Templates from "./components/Templates";
import api from "../../api";

const menuItems = [
  { id: "smart-feedback", label: "Smart Feedback" },
  { id: "templates", label: "Templates" },
  { id: "review-insights", label: "Review Insights" },
];

const OrganicUA = () => {
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const [templates, setTemplates] = useState([]);
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

  const getAllReplyTemplates = async () => {
    try {
      const templatesResponse = await api.get(
        `/v1/organic-ua/reply-templates/${
          studio_slug
            ? studios.filter((x) => x.slug === studio_slug)[0].id
            : userData.studio_id
        }`
      );
      setTemplates(templatesResponse.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (studio_slug ? studios.length : 1) {
      getAllReplyTemplates();
    }
  }, [studios.length]);

  return (
    <div className="docs-container flex">
      <div className="bg-[#ffffff] w-52 min-w-[13rem] max-w-[13rem] p-3 sticky top-[58px] py-1/5 z-10 shadow-md h-[calc(100vh-3.5rem)] pt-4 hidden sm:block">
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
      <div className="content flex-auto sm:w-auto px-6">
        {activeMenu === "smart-feedback" && <SmartFeedback studio_slug={studio_slug} templates={templates} setTemplates={setTemplates} />}
        {activeMenu === "review-insights" && <ReviewInsights studio_slug={studio_slug} />}
        {activeMenu === "templates" && <Templates studio_slug={studio_slug} templates={templates} setTemplates={setTemplates} />}
      </div>
    </div>
  );
};

export default OrganicUA;
