import { useEffect, useState } from "react";

const analytics = [
  {
    id: "1",
    name: "Monetization",
    url: "https://lookerstudio.google.com/reporting/78d787cc-9871-4388-a8fe-45c45c9de36a/page/8r4qD",
    embed:
      "https://lookerstudio.google.com/embed/reporting/78d787cc-9871-4388-a8fe-45c45c9de36a/page/p_ksch1eised",
  },
  {
    id: "2",
    name: "Economy",
    url: "https://lookerstudio.google.com/u/0/reporting/b08e7772-0424-40c0-87f4-3210e5711377/page/UeqrD",
    embed:
      "https://lookerstudio.google.com/embed/reporting/b08e7772-0424-40c0-87f4-3210e5711377/page/p_35ykx5xegd",
  },
  {
    id: "3",
    name: "Acquisition",
    url: "https://lookerstudio.google.com/u/0/reporting/28f0edaa-17c4-41d0-b57e-39acb0cbde3f/page/p_bwfuduzjfd",
    embed:
      "https://lookerstudio.google.com/embed/reporting/28f0edaa-17c4-41d0-b57e-39acb0cbde3f/page/p_bwfuduzjfd",
  },
  {
    id: "4",
    name: "Tech",
    url: "https://lookerstudio.google.com/u/0/reporting/b9f3fee3-9c98-4743-97fc-69aa0520b881/page/p_bwfuduzjfd",
    embed:
      "https://lookerstudio.google.com/embed/reporting/b9f3fee3-9c98-4743-97fc-69aa0520b881/page/p_usl6f3v3fd",
  },
  {
    id: "5",
    name: "Engagement",
    url: "https://lookerstudio.google.com/u/0/reporting/c8877a93-6981-4e89-83f4-ba73b114e61a/page/UeqrD",
    embed:
      "https://lookerstudio.google.com/embed/reporting/c8877a93-6981-4e89-83f4-ba73b114e61a/page/UeqrD",
  },
];
const Analytics = () => {
  const [selectedAnalytics, setSelectedAnalytics] = useState({});
  useEffect(() => {
    setSelectedAnalytics(analytics[0]);
  }, []);
  return (
    <div className="">
      <h1 className="text-center text-2xl pt-6">Analytics</h1>
      <div className="flex items-center mx-6 border-b border-b-[#e5e5e5] mb-2 sticky top-0 w-full">
        {analytics.map((item) => (
          <p
            className={`text-xl mr-6 cursor-pointer ${selectedAnalytics.id === item.id ? "text-black border-b-2 border-b-black" : "text-gray-500 hover:border-b-2 hover:border-b-gray-500"}`}
            key={item.id}
            onClick={() => setSelectedAnalytics(item)}
          >
            {item.name}
          </p>
        ))}
      </div>
      {selectedAnalytics.embed && (
        <div className="relative">
          <iframe
            width="600"
            height="450"
            className="absolute top-0 bottom-0 left-0 right-0 w-full h-screen"
            src={selectedAnalytics.embed}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        </div>
      )}
    </div>
  );
};
export default Analytics;
