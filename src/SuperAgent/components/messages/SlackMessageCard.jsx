import React, { useState, useRef, useEffect, useCallback } from "react";
import { searchSlackChannels, searchSlackUsers } from "../../../services/composioApi";

const slackIcon = "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png";

const SlackMessageCard = ({
  channel: initialChannel = "",
  text: initialText = "",
  channels = [],
  users = [],
  onSend,
  onCancel,
  onChange,
  onFocus,
  isConnected = false,
  onConnect,
  isLoading = false,
  isConnecting = false,
  isLoadingChannels = false,
}) => {
  const [channel, setChannel] = useState(initialChannel);
  const [text, setText] = useState(initialText);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ channels: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const channelInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSearchResults({ channels: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const cleanQuery = query.replace(/^[#@]/, "").toLowerCase();

    try {
      // Search channels via API
      const channelsResult = await searchSlackChannels({ searchQuery: cleanQuery, limit: 10 }).catch(() => null);
      const searchedChannels = channelsResult?.data?.data?.channels || [];

      // Filter users locally by name (API only supports email search)
      const filteredUsers = users.filter((u) =>
        (u.name || u.real_name || u).toLowerCase().includes(cleanQuery)
      );

      setSearchResults({ channels: searchedChannels, users: filteredUsers });
    } catch (error) {
      console.error("Slack search error:", error);
      setSearchResults({ channels: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  }, [users]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults({ channels: [], users: [] });
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleChannelChange = (e) => {
    const value = e.target.value;
    setChannel(value);
    setSearchQuery(value);
    setShowChannelDropdown(true);
    onChange?.({ channel: value, text });
  };

  const handleChannelSelect = (ch) => {
    const channelName = `#${ch.channel_name || ch.name || ch}`;
    setChannel(channelName);
    setSearchQuery("");
    setShowChannelDropdown(false);
    setSearchResults({ channels: [], users: [] });
    onChange?.({ channel: channelName, text });
  };

  const handleUserSelect = (u) => {
    const userName = `@${u.name || u.real_name || u}`;
    setChannel(userName);
    setSearchQuery("");
    setShowChannelDropdown(false);
    setSearchResults({ channels: [], users: [] });
    onChange?.({ channel: userName, text });
  };

  const handleChannelFocus = () => {
    setShowChannelDropdown(true);
    onFocus?.();
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    onChange?.({ channel, text: e.target.value });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowChannelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={slackIcon} alt="Slack" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Slack Message
        </span>
      </div>

      {/* Channel Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1] relative" ref={dropdownRef}>
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Channel
        </span>
        <div className="flex-1 relative">
          <input
            ref={channelInputRef}
            type="text"
            value={channel}
            onChange={handleChannelChange}
            onFocus={handleChannelFocus}
            placeholder="#channel-name"
            disabled={!isConnected}
            className={`w-full text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
          {/* Channel/User Dropdown */}
          {showChannelDropdown && isConnected && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e6e6] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
              {isSearching ? (
                <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  Searching...
                </div>
              ) : searchQuery ? (
                // Show search results when there's a search query
                (searchResults.channels.length > 0 || searchResults.users.length > 0) ? (
                  <>
                    {searchResults.channels.map((ch) => (
                      <button
                        key={`ch-${ch.channel_id || ch.channel_name}`}
                        onClick={() => handleChannelSelect(ch)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        #{ch.channel_name}
                      </button>
                    ))}
                    {searchResults.users.map((u) => (
                      <button
                        key={`u-${u.id || u.name}`}
                        onClick={() => handleUserSelect(u)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        @{u.name || u.real_name}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    No matches found
                  </div>
                )
              ) : (
                // Show initial list when search is empty
                isLoadingChannels ? (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    Loading...
                  </div>
                ) : (channels.length > 0 || users.length > 0) ? (
                  <>
                    {channels.map((ch) => (
                      <button
                        key={`ch-${ch.id || ch.name || ch}`}
                        onClick={() => handleChannelSelect(ch)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        #{ch.name || ch}
                      </button>
                    ))}
                    {users.map((u) => (
                      <button
                        key={`u-${u.id || u.name || u}`}
                        onClick={() => handleUserSelect(u)}
                        className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                        style={{ fontFamily: "Urbanist, sans-serif" }}
                      >
                        @{u.name || u.real_name || u}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    No channels or users available
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Message
        </span>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your Slack message..."
          rows={6}
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] leading-[22px] outline-none bg-transparent resize-none ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Not connected warning */}
      {!isConnected && (
        <div className="px-4 py-3 bg-[#fffbeb] border-b border-[#f1f1f1]">
          <p
            className="text-[13px] text-[#f59e0b] flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            You're not connected to Slack
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 p-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Cancel
        </button>
        {isConnected ? (
          <button
            onClick={() => onSend?.({ channel, text })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Posting..." : "Post Message"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading || isConnecting}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Connect Slack
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SlackMessageCard;
