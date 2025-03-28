import { useEffect, useState } from "react";
import api from "../../../../api";
import InfiniteScroll from "react-infinite-scroll-component";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ADD_VIDEO, dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";

export const AiAvatars = () => {
  // Separate state for each tab
  const [avatarState, setAvatarState] = useState({
    items: [],
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    searchText: "",
    originalItems: [], // Store original items before search
  });

  const [talkingPhotoState, setTalkingPhotoState] = useState({
    items: [],
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    searchText: "",
    originalItems: [], // Store original items before search
  });

  const [activeTab, setActiveTab] = useState("avatar");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleAddVideo = (src) => {
    dispatch(ADD_VIDEO, {
      payload: {
        id: generateId(),
        details: {
          src: src,
        },
        metadata: {
          resourceId: src,
        },
      },
      options: {
        resourceId: "main",
      },
    });
  };

  // Get current active state based on tab
  const currentState = activeTab === "avatar" ? avatarState : talkingPhotoState;
  const setCurrentState =
    activeTab === "avatar" ? setAvatarState : setTalkingPhotoState;

  const fetchMoreData = () => {
    if (
      !currentState.isLoading &&
      currentState.currentPage < currentState.totalPages
    ) {
      if (activeTab === "avatar") {
        getAiAvatars(currentState.currentPage + 1, currentState.searchText);
      } else {
        getTalkingPhotos(currentState.currentPage + 1, currentState.searchText);
      }
    }
  };

  const getAiAvatars = async (page, search) => {
    try {
      setAvatarState((prev) => ({ ...prev, isLoading: true }));
      const response = await api.get("/v1/ugc-ads/avatars", {
        params: {
          page,
          search,
          limit: 20, // Explicitly request 20 items per page
        },
      });

      setAvatarState((prev) => {
        const newItems =
          page === 1
            ? response.data.data
            : [...prev.items, ...response.data.data];

        return {
          ...prev,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.pages,
          items: newItems,
          // If this is a new search (page 1), save the original items
          originalItems:
            search && page === 1 && !prev.originalItems.length
              ? prev.items
              : prev.originalItems,
          isLoading: false,
          searchText: search,
        };
      });
    } catch (error) {
      console.error(error);
      setAvatarState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getTalkingPhotos = async (page, search) => {
    try {
      setTalkingPhotoState((prev) => ({ ...prev, isLoading: true }));
      const response = await api.get("/v1/ugc-ads/talking-photos", {
        params: {
          page,
          search,
          limit: 20,
        },
      });

      setTalkingPhotoState((prev) => {
        const newItems =
          page === 1
            ? response.data.data
            : [...prev.items, ...response.data.data];

        return {
          ...prev,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.pages,
          items: newItems,
          // If this is a new search (page 1), save the original items
          originalItems:
            search && page === 1 && !prev.originalItems.length
              ? prev.items
              : prev.originalItems,
          isLoading: false,
          searchText: search,
        };
      });
    } catch (error) {
      console.error(error);
      setTalkingPhotoState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchInput.trim() === "") return;

    setIsSearching(true);

    if (activeTab === "avatar") {
      setAvatarState((prev) => ({
        ...prev,
        searchText: searchInput,
        // Save original items if this is the first search
        originalItems: prev.originalItems.length
          ? prev.originalItems
          : prev.items,
      }));
      getAiAvatars(1, searchInput);
    } else {
      setTalkingPhotoState((prev) => ({
        ...prev,
        searchText: searchInput,
        // Save original items if this is the first search
        originalItems: prev.originalItems.length
          ? prev.originalItems
          : prev.items,
      }));
      getTalkingPhotos(1, searchInput);
    }
  };

  // Handle cancel search
  const handleCancelSearch = () => {
    setSearchInput("");
    setIsSearching(false);

    if (activeTab === "avatar") {
      setAvatarState((prev) => ({
        ...prev,
        items: prev.originalItems,
        searchText: "",
        currentPage: 1,
        totalPages: Math.ceil(prev.originalItems.length / 10) || 1, // Estimate total pages
      }));
    } else {
      setTalkingPhotoState((prev) => ({
        ...prev,
        items: prev.originalItems,
        searchText: "",
        currentPage: 1,
        totalPages: Math.ceil(prev.originalItems.length / 10) || 1, // Estimate total pages
      }));
    }
  };

  // Initial data load
  useEffect(() => {
    // Only load data if it hasn't been loaded yet
    if (avatarState.items.length === 0) {
      getAiAvatars(1, "");
    }
  }, []);

  // Load talking photos data when tab is switched for the first time
  useEffect(() => {
    if (
      activeTab === "talking_photos" &&
      talkingPhotoState.items.length === 0
    ) {
      getTalkingPhotos(1, "");
    }
  }, [activeTab]);
  return (
    <div className="flex-1 flex flex-col">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Search Bar */}
      {/* <div className="px-4 py-2 flex gap-2">
        <Input
          placeholder={`Search ${
            activeTab === "avatar" ? "avatars" : "talking photos"
          }...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button 
          size="sm" 
          onClick={isSearching ? handleCancelSearch : handleSearch}
        >
          {isSearching ? <X size={16} /> : <Search size={16} />}
        </Button>
      </div> */}

      <div id={`${activeTab}-scrollable`} className="h-[450px] overflow-y-auto">
        <InfiniteScroll
          dataLength={currentState.items.length}
          next={fetchMoreData}
          hasMore={currentState.currentPage < currentState.totalPages}
          loader={<div className="py-4 text-center">Loading more items...</div>}
          endMessage={
            <p className="py-4 text-center">
              <b>No more items to load</b>
            </p>
          }
          scrollableTarget={`${activeTab}-scrollable`}
          className="px-4 grid grid-cols-2 gap-2"
        >
          {currentState.items.map((item, index) => (
            <div
              key={
                activeTab === "avatar"
                  ? `avatar-${item.avatar_id}`
                  : `talking-photo-${item.talking_photo_id}`
              }
              className="flex items-center justify-center w-full bg-background pb-2 cursor-pointer"
              onClick={() => handleAddVideo(item.preview_video_url)}
            >
              <img
                src={item.preview_image_url}
                alt={
                  activeTab === "avatar"
                    ? item.avatar_name
                    : item.talking_photo_name
                }
                className="w-full object-cover rounded-md"
              />
              {item.is_premium && (
                <span className="absolute top-2 right-2">
                  <Sparkles size={20} />
                </span>
              )}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "avatar",
      label: "Avatar",
    },
    // {
    //   id: "talking_photos",
    //   label: "Talking Photos",
    // },
  ];
  return (
    <div className="flex">
      {tabs.map((tab) => (
        <p
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`text-sm text-text-primary font-medium h-12 flex items-center px-4 cursor-pointer 
            ${activeTab === tab.id ? "" : ""}`}
        >
          {tab.label}
        </p>
      ))}
    </div>
  );
};
