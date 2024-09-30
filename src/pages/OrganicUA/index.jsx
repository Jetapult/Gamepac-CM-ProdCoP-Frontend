import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SmartFeedback from "./components/smartFeedback/SmartFeedback";
import ReviewInsights from "./components/ReviewInsights/ReviewInsights";
import Templates from "./components/Templates";
import api from "../../api";
import WeeklyReport from "./components/WeeklyReport/WeeklyReport";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const menuItems = [
  {
    id: "smart-feedback",
    label: "Smart Feedback",
    subMenu: [{ id: "templates", label: "Templates" }],
  },
  { id: "review-insights", label: "Review Insights" },
  { id: "weekly-report", label: "Weekly Report" },
];

const OrganicUA = () => {
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const [templates, setTemplates] = useState([]);
  const [activeMenu, setActiveMenu] = useState(menuItems[0].id);
  const [games, setGames] = useState([]);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const navigate = useNavigate();
  const params = useParams();
  const studio_slug = params.studio_slug;

  const handleMenuClick = (id) => {
    navigate(
      studio_slug ? `/organic-ua/${id}/${studio_slug}` : `/organic-ua/${id}`
    );
    setActiveMenu(id);
  };

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const relevantSegment = studio_slug
      ? pathSegments[pathSegments.length - 2]
      : pathSegments.pop();
    setActiveMenu(relevantSegment);
  }, [studio_slug, location.pathname]);

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

  const fetchAllgames = async () => {
    try {
      const gamesresponse = await api.get(
        `/v1/games/platform/${studio_slug ? studio_slug : userData.studio_id}`
      );
      setGames(gamesresponse.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsGameLoading(false);
    }
  };

  useEffect(() => {
    if (studio_slug ? studios.length : userData.studio_id) {
      getAllReplyTemplates();
      fetchAllgames();
    }
  }, [studios.length, userData?.id]);

  return (
    <div className="docs-container flex">
      <div className="bg-[#ffffff] w-52 min-w-[13rem] max-w-[13rem] p-3 sticky top-[58px] py-1/5 z-10 shadow-md h-[calc(100vh-3.5rem)] pt-4 hidden sm:block">
        {menuItems.map((item) => (
          <div key={item.id}>
            <p
              className={`menu-item p-1.5 pl-5 cursor-pointer rounded hover:bg-gray-100 ${
                activeMenu === item.id
                  ? "active bg-[#f7e5e5] text-[#ff1053]"
                  : ""
              }`}
              onClick={() => handleMenuClick(item.id)}
            >
              {item.label}
              {item?.subMenu?.length && (
                <ChevronDownIcon className="inline-block ml-2 h-4 w-4" />
              )}
            </p>
            <div
              className={`sub-menu my-1 ${
                activeMenu === item.id ||
                item?.subMenu?.some((subItem) => subItem.id === activeMenu)
                  ? "open"
                  : ""
              }`}
            >
              {item?.subMenu?.map((subItem) => (
                <p
                  key={subItem.id}
                  className={`p-1 px-2 pl-8 cursor-pointer rounded hover:bg-gray-100 ${
                    activeMenu === subItem.id
                      ? "active bg-[#f7e5e5] text-[#ff1053]"
                      : ""
                  }`}
                  onClick={() => handleMenuClick(subItem.id)}
                >
                  {subItem.label}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="content flex-auto sm:w-auto px-6">
        {activeMenu === "smart-feedback" && (
          <SmartFeedback
            studio_slug={studio_slug}
            templates={templates}
            setTemplates={setTemplates}
            setIsGameLoading={setIsGameLoading}
            isGameLoading={isGameLoading}
            games={games}
            setGames={setGames}
          />
        )}
        {activeMenu === "templates" && (
          <Templates
            studio_slug={studio_slug}
            templates={templates}
            setTemplates={setTemplates}
          />
        )}
        {activeMenu === "review-insights" && (
          <ReviewInsights
            studio_slug={studio_slug}
            games={games}
            setGames={setGames}
          />
        )}
        {activeMenu === "weekly-report" && (
          <WeeklyReport games={games} studio_slug={studio_slug} setGames={setGames} />
        )}
      </div>
    </div>
  );
};

export default OrganicUA;
