import { useEffect, useRef, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { formatNumberForDisplay } from "../../../../utils";

const GamesDropdown = ({ selectedGame, setSelectedGame, games }) => {
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
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
                selectedGame?.platform === "Android"
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
            {selectedGame?.platform === "Android" ? (
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
                {selectedGame?.platform === "Android"
                  ? selectedGame?.play_store_developer
                  : selectedGame?.app_store_developer}
              </p>
              <ChevronDownIcon className="w-5 h-5" />
            </div>
            <div className="flex">
              {selectedGame?.platform === "Android" ? (
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
                {selectedGame?.platform === "Android"
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
          className="bg-white rounded-lg absolute top-[90px] overflow-auto h-[300px] z-10 shadow-lg"
          ref={wrapperRef}
        >
          {games.map((item, index) => (
            <div className="" key={`${item.title}`}>
              <p className="bg-gray-400 px-2 text-white mb-2">{item.title}</p>
              {item.data.map((game, i) => (
                <div
                  className={`flex items-center  rounded-lg px-2 relative mb-2 cursor-pointer mx-2 ${
                    item.title === "Android"
                      ? game.package_name === selectedGame.package_name &&
                        selectedGame.platform === "Android"
                        ? "bg-[#e1e1e1]"
                        : ""
                      : game.app_id === selectedGame.app_id &&
                        selectedGame.platform === "Apple"
                      ? "bg-[#e1e1e1]"
                      : ""
                  }`}
                  key={`game-${game.id}-${i}-${index}`}
                  onClick={() => {
                    setSelectedGame(game);
                    setShowGamesDropdown(false);
                  }}
                >
                  {game?.play_store_icon || game?.app_store_icon ? (
                    <img
                      src={
                        game?.platform === "Android"
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
                    {game?.platform === "Android" ? (
                      <i className="fa fa-android"></i>
                    ) : (
                      <i className="fa fa-apple"></i>
                    )}
                  </span>
                  <div className="pl-2 w-full">
                    <p className="truncate w-[172px] text-md font-bold">
                      {game?.game_name}
                    </p>
                    <p className="truncate w-[158px] text-sm text-gray-400">
                      {game?.platform === "Android"
                        ? game?.play_store_developer
                        : game?.app_store_developer}
                    </p>
                    <div className="flex">
                      {game?.platform === "Android" ? (
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
                        {game?.platform === "Android"
                          ? formatNumberForDisplay(
                              parseFloat(game?.play_store_ratings)
                            )
                          : formatNumberForDisplay(game?.app_store_ratings)}
                        )
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
export default GamesDropdown;
