import { useState, useEffect, useRef } from "react";
import PlaceholderImg from "../../../assets/placeholder.svg";
import { useNavigate } from "react-router-dom";

const adData = [
  {
    id: 1,
    title: "Tripledot Studios",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Mahjong+Tile+Dynasty.mp4",
    watchTime: "01:00",
    game: "Mahjong Tile Dynastya",
    audience: {
      age: "37",
      geography: "-",
      gender: "Female - 61%",
    },
    performance: "best",
    categories: ["Top games", "Inspiration"],
    shareOfVoice: "13.6%",
  },
  {
    id: 2,
    title: "Tripledot Studios",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Blossom+Match+-+Puzzle+Game.mp4",
    watchTime: "01:00",
    game: "Blossom Match - Puzzle Game",
    audience: {
      age: "34",
      geography: "-",
      gender: "Female - 64%",
    },
    performance: "best",
    categories: ["Competitors", "Top games"],
    shareOfVoice: "55.3%",
  },
  {
    id: 3,
    title: "Modern Times Group",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Tile+Match+puzzle+-+Tiletopia.mp4",
    watchTime: "00:30",
    game: "Tile Match puzzle - Tiletopia",
    audience: {
      age: "37",
      geography: "US, Japan, Germany",
      gender: "Female 67%",
    },
    performance: "best",
    categories: ["Top games", "Inspiration", "Competitors"],
    shareOfVoice: "12%",
  },
  {
    id: 4,
    title: "Brainit Games",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Mahjong+Solitaire+-+Tile+Match.mp4",
    watchTime: "00:30",
    game: "Mahjong Solitaire - Tile Match",
    audience: {
      age: "40",
      geography: "Brazil, New Zealand, Italy",
      gender: "Female 58%",
    },
    performance: "best",
    categories: ["Top games", "Inspiration"],
    shareOfVoice: "5.6%",
  },
  {
    id: 5,
    title: "GamoVation",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Tile+Club+-+Match+Puzzle+Game.mp4",
    watchTime: "00:55",
    game: "TiIe Club - Match Puzzle Game",
    audience: { age: "36", geography: "US, Germany, Japan", gender: "Female 64%" },
    performance: "best",
    categories: ["Top games", "Inspiration"],
    shareOfVoice: "12.1%",
  },
  {
    id: 6,
    title: "Oakever Games",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Tile+Explorer-++Triple+Match.mp4",
    watchTime: "00:27",
    game: "DTile Explorer - Triple Match",
    audience: {
      age: "41",
      geography: "US, Japan, Germany",
      gender: "Female 58%",
    },
    performance: "best",
    shareOfVoice: "9.4%",
  },
  {
    id: 7,
    title: "Playflux",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Tile+Family+-+Match+Puzzle+Game.mp4",
    watchTime: "00:59",
    game: "Tile Family: Match Puzzle Game",
    audience: {
      age: "37",
      geography: "US, UK, Japan",
      gender: "Female 77%",
    },
    performance: "best",
    shareOfVoice: "37.6%",
  },
  {
    id: 8,
    title: "Zen Match - Relaxing Puzzle",
    video:
      "https://gamepacbucket.s3.ap-south-1.amazonaws.com/development/studioAssets/jetapult/rendered-videos/Zen+Match+-+Relaxing+Puzzle.mp4",
    watchTime: "00:59",
    game: "Zen Match - Relaxing Puzzle",
    audience: { age: "35", geography: "US, Germany, UK", gender: "Female 82%" },
    performance: "best",
    shareOfVoice: "23.3%",
  },
];

export const VideoThumbnail = ({ videoSrc, alt, width, height }) => {
  const [thumbnail, setThumbnail] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoSrc && videoSrc.includes(".mp4")) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const generateThumbnail = () => {
        video.currentTime = 1.0;
      };

      const handleSeeked = () => {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setThumbnail(dataUrl);
      };

      video.addEventListener("loadeddata", generateThumbnail);
      video.addEventListener("seeked", handleSeeked);

      return () => {
        video.removeEventListener("loadeddata", generateThumbnail);
        video.removeEventListener("seeked", handleSeeked);
      };
    }
  }, [videoSrc]);

  return (
    <>
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ display: "none" }}
        crossOrigin="anonymous"
        preload="metadata"
      />
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={width}
        height={height}
      />

      {thumbnail ? (
        <div className={`h-[${height}px] w-full relative overflow-hidden`}>
          <img
            src={thumbnail}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          />

          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-[70%] h-full overflow-hidden shadow-md">
              <img
                src={thumbnail}
                alt={alt}
                className="w-full h-full object-fill"
              />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={PlaceholderImg}
          alt={alt}
          className="h-[240px] w-full object-cover"
        />
      )}
    </>
  );
};

