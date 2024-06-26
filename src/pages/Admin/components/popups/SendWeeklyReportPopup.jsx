import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import api from "../../../../api";

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

const SendWeeklyReportPopup = ({
  setShowSendReportPopup,
  selectedGame,
  setSelectedGame,
  setGames,
  studio_id,
}) => {
  const [selectedReportType, setSelectedReportType] = useState({});

  const onSelectType = (item) => {
    if (item.value === selectedReportType?.value) {
      setSelectedReportType({ value: "none" });
    } else {
      setSelectedReportType(item);
    }
  };

  const sendWeeklyreport = async () => {
    try {
      const GameData = {
        ...selectedGame,
        generateweeklyreport: selectedReportType.value,
      };
      const sendWeeklyReportResponse = await api.put(
        `/v1/games/${studio_id}/${selectedGame?.id}`,
        GameData
      );
      setGames((prev) =>
        prev.filter((game) => {
          if (game.id === selectedGame.id) {
            game.generateweeklyreport =
              sendWeeklyReportResponse.data.data.generateweeklyreport;
          }
          return prev;
        })
      );
      setSelectedGame({});
      setShowSendReportPopup(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (selectedGame?.id) {
      const game = data.find(
        (item) => item.value === selectedGame.generateweeklyreport
      );
      setSelectedReportType(game);
    }
  }, [selectedGame?.id]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Send Weekly Report</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowSendReportPopup(false)}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="px-4 pt-4">
            <p className="text-base">
              This feature enables the automatic generation and sending of a
              weekly report summarizing user reviews and feedback for our games.
              The report includes detailed analytics on ratings distribution,
              sentiment analysis, and emerging trends, helping you stay informed
              about player experiences and sentiments. This insight allows for
              proactive management and enhancement of game reputation and player
              satisfaction.
            </p>
          </div>
          <div className="px-4 py-4">
            {data.map((item) => (
              // <p
              //   className={`col-span-4 border-[0.5px] border-[#d6d6d6] rounded-md p-2 cursor-pointer ${
              //     selectedReportType?.id === item?.id
              //       ? "border-[1px] border-[#000000]"
              //       : ""
              //   }`}
              //   key={item.id}
              //   onClick={() => onSelectType(item)}
              // >
              //   {item.name}
              //   {selectedReportType?.id === item.id && (
              //     <CheckIcon className="w-5 h-5 inline float-right" />
              //   )}
              // </p>
              <React.Fragment key={item.id}>
                <label
                  className={`relative flex justify-between items-center p-1 text-xl mb-2 ${
                    item.coming_soon ? "text-gray-300" : ""
                  }`}
                >
                  {item.name}
                  {item.coming_soon ? (
                    <p className="text-md">coming soon</p>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                        onChange={() => onSelectType(item)}
                        checked={selectedReportType?.id === item.id}
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
          <div className="flex p-5 pt-6 border-t border-t-blueGray-200">
            <button
              className={`bg-[#000000] text-white rounded-md px-5 py-2 mr-4`}
              onClick={sendWeeklyreport}
            >
              Save
            </button>
            <button
              className={`border border-[#000000] rounded-md px-5 py-2`}
              onClick={() => setShowSendReportPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendWeeklyReportPopup;
