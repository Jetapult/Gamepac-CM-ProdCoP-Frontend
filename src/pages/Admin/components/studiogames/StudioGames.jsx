import { Fragment, useEffect, useState } from "react";
import api from "../../../../api";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import Pagination from "../../../../components/Pagination";
import { classNames } from "../../../../utils";
import CreateGamePopup from "../popups/CreateGamePopup";
import SendWeeklyReportPopup from "../popups/SendWeeklyReportPopup";
import EnableAutoReplyPopup from "../popups/EnableAutoReplyPopup";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import TypewriterLoader from "../../../../components/TypewriterLoader/TypewriterLoader";
import { useSelector } from "react-redux";
import ReactPopover from "../../../../components/Popover";

const StudioGames = ({
  studio_id,
  setToastMessage,
  users,
  studioData,
  setSelectedTab,
}) => {
  const userData = useSelector((state) => state.user.user);
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState({});
  const [showSendReportPopup, setShowSendReportPopup] = useState(false);
  const [showAutoReplyEnablePopup, setShowAutoReplyEnablePopup] =
    useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const limit = 10;

  const onRefreshReviews = async (game) => {
    try {
      setRefreshLoader(true);
      const requestbody = {
        gameId: game.id,
        studioId: studio_id,
      };
      const refresh_response = await api.put(
        `/v1/organic-ua/refresh-reviews`,
        requestbody
      );
      if (refresh_response.status === 201) {
        setToastMessage({
          show: true,
          message: "successfull",
          type: "success",
        });
      }
      setRefreshLoader(false);
    } catch (err) {
      setRefreshLoader(false);
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  const deleteGame = async () => {
    try {
      const response = await api.delete(
        `/v1/games/${studio_id}/${selectedGame.id}`
      );
      if (response.data.data) {
        setToastMessage({
          show: true,
          message: "Game deleted successfully",
          type: "success",
        });
        setShowConfirmationPopup(false);
        setGames((prev) =>
          prev.filter((game) => {
            if (game.id === selectedGame.id) {
              return game.id !== selectedGame.id;
            }
            return prev;
          })
        );
        setSelectedGame({});
      }
    } catch (err) {
      console.log(err);
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  const onEditGame = (game) => {
    setShowAddUserPopup(!showAddUserPopup);
    setSelectedGame(game);
  };

  const getGamesByStudioId = async () => {
    try {
      const games_response = await api.get(
        `/v1/games/studio/${studioData.slug}?current_page=${currentPage}&limit=10`
      );
      setGames(games_response.data.data);
      setTotalGames(games_response.data.totalGames);
    } catch (err) {
      console.log(err);
      setGames([]);
      setTotalGames(0);
    }
  };
  useEffect(() => {
    getGamesByStudioId();
  }, [currentPage, studio_id]);
  return (
    <>
      <div className="flex justify-between items-center">
        <p
          className="text-gray-500 my-2 cursor-pointer prerequisites-text"
          onClick={() => window.open(`/docs/app-onboarding`)}
        >
          Prerequisites/Not able to fetch the reviews{" "}
          <QuestionMarkCircleIcon className="inline w-4 h-4" />
        </p>
        <button
          className="bg-[#ff1053] text-white px-4 py-2 rounded-md new-btn"
          onClick={() => setShowAddUserPopup(!showAddUserPopup)}
        >
          <PlusIcon className="h-5 w-5 inline mr-1" /> New
        </button>
      </div>

      <div className="flex border-y-[0.5px] border-[#e5e5e5] py-3 items-center bg-[#f7e5e5] px-3 mt-4">
        <div className="w-[5%]">
          <p>No.</p>
        </div>
        <div className="w-[25%]">
          <p>Game name</p>
        </div>
        <div className="w-[10%]">
          <p>Short names</p>
        </div>
        <div className="w-[10%]">
          <p>App details</p>
        </div>
        <div className="w-[20%] px-1">
          <p>Team</p>
        </div>
        <div className="w-[30%]">
          <p>Actions</p>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-334px)]">
        {games.map((game, index) => (
          <div
            className="flex grid-cols-12 px-3 py-3 border-b-[0.5px] border-[#e5e5e5] cursor-pointer"
            key={game.id}
          >
            <p className="w-[5%]">{(currentPage - 1) * limit + index + 1}</p>
            <p className="w-[25%] pr-2">{game.game_name}</p>
            <p className="w-[10%] break-all px-1">{game.short_names}</p>
            <div className="w-[10%] break-all px-1 pr-3 flex">
              {game.package_name && (
                <ReactPopover
                  trigger="hover"
                  content={
                    <p>
                      <span className="text-[#808080]">Package name: </span>
                      {game.package_name}
                    </p>
                  }
                >
                  <span className="text-xl text-[#092139] mr-2">
                    <i className="fa fa-android"></i>
                  </span>
                </ReactPopover>
              )}
              {game.app_id && (
                <ReactPopover
                  trigger="hover"
                  content={
                    <p>
                      <span className="text-[#808080]">App ID: </span>
                      {game.app_id}
                    </p>
                  }
                >
                  <span className="text-xl text-[#092139]">
                    <i className="fa fa-apple"></i>
                  </span>
                </ReactPopover>
              )}
            </div>
            <div className="w-[20%] break-all px-1 pr-3">
              {game.product_manager_name && (
                <p>
                  <span className="text-[#808080]">PM:</span>{" "}
                  {game.product_manager_name}
                </p>
              )}
              {game.producer_name && (
                <p>
                  <span className="text-[#808080]">Producer:</span>{" "}
                  {game.producer_name}
                </p>
              )}
              {game.lead_engineer_name && (
                <p>
                  <span className="text-[#808080]">Lead engineer:</span>{" "}
                  {game.lead_engineer_name}
                </p>
              )}
            </div>
            <p className="w-[30%]">
              <button
                className="bg-[#ff1053] text-white rounded-full px-4 py-1 mr-2"
                onClick={() => {
                  setSelectedGame(game);
                  setShowAutoReplyEnablePopup(!showAutoReplyEnablePopup);
                }}
              >
                Auto reply
              </button>{" "}
              <button
                className="bg-[#ff1053] text-white rounded-full px-4 py-1 mr-2"
                onClick={() => {
                  setSelectedGame(game);
                  setShowSendReportPopup(!showSendReportPopup);
                }}
              >
                Weekly report
              </button>
              {/* <button
                className="border border-[#ccc] rounded px-4 py-1"
                onClick={() => onRefreshReviews(game)}
              >Refresh reviews</button> */}
            </p>
            <Menu
              as="div"
              className="relative inline-block text-left col-span-1"
            >
              <div className="flex items-center justify-end">
                <Menu.Button
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex text-sm font-semibold"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                          onClick={() => onEditGame(game)}
                        >
                          Edit
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                          onClick={() => {
                            setSelectedGame(game);
                            setShowConfirmationPopup(!showConfirmationPopup);
                          }}
                        >
                          Delete
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        ))}
      </div>
      {totalGames > 0 && (
        <Pagination
          totalReviews={totalGames}
          currentPage={currentPage}
          limit={limit}
          setCurrentPage={setCurrentPage}
        />
      )}
      {showAddUserPopup && (
        <CreateGamePopup
          setShowModal={setShowAddUserPopup}
          setToastMessage={setToastMessage}
          setGames={setGames}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          studio_id={studio_id}
          users={users}
        />
      )}
      {showSendReportPopup && (
        <SendWeeklyReportPopup
          setShowSendReportPopup={setShowSendReportPopup}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          setGames={setGames}
          studio_id={studio_id}
        />
      )}
      {showAutoReplyEnablePopup && (
        <EnableAutoReplyPopup
          setShowAutoReplyEnablePopup={setShowAutoReplyEnablePopup}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          setGames={setGames}
          studio_id={studio_id}
        />
      )}
      {showConfirmationPopup && (
        <ConfirmationPopup
          heading="Delete Game"
          subHeading="Are you sure you want to delete this game? on deleting all the reviews under this game will be deleted and cannot be retrieved."
          onCancel={() => setShowConfirmationPopup(!showConfirmationPopup)}
          onConfirm={deleteGame}
        />
      )}
      {refreshLoader && (
        <div className="fixed top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-[#ffffff] bg-opacity-[0.7]">
          <TypewriterLoader />
          <p> Please wait...</p>
          <p>till we fetch all the reviews</p>
        </div>
      )}
    </>
  );
};
export default StudioGames;
