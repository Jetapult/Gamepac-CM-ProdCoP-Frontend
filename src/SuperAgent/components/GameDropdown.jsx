import React, { useState, useRef, useEffect, useCallback } from "react";
import { AltArrowDown } from "@solar-icons/react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedGame,
  setGames as setGamesAction,
} from "../../store/reducer/superAgent";
import { fetchAllgames } from "../../services/games.service";

const GameDropdown = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const games = useSelector((state) => state.superAgent.games);
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Fetch games using existing service when studio data is available
  // useEffect(() => {
  //   const loadGames = async () => {
  //     const studioSlug = ContextStudioData?.slug;
  //     if (games.length > 0 || !studioSlug) return; // Already fetched or no studio

  //     setIsLoading(true);
  //     try {
  //       const gamesData = await fetchAllgames(studioSlug);
  //       if (gamesData && gamesData.length > 0) {
  //         dispatch(setGamesAction(gamesData));
  //         // Auto-select first game if none selected
  //         if (!selectedGame) {
  //           dispatch(setSelectedGame(gamesData[0]));
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch games:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadGames();
  // }, [ContextStudioData?.slug, dispatch, selectedGame, games.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchTerm("");
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelectGame = useCallback(
    (game) => {
      dispatch(setSelectedGame(game));
      setShowDropdown(false);
      setSearchTerm("");
    },
    [dispatch]
  );

  const filteredGames = games.filter(
    (game) =>
      game.game_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.short_names?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !selectedGame) {
    return (
      <div className="h-8 px-3 flex items-center gap-2 border border-[#e6e6e6] rounded-lg bg-white">
        <span
          className="text-[14px] text-[#6d6d6d]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        className={`h-8 px-3 flex items-center gap-2 border border-[#e6e6e6] rounded-lg transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
          !disabled ? "hover:border-[#1f6744]" : ""
        }`}
        onClick={() =>
          !disabled && games.length > 0 && setShowDropdown(!showDropdown)
        }
        disabled={disabled || games.length === 0}
      >
        {selectedGame?.play_store_icon || selectedGame?.app_store_icon ? (
          <img
            src={selectedGame?.play_store_icon || selectedGame?.app_store_icon}
            alt=""
            className="w-5 h-5 rounded object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-5 h-5 rounded bg-[#e6e6e6] flex items-center justify-center"
          style={{
            display:
              selectedGame?.play_store_icon || selectedGame?.app_store_icon
                ? "none"
                : "flex",
          }}
        >
          <span className="text-[10px] text-[#6d6d6d]">🎮</span>
        </div>
        <span
          className="text-[14px] text-[#141414] font-medium max-w-[120px] truncate"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {games.length === 0
            ? "You don't have any games"
            : selectedGame?.game_name || "Select Game"}
        </span>
        <AltArrowDown
          weight="Linear"
          className={`w-4 h-4 text-[#6D6D6D] transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-[240px] bg-white border border-[#f1f1f1] rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-[#f1f1f1]">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-[14px] border border-[#e6e6e6] rounded-lg outline-none focus:border-[#1f6744] transition-colors"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            />
          </div>

          {/* Games List */}
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <button
                  key={game.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f7f8] transition-colors ${
                    selectedGame?.id === game.id ? "bg-[#f1fcf6]" : ""
                  }`}
                  onClick={() => handleSelectGame(game)}
                >
                  {game.play_store_icon || game.app_store_icon ? (
                    <img
                      src={game.play_store_icon || game.app_store_icon}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-8 h-8 rounded bg-[#e6e6e6] flex items-center justify-center shrink-0"
                    style={{
                      display:
                        game.play_store_icon || game.app_store_icon
                          ? "none"
                          : "flex",
                    }}
                  >
                    <span className="text-[10px] text-[#6d6d6d]">🎮</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p
                      className="text-[14px] text-[#141414] font-medium truncate"
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                    >
                      {game.game_name}
                    </p>
                    {game.short_names && (
                      <p
                        className="text-[12px] text-[#6d6d6d] truncate"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        {game.short_names}
                      </p>
                    )}
                  </div>
                  {selectedGame?.id === game.id && (
                    <span className="text-[#1f6744] text-sm">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <span
                  className="text-[14px] text-[#6d6d6d]"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {searchTerm ? "No games found" : "No games available"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDropdown;
