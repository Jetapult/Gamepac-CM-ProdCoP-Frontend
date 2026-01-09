import React from "react";

const Checkbox = ({ checked, onChange, className = "" }) => (
  <div
    className={`w-4 h-4 border rounded ${
      checked ? "bg-[#1f6744] border-[#1f6744]" : "border-[#d9dee4] bg-white"
    } flex items-center justify-center cursor-pointer ${className}`}
    onClick={() => onChange?.(!checked)}
  >
    {checked && (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

export default Checkbox;

