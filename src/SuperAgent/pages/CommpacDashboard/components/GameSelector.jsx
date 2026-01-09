import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AltArrowDown, Pin, Star } from "@solar-icons/react";
import { setSelectedGame, setGames as setGamesAction } from "../../../../store/reducer/superAgent";
import api from "../../../../api";
import { fetchAllgames } from "../../../../services/games.service";
import ToastMessage from "../../../../components/ToastMessage";
import { formatScore } from "../utils/formatScore";
import RadioButton from "./RadioButton";

const GameSelector = ({ game, ContextStudioData, games = [], platform = "android" }) => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelectGame = (selectedGame) => {
    // Add platform to selected game
    const gameWithPlatform = {
      ...selectedGame,
      platform: platform,
    };
    dispatch(setSelectedGame(gameWithPlatform));
    setShowDropdown(false);
  };

  const isSelected = (gameItem) => {
    return game?.id === gameItem?.id || game?.app_id === gameItem?.app_id;
  };

  const pinGame = async (e, gameItem) => {
    try {
      e.stopPropagation();
      const response = await api.post(`/v1/games/${gameItem.id}/pin`);
      if (response.status === 200) {
        const gamesresponse = await fetchAllgames(ContextStudioData?.id);
        dispatch(setGamesAction(gamesresponse));
        // Find the updated game from the refreshed list and update selectedGame
        const updatedGame = gamesresponse.find(
          (g) => g.id === gameItem.id || g.app_id === gameItem.app_id
        );
        if (updatedGame) {
          dispatch(setSelectedGame(updatedGame));
        }
        setToastMessage({
          show: true,
          title: "Game pinned",
          subtitle: "Game pinned successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Failed to pin game",
        type: "error",
      });
    }
  };

  const unpinGame = async (e, gameItem) => {
    try {
      e.stopPropagation();
      const response = await api.delete(`/v1/games/${gameItem.id}/unpin`);
      if (response.status === 200) {
        const gamesresponse = await fetchAllgames(ContextStudioData?.id);
        dispatch(setGamesAction(gamesresponse));
        // Find the updated game from the refreshed list and update selectedGame
        const updatedGame = gamesresponse.find(
          (g) => g.id === gameItem.id || g.app_id === gameItem.app_id
        );
        if (updatedGame) {
          dispatch(setSelectedGame(updatedGame));
        }
        setToastMessage({
          show: true,
          title: "Game unpinned",
          subtitle: "Game unpinned successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle: "Failed to unpin game",
        type: "error",
      });
    }
  };

  // Filter games by platform
  const filteredGames = useMemo(() => {
    if (platform === "android") {
      return games.filter(
        (game) => game.package_name && game.package_name.trim().length > 0
      );
    } else {
      return games.filter((game) => game.app_id);
    }
  }, [games, platform]);

  return (
    <div className="relative w-[353px]" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        className="bg-white border border-[#e6e6e6] rounded flex items-center justify-between gap-[10px] pl-1 pr-3 py-1 cursor-pointer hover:border-[#1f6744] transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex gap-[9px] items-center">
          <div className="relative w-[66px] h-[52px] rounded-[3.375px] overflow-hidden">
            <img
              src={
                platform === "android"
                  ? game?.play_store_icon
                  : game?.app_store_icon ||
                game?.play_store_icon ||
                "https://via.placeholder.com/66x52"
              }
              alt={game?.game_name || "Game"}
              className="w-full h-full object-cover"
            />
            {game && (
              <div
                className="absolute top-[6px] left-[6px] cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (game.is_pinned) {
                    unpinGame(e, game);
                  } else {
                    pinGame(e, game);
                  }
                }}
              >
                <Pin
                  weight={game.is_pinned ? "Bold" : "Linear"}
                  size={16}
                  color="#fff"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 w-[174px]">
            <div className="flex flex-col gap-0.5 ">
              <span className="font-urbanist font-medium text-sm text-[#141414] truncate">
                {game?.game_name || "Select Game"}
              </span>
              <span className="font-urbanist text-xs text-[#b0b0b0]">
                {ContextStudioData?.studio_name ||
                  game?.app_store_developer ||
                  game?.play_store_developer}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <span className="font-urbanist text-[11px] text-[#b0b0b0]">
                  {formatScore(
                    platform === "android"
                      ? game?.play_store_score
                      : game?.app_store_score || game?.play_store_score
                  )}
                </span>
                <Star size={11} weight="Bold" color="#FFC322" />
              </div>
              {game?.version && (
                <>
                  <div className="w-1 h-1 bg-[#b0b0b0] rounded-full" />
                  <span className="font-urbanist text-[11px] text-[#b0b0b0]">
                    {game?.version}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <AltArrowDown
          size={16}
          color="#6d6d6d"
          weight="Linear"
          className={`cursor-pointer transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {showDropdown && filteredGames.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-[353px] bg-white border border-[#e7eaee] rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Games List */}
          <div className="overflow-y-auto p-2">
            {filteredGames.map((gameItem, index) => {
              const selected = isSelected(gameItem);
              return (
                <div
                  key={gameItem?.id || gameItem?.app_id || index}
                  className="relative mb-2 last:mb-0"
                >
                  <div
                    className={`flex items-center gap-3 px-2 py-2 cursor-pointer transition-colors relative ${
                      selected
                        ? "bg-[#f6f7f8] rounded-lg"
                        : "hover:bg-[#f6f7f8] rounded-lg border-2 border-transparent"
                    }`}
                    onClick={() => handleSelectGame(gameItem)}
                  >
                    {/* Radio Button */}
                    <div className="flex-shrink-0">
                      <RadioButton
                        checked={selected}
                        onChange={() => handleSelectGame(gameItem)}
                      />
                    </div>

                    {/* Game Thumbnail */}
                      <div className="relative w-[66px] h-[52px] rounded-[3.375px] overflow-hidden flex-shrink-0">
                        <img
                          src={
                            platform === "android"
                              ? gameItem?.play_store_icon
                              : gameItem?.app_store_icon ||
                            gameItem?.play_store_icon ||
                            "https://via.placeholder.com/66x52"
                          }
                          alt={gameItem?.game_name || "Game"}
                          className="w-full h-full object-cover"
                        />
                      <div
                        className="absolute top-[6px] left-[6px] cursor-pointer z-10"
                        onClick={(e) => {
                          if (gameItem.is_pinned) {
                            unpinGame(e, gameItem);
                          } else {
                            pinGame(e, gameItem);
                          }
                        }}
                      >
                        <Pin
                          weight={gameItem.is_pinned ? "Bold" : "Linear"}
                          size={16}
                          color="#fff"
                        />
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-urbanist font-medium text-sm text-[#141414] truncate">
                          {gameItem?.game_name}
                        </span>
                        <span className="font-urbanist text-xs text-[#b0b0b0] truncate">
                          {ContextStudioData?.studio_name ||
                            gameItem?.app_store_developer ||
                            gameItem?.play_store_developer}
                        </span>
                      </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="font-urbanist text-[11px] text-[#b0b0b0]">
                              {formatScore(
                                platform === "android"
                                  ? gameItem?.play_store_score
                                  : gameItem?.app_store_score ||
                                    gameItem?.play_store_score
                              )}
                            </span>
                          <Star size={11} weight="Bold" color="#FFC322" />
                        </div>
                        {gameItem?.version && (
                          <>
                            <div className="w-1 h-1 bg-[#b0b0b0] rounded-full" />
                            <span className="font-urbanist text-[11px] text-[#b0b0b0]">
                              {gameItem?.version}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Toast Message */}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default GameSelector;

