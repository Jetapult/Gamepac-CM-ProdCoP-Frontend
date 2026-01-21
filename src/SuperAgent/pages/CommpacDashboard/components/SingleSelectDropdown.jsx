import React from "react";
import { AltArrowDown } from "@solar-icons/react";
import FilterTag from "./FilterTag";

const SingleSelectDropdown = ({
  label,
  placeholder = "Select...",
  options = [],
  selectedValue = null,
  onSelect,
  onRemove,
  isOpen,
  onToggle,
  dropdownRef,
}) => {
  const hasSelection = selectedValue !== null;

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
              ? selectedValue.label || selectedValue.name
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
                  const isSelected =
                    selectedValue?.value === option.value ||
                    selectedValue?.id === option.id;
                  return (
                    <div
                      key={option.id || option.value}
                      className={`px-4 py-2 cursor-pointer transition-colors flex items-center gap-2 ${
                        isSelected ? "bg-[#f6f7f8]" : "hover:bg-[#f6f7f8]"
                      }`}
                      onClick={() => onSelect(option)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-[#4C980F] bg-[#4C980F]"
                            : "border-[#d9dee4] bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
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
      {/* Selected Tag */}
      {hasSelection && (
        <div className="flex flex-wrap gap-2">
          <FilterTag
            label={selectedValue.label || selectedValue.name}
            onRemove={onRemove}
          />
        </div>
      )}
    </div>
  );
};

export default SingleSelectDropdown;

