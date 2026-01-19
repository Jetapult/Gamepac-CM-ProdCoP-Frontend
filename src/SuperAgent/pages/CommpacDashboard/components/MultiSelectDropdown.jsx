import React from "react";
import { AltArrowDown } from "@solar-icons/react";
import FilterTag from "./FilterTag";
import Checkbox from "./Checkbox";

const MultiSelectDropdown = ({
  label,
  placeholder = "Select...",
  options = [],
  selectedValues = [],
  onSelect,
  onRemove,
  isOpen,
  onToggle,
  dropdownRef,
}) => {
  const hasSelection = selectedValues.length > 0;

  return (
    <div className="flex flex-col gap-3" ref={dropdownRef}>
      <span className="font-urbanist text-sm text-black">{label}</span>
      <div className="relative">
        <div
          className={`bg-[#f6f6f6] border flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
            isOpen
              ? "border-[#1f6744] bg-white"
              : hasSelection
              ? "border-[#f6f6f6]"
              : "border-[#f6f6f6] hover:border-[#e7eaee]"
          }`}
          onClick={onToggle}
        >
          <span
            className={`font-urbanist text-base ${
              hasSelection ? "text-[#141414]" : "text-[#b0b0b0]"
            }`}
          >
            {hasSelection
              ? selectedValues.length === 1
                ? selectedValues[0].label
                : `${selectedValues.length} selected`
              : placeholder}
          </span>
          <AltArrowDown
            size={16}
            color="#6d6d6d"
            weight="Linear"
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e7eaee] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
            <div className="py-1">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = selectedValues.some(
                    (sv) => sv.value === option.value
                  );
                  return (
                    <div
                      key={option.id || option.value}
                      className="px-4 py-2 hover:bg-[#f6f7f8] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        if (isSelected) {
                          onRemove(option);
                        } else {
                          onSelect(option);
                        }
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      <span className="font-urbanist text-sm text-[#141414]">
                        {option.label || option.name}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-[#b0b0b0] text-center">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Selected Tags */}
      {hasSelection && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <FilterTag
              key={item.value}
              label={item.label || item.name}
              onRemove={() => onRemove(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;

