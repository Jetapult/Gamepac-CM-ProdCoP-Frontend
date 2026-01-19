import React, { useState, useRef, useEffect } from "react";
import { AltArrowDown, InfoCircle } from "@solar-icons/react";

const SelectDropdown = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  onLoadMore,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      onLoadMore?.();
    }
  };

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-[#6d6d6d]">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-lg border text-sm text-left flex items-center justify-between transition-colors ${
            isOpen ? "border-[#1F6744]" : "border-[#E7EAEE]"
          } ${value ? "text-[#141414]" : "text-[#B0B0B0]"}`}
        >
          <span>{value?.label || placeholder}</span>
          <AltArrowDown
            size={16}
            color="#6d6d6d"
            weight="Linear"
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E7EAEE] rounded-lg shadow-lg z-10 max-h-[200px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F6F6F6] transition-colors ${
                    value?.value === option.value
                      ? "bg-[#E8F5E9] text-[#1F6744]"
                      : "text-[#141414]"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2.5 text-sm text-[#B0B0B0] text-center">
                No users available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StepStakeholders = ({
  gameData,
  errors,
  users,
  productManager,
  producer,
  leadEngineer,
  setProductManager,
  setProducer,
  setLeadEngineer,
  onInputChange,
  onLoadMore,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Step 1 Data - Editable */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">Game name</label>
          <input
            type="text"
            value={gameData.game_name}
            onChange={(e) => onInputChange("game_name", e.target.value)}
            placeholder="Add game name"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors?.game_name ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors?.game_name && (
            <span className="text-xs text-[#f25a5a]">{errors.game_name}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">Game alias</label>
          <input
            type="text"
            value={gameData.short_names}
            onChange={(e) => onInputChange("short_names", e.target.value)}
            placeholder="Add alias"
            className="w-full px-4 py-3 rounded-lg border border-[#E7EAEE] text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-[calc(50%-8px)]">
        <label className="text-sm font-medium text-[#6d6d6d]">Game type</label>
        <input
          type="text"
          value={gameData.game_type}
          onChange={(e) => onInputChange("game_type", e.target.value)}
          placeholder="Add game type"
          className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
            errors?.game_type ? "border-[#f25a5a]" : "border-[#E7EAEE]"
          }`}
        />
        {errors?.game_type && (
          <span className="text-xs text-[#f25a5a]">{errors.game_type}</span>
        )}
      </div>

      {/* Step 2 Data - Editable */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">Playstore link</label>
          <input
            type="text"
            value={gameData.playstore_link}
            onChange={(e) => onInputChange("playstore_link", e.target.value)}
            placeholder="Add link"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#1976D2] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors?.playstore_link ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors?.playstore_link && (
            <span className="text-xs text-[#f25a5a]">{errors.playstore_link}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d] flex items-center gap-1">
            Package name
            <span className="cursor-help" title="The package name is the unique identifier for your app on Google Play Store">
              <InfoCircle weight="Linear" size={16} color="#6d6d6d" />
            </span>
          </label>
          <input
            type="text"
            value={gameData.package_name}
            onChange={(e) => onInputChange("package_name", e.target.value)}
            placeholder="Add package name"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors?.package_name ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors?.package_name && (
            <span className="text-xs text-[#f25a5a]">{errors.package_name}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">Appstore link</label>
          <input
            type="text"
            value={gameData.appstore_link}
            onChange={(e) => onInputChange("appstore_link", e.target.value)}
            placeholder="Add link"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#1976D2] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors?.appstore_link ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors?.appstore_link && (
            <span className="text-xs text-[#f25a5a]">{errors.appstore_link}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">App ID</label>
          <input
            type="text"
            value={gameData.app_id}
            onChange={(e) => onInputChange("app_id", e.target.value)}
            placeholder="Add ID"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors?.app_id ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors?.app_id && (
            <span className="text-xs text-[#f25a5a]">{errors.app_id}</span>
          )}
        </div>
      </div>

      {/* Links error */}
      {errors?.links && (
        <span className="text-xs text-[#f25a5a]">{errors.links}</span>
      )}

      {/* Step 3 - Stakeholder Dropdowns */}
      <div className="grid grid-cols-2 gap-4">
        <SelectDropdown
          label="Product manager"
          placeholder="Add alias"
          options={users}
          value={productManager}
          onChange={setProductManager}
          onLoadMore={onLoadMore}
        />
        <SelectDropdown
          label="Producer"
          placeholder="Add game name"
          options={users}
          value={producer}
          onChange={setProducer}
          onLoadMore={onLoadMore}
        />
      </div>

      <div className="max-w-[calc(50%-8px)]">
        <SelectDropdown
          label="Lead engineer"
          placeholder="Add alias"
          options={users}
          value={leadEngineer}
          onChange={setLeadEngineer}
          onLoadMore={onLoadMore}
        />
      </div>
    </div>
  );
};

export default StepStakeholders;
