import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import ReactStars from "react-rating-stars-component";
import { ratingFilter } from "../../../../constants/organicUA";

const data = [
  {
    id: "1",
    name: "Google Play",
    value: "play_store",
    coming_soon: false,
  },
  {
    id: "2",
    name: "App Store",
    value: "app_store",
    coming_soon: true,
  },
  //   {
  //     id: "3",
  //     name: "Both",
  //     value: "both",
  //   },
];

const EnableAutoReplyPopup = ({
  setShowAutoReplyEnablePopup,
  selectedGame,
  setSelectedGame,
  setGames,
  studio_id,
}) => {
  const [selectedType, setSelectedType] = useState({});
  const [rating, setRating] = useState(["1", "2", "3", "4", "5"]);

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

  const onSelectType = (item) => {
    if (item.value === selectedType?.value) {
      setSelectedType({ value: "none" });
    } else {
      setSelectedType(item);
    }
  };

  const enableAutoReply = async () => {
    try {
      if (selectedType?.id && !rating.length) {
        return;
      }
      const auto_reply_ratings = rating?.join(",");
      const GameData = {
        ...selectedGame,
        auto_reply_enabled: selectedType?.value || "none",
        auto_reply_ratings: auto_reply_ratings,
      };
      const sendWeeklyReportResponse = await api.put(
        `/v1/games/${studio_id}/${selectedGame?.id}`,
        GameData
      );
      setGames((prev) =>
        prev.filter((game) => {
          if (game.id === selectedGame.id) {
            game.auto_reply_enabled =
              sendWeeklyReportResponse.data.data.auto_reply_enabled;
            game.auto_reply_ratings =
              sendWeeklyReportResponse.data.data.auto_reply_ratings;
          }
          return prev;
        })
      );
      setRating(
        sendWeeklyReportResponse.data.data?.auto_reply_ratings?.split(",")
      );
      setSelectedGame({});
      setShowAutoReplyEnablePopup(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (selectedGame?.id) {
      const game = data.find(
        (item) => item.value === selectedGame.auto_reply_enabled
      );
      setSelectedType(game);
      if (selectedGame.auto_reply_ratings) {
        setRating(selectedGame.auto_reply_ratings.split(","));
      }
    }
  }, [selectedGame?.id]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Enable Auto Reply</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowAutoReplyEnablePopup(false)}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="px-4 pt-4">
            <p className="text-base">
              Auto-reply allows you to automatically respond to reviews based on
              specific star ratings. This helps maintain engagement and manage
              your app's reputation efficiently.
            </p>
          </div>
          <div className="px-4 py-4">
            {data.map((item) => (
              <React.Fragment key={item.id}>
                <label className={`relative flex justify-between items-center p-1 text-xl mb-2 ${item.coming_soon ? "text-gray-300" : ""}`}>
                  {item.name}
                  {item.coming_soon ? (
                    <p className="text-md">coming soon</p>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                        onClick={() => onSelectType(item)}
                        checked={selectedType?.id === item.id}
                      />
                      <span
                        className={`w-11 h-6 flex items-center flex-shrink-0 ml-4 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-[#2563eb] after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                      ></span>
                    </>
                  )}
                </label>
              </React.Fragment>
            ))}
          </div>
          {selectedType?.id && (
            <p className="px-4 mb-2 text-base">
              Please select the star ratings you want to automatically reply to.
            </p>
          )}
          {selectedType?.id && (
            <div className="flex items-center px-4 pb-5">
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
          )}
          <div className="flex p-5 pt-6 border-t border-t-blueGray-200">
            <button
              className={`bg-[#000000] text-white rounded-md px-5 py-2 mr-4 hover:opacity-80`}
              onClick={enableAutoReply}
            >
              Save
            </button>
            <button
              className={`border border-[#000000] rounded-md px-5 py-2 hover:bg-gray-200`}
              onClick={() => setShowAutoReplyEnablePopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnableAutoReplyPopup;
