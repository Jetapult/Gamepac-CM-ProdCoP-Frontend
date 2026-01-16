import React, { useState, useEffect, Fragment, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  AltArrowDown,
  CheckCircle,
  CheckSquare,
  MenuDots,
  MinusSquare,
  Stop,
  TrashBinMinimalistic,
  Pen,
} from "@solar-icons/react";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../../../api";
import AddGamePopup from "../../../components/shared/AddGamePopup";
import {
  SendWeeklyReportPopup,
  EnableAutoReplyPopup,
  BulkUploadGamesPopup,
} from "../../../components/shared";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import ToastMessage from "../../../../components/ToastMessage";
import { Plus } from "lucide-react";
import AndroidIcon from "../../../../assets/super-agents/android-icon.svg";
import AppleIcon from "../../../../assets/super-agents/ios-icon.svg";
import FileIcon from "../../../../assets/super-agents/file-icon.svg";
// Platform badge components
const AndroidBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] border border-[#4CAF50] rounded-full text-xs font-urbanist font-medium text-[#2E7D32]">
    <img src={AndroidIcon} alt="Android" className="w-4 h-4" />
    Android
  </span>
);

const AppleBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EDFBFF] border border-[#0B99FF] rounded-full text-xs font-urbanist font-medium text-[#0B99FF]">
    <img src={AppleIcon} alt="Apple" className="w-4 h-4" />
    Apple
  </span>
);

// Checkbox component
const Checkbox = ({ checked, onChange, indeterminate }) => {
  if (indeterminate && !checked) {
    return (
      <div onClick={onChange} className="cursor-pointer">
        <MinusSquare weight="Bold" size={22} color="#1f6744" />
      </div>
    );
  }

  if (checked) {
    return (
      <div onClick={onChange} className="cursor-pointer">
        <CheckSquare weight="Bold" size={22} color="#1f6744" />
      </div>
    );
  }

  return (
    <div onClick={onChange} className="cursor-pointer">
      <Stop weight="Linear" size={22} color="#6d6d6d" />
    </div>
  );
};

