import React, { useState, useRef, useEffect } from "react";

const slackIcon = "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png";

const SlackTaskCard = ({
  channel: initialChannel = "",
  task_title: initialTaskTitle = "",
  task_description: initialTaskDescription = "",
  priority: initialPriority = "Medium",
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
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle);
  const [taskDescription, setTaskDescription] = useState(initialTaskDescription);
  const [priority, setPriority] = useState(initialPriority);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [channelFilter, setChannelFilter] = useState("");
  const dropdownRef = useRef(null);

  // Merge channels and users, filter based on input
  const filterText = channelFilter.toLowerCase().replace(/^[#@]/, "");
  const filteredChannels = channels.filter((ch) =>
    (ch.name || ch).toLowerCase().includes(filterText)
  );
  const filteredUsers = users.filter((u) =>
    (u.name || u.real_name || u).toLowerCase().includes(filterText)
  );

  const handleChange = (field, value) => {
    const updates = { channel, task_title: taskTitle, task_description: taskDescription, priority };
    updates[field] = value;
    onChange?.(updates);
  };

  const handleChannelSelect = (ch) => {
    const channelName = `#${ch.name || ch}`;
    setChannel(channelName);
    setChannelFilter("");
    setShowChannelDropdown(false);
    handleChange("channel", channelName);
  };

  const handleUserSelect = (u) => {
    const userName = `@${u.name || u.real_name || u}`;
    setChannel(userName);
    setChannelFilter("");
    setShowChannelDropdown(false);
    handleChange("channel", userName);
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
          Slack Task
        </span>
      </div>

      {/* Channel Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1] relative" ref={dropdownRef}>
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Channel
        </span>
        <div className="flex-1 relative">
          <input
            type="text"
            value={channel}
            onChange={(e) => { 
              setChannel(e.target.value); 
              setChannelFilter(e.target.value);
              setShowChannelDropdown(true);
              handleChange("channel", e.target.value); 
            }}
            onFocus={() => { setShowChannelDropdown(true); onFocus?.(); }}
            placeholder="#channel-name"
            disabled={!isConnected}
            className={`w-full text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
          {/* Channel/User Dropdown */}
          {showChannelDropdown && isConnected && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e6e6] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
              {isLoadingChannels ? (
                <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  Loading...
                </div>
              ) : (filteredChannels.length > 0 || filteredUsers.length > 0) ? (
                <>
                  {filteredChannels.map((ch) => (
                    <button
                      key={`ch-${ch.id || ch.name || ch}`}
                      onClick={() => handleChannelSelect(ch)}
                      className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                    >
                      #{ch.name || ch}
                    </button>
                  ))}
                  {filteredUsers.map((u) => (
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
              ) : (channels.length === 0 && users.length === 0) ? (
                <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  No channels or users available
                </div>
              ) : (
                <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Title Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Task Title
        </span>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => { setTaskTitle(e.target.value); handleChange("task_title", e.target.value); }}
          placeholder="Enter task title..."
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Priority Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Priority
        </span>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); handleChange("priority", e.target.value); }}
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Task Description Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-24 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Description
        </span>
        <textarea
          value={taskDescription}
          onChange={(e) => { setTaskDescription(e.target.value); handleChange("task_description", e.target.value); }}
          placeholder="Enter task description..."
          rows={4}
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
            onClick={() => onSend?.({ channel, task_title: taskTitle, task_description: taskDescription, priority })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Creating..." : "Create Task"}
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

export default SlackTaskCard;
