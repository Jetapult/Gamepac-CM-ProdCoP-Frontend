import React from "react";
import { CheckSquare, Stop } from "@solar-icons/react";

const Checkbox = ({ checked, onChange, className = "" }) => {
  if (checked) {
    return (
      <div
        onClick={() => onChange?.(!checked)}
        className={`cursor-pointer ${className}`}
      >
        <CheckSquare weight="Bold" size={20} color="#1f6744" />
      </div>
    );
  }

  return (
    <div
      onClick={() => onChange?.(!checked)}
      className={`cursor-pointer ${className}`}
    >
      <Stop weight="Linear" size={20} color="#d9dee2" />
    </div>
  );
};

export default Checkbox;