const GamesSettings = ({ studioData }) => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [selectedGames, setSelectedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const addGameDropdownRef = useRef(null);

  // Popup states
  const [showAddGamePopup, setShowAddGamePopup] = useState(false);
  const [showSendReportPopup, setShowSendReportPopup] = useState(false);
  const [showAutoReplyPopup, setShowAutoReplyPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showBulkUploadPopup, setShowBulkUploadPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Dropdown state
  const [showAddGameDropdown, setShowAddGameDropdown] = useState(false);

  const limit = 20;

  const getGamesByStudioId = async (page = 1, append = false) => {
    if (!studioData?.slug) return;

    setIsLoading(true);

    try {
      const response = await api.get(
        `/v1/games/studio/${studioData.slug}?current_page=${page}&limit=${limit}`
      );
      const newGames = response.data.data || [];
      const total = response.data.totalGames || 0;

      if (append) {
        setGames((prev) => [...prev, ...newGames]);
      } else {
        setGames(newGames);
      }
      setTotalGames(total);
      setHasMore(page * limit < total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch games:", err);
      if (!append) {
        setGames([]);
        setTotalGames(0);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and reset when studio changes
  useEffect(() => {
    setCurrentPage(1);
    setGames([]);
    setHasMore(true);
    getGamesByStudioId(1, false);
    setSelectedGames([]);
  }, [studioData?.slug]);

  // Load more games for infinite scroll
  const loadMoreGames = () => {
    if (!isLoading && hasMore) {
      getGamesByStudioId(currentPage + 1, true);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addGameDropdownRef.current &&
        !addGameDropdownRef.current.contains(event.target)
      ) {
        setShowAddGameDropdown(false);
      }
    };
    if (showAddGameDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddGameDropdown]);

  const handleSelectAll = () => {
    if (selectedGames.length === games.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(games.map((game) => game.id));
    }
  };

  const handleSelectGame = (gameId) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((id) => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const handleDeleteGame = async () => {
    if (!selectedGame) return;

    try {
      const response = await api.delete(
        `/v1/games/${studioData?.id}/${selectedGame.id}`
      );
      if (response.data.data) {
        setToastMessage({
          show: true,
          message: "Game deleted successfully",
          type: "success",
        });
        setShowDeleteConfirmation(false);
        setGames((prev) => prev.filter((game) => game.id !== selectedGame.id));
        setSelectedGame(null);
        setSelectedGames((prev) => prev.filter((id) => id !== selectedGame.id));
      }
    } catch (err) {
      console.error("Failed to delete game:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to delete game",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const gameId of selectedGames) {
        await api.delete(`/v1/games/${studioData?.id}/${gameId}`);
      }
      setToastMessage({
        show: true,
        message: `${selectedGames.length} game(s) deleted successfully`,
        type: "success",
      });
      setGames((prev) =>
        prev.filter((game) => !selectedGames.includes(game.id))
      );
      setSelectedGames([]);
      setShowDeleteConfirmation(false);
    } catch (err) {
      console.error("Failed to delete games:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to delete games",
        type: "error",
      });
    }
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setShowAddGamePopup(true);
  };

  const handleAutoReply = (game) => {
    setSelectedGame(game);
    setShowAutoReplyPopup(true);
  };

  const handleWeeklyReport = (game) => {
    setSelectedGame(game);
    setShowSendReportPopup(true);
  };

  const isAllSelected =
    games.length > 0 && selectedGames.length === games.length;
  const isIndeterminate =
    selectedGames.length > 0 && selectedGames.length < games.length;

  // Get team names from game data
  const getTeamNames = (game) => {
    const names = [];
    if (game.product_manager_name) names.push(game.product_manager_name);
    if (game.producer_name) names.push(game.producer_name);
    if (game.lead_engineer_name) names.push(game.lead_engineer_name);
    return names.join(", ") || "-";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between pb-5 shrink-0">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Games
        </h3>
        <div className="relative" ref={addGameDropdownRef}>
          <button
            onClick={() => setShowAddGameDropdown(!showAddGameDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors"
          >
            <Plus size={18} color="#ffffff" />
            Add Game
            <AltArrowDown weight={"Linear"} size={16} color="#fff" />
          </button>
          {showAddGameDropdown && (
            <div className="absolute right-0 top-full mt-1 w-[175px] bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-20 p-1">
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setShowAddGamePopup(true);
                  setShowAddGameDropdown(false);
                }}
                className="w-full inline-flex items-center gap-1 text-left px-4 py-2 font-urbanist text-[14px] text-[#141414] hover:bg-[#f6f6f6] rounded-t-lg border-b border-[#f1f1f1] cursor-pointer"
              >
                <Plus size={25} strokeWidth={1} />
                Add New Game
              </button>
              <button
                onClick={() => {
                  setShowBulkUploadPopup(true);
                  setShowAddGameDropdown(false);
                }}
                className="w-full inline-flex items-center gap-2 text-left px-4 py-2 font-urbanist text-[14px] text-[#141414] hover:bg-[#f6f6f6] rounded-b-lg cursor-pointer"
              >
                <img src={FileIcon} alt="File" className="size-5" />
                Add via CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container - Flex grow with overflow */}
      <div className="flex-1 flex flex-col border border-[#f6f6f6] rounded-lg overflow-hidden min-h-0">
        {/* Table Header - Fixed */}
        <div className="shrink-0 bg-white">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-[#f6f6f6]">
                <th className="w-[48px] px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[280px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Name
                  </span>
                </th>
                <th className="w-[100px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Alias
                  </span>
                </th>
                <th className="w-[180px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Platforms
                  </span>
                </th>
                <th className="w-[200px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Team
                  </span>
                </th>
                <th className="w-[240px] px-3 py-3 text-left">
                  <span className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body - Scrollable with infinite scroll */}
        <div id="gamesScrollableDiv" className="flex-1 overflow-y-auto">
          {isLoading && games.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1F6744]"></div>
                <span className="font-urbanist text-[14px] text-[#6d6d6d]">
                  Loading...
                </span>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="font-urbanist text-[14px] text-[#6d6d6d]">
                No games found
              </span>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={games.length}
              next={loadMoreGames}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F6744]"></div>
                    <span className="font-urbanist text-sm text-[#6d6d6d]">
                      Loading more games...
                    </span>
                  </div>
                </div>
              }
              endMessage={
                <div className="flex justify-center items-center py-4">
                  <span className="font-urbanist text-[12px] text-[#b0b0b0]">
                    {games.length > 0
                      ? `You've seen all ${totalGames} games`
                      : ""}
                  </span>
                </div>
              }
              scrollableTarget="gamesScrollableDiv"
            >
              <table className="w-full table-fixed">
                <tbody>
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className={`border-b border-[#f6f6f6] hover:bg-[#fafafa] transition-colors ${
                        selectedGames.includes(game.id) ? "bg-[#f1fcf6]" : ""
                      }`}
                    >
                      <td className="w-[48px] px-4 py-3">
                        <Checkbox
                          checked={selectedGames.includes(game.id)}
                          onChange={() => handleSelectGame(game.id)}
                        />
                      </td>
                      <td className="w-[280px] px-3 py-3">
                        <div className="flex items-center gap-3">
                          {game.play_store_icon || game.app_store_icon ? (
                            <img
                              src={game.play_store_icon || game.app_store_icon}
                              alt={game.game_name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#f6f6f6] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#f6f6f6] flex items-center justify-center shrink-0">
                              <span className="text-[#b0b0b0] text-[10px]">
                                No img
                              </span>
                            </div>
                          )}
                          <span className="font-urbanist font-medium text-sm text-[#141414] truncate">
                            {game.game_name}
                          </span>
                        </div>
                      </td>
                      <td className="w-[100px] px-3 py-3">
                        <span className="font-urbanist font-medium text-sm text-[#141414]">
                          {game.short_names || "-"}
                        </span>
                      </td>
                      <td className="w-[180px] px-3 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {game.package_name && <AndroidBadge />}
                          {game.app_id && <AppleBadge />}
                          {!game.package_name && !game.app_id && (
                            <span className="text-[#b0b0b0] text-[12px]">
                              -
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="w-[200px] px-3 py-3">
                        <span className="font-urbanist font-medium text-[14px] text-[#141414] truncate block max-w-[180px]">
                          {getTeamNames(game)}
                        </span>
                      </td>
                      <td className="w-[240px] px-3 py-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleAutoReply(game)}
                            className="flex items-center gap-1 font-urbanist font-medium text-sm text-[#00A251] whitespace-nowrap"
                          >
                            {(game.auto_reply_enabled !== "none" &&
                            game.auto_reply_enabled !== null) ? (
                              <CheckCircle
                                weight={"Bold"}
                                size={16}
                                color="green"
                              />
                            ) : (
                              <Plus size={16} />
                            )}
                            Auto Reply
                          </button>
                          <button
                            onClick={() => handleWeeklyReport(game)}
                            className="flex items-center gap-1 font-urbanist font-medium text-sm text-[#00A251] whitespace-nowrap"
                          >
                            {game.generateweeklyreport !== "none" ? (
                              <CheckCircle
                                weight={"Bold"}
                                size={16}
                                color="green"
                              />
                            ) : (
                              <Plus size={16} />
                            )}
                            Weekly Report
                          </button>
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 hover:bg-[#f6f6f6] rounded transition-colors">
                              <MenuDots
                                weight="Bold"
                                size={16}
                                color="#6D6D6D"
                                className=""
                              />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-20 mt-1 w-32 bg-white border border-[#f6f6f6] rounded-lg shadow-lg">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEditGame(game)}
                                      className={`w-full inline-flex items-center gap-2 text-left px-3 py-2 font-urbanist text-[14px] ${
                                        active ? "bg-[#f6f6f6]" : ""
                                      }`}
                                    >
                                      <Pen weight="Linear" size={14} color="#6D6D6D" />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedGame(game);
                                        setShowDeleteConfirmation(true);
                                      }}
                                      className={`w-full inline-flex items-center gap-2 text-left px-3 py-2 font-urbanist text-[14px] text-[#f25a5a] ${
                                        active ? "bg-[#f6f6f6]" : ""
                                      }`}
                                    >
                                      <TrashBinMinimalistic weight="Linear" size={14} color="#f25a5a" />
                                      Delete
                                    </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InfiniteScroll>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-30">
          <span className="font-urbanist font-medium text-[14px] text-[#141414]">
            {selectedGames.length} selected
          </span>
          <div className="w-px h-6 bg-[#f6f6f6]" />
          <button
            onClick={() => {
              const game = games.find((g) => g.id === selectedGames[0]);
              if (game) handleAutoReply(game);
            }}
            className="flex items-center gap-1 font-urbanist font-medium text-[14px] text-[#1f6744] hover:text-[#141414]"
          >
            <Plus size={16} /> Auto Reply
          </button>
          <div className="w-px h-6 bg-[#f6f6f6]" />
          <button
            onClick={() => {
              const game = games.find((g) => g.id === selectedGames[0]);
              if (game) handleWeeklyReport(game);
            }}
            className="flex items-center gap-1 font-urbanist font-medium text-[14px] text-[#1f6744] hover:text-[#141414]"
          >
            <Plus size={16} /> Weekly Report
          </button>
          <div className="w-px h-6 bg-[#f6f6f6]" />
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="flex items-center gap-1 font-urbanist font-medium text-[14px] text-[#f25a5a] hover:opacity-80"
          >
            <TrashBinMinimalistic weight="Linear" size={16} color="#f25a5a" />
            Delete
          </button>
        </div>
      )}

      {/* Popups */}
      {showAddGamePopup && (
        <AddGamePopup
          setShowModal={setShowAddGamePopup}
          setToastMessage={setToastMessage}
          setGames={setGames}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          studio_id={studioData?.id}
        />
      )}

      {showSendReportPopup && selectedGame && (
        <SendWeeklyReportPopup
          setShowSendReportPopup={setShowSendReportPopup}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          setGames={setGames}
          studio_id={studioData?.id}
        />
      )}

      {showAutoReplyPopup && selectedGame && (
        <EnableAutoReplyPopup
          setShowAutoReplyEnablePopup={setShowAutoReplyPopup}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          setGames={setGames}
          studio_id={studioData?.id}
          setToastMessage={setToastMessage}
        />
      )}

      {showBulkUploadPopup && (
        <BulkUploadGamesPopup
          setShowBulkUploadPopup={setShowBulkUploadPopup}
          studio_id={studioData?.id}
          onUploadSuccess={(data) => {
            setToastMessage({
              show: true,
              message: data?.message || "Games uploaded successfully",
              type: "success",
            });
            // Refresh games list
            getGamesByStudioId(1, false);
            setShowBulkUploadPopup(false);
          }}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationPopup
          heading="Delete Game"
          subHeading={
            selectedGames.length > 1
              ? `Are you sure you want to delete ${selectedGames.length} games? All reviews under these games will be deleted.`
              : `Are you sure you want to delete ${
                  selectedGame?.game_name || "this game"
                }? All reviews under this game will be deleted.`
          }
          onCancel={() => {
            setShowDeleteConfirmation(false);
            if (!selectedGames.length) setSelectedGame(null);
          }}
          onConfirm={
            selectedGames.length > 1 ? handleBulkDelete : handleDeleteGame
          }
        />
      )}

      {/* Toast Message */}
      {toastMessage?.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default GamesSettings;
