import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactStars from "react-rating-stars-component";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { formatNumberForDisplay } from "../../../../utils";
import { XCircleIcon } from "@heroicons/react/24/outline";
import api from "../../../../api";
import { fetchAllgames } from "../../../../services/games.service";
import { useSelector } from "react-redux";
import ToastMessage from "../../../../components/ToastMessage";

const tabs = [
  {
    id: "1",
    name: "android",
    title: "Android",
  },
  {
    id: "2",
    name: "apple",
    title: "Apple",
  },
];

const GamesDropdown = ({
  selectedGame,
  setSelectedGame,
  games,
  selectedTab,
  setSelectedTab,
  setGames,
  studio_slug,
}) => {
  const userData = useSelector((state) => state.user.user);
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowGamesDropdown(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const handleTabChange = (newTab) => {
    if (newTab !== selectedTab) {
      setSelectedTab(newTab);
    }
  };

  const pinGame = async (e, game) => {
    try {
      e.stopPropagation();
      const response = await api.post(`/v1/games/${game.id}/pin`);
      if (response.status === 200) {
        setSelectedGame(game);
        const gamesresponse = await fetchAllgames(
          studio_slug ? studio_slug : userData.studio_id
        );
        setGames(gamesresponse);
        setRefresh(refresh ? 0 : 1);
        setToastMessage({
          show: true,
          message: "Game pinned",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const unpinGame = async (e, game) => {
    try {
      e.stopPropagation();
      const response = await api.delete(`/v1/games/${game.id}/unpin`);
      if (response.status === 200) {
        setGames((prev) =>
          prev.filter((x) => {
            if (x.id === game.id) {
              x.is_pinned = false;
              return x;
            }
            return prev;
          })
        );
        setToastMessage({
          show: true,
          message: "Game unpinned",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectGame = useCallback((game, selectedTab) => {
    setSelectedGame({ ...game, platform: selectedTab });
    setShowGamesDropdown(false);
    setSearchTerm("");
  }, []);

  const androidGames = useMemo(
    () => games.filter((game) => game.package_name && game.package_name.trim().length > 0),
    [games, refresh]
  );
  const appleGames = useMemo(
    () => games.filter((game) => game.app_id),
    [games, refresh]
  );

  const filteredGames = useMemo(() => {
    const gamesToFilter = selectedTab === "android" ? androidGames : appleGames;
    return gamesToFilter.filter(
      (game) =>
        game.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.short_names.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [
    searchTerm,
    selectedTab,
    androidGames.length,
    appleGames.length,
    refresh,
  ]);

  return (
    <>
      {selectedGame?.id && (
        <div
          className="flex items-center bg-white border border-[#ccc] rounded-lg px-2 relative mb-2 cursor-pointer"
          onClick={() => setShowGamesDropdown(!showGamesDropdown)}
        >
          {selectedGame?.play_store_icon || selectedGame?.app_store_icon ? (
            <img
              src={
                selectedGame?.platform === "android"
                  ? selectedGame?.play_store_icon
                  : selectedGame?.app_store_icon
              }
              alt="icon"
              className="w-14 h-auto rounded-lg"
            />
          ) : (
            <></>
          )}
          <span className="absolute bg-white bottom-[0px] left-[50px] px-1 rounded-full text-sm text-gray-600">
            {selectedGame?.platform === "android" ? (
              <i className="fa fa-android"></i>
            ) : (
              <i className="fa fa-apple"></i>
            )}
          </span>
          <div className="pl-2 w-full">
            <p className="truncate w-[172px] text-md font-bold">
              {selectedGame?.game_name}
            </p>
            <div className="flex justify-between items-center">
              <p className="truncate w-[158px] text-sm text-gray-400">
                {selectedGame?.platform === "android"
                  ? selectedGame?.play_store_developer
                  : selectedGame?.app_store_developer}
              </p>
              <ChevronDownIcon className="w-5 h-5" />
            </div>
            <div className="flex">
              {selectedGame?.platform === "android" ? (
                <>
                  {selectedGame?.play_store_score && (
                    <ReactStars
                      count={5}
                      edit={false}
                      size={15}
                      isHalf={true}
                      value={parseFloat(selectedGame?.play_store_score)}
                      emptyIcon={<i className="far fa-star"></i>}
                      halfIcon={<i className="fa fa-star-half-alt"></i>}
                      fullIcon={<i className="fa fa-star"></i>}
                      activeColor="#ffd700"
                    />
                  )}
                </>
              ) : (
                <ReactStars
                  count={5}
                  edit={false}
                  size={15}
                  isHalf={true}
                  value={parseFloat(selectedGame?.app_store_score)}
                  emptyIcon={<i className="far fa-star"></i>}
                  halfIcon={<i className="fa fa-star-half-alt"></i>}
                  fullIcon={<i className="fa fa-star"></i>}
                  activeColor="#ffd700"
                />
              )}
              <p className="text-gray-400 text-sm ml-2">
                (
                {selectedGame?.platform === "android"
                  ? formatNumberForDisplay(
                      parseFloat(selectedGame?.play_store_ratings)
                    )
                  : formatNumberForDisplay(selectedGame?.app_store_ratings)}
                )
              </p>
            </div>
          </div>
        </div>
      )}
      {showGamesDropdown ? (
        <div
          className="bg-white rounded-lg absolute top-[90px] h-[350px] w-64 z-10 shadow-lg"
          ref={wrapperRef}
        >
          <div className="flex">
            {tabs.map((item, index) => (
              <p
                className={`px-2 mb-2 w-1/2 cursor-pointer text-center ${
                  selectedTab === item.name ? "bg-gray-400 text-white" : ""
                } ${
                  selectedTab === "android" ? "rounded-tl-lg" : "rounded-tr-lg"
                }`}
                key={`${item.name}`}
                onClick={() => {
                  handleTabChange(item.name);
                }}
              >
                {item.title}
              </p>
            ))}
          </div>
          <div className="px-2 relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-2 py-1 mb-2 border border-[#ccc] rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.length > 2 && (
              <XCircleIcon
                className="absolute right-2 top-2 w-5 h-5 text-[#ccc] mr-2 cursor-pointer"
                onClick={() => {
                  setSearchTerm("");
                }}
              />
            )}
          </div>
          <div className="overflow-auto h-[270px]">
            {filteredGames.map((game, i) => (
              <GamesCard
                game={game}
                i={i}
                selectedTab={selectedTab}
                selectedGame={selectedGame}
                onSelect={handleSelectGame}
                key={`game-${game.id}-${i}-${selectedTab}`}
                pinGame={pinGame}
                unpinGame={unpinGame}
              />
            ))}
          </div>
        </div>
      ) : (
        <></>
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
const GamesCard = React.memo(
  ({ game, i, selectedTab, selectedGame, onSelect, pinGame, unpinGame }) => {
    return (
      <div
        className={`flex game-card items-center rounded-lg px-2 relative mb-2 cursor-pointer mx-2 ${
          selectedGame?.platform === "android"
            ? game.package_name === selectedGame.package_name &&
              selectedTab === "android"
              ? "bg-[#e1e1e1]"
              : ""
            : game.app_id === selectedGame.app_id && selectedTab === "apple"
            ? "bg-[#e1e1e1]"
            : ""
        }`}
        onClick={() => onSelect(game, selectedTab)}
      >
        {game?.play_store_icon || game?.app_store_icon ? (
          <img
            src={
              selectedTab === "android"
                ? game?.play_store_icon
                : game?.app_store_icon
            }
            alt="icon"
            className="w-14 h-auto rounded-lg"
          />
        ) : (
          <></>
        )}
        <span className="absolute bg-white bottom-[0px] left-[50px] px-1 rounded-full text-sm text-gray-600">
          {selectedTab === "android" ? (
            <i className="fa fa-android"></i>
          ) : (
            <i className="fa fa-apple"></i>
          )}
        </span>
        <div className="pl-2 w-full">
          <p className="truncate w-[150px] text-md font-bold">
            {game?.game_name}
          </p>
          <p className="truncate w-[158px] text-sm text-gray-400">
            {selectedTab === "android"
              ? game?.play_store_developer
              : game?.app_store_developer}
          </p>
          <div className="flex justify-between">
            <div className="flex">
              {selectedTab === "android" ? (
                <>
                  {game?.play_store_score && (
                    <ReactStars
                      count={5}
                      edit={false}
                      size={15}
                      isHalf={true}
                      value={parseFloat(game?.play_store_score)}
                      emptyIcon={<i className="far fa-star"></i>}
                      halfIcon={<i className="fa fa-star-half-alt"></i>}
                      fullIcon={<i className="fa fa-star"></i>}
                      activeColor="#ffd700"
                    />
                  )}
                </>
              ) : (
                <ReactStars
                  count={5}
                  edit={false}
                  size={15}
                  isHalf={true}
                  value={parseFloat(game?.app_store_score)}
                  emptyIcon={<i className="far fa-star"></i>}
                  halfIcon={<i className="fa fa-star-half-alt"></i>}
                  fullIcon={<i className="fa fa-star"></i>}
                  activeColor="#ffd700"
                />
              )}
              <p className="text-gray-400 text-sm ml-2">
                (
                {selectedTab === "android"
                  ? formatNumberForDisplay(parseFloat(game?.play_store_ratings))
                  : formatNumberForDisplay(game?.app_store_ratings)}
                )
              </p>
            </div>
            {game.is_pinned ? (
              <p className="text-xl" onClick={(e) => unpinGame(e, game)}>
                📌
              </p>
            ) : (
              <p
                className="pin-icon text-base"
                onClick={(e) => pinGame(e, game)}
              >
                📌
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
export default GamesDropdown;
