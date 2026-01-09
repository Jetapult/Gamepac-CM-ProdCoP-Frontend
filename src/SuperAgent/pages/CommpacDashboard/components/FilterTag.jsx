import React from "react";
import { CloseCircle } from "@solar-icons/react";

const FilterTag = ({ label, onRemove }) => (
  <div className="inline-flex items-center gap-1.5 bg-[#f6f6f6] px-2 py-1 rounded-full text-sm font-urbanist text-[#141414] border border-[#E7EAEE]">
    <span className="text-[#B0B0B0]">{label}</span>
    <CloseCircle
      weight={"Linear"}
      size={14}
      color="#6D6D6D"
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    />
  </div>
);

export default FilterTag;

