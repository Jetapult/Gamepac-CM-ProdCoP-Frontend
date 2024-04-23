import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

const AnalyticsPopup = ({ setShowModal }) => {
  const closePopup = () => {
    setShowModal(false);
  };
  const analytics = [
    {
      id: "1",
      name: "Monetization",
      url: "https://lookerstudio.google.com/reporting/78d787cc-9871-4388-a8fe-45c45c9de36a/page/8r4qD",
    },
    {
      id: "2",
      name: "Economy",
      url: "https://lookerstudio.google.com/u/0/reporting/b08e7772-0424-40c0-87f4-3210e5711377/page/UeqrD",
    },
    {
      id: "3",
      name: "Acquisition",
      url: "https://lookerstudio.google.com/u/0/reporting/28f0edaa-17c4-41d0-b57e-39acb0cbde3f/page/p_bwfuduzjfd",
    },
    {
      id: "4",
      name: "Tech",
      url: "https://lookerstudio.google.com/u/0/reporting/b9f3fee3-9c98-4743-97fc-69aa0520b881/page/p_bwfuduzjfd",
    },
    {
      id: "5",
      name: "Engagement",
      url: "https://lookerstudio.google.com/u/0/reporting/c8877a93-6981-4e89-83f4-ba73b114e61a/page/UeqrD",
    },
  ];

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Analytics</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <ul className="grid grid-cols-12 gap-4">
              {analytics.map((analytic) => (
                <li className="bg-white col-span-4 p-3 border border-[#d6d6d6] rounded">
                  <Link to={analytic.url} target="_blank" className="flex justify-between items-center">
                    <button>{analytic.name} </button><ArrowUpRightIcon className="inline w-5 h-5 ml-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPopup;
