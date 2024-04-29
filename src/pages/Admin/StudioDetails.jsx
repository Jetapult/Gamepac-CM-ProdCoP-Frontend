import React, { useEffect, useState } from "react";
import ToastMessage from "../../components/ToastMessage";
import StudioUsers from "./components/studiousers/StudioUsers";
import StudioGames from "./components/studiogames/StudioGames";
import api from "../../api";
import StudioSettings from "./components/studioSettings/StudioSettings";
import StudioDashboard from "./components/studioDashboard/StudioDashboard";
import { useSelector } from "react-redux";

const StudioDetails = () => {
  const adminData = useSelector((state) => state.admin.selectedStudio);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });

  const tabs = [
    {
      id: "0",
      label: "Overview",
      value: "overview",
      show: true,
    },
    {
      id: "1",
      label: "Users",
      value: "users",
      show: true,
    },
    {
      id: "2",
      label: "Games",
      value: "games",
      show: !adminData?.studio_type?.includes("studio_manager") ? true : false,
    },
    {
      id: "3",
      label: "Settings",
      value: "settings",
      show: true,
    },
  ];

  const getUsersBystudioSlug = async (pageNum) => {
    try {
      const users_response = await api.get(
        `/v1/users/studio/${adminData.slug}?current_page=${
          pageNum ? pageNum : currentPage
        }&limit=10${searchTerm ? "&searchTerm=" + searchTerm : ""}`
      );
      setUsers(users_response.data.data);
      setTotalUsers(users_response.data.totalUsers);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (adminData?.id) {
      getUsersBystudioSlug();
    }
  }, [currentPage, adminData?.id]);

  //   useEffect(() => {
  //     const getSearchData = setTimeout(() => {
  //       if(searchTerm.length > 0){
  //         getUsersBystudioId();
  //       }
  //     }, 2000)
  //     return () => clearTimeout(getSearchData)
  // }, [searchTerm])

  return (
    <>
      <div className="flex border-b-[0.5px] border-b-[#e5e5e5] my-3 pl-3">
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            {tab.show && <p
              className={`mr-6 cursor-pointer text-lg ${
                selectedTab === tab.value
                  ? "text-black border-b-[2px] border-black"
                  : "text-[#808080]"
              }`}
              onClick={() => {
                setSelectedTab(tab.value);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </p>}
          </React.Fragment>
        ))}
      </div>
      {selectedTab === "overview" && <StudioDashboard studioData={adminData} />}
      {selectedTab === "users" && (
        <StudioUsers
          studio_id={adminData?.id}
          setToastMessage={setToastMessage}
          users={users}
          setUsers={setUsers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalUsers={totalUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          getUsersBystudioSlug={getUsersBystudioSlug}
        />
      )}
      {selectedTab === "games" && (
        <StudioGames
          studio_id={adminData?.id}
          setToastMessage={setToastMessage}
          users={users}
          studioData={adminData}
        />
      )}

      {selectedTab === "settings" && (
        <StudioSettings
          studioData={adminData}
          setToastMessage={setToastMessage}
          setSelectedTab={setSelectedTab}
        />
      )}

      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </>
  );
};

export default StudioDetails;
