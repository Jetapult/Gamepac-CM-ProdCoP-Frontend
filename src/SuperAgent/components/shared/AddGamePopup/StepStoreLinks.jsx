import React from "react";
import { InfoCircle } from "@solar-icons/react";

const StepStoreLinks = ({ gameData, errors, onInputChange }) => {
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

      {/* Step 2 - Play Store Section */}
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
            <span className="cursor-help" title="The package name is the unique identifier for your app on Google Play Store (e.g., com.example.app)">
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

      {/* App Store Section */}
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
    </div>
  );
};

export default StepStoreLinks;
