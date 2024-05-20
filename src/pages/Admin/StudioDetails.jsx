import React, { useEffect, useState } from "react";
import ToastMessage from "../../components/ToastMessage";
import StudioUsers from "./components/studiousers/StudioUsers";
import StudioGames from "./components/studiogames/StudioGames";
import api from "../../api";
import StudioSettings from "./components/studioSettings/StudioSettings";
import StudioDashboard from "./components/studioDashboard/StudioDashboard";
import { useDispatch, useSelector } from "react-redux";
import Joyride, { STATUS } from "react-joyride";
import { StudioSteps, externalSteps, jetapultSteps, steps } from "../../utils";
import { onboardingProcess } from "../../store/reducer/onboardingSlice";
import { updateUserData } from "../../store/reducer/userSlice";
import StudioAppStoreKeys from "./components/studioAppStoreKeys/studioAppStoreKeys";

const StudioDetails = () => {
  const userData = useSelector((state) => state.user.user);
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
  const [run, setRun] = useState(false);
  const dispatch = useDispatch();

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
    {
      id: "4",
      label: "API key",
      value: "apple-api-key",
      show: !adminData?.studio_type?.includes("studio_manager") ? true : false,
    },
  ];

  const updateUserOnboardingStatus = async () => {
    try {
      const updateUserOnboardingStatus_response = await api.put(
        `/v1/users/update-onboard-user-status`
      );
      const data = {
        has_completed_onboarding:
          updateUserOnboardingStatus_response.updateUserOnboardingStatus_response,
      };
      dispatch(updateUserData(data));
    } catch (err) {
      console.log(err);
    }
  };

  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      updateUserOnboardingStatus();
    }
    if (index === steps.length - 1) {
      dispatch(onboardingProcess(true));
    }
  };

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

  useEffect(() => {
    if (userData.id && !userData.has_completed_onboarding) {
      setRun(true);
    }
  }, [userData.id]);

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
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={
          userData?.studio_type?.includes("studio_manager")
            ? jetapultSteps
            : userData?.studio_type?.includes("external_studio")
            ? externalSteps
            : StudioSteps
        }
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      <div className="flex border-b-[0.5px] border-b-[#e5e5e5] my-3 pl-3">
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            {tab.show && (
              <p
                className={`mr-6 cursor-pointer text-lg tab-${tab.id} ${
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
              </p>
            )}
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
          setSelectedTab={setSelectedTab}
        />
      )}

      {selectedTab === "settings" && (
        <StudioSettings
          studioData={adminData}
          setToastMessage={setToastMessage}
          setSelectedTab={setSelectedTab}
        />
      )}

      {selectedTab === "apple-api-key" && (
        <StudioAppStoreKeys
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
