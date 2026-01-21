import React from "react";

const StepBasics = ({ gameData, errors, onInputChange }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Row 1: Game name and Game alias */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6d6d6d]">Game name</label>
          <input
            type="text"
            value={gameData.game_name}
            onChange={(e) => onInputChange("game_name", e.target.value)}
            placeholder="Add game name"
            className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
              errors.game_name ? "border-[#f25a5a]" : "border-[#E7EAEE]"
            }`}
          />
          {errors.game_name && (
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

      {/* Row 2: Game type - text input */}
      <div className="flex flex-col gap-2 max-w-[calc(50%-8px)]">
        <label className="text-sm font-medium text-[#6d6d6d]">Game type</label>
        <input
          type="text"
          value={gameData.game_type}
          onChange={(e) => onInputChange("game_type", e.target.value)}
          placeholder="Add game type"
          className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
            errors.game_type ? "border-[#f25a5a]" : "border-[#E7EAEE]"
          }`}
        />
        {errors.game_type && (
          <span className="text-xs text-[#f25a5a]">{errors.game_type}</span>
        )}
      </div>
    </div>
  );
};

export default StepBasics;
