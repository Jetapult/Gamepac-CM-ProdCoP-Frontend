import React, { useState } from "react";
import { X } from "lucide-react";

const calendarIcon = "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png";

const CalendarEventCard = ({
  summary: initialSummary = "",
  description: initialDescription = "",
  start_date: initialStartDate = "",
  start_time: initialStartTime = "09:00",
  duration_hours: initialDuration = 1,
  attendees: initialAttendees = [],
  time_zone: initialTimeZone = "UTC",
  onSend,
  onCancel,
  onChange,
  isConnected = false,
  onConnect,
  isLoading = false,
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [description, setDescription] = useState(initialDescription);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState(initialDuration);
  const [attendees, setAttendees] = useState(initialAttendees);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [timeZone, setTimeZone] = useState(initialTimeZone);

  const handleChange = (updates) => {
    onChange?.({
      summary,
      description,
      start_date: startDate,
      start_time: startTime,
      duration_hours: duration,
      attendees,
      time_zone: timeZone,
      ...updates,
    });
  };

  const handleAddAttendee = (e) => {
    if (e.key === "Enter" && attendeeInput.trim()) {
      e.preventDefault();
      const newAttendees = [...attendees, attendeeInput.trim()];
      setAttendees(newAttendees);
      setAttendeeInput("");
      handleChange({ attendees: newAttendees });
    }
  };

  const handleRemoveAttendee = (email) => {
    const newAttendees = attendees.filter((a) => a !== email);
    setAttendees(newAttendees);
    handleChange({ attendees: newAttendees });
  };

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={calendarIcon} alt="Google Calendar" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Calendar Event
        </span>
      </div>

      {/* Event Title Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Title
        </span>
        <input
          type="text"
          value={summary}
          onChange={(e) => { setSummary(e.target.value); handleChange({ summary: e.target.value }); }}
          placeholder="Event title..."
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Date & Time Row */}
      <div className="flex border-b border-[#f1f1f1]">
        <div className="flex items-center gap-3 px-4 py-3 flex-1 border-r border-[#f1f1f1]">
          <span
            className="text-[14px] text-[#9ca3af] w-12 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); handleChange({ start_date: e.target.value }); }}
            disabled={!isConnected}
            className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 flex-1">
          <span
            className="text-[14px] text-[#9ca3af] w-12 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Time
          </span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); handleChange({ start_time: e.target.value }); }}
            disabled={!isConnected}
            className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
      </div>

      {/* Duration & Timezone Row */}
      <div className="flex border-b border-[#f1f1f1]">
        <div className="flex items-center gap-3 px-4 py-3 flex-1 border-r border-[#f1f1f1]">
          <span
            className="text-[14px] text-[#9ca3af] w-16 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Duration
          </span>
          <select
            value={duration}
            onChange={(e) => { setDuration(Number(e.target.value)); handleChange({ duration_hours: Number(e.target.value) }); }}
            disabled={!isConnected}
            className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <option value={0.5}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={1.5}>1.5 hours</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
          </select>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 flex-1">
          <span
            className="text-[14px] text-[#9ca3af] w-16 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Timezone
          </span>
          <select
            value={timeZone}
            onChange={(e) => { setTimeZone(e.target.value); handleChange({ time_zone: e.target.value }); }}
            disabled={!isConnected}
            className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      {/* Attendees Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Attendees
        </span>
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {attendees.map((email) => (
            <div
              key={email}
              className="flex items-center gap-1 px-2 py-1 bg-[#f6f7f8] rounded-md"
            >
              <span
                className="text-[14px] text-[#141414]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {email}
              </span>
              <button
                onClick={() => handleRemoveAttendee(email)}
                className="text-[#9ca3af] hover:text-[#141414] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="email"
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            onKeyDown={handleAddAttendee}
            placeholder={attendees.length === 0 ? "Add attendees..." : ""}
            disabled={!isConnected}
            className={`flex-1 min-w-[150px] text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Description
        </span>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); handleChange({ description: e.target.value }); }}
          placeholder="Event description..."
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
            You're not connected to Google Calendar
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
            onClick={() => onSend?.({ summary, description, start_date: startDate, start_time: startTime, duration_hours: duration, attendees, time_zone: timeZone })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Connect Calendar
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarEventCard;
