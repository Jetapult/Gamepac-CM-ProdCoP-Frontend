import { Fragment, useEffect, useState } from "react";
import api from "../../../../api";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import Pagination from "../../../../components/Pagination";
import CreateUserPopup from "../popups/CreateUserPopup";
import { classNames } from "../../../../utils";
import CreateGamePopup from "../popups/CreateGamePopup";

const StudioGames = ({ studio_id, setToastMessage, users }) => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState({});
  const limit = 10;

  const onEditGame = (game) => {
    setShowAddUserPopup(!showAddUserPopup);
    setSelectedGame(game);
  };

  const getGamesByStudioId = async () => {
    try {
      const games_response = await api.get(
        `/v1/games/studio/${studio_id}?current_page=${currentPage}&limit=10`
      );
      setGames(games_response.data.data);
      setTotalGames(games_response.data.totalGames);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getGamesByStudioId();
  }, [currentPage]);
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl my-2"></h1>
        <button
          className="bg-[#f58174] text-white px-4 py-2 rounded-md"
          onClick={() => setShowAddUserPopup(!showAddUserPopup)}
        >
          <PlusIcon className="h-5 w-5 inline mr-1" /> New
        </button>
      </div>

      <div className="grid grid-cols-12 border-y-[0.5px] border-[#e5e5e5] py-3 items-center bg-[#f5e7e6] px-3 mt-4">
        <div className="">
          <p>No.</p>
        </div>
        <div className="col-span-2">
          <p>Game name</p>
        </div>
        <div className="col-span-1">
          <p>short_names</p>
        </div>
        <div className="col-span-2">
          <p>game_type</p>
        </div>
        <div className="col-span-1">
          <p>App ID</p>
        </div>
        <div className="col-span-2">
          <p>Package name</p>
        </div>
        <div className="col-span-2">
          <p>Pod owner</p>
        </div>
        <div className="">
          <p></p>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-334px)]">
        {games.map((game) => (
          <div
            className="grid grid-cols-12 px-3 py-3 border-b-[0.5px] border-[#e5e5e5] cursor-pointer"
            key={game.id}
          >
            <p className="">{game.id}</p>
            <p className="col-span-2">{game.game_name}</p>
            <p className="col-span-1">{game.short_names}</p>
            <p className="col-span-2">{game.game_type}</p>
            <p className="col-span-1">{game.app_id}</p>
            <p className="col-span-2 break-all">{game.package_name}</p>
            <p className="col-span-2 break-all">{game.pod_owner_email}</p>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex w-full justify-end gap-x-1.5 text-sm font-semibold"
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
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
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
          setUsers={setGames}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          studio_id={studio_id}
          users={users}
        />
      )}
    </div>
  );
};
export default StudioGames;
