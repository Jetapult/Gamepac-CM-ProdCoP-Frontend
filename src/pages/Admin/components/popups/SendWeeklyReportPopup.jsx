import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import api from "../../../../api";

const data = [
  {
    id: "1",
    name: "Google Play",
    value: "play_store",
  },
  //   {
  //     id: "2",
  //     name: "App Store",
  //     value: "app_store",
  //   },
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
        `/v1/games/${selectedGame?.id}`,
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
          <div className="px-4 py-8 grid grid-cols-12 gap-5">
            {data.map((item) => (
              <p
                className={`col-span-4 border-[0.5px] border-[#d6d6d6] rounded-md p-2 cursor-pointer ${
                  selectedReportType?.id === item?.id
                    ? "border-[1px] border-[#000000]"
                    : ""
                }`}
                key={item.id}
                onClick={() => onSelectType(item)}
              >
                {item.name}
                {selectedReportType?.id === item.id && (
                  <CheckIcon className="w-5 h-5 inline float-right" />
                )}
              </p>
            ))}
          </div>
          <div className="flex p-6 pt-4 justify-center">
            <button
              className={`bg-[#000000] text-white rounded-md px-5 py-2`}
              onClick={sendWeeklyreport}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendWeeklyReportPopup;
