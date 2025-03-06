import React, { useState, useEffect } from "react";
import { ChevronRight, XCircle, Loader } from "lucide-react";
import api from "../../../api";
import PlayStoreIcon from "../../../assets/googleplay-svg.svg";
import AppStoreIcon from "../../../assets/appstore-p-svg.svg";

const AppIconGenerator = ({ game }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [artStyles, setArtStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allIcons, setAllIcons] = useState([]);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [currentSlideIndices, setCurrentSlideIndices] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [exportPopup, setExportPopup] = useState({
    isOpen: false,
    image: null,
    style: null,
    timestamp: null,
  });
  const [exports, setExports] = useState([]);

  const handleDownload = (url, platform) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";

    xhr.onload = function () {
      if (this.status === 200) {
        const blob = new Blob([this.response], { type: "image/png" });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `app-icon-${platform}-${Date.now()}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);
      }
    };

    xhr.send();
  };

  const getArtStyleName = (style) => {
    const artStyle = artStyles.find((s) => s.value === style);
    return artStyle ? artStyle.name : "Unknown Art Style";
  };

  const getRootIconId = (icon) => {
    return icon.parent_id || icon.id;
  };

  const setSlideForIcon = (iconId, index) => {
    setCurrentSlideIndices((prev) => ({
      ...prev,
      [iconId]: index,
    }));
  };

  const getSlideForIcon = (iconId) => {
    return currentSlideIndices[iconId] || 0;
  };

  const handleNewConcept = async (session, icon, parentIconId) => {
    try {
      setIsLoading({ sessionId: session.id, iconId: parentIconId });
      const payload = {
        session_id: session.id,
        parent_icon_id: icon.id,
      };
      await api.post(`/v1/aso-assistant/app-icons/new-concept`, payload);

      await fetchGeneratedIcons();
    } catch (error) {
      console.error("Error generating new concept:", error);
      setIsLoading({});
    }
  };

  const handleRedraw = async (session, icon, parentIconId) => {
    try {
      setIsLoading({ sessionId: session.id, iconId: parentIconId });
      const payload = {
        session_id: session.id,
        parent_icon_id: icon.id,
      };
      await api.post(`/v1/aso-assistant/app-icons/redraw`, payload);

      await fetchGeneratedIcons();
    } catch (error) {
      console.error("Error redrawing icon:", error);
      setIsLoading({});
    }
  };

  const handleExport = async (session, icon) => {
    try {
      setIsLoading({ sessionId: session.id, iconId: icon.id });

      const payload = {
        icon_id: icon.id,
      };
      await api.post(`/v1/aso-assistant/app-icons/export`, payload);

      await fetchGeneratedIcons();
    } catch (error) {
      console.error("Error exporting icon:", error);
      setIsLoading({});
    }
  };

  const closeExportPopup = () => {
    setExportPopup({
      isOpen: false,
      image: null,
      style: null,
      timestamp: null,
    });
  };

  const fetchArtStyles = async () => {
    try {
      const response = await api.get("/v1/aso-assistant/app-icons/art-styles");
      setArtStyles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching art styles:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectArtStyle = (style) => {
    setSelectedStyle(style);
    setIsDropdownOpen(false);
  };

  const handleGenerate = async () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    try {
      const response = await api.post("/v1/aso-assistant/app-icons", {
        game_id: game.id,
        studio_id: game.studio_id,
        style: selectedStyle.value,
      });
      setIsGenerating(false);
      setGeneratedIcons(response.data.data);
      setAllIcons((prev) => [response.data.data, ...prev]);

      const newIndices = { ...currentSlideIndices };
      response.data.data.assets.forEach((icon) => {
        newIndices[icon.id] = 0;
      });
      setCurrentSlideIndices(newIndices);
    } catch (error) {
      console.error("Error generating icon:", error);
      setIsGenerating(false);
    }
  };

  const fetchAllIcons = async () => {
    try {
      const response = await api.get(
        `/v1/aso-assistant/app-icons/${game.id}/history`
      );
      const icons = response.data.data || [];
      setAllIcons(icons);

      const initialIndices = { ...currentSlideIndices };
      icons.forEach((session) => {
        session.assets.forEach((icon) => {
          if (!(icon.id in initialIndices)) {
            initialIndices[icon.id] = 0;
          }
        });
      });
      setCurrentSlideIndices(initialIndices);
      setIsLoading({});
    } catch (error) {
      console.error("Error fetching generated icons:", error);
      setIsLoading({});
    }
  };

  const fetchExports = async () => {
    try {
      const response = await api.get(`/v1/aso-assistant/app-icons/exported`, {
        params: { game_id: game.id },
      });
      setExports(response.data.data || []);
    } catch (error) {
      console.error("Error fetching exports:", error);
    }
  };

  useEffect(() => {
    fetchArtStyles();
    fetchAllIcons();
    fetchExports();
  }, []);

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return `Generated on ${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}, at ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${
      date.getHours() >= 12 ? "PM" : "AM"
    }`;
  };

  return (
    <div className="w-full max-w-[800px]">
      {exportPopup.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeExportPopup}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full min-w-[700px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <img
                src={exportPopup.image}
                alt="App Icon"
                className="w-full object-contain max-h-[500px]"
              />
            </div>
            <div className="text-center mb-2">
              <p className="text-lg font-medium">
                {exportPopup.style || "Video game 3D realism"}
              </p>
              <p className="text-sm text-gray-500">
                {formatTimestamp(exportPopup?.platforms?.[0]?.created_at)}
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              {exportPopup.platforms?.map((platform) => (
                <button
                  key={platform.platform}
                  className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center"
                  onClick={() =>
                    handleDownload(platform.image_url, platform.platform)
                  }
                >
                  <img
                    src={
                      platform.platform === "app_store"
                        ? AppStoreIcon
                        : PlayStoreIcon
                    }
                    alt={platform.platform}
                    className="w-5 h-5 mr-3"
                  />
                  Download for{" "}
                  {platform.platform === "app_store"
                    ? `App Store`
                    : `Google Play`}
                </button>
              ))}

              {(!exportPopup.platforms ||
                exportPopup.platforms.length === 0) && (
                <>
                  <button
                    className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black font-medium py-2 px-6 rounded-md transition-colors w-full flex items-center justify-center"
                    onClick={() =>
                      handleDownload(exportPopup.image, "app_store")
                    }
                  >
                    <img
                      src={AppStoreIcon}
                      alt="App Store"
                      className="w-5 h-5 mr-3"
                    />
                    Download for App Store
                  </button>

                  <button
                    className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black font-medium py-2 px-6 rounded-md transition-colors w-full flex items-center justify-center"
                    onClick={() =>
                      handleDownload(exportPopup.image, "google_play")
                    }
                  >
                    <img
                      src={PlayStoreIcon}
                      alt="Google Play"
                      className="w-5 h-5 mr-3"
                    />
                    Download for Google Play
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
        <h1 className="text-xl font-bold mb-6">Generate stunning app icons</h1>

        <div className="border-t border-gray-200 pt-6">
          <div className="mb-6 relative">
            {selectedStyle?.id ? (
              <div
                className="flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer"
                onClick={toggleDropdown}
              >
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
                  <span>{selectedStyle?.name || "Select an art style"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {selectedStyle?.examples?.map((example, index) => (
                      <div className="w-1/3" key={index}>
                        <img
                          src={example}
                          alt={example}
                          className="w-[65px] h-[65px] object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStyle(null);
                    }}
                  >
                    <XCircle />
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer ${
                  isDropdownOpen ? "rounded-b-none" : ""
                }`}
                onClick={toggleDropdown}
              >
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
                  <span>{selectedStyle?.name || "Select an art style"}</span>
                </div>
                <ChevronRight
                  className={`transform transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </div>
            )}

            <div
              className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out ${
                isDropdownOpen
                  ? "opacity-100 mt-0"
                  : "max-h-0 opacity-0 border-none"
              }`}
            >
              <div className="p-2 bg-white">
                {artStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`p-2 cursor-pointer rounded-b-none hover:bg-gray-100 border-b last:border-b-0 border-gray-300 flex items-center justify-between ${
                      selectedStyle?.id === style.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => selectArtStyle(style)}
                  >
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-2"></div>
                      <span>{style.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {style.examples.map((example, index) => (
                        <div className="w-1/3" key={index}>
                          <img
                            src={example}
                            alt={example}
                            className="w-[65px] h-[65px] object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] hover:from-[#84cc16] hover:to-[#4d7c0f] text-black font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={!selectedStyle || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {allIcons?.map((session) => (
          <IconCard
            session={session}
            getArtStyleName={getArtStyleName}
            getSlideForIcon={getSlideForIcon}
            isLoading={isLoading}
            setSlideForIcon={setSlideForIcon}
            handleRedraw={handleRedraw}
            handleNewConcept={handleNewConcept}
            handleExport={handleExport}
            setExportPopup={setExportPopup}
          />
        ))}
      </div>
      {/* <div className="mt-8 space-y-4 flex flex-wrap gap-6 items-center">
        {exports?.map((item) => (
          <div
            className=""
            onClick={() => {
              setExportPopup({
                isOpen: true,
                image: item.original_image_url,
                style: item.style,
                timestamp: item.created_at,
                platforms: item.platforms,
              });
            }}
          >
            <img
              src={item.original_image_url}
              alt={`original_${item?.original_icon_id}`}
              className="w-48"
            />
          </div>
        ))}
      </div> */}
    </div>
  );
};

const IconCard = ({
  session,
  getArtStyleName,
  getSlideForIcon,
  isLoading,
  setSlideForIcon,
  handleNewConcept,
  handleRedraw,
  handleExport,
  setExportPopup
}) => {
  return (
    <div
      key={session?.id}
      className="flex flex-wrap gap-6 border border-gray-200 rounded-md p-4 bg-white"
    >
      <h2 className="w-full text-lg font-semibold mb-2">
        {getArtStyleName(session?.assets?.[0]?.style) || "Generated Icons"}
      </h2>

      {session?.assets?.length > 0 &&
        session.assets.map((icon) => {
          const allVariations = [...(icon?.derivatives || []), icon];
          const currentIndex = getSlideForIcon(icon.id);
          const currentImage = allVariations[currentIndex];

          return (
            <div className="w-[235px]" key={icon.id}>
              {isLoading.sessionId === session.id &&
              isLoading.iconId === icon.id ? (
                <div className="flex flex-col items-center justify-center gap-2 mt-6 mb-2 bg-gray-100 rounded-md h-[240px]">
                  <Loader className="w-10 h-10 text-[#b9ff66] animate-spin" />
                  <span className="text-sm text-gray-500">Generating...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 my-2">
                    {allVariations.map((item, index) => (
                      <button
                        key={`dot-${item.id || index}`}
                        className={`w-2 h-2 rounded-full ${
                          currentIndex === index
                            ? "bg-[#b9ff66]"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={() => setSlideForIcon(icon.id, index)}
                        aria-label={`View variation ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div
                    className="relative h-[240px] flex items-center justify-center bg-gray-50 rounded-md overflow-hidden"
                    onClick={() => {
                      if(currentImage?.is_exported){
                        setExportPopup({
                          isOpen: true,
                          image:
                            currentImage?.image_url ||
                            currentImage?.original_url,
                          style: getArtStyleName(session?.assets?.[0]?.style),
                          timestamp: new Date().toISOString(),
                          platforms: currentImage?.exported_versions,
                        });
                      }
                    }}
                  >
                    <img
                      src={
                        currentImage?.image_url || currentImage?.original_url
                      }
                      alt={`App icon variation`}
                      className="max-h-full max-w-full object-contain"
                    />
                    {currentImage?.is_exported && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Exported
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between my-2">
                <button
                  className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    handleNewConcept(session, currentImage, icon.id)
                  }
                  disabled={
                    isLoading.sessionId === session.id &&
                    isLoading.iconId === icon.id
                  }
                >
                  <span>New concept</span>
                </button>
                <button
                  className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleRedraw(session, currentImage, icon.id)}
                  disabled={
                    isLoading.sessionId === session.id &&
                    isLoading.iconId === icon.id
                  }
                >
                  <span>Redraw</span>
                </button>
              </div>

              <button
                className={`w-full py-2 rounded-md text-sm font-medium ${
                  currentImage?.is_exported ||
                  (isLoading.sessionId === session.id &&
                    isLoading.iconId === icon.id)
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gradient-to-r from-[#b9ff66] to-[#84cc16] text-black hover:from-[#84cc16] hover:to-[#4d7c0f]"
                }`}
                onClick={() => handleExport(session, currentImage)}
                disabled={
                  currentImage?.is_exported ||
                  (isLoading.sessionId === session.id &&
                    isLoading.iconId === icon.id)
                }
              >
                {isLoading.sessionId === session.id &&
                isLoading.iconId === icon.id
                  ? "Processing..."
                  : currentImage?.is_exported
                  ? "Exported"
                  : "Export"}
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default AppIconGenerator;
