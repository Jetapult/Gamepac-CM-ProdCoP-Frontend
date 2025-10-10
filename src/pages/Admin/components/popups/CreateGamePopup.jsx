import { Fragment, useEffect, useState } from "react";
import api from "../../../../api";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { classNames, emailRegex } from "../../../../utils";
import loadingIcon from "../../../../assets/transparent-spinner.svg";
import Select from "react-select";

const CreateGamePopup = ({
  setShowModal,
  setToastMessage,
  selectedGame,
  setSelectedGame,
  studio_id,
  setGames,
}) => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [gameData, setGameData] = useState({
    game_name: "",
    short_names: "",
    game_type: "",
    playstore_link: "",
    appstore_link: "",
    app_id: "",
    package_name: "",
    studio_id: studio_id?.toString(),
    generateweeklyreport: "none",
  });
  const [product_manager, setProductManager] = useState(null);
  const [producer, setProducer] = useState(null);
  const [lead_engineer, setLeadEngineer] = useState(null);

  const [error, setError] = useState({
    game_name: "",
    short_names: "",
    game_type: "",
    playstore_link: "",
    appstore_link: "",
    app_id: "",
    package_name: "",
  });
  const [submitLoader, setSubmitLoader] = useState(false);

  const onhandleChange = (event) => {
    const { name, value } = event.target;
    setGameData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "", links: "" }));
  };

  const closePopup = () => {
    setShowModal(false);
    setSelectedGame({});
  };

  const createStudio = async () => {
    try {
      const stringFields = ["game_name", "game_type"];
      stringFields.forEach((field) => {
        if (!gameData[field] || gameData[field].length < 2) {
          setError((prev) => ({
            ...prev,
            [field]: `This field must be at least 2 characters long`,
          }));
          return;
        }
      });

      if (gameData.playstore_link) {
        if (!gameData.package_name) {
          setError((prev) => ({
            ...prev,
            package_name: "package name is required with playstore link",
          }));
          return;
        } else if (!gameData.playstore_link.includes(gameData.package_name)) {
          setError((prev) => ({
            ...prev,
            playstore_link: "package name must be part of playstore link",
          }));
          return;
        }
      }

      if (gameData.appstore_link) {
        if (!gameData.app_id) {
          setError((prev) => ({
            ...prev,
            app_id: "app_id is required with appstore_link",
          }));
          return;
        } else if (!gameData.appstore_link.includes(gameData.app_id)) {
          setError((prev) => ({
            ...prev,
            appstore_link: "AppId must be part of appstore link",
          }));
          return;
        }
      }

      if (!gameData.playstore_link && !gameData.appstore_link) {
        setError((prev) => ({
          ...prev,
          links: "Either playstore link or appstore link is required",
        }));
        return;
      }

      if (Object.values(error).every((value) => value === "")) {
        setSubmitLoader(true);
        const requestbody = {
          ...gameData,
          product_manager: product_manager?.value,
          producer: producer?.value,
          lead_engineer: lead_engineer?.value,
        };
        const create_game_response = selectedGame?.id
          ? await api.put(
              `/v1/games/${studio_id}/${selectedGame?.id}`,
              requestbody
            )
          : await api.post("v1/games", requestbody);
        setToastMessage({
          show: true,
          message: selectedGame.id
            ? "Game data updated successfully"
            : "Game added successfully",
          type: "success",
        });
        setSubmitLoader(false);
        if (create_game_response.status === 201) {
          selectedGame?.id
            ? setGames((prev) =>
                prev.map((studio) =>
                  studio.id === selectedGame.id
                    ? {
                        ...gameData,
                        id: selectedGame.id,
                        product_manager_name: product_manager?.label,
                        producer_name: producer?.label,
                        lead_engineer_name: lead_engineer?.label,
                      }
                    : studio
                )
              )
            : setGames((prev) => [
                ...prev,
                {
                  ...gameData,
                  id: create_game_response.data.data.id,
                  product_manager_name: product_manager?.label,
                  producer_name: producer?.label,
                  lead_engineer_name: lead_engineer?.label,
                },
              ]);
          closePopup();
          setGameData({
            game_name: "",
            short_names: "",
            game_type: "",
            playstore_link: "",
            appstore_link: "",
            app_id: "",
            package_name: "",
            studio_id: studio_id,
          });
        }
      }
    } catch (err) {
      console.log(err, "err");
      setSubmitLoader(false);
      if (err?.response?.data?.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  const getListofUsers = async () => {
    try {
      const usersResponse = await api.get(
        `v1/users/studio/${studio_id}/users?current_page=${currentPage}&limit=20`
      );
      const usersData = usersResponse.data.data;
      const usersList = usersData.map((x) => ({ label: x.name, value: x.id }));
      currentPage === 1
        ? setUsers(usersList)
        : setUsers((prev) => [...prev, ...usersList]);
      setTotalUsers(usersResponse.data.totalUsers);
    } catch (err) {
      console.log(err, "err");
    }
  };

  useEffect(() => {
    if (selectedGame?.id) {
      setGameData(selectedGame);
      setProductManager({
        label: selectedGame.product_manager_name,
        value: selectedGame.product_manager,
      });
      setProducer({
        label: selectedGame.producer_name,
        value: selectedGame.producer,
      });
      setLeadEngineer({
        label: selectedGame.lead_engineer_name,
        value: selectedGame.lead_engineer,
      });
    }
  }, [selectedGame]);

  useEffect(() => {
    getListofUsers();
  }, [currentPage]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[800px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">
              {selectedGame?.id ? "Edit" : "Add"} Game
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-8 py-4 overflow-y-auto max-h-[550px] grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Game name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="game_name"
                name="game_name"
                type="text"
                value={gameData.game_name}
                onChange={onhandleChange}
              />
              {error.game_name && (
                <span className="text-[#f58174] text-[12px]">
                  {error.game_name}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="short_names"
              >
                Short names
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="short_names"
                name="short_names"
                type="text"
                value={gameData.short_names}
                onChange={onhandleChange}
              />
              {error.short_names && (
                <span className="text-[#f58174] text-[12px]">
                  {error.short_names}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="game_type"
              >
                Game type
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="game_type"
                name="game_type"
                type="text"
                value={gameData.game_type}
                onChange={onhandleChange}
              />
              {error.game_type && (
                <span className="text-[#f58174] text-[12px]">
                  {error.game_type}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="playstore_link"
              >
                Playstore Link
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="playstore_link"
                name="playstore_link"
                type="text"
                value={gameData.playstore_link}
                onChange={onhandleChange}
              />
              {error.playstore_link && (
                <span className="text-[#f58174] text-[12px]">
                  {error.playstore_link}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="package_name"
              >
                Package name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="package_name"
                name="package_name"
                type="text"
                value={gameData.package_name}
                onChange={onhandleChange}
              />
              {error.package_name && (
                <span className="text-[#f58174] text-[12px]">
                  {error.package_name}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="appstore_link"
              >
                App Store Link
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="appstore_link"
                name="appstore_link"
                type="text"
                value={gameData.appstore_link}
                onChange={onhandleChange}
              />
              {error.appstore_link && (
                <span className="text-[#f58174] text-[12px]">
                  {error.appstore_link}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="app_id"
              >
                App ID
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="app_id"
                name="app_id"
                type="text"
                value={gameData.app_id}
                onChange={onhandleChange}
              />
              {error.app_id && (
                <span className="text-[#f58174] text-[12px]">
                  {error.app_id}
                </span>
              )}
            </div>
            <div className="">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="product_manager"
              >
                Product manager
              </label>
              <Select
                options={users}
                value={product_manager}
                onChange={(val) => setProductManager(val)}
                onMenuScrollToBottom={() => {
                  if (users.length < totalUsers) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                placeholder={""}
              />
            </div>
            <div className="">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="producer"
              >
                Producer
              </label>
              <Select
                options={users}
                value={producer}
                onChange={(val) => setProducer(val)}
                onMenuScrollToBottom={() => {
                  if (users.length < totalUsers) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                placeholder={""}
              />
            </div>

            <div className="">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="lead_engineer"
              >
                Lead Engineer
              </label>
              <Select
                options={users}
                value={lead_engineer}
                onChange={(val) => setLeadEngineer(val)}
                onMenuScrollToBottom={() => {
                  if (users.length < totalUsers) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                placeholder={""}
              />
            </div>

            {error.links && (
              <span className="text-[#f58174] text-[12px]">{error.links}</span>
            )}
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#000] text-[#B9FF66] font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 cursor-not-allowed"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <button
                className="bg-[#B9FF66] text-[#000] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:bg-[#000] hover:text-[#B9FF66]"
                type="button"
                onClick={createStudio}
              >
                {selectedGame?.id ? "Save" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePopup;
