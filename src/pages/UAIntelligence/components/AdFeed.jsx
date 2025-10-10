import React, { useState, useEffect } from 'react';
import PlaceholderImg from "../../../assets/placeholder.svg";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import api from "../../../api";

const formatAdType = (adType) => {
  if (!adType) return "";
  return adType
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getRandomCTAColor = (buttonText) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-lime-100 text-lime-800 border-lime-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200'
  ];
  
  const hash = buttonText?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[hash % colors.length];
};

export default function AdFeed({
  adsData,
  loading,
  error,
  hasMore,
  loadMoreData,
  totalItems,
  filters,
}) {
  const [selectedAd, setSelectedAd] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    setOpen(true);
  };

  const analyseCreative = async () => {
    try {
      const isCreativeAnalysisPresent = await api.get(
        `/v1/ua-intel/media-analysis/creative-gallery/${selectedAd.id}`
      );
      if (Object.keys(isCreativeAnalysisPresent.data.data).length > 0) {
        navigate(
          `/ua-intelligence/analyse/${isCreativeAnalysisPresent.data.data.id}`
        );
      } else {
        navigate(
          `/ua-intelligence/analyse?url=${selectedAd.creative_url}&ad_id=${selectedAd.id}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getNetworkLogo = (network) => {
    const logos = {
      'Facebook': '/src/assets/network-logos/facebook-logo.png',
      'Instagram': '/src/assets/network-logos/Instagram_logo.webp',
      'Admob': '/src/assets/network-logos/google-admob.svg',
      'Youtube': '/src/assets/network-logos/youtube-logo.png',
      'TikTok': '/src/assets/network-logos/tiktok-logo.png',
      'Twitter': '/src/assets/network-logos/X-logo.jpg',
      'Pinterest': '/src/assets/network-logos/Pinterest-logo.png',
      'Snapchat': '/src/assets/network-logos/snapchat-logo.png',
      'Line': '/src/assets/network-logos/line-logo.png',
      'Unity': '/src/assets/network-logos/unity-logo.webp',
      'Applovin': '/src/assets/network-logos/applovin.webp',
      'Supersonic': '/src/assets/network-logos/supersonic-logo.png',
      'Vungle': '/src/assets/network-logos/Liftoff_icon.webp',
      'Chartboost': '/src/assets/network-logos/chartboost-logo.png',
      'InMobi': '/src/assets/network-logos/InMobi-Logo.png',
      'Tapjoy': '/src/assets/network-logos/tapjoy-logo.png',
      'Mintegral': '/src/assets/network-logos/mintegral-logo.png',
      'Pangle': '/src/assets/network-logos/pangle-logo.png',
      'Smaato': '/src/assets/network-logos/smaato-logo.avif',
      'Verve': '/src/assets/network-logos/verve-logo.png',
      'Moloco': '/src/assets/network-logos/moloco-ads-logo.png',
      'Adcolony': '/src/assets/network-logos/adcolony-logo.png',
      'BidMachine': '/src/assets/network-logos/bid-machine-logo.png',
      'Digital Turbine': '/src/assets/network-logos/digital-turbine.webp',
      'Meta Audience Network': '/src/assets/network-logos/meta-logo.png',
      'Mopub': '/src/assets/network-logos/mopub.png',
      'IronSource': '/src/assets/network-logos/ironsource-logo.png',
    };
    
    return logos[network] || null;
  };

  if (loading && adsData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">{error}</div>
          <div className="text-sm text-gray-500">
            Please try again or adjust your filters
          </div>
        </div>
      </div>
    );
  }

  if (adsData.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">No ads found</div>
          <div className="text-sm text-gray-500">
            Try adjusting your filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-600">
            Showing {adsData.length} of {totalItems} results
          </span>
          {filters?.search && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Search: "{filters.search}"
            </span>
          )}
          {filters?.network && filters.network.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {filters.network.map((network) => (
                <span
                  key={network}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {network}
                </span>
              ))}
            </div>
          )}
          {filters?.ad_type && filters.ad_type.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {filters.ad_type.map((adType) => (
                <span
                  key={adType}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {formatAdType(adType)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <InfiniteScroll
        dataLength={adsData.length}
        next={loadMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading more ads...</span>
            </div>
          </div>
        }
        endMessage={
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">
              <div className="text-center">
                <div className="text-lg font-medium">That's all!</div>
                <div className="text-sm">
                  You've seen all {totalItems} results
                </div>
              </div>
            </div>
          </div>
        }
        scrollableTarget="scrollableDiv"
        height={"calc(100vh - 220px)"}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {adsData.map((ad, index) => (
            <div
              key={ad.id + index}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleAdClick(ad)}
            >
              <div className="p-2 flex">
                <img
                  src={ad.game_icon_url}
                  alt="Game Icon"
                  className="w-10 h-10 object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="flex flex-col pl-2">
                  <p className="text-sm font-medium">{ad.game_name}</p>
                  <div className="flex items-center gap-2">
                    {getNetworkLogo(ad.network) && (
                      <img
                        src={getNetworkLogo(ad.network)}
                        alt={ad.network}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-500">{ad.network}</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <div className="relative">
                  <div className="h-[240px] w-full relative overflow-hidden">
                    {ad.preview_url || ad.creative_url ? (
                      <>
                        <img
                          src={ad.thumb_url || PlaceholderImg}
                          alt={ad.ad_unit_id}
                          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
                          onError={(e) => {
                            e.target.src = PlaceholderImg;
                          }}
                        />

                        <div className="absolute inset-0 flex justify-center items-center">
                          <div className="w-[70%] h-full overflow-hidden shadow-md">
                            {ad.video_duration &&
                            (ad.creative_url?.includes(".mp4") ||
                              ad.preview_url?.includes(".mp4")) ? (
                              <video
                                src={ad.thumb_url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                onMouseEnter={(e) => e.target.play()}
                                onMouseLeave={(e) => e.target.pause()}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "block";
                                }}
                              />
                            ) : (
                              <img
                                src={
                                  ad.thumb_url ||
                                  ad.creative_url ||
                                  ad.preview_url ||
                                  PlaceholderImg
                                }
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = PlaceholderImg;
                                }}
                              />
                            )}
                            <img
                              src={ad.thumb_url || PlaceholderImg}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                              style={{ display: "none" }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={PlaceholderImg}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="absolute right-2 top-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {formatAdType(ad.ad_type)}
                    </span>
                  </div>
                  {ad.video_duration && (
                    <div className="absolute bottom-2 right-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-black bg-opacity-70 text-white">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        {formatDuration(ad.video_duration)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 text-right pt-1 pr-2">
                  <span className="font-medium">Active: </span>
                  {moment(ad.first_seen_at).format("DD-MM-YYYY")} ~ {moment(ad.last_seen_at).format("DD-MM-YYYY")}
                </p>

                <div className="p-3 px-4 min-h-[140px]">
                  {ad.title && <div className="mb-2">
                    <span className="text-xs text-gray-500 font-medium">Title: </span>
                    <h3 className="text-sm line-clamp-2 inline">
                      {ad.title}
                    </h3>
                  </div>}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {ad.video_duration && (
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {formatDuration(ad.video_duration)}
                        </p>
                      </div>
                    )}
                    {ad?.share &&<div>
                      <p className="text-gray-500">Share of Voice</p>
                      <p className="font-medium">
                        {(ad?.share * 100)?.toFixed(2)}%
                      </p>
                    </div>}
                    {ad.width && ad.height && (
                      <div>
                        <p className="text-gray-500">Dimensions</p>
                        <p className="font-medium">
                          {ad.width}x{ad.height}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Last Seen</p>
                      <p className="font-medium">
                        {moment(ad.last_seen_at).format("DD-MM-YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between bg-gray-50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">CTA :</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRandomCTAColor(ad.button_text)}`}>
                    {ad.button_text || "View"}
                  </span>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdClick(ad);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {selectedAd && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-6xl w-full rounded-lg bg-white p-6 shadow-xl max-h-[95vh] overflow-y-auto">
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
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="h-[500px] w-full relative overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                  {selectedAd.video_duration ? (
                    <video
                      src={selectedAd.creative_url}
                      className="w-full h-full object-contain bg-black"
                      controls
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : (
                    <img
                      src={selectedAd.creative_url}
                      alt={selectedAd.title}
                      className="w-full h-full object-contain bg-gray-100"
                      onError={(e) => {
                        e.target.src = PlaceholderImg;
                      }}
                    />
                  )}
                </div>

                <div className="mt-4 flex gap-2 items-center">
                  <button
                    className="flex-1 rounded-md bg-[#b9ff66] px-4 py-2"
                    onClick={() => {
                      window.open(selectedAd.creative_url, "_blank");
                    }}
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
                    View Creative
                  </button>
                  <button
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={analyseCreative}
                  >
                    Analyse
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Ad Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAd.game_icon_url && (
                      <div className="rounded-lg bg-gray-100 p-3 flex items-center space-x-3">
                        <img
                          src={selectedAd.game_icon_url}
                          alt="Game Icon"
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div>
                          <p className="text-sm text-gray-500">Game</p>
                          <p className="text-lg font-semibold">
                            {selectedAd.game_name || "Game"}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Network</p>
                      <div className="flex items-center gap-2">
                        {getNetworkLogo(selectedAd.network) && (
                          <img
                            src={getNetworkLogo(selectedAd.network)}
                            alt={selectedAd.network}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <p className="text-lg font-semibold">
                          {selectedAd.network}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Ad Type</p>
                      <p className="text-lg font-semibold">
                        {formatAdType(selectedAd.ad_type)}
                      </p>
                    </div>
                    {selectedAd.video_duration && (
                      <div className="rounded-lg bg-gray-100 p-3">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-lg font-semibold">
                          {formatDuration(selectedAd.video_duration)}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Share of Voice</p>
                      <p className="text-lg font-semibold">
                        {(selectedAd.share * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {(selectedAd.width || selectedAd.height) && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Creative Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAd.width && selectedAd.height && (
                        <div className="rounded-lg bg-gray-100 p-3">
                          <p className="text-sm text-gray-500">Dimensions</p>
                          <p className="text-lg font-semibold">
                            {selectedAd.width} x {selectedAd.height}
                          </p>
                        </div>
                      )}
                      {selectedAd.ad_formats &&
                        selectedAd.ad_formats.length > 0 && (
                          <div className="rounded-lg bg-gray-100 p-3">
                            <p className="text-sm text-gray-500">Formats</p>
                            <p className="text-lg font-semibold">
                              {selectedAd.ad_formats.join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">First Seen</p>
                      <p className="text-lg font-semibold">
                        {moment(selectedAd.first_seen_at).format("DD-MM-YYYY")}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-500">Last Seen</p>
                      <p className="text-lg font-semibold">
                        {moment(selectedAd.last_seen_at).format("DD-MM-YYYY")}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAd.message && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Message</h3>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm">{selectedAd.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