export default function AdFeed() {
  const [selectedAd, setSelectedAd] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    setOpen(true);
  };

  const filteredAds =
    activeCategory === "All"
      ? adData
      : adData.filter(
          (ad) => ad.categories && ad.categories.includes(activeCategory)
        );

  const categories = [
    "All",
    "Top games",
    "Competitors",
    "Same Demographics",
    "Inspiration",
  ];

  return (
    <> 
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {categories.map((category) => (
              <p
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`mr-6 cursor-pointer text-lg hover:text-gray-500 hover:border-b-[2px] hover:border-gray-500 ${
                  activeCategory === category
                    ? "text-black border-b-[2px] border-black"
                    : "text-[#808080]"
                }`}
              >
                {category}
              </p>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAds.map((ad) => (
          <div
            key={ad.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow cursor-pointer"
            onClick={() => handleAdClick(ad)}
          >
            <div className="p-0">
              <div className="relative">
                {ad.video.includes(".mp4") ? (
                  <VideoThumbnail
                    videoSrc={ad.video}
                    alt={ad.title}
                    width={400}
                    height={240}
                  />
                ) : (
                  <div className="h-[240px] w-full relative overflow-hidden">
                    {/* Blurred background version of the same image */}
                    <img
                      src={ad.video || PlaceholderImg}
                      alt={ad.title}
                      className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                    />

                    {/* Clear center image with drop shadow */}
                    <div className="absolute inset-0 flex justify-center items-center">
                      <div className="w-[70%] h-full overflow-hidden shadow-md">
                        <img
                          src={ad.video || PlaceholderImg}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
                    ${
                      ad.performance === "best"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ad.performance === "best" ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        Best
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                          <polyline points="17 18 23 18 23 12"></polyline>
                        </svg>
                        Worst
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-2 font-semibold">{ad.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Watch Time</p>
                    <p className="font-medium">{ad.watchTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Share of Voice</p>
                    <p className="font-medium">{ad.shareOfVoice}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between bg-gray-50 px-4 py-2">
              <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium">
                {ad.game}
              </span>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => handleAdClick(ad)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAd && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedAd.title}</h2>
              <button
                className="rounded-full p-1 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                {selectedAd.video.includes(".mp4") ? (
                  <VideoThumbnail
                    videoSrc={selectedAd.video}
                    alt={selectedAd.title}
                    width={400}
                    height={400}
                  />
                ) : (
                  <div className="h-[240px] w-full relative overflow-hidden">
                    {/* Blurred background version of the same image */}
                    <img
                      src={selectedAd.video || PlaceholderImg}
                      alt={selectedAd.title}
                      className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                    />

                    {/* Clear center image with drop shadow */}
                    <div className="absolute inset-0 flex justify-center items-center">
                      <div className="w-[70%] h-full overflow-hidden shadow-md">
                        <img
                          src={selectedAd.video || PlaceholderImg}
                          alt={selectedAd.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Watch Time</p>
                      <p className="text-xl font-semibold">
                        {selectedAd.watchTime}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Share of Voice</p>
                      <p className="text-xl font-semibold">
                        {selectedAd.shareOfVoice}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Target Audience
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedAd.audience.age}</p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">
                        {selectedAd.audience.gender}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Geography</p>
                      <p className="font-medium">
                        {selectedAd.audience.geography}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    className="flex-1 rounded-md bg-[#b9ff66] px-4 py-2"
                    onClick={() => window.open(selectedAd.video, "_blank")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 inline-block h-4 w-4"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Watch Ad
                  </button>
                  <button
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    // onClick={() => navigate(`/ua-intelligence/${selectedAd.id}`)}
                  >
                    Analyse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
