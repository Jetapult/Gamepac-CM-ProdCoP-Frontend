import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api";
import ReactStars from "react-rating-stars-component";
import { formatNumberForDisplay } from "../../../../utils";
import Select from "react-select";
import ReviewsCard from "./ReviewsCard";
import { ChevronDownIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { DateRangePicker } from "react-date-range";
import moment from "moment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  TerritoryCode,
  periodFilter,
  ratingFilter,
  replyStateFilter,
  responseStateFilter,
} from "../../../../constants/organicUA";

const SmartFeedback = ({ studio_slug, templates, setTemplates }) => {
  const userData = useSelector((state) => state.user.user);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState({});
  const [languages, setlanguages] = useState([]);
  const [selectedlanguages, setSelectedLanguages] = useState();
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [period, setPeriod] = useState("");
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rating, setRating] = useState("");
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [version, setVersion] = useState("");
  const [replyState, setreplyState] = useState("");
  const [sortBy, setSortBy] = useState();
  const [selectedTerritory, setSelectedTerritory] = useState();
  const [responseState, setResponseState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const orderBy = [
    {
      id: "1",
      label: "Highest Rating",
      value:
        selectedGame?.platform === "Android"
          ? "userrating DESC"
          : "rating DESC",
    },
    {
      id: "2",
      label: "Lowest Rating",
      value: selectedGame?.platform === "Android" ? "userrating" : "rating",
    },
    {
      id: "3",
      label: "Most Recent Reply",
      value:
        selectedGame?.platform === "Android" ? "posteddate" : "latestResponse",
    },
  ];
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowGamesDropdown(false);
          setShowCalendar(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const onPeriodhangleChange = (event) => {
    setPeriod(event.target.value);
    if (event.target.value === "custom") {
      setShowCalendar(true);
    }
  };

  const handleRatingChange = (event) => {
    if(rating === event.target.name){
      setRating("");
      return
    }
   setRating(event.target.name);
  };

  const fetchReviews = async (pageNumber) => {
    try {
      const paramData = {
        current_page: pageNumber || currentPage,
        limit: limit,
        game_id: selectedGame.id,
      };
      if (period) {
        paramData.period = period;
      }
      if (period === "custom") {
        paramData.startDate = moment(customDates[0].startDate).format(
          "YYYY-MM-DD"
        );
        paramData.endDate = moment(customDates[0].endDate).format("YYYY-MM-DD");
      }
      if (rating) {
        paramData.rating = rating;
      }
      if (searchText) {
        paramData.searchText = searchText;
      }
      if (selectedlanguages?.value) {
        paramData.language = selectedlanguages.value;
      }
      if (selectedTerritory?.value) {
        paramData.territory = selectedTerritory.value;
      }
      if (version) {
        paramData.version = version;
      }
      if (selectedTags?.value) {
        paramData.tags = selectedTags.value;
      }
      if (replyState) {
        paramData.replyState = replyState;
      }
      if(responseState){
        paramData.responseState = responseState;
      }
      if (selectedTags?.length) {
        const tags = [];
        selectedTags.filter((x) => tags.push(x.value));
        paramData.tags = tags.join(",");
      }
      if (sortBy) {
        const sort_by = sortBy.value.split(" ");
        paramData.sortBy = sort_by[0];
        sort_by.length > 1 && (paramData.sortOrder = "desc");
      }
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

  const fetchAllLanguages = async () => {
    try {
      const languageResponse = await api.get(`v1/organic-ua/languages`);
      const languages = [];
      languageResponse.data.data.filter((x, index) => {
        languages.push({ id: index, label: x, value: x });
      });
      setlanguages(languages);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAllTags = async () => {
    try {
      const tagsResponse = await api.get(`v1/organic-ua/tags`);
      const tags = [];
      tagsResponse.data.data.filter((x, index) => {
        tags.push({ id: index, label: x, value: x });
      });
      setTags(tags);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAllgames();
    fetchAllLanguages();
    fetchAllTags();
  }, []);
  useEffect(() => {
    if (selectedGame.id) {
      fetchReviews();
    }
  }, [selectedGame?.id, selectedGame?.platform, currentPage]);
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Smart Feedback</h1>
      <div className="flex">
        <div className="w-[275px] min-w-[275px] max-w-[275px] bg-[#F8F9FD] p-3 relative">
          {selectedGame?.id && (
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
              className="bg-white rounded-lg absolute top-[90px] overflow-auto h-[300px] z-10 shadow-lg px-2"
              ref={wrapperRef}
            >
              {games.map((game, index) => (
                <div
                  className="flex items-center bg-white rounded-lg px-2 relative mb-2 cursor-pointer"
                  key={game.id + index}
                  onClick={() => {
                    setSelectedGame(game);
                    setShowGamesDropdown(false);
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
          ): <></>}
          <h5 className="font-bold">Period</h5>
          <div className="">
            {periodFilter.map((item) => (
              <div className="flex items-center mb-1" key={`period-${item.id}`}>
                <input
                  id={item.value}
                  type="radio"
                  value={item.value}
                  name="period-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "
                  onChange={onPeriodhangleChange}
                  checked={period === item.value}
                  onClick={() => {if(period){setPeriod("")}}}
                />
                <label
                  htmlFor="default-radio-1"
                  className="ms-2 text-sm font-medium"
                >
                  {item.name}
                </label>
              </div>
            ))}
            {period === "custom" && showCalendar && (
              <div className="" ref={wrapperRef}>
                <DateRangePicker
                  onChange={(item) => setCustomDates([item.selection])}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={customDates}
                  direction="horizontal"
                  className="z-50 relative border border-[#eff2f7]"
                />
              </div>
            )}
            {period === "custom" && !showCalendar && (
              <div
                className="border border-[#eff2f7] bg-white rounded py-1 px-3 flex items-center justify-between"
                onClick={() => setShowCalendar(true)}
              >
                {" "}
                <p className="text-sm">
                  {moment(customDates[0].startDate).format("YYYY-MM-DD")}
                </p>
                <span className="text-gray-400 px-3">-</span>
                <p className="text-sm">
                  {moment(customDates[0].endDate).format("YYYY-MM-DD")}
                </p>{" "}
                <CalendarIcon className="w-4 h-4 text-gray-400 ml-8" />
              </div>
            )}
          </div>
          <h5 className="font-bold my-3">Review rating</h5>
          <div className="flex flex-wrap">
            {ratingFilter.map((rate) => (
              <div className="flex items-center mb-2 mr-4" key={rate.id}>
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value={rating}
                  name={rate.name}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  onChange={handleRatingChange}
                  checked={rating === rate.name}
                />
                <label
                  htmlFor="default-checkbox"
                  className="ms-2 text-sm font-medium flex"
                >
                  {rate.name}
                  <ReactStars
                    count={1}
                    edit={false}
                    size={16}
                    value={parseInt(rate.name)}
                    activeColor={rate.color}
                    classNames={"pl-1"}
                  />
                </label>
              </div>
            ))}
          </div>
          <h5 className="font-bold my-3">Search</h5>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by review text"
              className="border border-[#ccc] rounded pl-3 pr-6 py-1.5 w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText.length ? (
              <XCircleIcon
                className="w-4 h-4 inline text-gray-400 absolute right-2 top-3 cursor-pointer"
                onClick={() => setSearchText("")}
              />
            ) : (
              <></>
            )}
          </div>
          {selectedGame?.platform === "Android" ? (
            <>
              <h5 className="font-bold my-3">Language</h5>
              <Select
                options={languages}
                value={selectedlanguages}
                onChange={(val) => setSelectedLanguages(val)}
              />
            </>
          ) : (
            <>
              <h5 className="font-bold my-3">Territory</h5>
              <Select
                options={TerritoryCode}
                value={selectedTerritory}
                onChange={(val) => setSelectedTerritory(val)}
              />
            </>
          )}
          {selectedGame?.platform === "Android" && (
            <>
              <h5 className="font-bold my-3">Version</h5>
              <input
                type="text"
                placeholder="Version"
                className="border border-[#ccc] rounded px-3 py-1.5 w-full"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </>
          )}
          <h5 className="font-bold my-3">Tag</h5>
          <Select
            options={tags}
            value={selectedTags}
            isMulti={true}
            onChange={(val) => setSelectedTags(val)}
          />
          {selectedGame?.platform === "Apple" && (
            <>
              <h5 className="font-bold my-3">Response State</h5>
              {responseStateFilter.map((state) => (
                <div className="flex items-center mb-2 mr-4" key={state.id}>
                  <input
                    id="default-checkbox"
                    type="checkbox"
                    value={state.value}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    onChange={(e) => setResponseState(e.target.value)}
                    checked={responseState === state.value}
                  />
                  <label
                    htmlFor="default-checkbox"
                    className="ms-2 text-sm font-medium flex"
                  >
                    {state.name}
                  </label>
                </div>
              ))}
            </>
          )}
          <h5 className="font-bold my-3">Reply State</h5>
          {replyStateFilter.map((state) => (
            <div className="flex items-center mb-2 mr-4" key={state.id}>
              <input
                id="default-checkbox"
                type="checkbox"
                value={state.value}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                onChange={(e) => replyState === e.target.value ? setreplyState("") : setreplyState(e.target.value)}
                checked={replyState === state.value}
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium flex"
              >
                {state.name}
              </label>
            </div>
          ))}
          <h5 className="font-bold my-3">Order By</h5>
          <Select
            options={orderBy}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
          />
          <button
            className="border border-[#819edf] rounded-md w-full my-4 py-1 text-[#5e80e1]"
            onClick={() => fetchReviews(1)}
          >
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
            templates={templates}
            setTemplates={setTemplates}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartFeedback;
