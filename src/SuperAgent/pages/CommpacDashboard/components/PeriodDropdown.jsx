import React, { useState, useRef, useEffect } from "react";
import { AltArrowDown, Filter } from "@solar-icons/react";
import { periodFilter } from "../../../../constants/organicUA";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import moment from "moment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const PeriodDropdown = ({
  period,
  setPeriod,
  customDates,
  setCustomDates,
  onPeriodChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showDropdown || showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showCalendar]);

  const handlePeriodSelect = (value) => {
    if (value === "custom") {
      setPeriod("custom");
      setShowCalendar(true);
      setShowDropdown(false);
    } else {
      setPeriod(value);
      setShowDropdown(false);
      // Trigger API call when period changes
      if (onPeriodChange) {
        onPeriodChange();
      }
    }
  };

  const getDisplayText = () => {
    if (period === "custom") {
      if (customDates[0]?.startDate && customDates[0]?.endDate) {
        return `${moment(customDates[0].startDate).format(
          "Do MMM YYYY"
        )} - ${moment(customDates[0].endDate).format("Do MMM YYYY")}`;
      }
      return "Custom";
    }
    if (!period || period === "") {
      return "Lifetime";
    }
    const selectedPeriod = periodFilter.find((p) => p.value === period);
    return selectedPeriod ? selectedPeriod.name : "Lifetime";
  };

  const customStaticRanges = [
    {
      label: "180 Days",
      range: () => ({
        startDate: moment().subtract(180, "days").toDate(),
        endDate: new Date(),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          moment(range.startDate).isSame(definedRange.startDate, "day") &&
          moment(range.endDate).isSame(definedRange.endDate, "day")
        );
      },
    },
    {
      label: "360 Days",
      range: () => ({
        startDate: moment().subtract(360, "days").toDate(),
        endDate: new Date(),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          moment(range.startDate).isSame(definedRange.startDate, "day") &&
          moment(range.endDate).isSame(definedRange.endDate, "day")
        );
      },
    },
    {
      label: "Lifetime",
      range: () => ({
        startDate: null,
        endDate: null,
      }),
      isSelected(range) {
        return range.startDate === null && range.endDate === null;
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        className="bg-white border border-[#e6e6e6] rounded flex items-center justify-between gap-5 h-9 px-2 py-2 cursor-pointer hover:border-[#1f6744] transition-colors"
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowCalendar(false);
        }}
      >
        <div className="flex items-center gap-1.5">
          <Filter weight={"Linear"} size={20} color="#6d6d6d" />
          <span className="font-urbanist font-medium text-base text-[#141414]">
            {getDisplayText()}
          </span>
        </div>
        <AltArrowDown
          size={16}
          color="#6d6d6d"
          weight="Linear"
          className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-[200px] bg-white border border-[#e7eaee] rounded-lg shadow-lg z-50">
          <div className="py-1">
            {periodFilter.map((item) => (
              <div
                key={item.id}
                className="px-4 py-2 hover:bg-[#f6f7f8] cursor-pointer transition-colors flex items-center gap-2"
                onClick={() => handlePeriodSelect(item.value)}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    period === item.value
                      ? "border-[#4C980F] bg-[#4C980F]"
                      : "border-[#d9dee4] bg-white"
                  }`}
                >
                  {period === item.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-urbanist text-sm text-[#141414]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date Picker */}
      {showCalendar && period === "custom" && (
        <div
          ref={calendarRef}
          className="absolute top-full right-0 mt-2 z-[60] bg-white border border-[#e7eaee] rounded-lg shadow-lg p-4"
          style={{
            maxHeight: "calc(100vh - 100px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "calc(100vh - 180px)",
              width: "100%",
            }}
            onWheel={(e) => {
              // Allow horizontal scrolling with shift+wheel
              if (e.shiftKey) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <div style={{ minWidth: "600px", width: "max-content" }}>
              <DateRangePicker
                onChange={(item) => setCustomDates([item.selection])}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={customDates}
                direction="horizontal"
                className="z-50"
                staticRanges={[...defaultStaticRanges, ...customStaticRanges]}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#e7eaee] bg-white flex-shrink-0">
            <button
              onClick={() => {
                setShowCalendar(false);
                // Reset to default if no dates selected
                if (!customDates[0]?.startDate || !customDates[0]?.endDate) {
                  setPeriod("7");
                }
              }}
              className="px-4 py-2 rounded-lg border border-[#e7eaee] text-[#141414] font-urbanist text-sm hover:bg-[#f6f7f8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowCalendar(false);
                setShowDropdown(false);
                if (onPeriodChange) {
                  onPeriodChange();
                }
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#11A85F] to-[#1F6744] text-white font-urbanist text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodDropdown;

