import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import ReactStars from "react-rating-stars-component";
import Select from "react-select";
import ReviewsCard from "./ReviewsCard";
import { XCircleIcon } from "@heroicons/react/20/solid";
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
import GamesDropdown from "./GamesDropdown";
import NoData from "../../../../components/NoData";

const SmartFeedback = ({
  studio_slug,
  templates,
  setTemplates,
  isGameLoading,
  setIsGameLoading,
  games,
  setGames,
}) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [selectedGame, setSelectedGame] = useState({});
  const [languages, setlanguages] = useState([]);
  const [selectedlanguages, setSelectedLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [period, setPeriod] = useState("");
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rating, setRating] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [versionList, setVersionList] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [replyState, setreplyState] = useState("");
  const [sortBy, setSortBy] = useState();
  const [selectedTerritory, setSelectedTerritory] = useState();
  const [responseState, setResponseState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setisLoading] = useState(true);
  const limit = 10;
  const navigate = useNavigate();

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

  const checkGames = () => {
    let game = 0;
    games.filter((x) => {
      x.data.filter((y) => {
        game += 1;
      });
    });
    return game;
  };

  const handleRatingChange = (event) => {
    if (rating.includes(event.target.name)) {
      const removeRating = rating.filter((x) => {
        if (x === event.target.name) {
          return x !== event.target.name;
        }
        return rating;
      });
      setRating(removeRating);
      return;
    }
    setRating([...rating, event.target.name]);
  };

  const fetchReviews = async (pageNumber) => {
    try {
      setisLoading(true);
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
        const ratingsArr = [];
        rating.filter((x) => ratingsArr.push(x));
        paramData.rating = ratingsArr.join(",");
      }
      if (searchText) {
        paramData.searchText = searchText;
      }
      if (selectedlanguages.length) {
        const selectedLanguages = [];
        selectedlanguages.filter((x) => selectedLanguages.push(x.value));
        paramData.language = selectedLanguages.join(",");
      }
      if (selectedTerritory?.value) {
        paramData.territory = selectedTerritory.value;
      }
      if (selectedVersions.length) {
        const selectedVersionsArr = [];
        selectedVersions.filter((x) => selectedVersionsArr.push(x.value));
        paramData.version = selectedVersionsArr.join(",");
      }
      if (selectedTags?.value) {
        paramData.tags = selectedTags.value;
      }
      if (replyState) {
        paramData.replyState = replyState;
      }
      if (responseState) {
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
      if (searchText) {
        setIsSearch(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setisLoading(false);
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

  const fetchAllVersions = async () => {
    try {
      const versionResponse = await api.get(
        `v1/organic-ua/versions/${
          studio_slug
            ? studios.filter((x) => x.slug === studio_slug)[0]?.id
            : userData.studio_id
        }/${selectedGame.id}`
      );
      const versionsArr = [];
      versionResponse.data.data.filter((x, index) => {
        versionsArr.push({ id: index, label: x, value: x });
      });
      setVersionList(versionsArr);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData.studio_id) {
      fetchAllLanguages();
      fetchAllTags();
    }
  }, [userData.id]);
  useEffect(() => {
    if (selectedGame.id) {
      fetchReviews();
    }
  }, [selectedGame?.id, selectedGame?.platform, currentPage]);
  useEffect(() => {
    if (
      selectedGame?.id &&
      selectedGame?.platform === "Android" &&
      (studio_slug ? studios.length : 1)
    ) {
      fetchAllVersions();
    }
  }, [selectedGame?.id, selectedGame?.platform, studios?.length]);

  useEffect(() => {
    if (games.length) {
      setSelectedGame(games[0].data[0]);
    }
  }, [games.length]);
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Smart Feedback</h1>
      {isGameLoading ? (
        <></>
      ) : checkGames() ? (
        <div className="flex">
          <div className="w-[275px] min-w-[275px] max-w-[275px] bg-[#F8F9FD] p-3 relative">
            <GamesDropdown
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              games={games}
            />
            <h5 className="font-bold">Period</h5>
            <div className="">
              {periodFilter.map((item) => (
                <div
                  className="flex items-center mb-1"
                  key={`period-${item.id}`}
                >
                  <input
                    id={item.value}
                    type="radio"
                    value={item.value}
                    name="period-radio"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "
                    onChange={onPeriodhangleChange}
                    checked={period === item.value}
                    onClick={() => {
                      if (period) {
                        setPeriod("");
                      }
                    }}
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
                    value={rating.includes(rate.name) ? rate.name : ""}
                    name={rate.name}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    onChange={handleRatingChange}
                    checked={
                      rating.includes(rate.name) ? rate.name : "" === rate.name
                    }
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
                  isMulti={true}
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
                <Select
                  options={versionList}
                  value={selectedVersions}
                  isMulti={true}
                  onChange={(val) => setSelectedVersions(val)}
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
                  onChange={(e) =>
                    replyState === e.target.value
                      ? setreplyState("")
                      : setreplyState(e.target.value)
                  }
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
            {isSearch && (
              <div className="px-3">
                <p className="text-lg font-bold">Results for "{searchText}"</p>
                <p className="">{totalReviews} results found</p>
              </div>
            )}
            {isLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    className="p-4 w-full  border-t-[0.5px] border-y-[#ccc]"
                    key={i}
                  >
                    <div className="animate-pulse">
                      <div className="grid grid-cols-3 gap-4 max-w-sm mb-4">
                        <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                        <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                        <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded mb-2"></div>
                      <div className="h-2 bg-slate-200 rounded mb-2"></div>
                      <div className="grid grid-cols-3 gap-4 max-w-sm my-4">
                        <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                        <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                        <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                      </div>
                      <div className="border-[0.5px] border-[#ccc] h-24 p-3 flex flex-col justify-between">
                        <div className="h-2 bg-slate-200 rounded mb-2"></div>
                        <div className="grid grid-cols-4 gap-4 max-w-sm">
                          <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                          <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                          <div className="h-3 bg-slate-200 rounded col-span-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {reviews.length === 0 ? (
                  <NoData
                    type="reviews"
                    next={() =>
                      navigate(
                        `${
                          studio_slug
                            ? `/${studio_slug}/dashboard`
                            : "/dashboard"
                        }`
                      )
                    }
                  />
                ) : (
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
                    searchText={searchText}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <NoData
          type="game"
          next={() =>
            navigate(
              `${studio_slug ? `/${studio_slug}/dashboard` : "/dashboard"}`
            )
          }
        />
      )}
    </div>
  );
};

export default SmartFeedback;
