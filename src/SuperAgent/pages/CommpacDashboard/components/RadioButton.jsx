import React from "react";

const RadioButton = ({ checked, onChange, className = "" }) => (
  <div
    className={`w-[20px] h-[20px] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
      checked
        ? "border-6 border-[#4C980F] bg-[#4C980F]"
        : "border border-[#d9dee4] bg-white"
    } ${className}`}
    onClick={(e) => {
      e.stopPropagation();
      onChange?.(!checked);
    }}
  >
    {checked && <div className="w-2 h-2 rounded-full bg-[#fff]" />}
  </div>
);

export default RadioButton;

