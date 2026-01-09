import React from "react";
import { AltArrowLeft, AltArrowRight } from "@solar-icons/react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between w-[335px]">
      <button
        className="flex items-center gap-1 h-9 px-3 py-2 rounded-lg text-[#b0b0b0] hover:text-[#141414] transition-colors disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <AltArrowLeft size={16} weight="Linear" color="#b0b0b0" />
        <span className="font-urbanist font-medium text-sm">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-urbanist font-medium text-sm transition-colors ${
              currentPage === page
                ? "bg-[#1f6744] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                : "text-[#b0b0b0] hover:bg-[#f6f6f6]"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <div className="w-9 h-9 flex items-center justify-center text-[#b0b0b0]">
          ...
        </div>
      </div>

      <button
        className="flex items-center gap-1 h-9 px-3 py-2 rounded-lg text-[#0a0a0a] hover:bg-[#f6f6f6] transition-colors"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="font-urbanist font-medium text-sm">Next</span>
        <AltArrowRight size={16} weight="Linear" color="#0a0a0a" />
      </button>
    </div>
  );
};

export default Pagination;

