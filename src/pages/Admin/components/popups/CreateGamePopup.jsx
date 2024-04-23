import { Fragment, useEffect, useState } from "react";
import api from "../../../../api";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { classNames, emailRegex } from "../../../../utils";
import loadingIcon from "../../../../assets/transparent-spinner.svg";

const CreateGamePopup = ({
  setShowModal,
  setToastMessage,
  setUsers,
  selectedGame,
  setSelectedGame,
  studio_id,
  users,
}) => {
  const [gameData, setGameData] = useState({
    game_name: "",
    short_names: "",
    game_type: "",
    playstore_link: "",
    appstore_link: "",
    app_id: "",
    package_name: "",
    studio_id: studio_id?.toString(),
    pod_owner: "",
    pod_owner_email: "",
    generateweeklyreport: "none",
  });

  const [error, setError] = useState({
    game_name: "",
    short_names: "",
    game_type: "",
    playstore_link: "",
    appstore_link: "",
    app_id: "",
    package_name: "",
    pod_owner: "",
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

      if (gameData.pod_owner && !emailRegex.test(gameData.pod_owner)) {
        setError((prev) => ({
          ...prev,
          pod_owner: "Please enter a valid email address",
        }));
        return;
      }

      if (Object.values(error).every((value) => value === "")) {
        setSubmitLoader(true);
        const create_game_response = selectedGame?.id
          ? await api.put(`/v1/games/${studio_id}/${selectedGame?.id}`, gameData)
          : await api.post("v1/games", gameData);
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
            ? setUsers((prev) =>
                prev.map((studio) =>
                  studio.id === selectedGame.id
                    ? { ...gameData, id: selectedGame.id }
                    : studio
                )
              )
            : setUsers((prev) => [
                ...prev,
                { ...gameData, id: create_game_response.data.data.id },
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

  useEffect(() => {
    if (selectedGame?.id) {
      setGameData(selectedGame);
    }
  }, [selectedGame]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
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
          <form className="px-8 py-4">
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
                htmlFor="pod_owner"
              >
                Pod owner
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-7000 leading-tight focus:outline-none focus:shadow-outline"
                id="pod_owner"
                name="pod_owner"
                type="email"
                value={gameData.pod_owner}
                onChange={onhandleChange}
              />
              {error.pod_owner && (
                <span className="text-[#f58174] text-[12px]">
                  {error.pod_owner}
                </span>
              )}
              {/* <Menu as="div" className="relative text-left">
                <Menu.Button className="border rounded py-2 px-3 h-10 w-full text-start shadow">
                  {gameData.pod_owner_email}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 h-[100px] overflow-y-auto">
                      {users.map((user, index) => (
                        <Menu.Item key={index}>
                          {({ active }) => (
                            <a
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                              onClick={() => {
                                setGameData((prev) => ({
                                  ...prev,
                                  pod_owner: user.id,
                                  pod_owner_email: user.email
                                }));
                              }}
                            >
                              {user.email}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu> */}
            </div>

            {error.links && (
              <span className="text-[#f58174] text-[12px]">{error.links}</span>
            )}
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#f58174] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <button
                className="bg-[#f58174] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
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
