import React, { useState, useRef, useEffect, useCallback } from "react";
import { AltArrowDown } from "@solar-icons/react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedGame,
  setStudio,
  setGames as setGamesAction,
} from "../../store/reducer/superAgent";
import { getAuthToken } from "../../utils";

const API_BASE_URL = "http://localhost:3000";

const GameDropdown = () => {
  const dispatch = useDispatch();
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const games = useSelector((state) => state.superAgent.games);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Fetch user data (studio & games) from /v1/auth/me
  useEffect(() => {
    const fetchUserData = async () => {
      if (games.length > 0) return; // Already fetched

      setIsLoading(true);
      try {
        const token = getAuthToken()?.token;
        const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.data) {
          // Store studio data
          if (result.data.studio) {
            dispatch(setStudio(result.data.studio));
          }
          // Store games data
          if (result.data.games && result.data.games.length > 0) {
            dispatch(setGamesAction(result.data.games));
            // Auto-select first game if none selected
            if (!selectedGame) {
              dispatch(setSelectedGame(result.data.games[0]));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch, selectedGame, games.length]);

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
      game.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.package_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        className="h-8 px-3 flex items-center gap-2 border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => games.length > 0 && setShowDropdown(!showDropdown)}
        disabled={games.length === 0}
      >
        {selectedGame?.icon ? (
          <img
            src={selectedGame.icon}
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
          style={{ display: selectedGame?.icon ? "none" : "flex" }}
        >
          <span className="text-[10px] text-[#6d6d6d]">🎮</span>
        </div>
        <span
          className="text-[14px] text-[#141414] font-medium max-w-[120px] truncate"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {games.length === 0
            ? "You don't have any games"
            : selectedGame?.name || "Select Game"}
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
                  {game.icon ? (
                    <img
                      src={game.icon}
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
                    style={{ display: game.icon ? "none" : "flex" }}
                  >
                    <span className="text-[10px] text-[#6d6d6d]">🎮</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p
                      className="text-[14px] text-[#141414] font-medium truncate"
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                    >
                      {game.name}
                    </p>
                    {game.package_name && (
                      <p
                        className="text-[12px] text-[#6d6d6d] truncate"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        {game.package_name}
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
