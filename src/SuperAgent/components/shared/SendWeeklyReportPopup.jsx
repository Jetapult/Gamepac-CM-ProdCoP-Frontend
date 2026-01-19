import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "../../../api";

const data = [
  {
    id: "1",
    name: "Play Store",
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
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto max-w-4xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 rounded-t">
            <h3 className="text-lg font-medium">Enable Weekly Reports</h3>
            <button
              className="p-1 border-0 text-black float-right text-lg leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowSendReportPopup(false)}
            >
              <X size={24} color="#6d6d6d" strokeWidth={1.5} />
            </button>
          </div>

          {/* Description */}
          <div className="px-5 pt-2">
            <p className="text-base text-[#141414]">
              This feature enables the{" "}
              <span className="font-semibold">
                automatic generation and sending of a weekly report
              </span>
              , summarising user reviews and feedback for our games.
            </p>
            <p className="text-base text-[#141414] mt-3">
              The report includes{" "}
              <span className="font-semibold">
                detailed analytics on ratings distribution, sentiment analysis
              </span>
              , and emerging trends, helping you stay informed about player
              experiences and sentiments which can be used to improve game
              reputation and player satisfaction metrics.
            </p>
          </div>

          {/* Select source */}
          <div className="px-5 py-4">
            <span className="text-sm font-medium text-[#B0B0B0]">
              Select source to fetch data from
            </span>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                <label
                  className={`relative flex items-center py-2 gap-2 text-sm font-regular text-[#141414] ${
                    item.coming_soon ? "text-[#898989]" : ""
                  }`}
                >
                  {item.name}
                  {item.coming_soon ? (
                    <p className="text-base text-[#1F6744]">Coming soon :)</p>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        className="accent-[#1F6744] absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                        onChange={() => onSelectType(item)}
                        checked={selectedReportType?.id === item.id}
                      />
                      <span
                        className={`w-11 h-6 flex items-center flex-shrink-0 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-[#1F6744] after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                      ></span>
                    </>
                  )}
                </label>
              </React.Fragment>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 p-5 pt-6">
            <button
              className="border border-[#E6E6E6] rounded-lg px-8 py-1.5 hover:bg-gray-200 shadow-sm text-base font-medium text-[#141414]"
              onClick={() => setShowSendReportPopup(false)}
            >
              Cancel
            </button>
            <button
              className="bg-[#1F6744] text-white rounded-lg px-8 py-1.5 text-base font-medium"
              onClick={sendWeeklyreport}
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendWeeklyReportPopup;
