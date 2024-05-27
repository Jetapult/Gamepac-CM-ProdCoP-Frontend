import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api";
import ReactStars from "react-rating-stars-component";
import { formatNumberForDisplay } from "../../../../utils";
import Select from "react-select";
import ReviewsCard from "./ReviewsCard";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const SmartFeedback = ({ studio_slug }) => {
  const userData = useSelector((state) => state.user.user);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState({});
  const [languages, setlanguages] = useState([
    {
      id: "1",
      label: "English",
      value: "eng",
    },
    {
      id: "2",
      label: "portuguese",
      value: "ptu",
    },
  ]);
  const [selectedlanguages, setSelectedLanguages] = useState();
  const [reviews, setReviews] = useState([]);
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
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

  const fetchReviews = async () => {
    try {
      const paramData = {
        current_page: currentPage,
        limit: limit,
        game_id: selectedGame.id,
      };
      const url =
        selectedGame?.platform === "Android"
          ? `/v1/organic-ua/google-reviews/${studio_slug || userData.studio_id}`
          : `/v1/organic-ua/fetch-app-store-reviews/${
              studio_slug || userData.studio_id
            }`;
      const reviewsResponse = await api.get(url, { params: paramData });
      setReviews(reviewsResponse.data.data);
      setTotalReviews(reviewsResponse.data.totalReviews);
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
      setSelectedGame(gamesresponse.data.data[0]);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchAllgames();
  }, []);
  useEffect(() => {
    if (selectedGame.id) {
      fetchReviews();
    }
  }, [selectedGame.id,selectedGame?.platform, currentPage]);
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Smart Feedback</h1>
      <div className="flex">
        <div className="w-[275px] min-w-[275px] max-w-[275px] bg-[#F8F9FD] p-3 relative">
          {selectedGame.id && (
            <div
              className="flex items-center bg-white border border-[#ccc] rounded-lg px-2 relative mb-2 cursor-pointer"
              onClick={() => setShowGamesDropdown(!showGamesDropdown)}
            >
              <img
                src={
                  selectedGame?.platform === "Android"
                    ? selectedGame?.play_store_icon
                    : selectedGame?.app_store_icon
                }
                alt="icon"
                className="w-14 h-auto rounded-lg"
              />
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
                      value={selectedGame?.app_store_score}
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
          {showGamesDropdown && (
            <div
              className="bg-white rounded-lg absolute top-[90px] overflow-auto h-[300px] z-10 shadow-lg px-2"
              ref={wrapperRef}
            >
              {games.map((game, index) => (
                <div
                  className="flex items-center bg-white rounded-lg px-2 relative mb-2 cursor-pointer"
                  key={game.id + index}
                  onClick={() => {
                    setSelectedGame(game);
                    setSelectedLanguages(false);
                  }}
                >
                  <img
                    src={
                      game?.platform === "Android"
                        ? game?.play_store_icon
                        : game?.app_store_icon
                    }
                    alt="icon"
                    className="w-14 h-auto rounded-lg"
                  />
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
                          value={game?.app_store_score}
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
          )}
          <h5 className="font-bold">Period</h5>
          <div className="flex items-center mb-1">
            <input
              id="period-radio-1"
              type="radio"
              value=""
              name="period-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "
            />
            <label
              htmlFor="default-radio-1"
              className="ms-2 text-sm font-medium"
            >
              Last 7 days
            </label>
          </div>
          <div className="flex items-center mb-1">
            <input
              id="period-radio-2"
              type="radio"
              value=""
              name="period-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            />
            <label
              htmlFor="default-radio-2"
              className="ms-2 text-sm font-medium"
            >
              Last 30 days
            </label>
          </div>
          <div className="flex items-center mb-1">
            <input
              id="period-radio-3"
              type="radio"
              value=""
              name="period-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            />
            <label
              htmlFor="default-radio-3"
              className="ms-2 text-sm font-medium "
            >
              Last 90 days
            </label>
          </div>
          <div className="flex items-center mb-1">
            <input
              id="period-radio-4"
              type="radio"
              value=""
              name="period-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            />
            <label
              htmlFor="period-radio-4"
              className="ms-2 text-sm font-medium "
            >
              Custom
            </label>
          </div>
          <h5 className="font-bold my-3">Review rating</h5>
          <div className="flex flex-wrap">
            <div className="flex items-center mb-2 mr-4">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                5
                <ReactStars
                  count={1}
                  edit={false}
                  size={16}
                  value={1}
                  activeColor="#62b47b"
                  classNames={"pl-1"}
                />
              </label>
            </div>
            <div className="flex items-center mb-2 mr-4">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor="checked-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                4
                <ReactStars
                  count={1}
                  edit={false}
                  size={16}
                  value={1}
                  activeColor="#bfd17e"
                  classNames={"pl-1"}
                />
              </label>
            </div>
            <div className="flex items-center mb-2 mr-4">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor="checked-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                3
                <ReactStars
                  count={1}
                  edit={false}
                  size={16}
                  value={1}
                  activeColor="#fcd66b"
                  classNames={"pl-1"}
                />
              </label>
            </div>
            <div className="flex items-center mb-2 mr-4">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor="checked-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                2
                <ReactStars
                  count={1}
                  edit={false}
                  size={16}
                  value={1}
                  activeColor="#ffb46f"
                  classNames={"pl-1"}
                />
              </label>
            </div>
            <div className="flex items-center mb-1 mr-2">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor="checked-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                1
                <ReactStars
                  count={1}
                  edit={false}
                  size={16}
                  value={1}
                  activeColor="#fd7779"
                  classNames={"pl-1"}
                />
              </label>
            </div>
          </div>
          <h5 className="font-bold my-3">Search</h5>
          <input
            type="text"
            placeholder="Search by review text"
            className="border border-[#ccc] rounded px-3 py-1.5 w-full"
          />
          <h5 className="font-bold my-3">Language</h5>
          <Select
            options={languages}
            value={selectedlanguages}
            isMulti={true}
            onChange={(val) => setSelectedLanguages(val)}
          />
          <h5 className="font-bold my-3">Version</h5>
          <input
            type="text"
            placeholder="Version"
            className="border border-[#ccc] rounded px-3 py-1.5 w-full"
          />
          <h5 className="font-bold my-3">Tag</h5>
          <input
            type="text"
            placeholder="Tag"
            className="border border-[#ccc] rounded px-3 py-1.5 w-full"
          />
          <h5 className="font-bold my-3">Reply State</h5>
          <div className="flex items-center mb-2 mr-4">
            <input
              id="default-checkbox"
              type="checkbox"
              value=""
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
            />
            <label
              htmlFor="default-checkbox"
              className="ms-2 text-sm font-medium flex"
            >
              Unreplied
            </label>
          </div>
          <div className="flex items-center mb-2 mr-4">
            <input
              id="default-checkbox"
              type="checkbox"
              value=""
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
            />
            <label
              htmlFor="default-checkbox"
              className="ms-2 text-sm font-medium flex"
            >
              Replied
            </label>
          </div>
          <h5 className="font-bold my-3">Order By</h5>
          <input
            type="text"
            placeholder="Order By"
            className="border border-[#ccc] rounded px-3 py-1.5 w-full"
          />
          <button className="border border-[#819edf] rounded-md w-full my-4 py-1 text-[#5e80e1]">
            Search
          </button>
        </div>
        <div className="flex-auto w-3/5">
          <ReviewsCard
            reviews={reviews}
            totalReviews={totalReviews}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setReviews={setReviews}
            selectedGame={selectedGame}
            studio_slug={studio_slug}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartFeedback;
