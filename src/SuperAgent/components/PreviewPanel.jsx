import React from "react";
import { ChevronDown } from "lucide-react";

const PreviewPanel = ({ taskProgress = { current: 1, total: 5 } }) => {
  return (
    <div className="w-[700px] bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col">
      {/* Zero State / Building State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Illustration */}
          <div className="w-[296px] h-[177px] bg-white rounded-lg mb-6 mx-auto relative overflow-hidden">
            <div className="absolute top-[43px] left-3 w-[100px] h-3 bg-[#f8f8f7] rounded-sm" />
            <div className="absolute top-[69px] left-3 w-[100px] h-3 bg-[#f8f8f7] rounded-sm" />
            <div className="absolute top-[89px] left-3 w-[100px] h-20 bg-[#f8f8f7] rounded-sm" />
            <div className="absolute top-[43px] left-[124px] w-[163px] h-20 bg-[#f8f8f7] rounded-sm" />
            <div className="absolute top-[129px] left-[124px] w-[160px] h-3 bg-[#f8f8f7] rounded-sm" />
            <div className="absolute top-[147px] left-[124px] w-[160px] h-[22px] bg-[#f8f8f7] rounded-sm" />
          </div>

          <p
            className="text-sm text-black"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
          >
            GamePac is building the document. Hang tight ✌️
          </p>
        </div>
      </div>

      {/* Task Progress Footer */}
      <div className="bg-white border-t border-[#f0f0f0] rounded-tl-lg rounded-tr-lg p-6">
        <div className="flex items-center justify-between">
          <p
            className="text-base text-[#0e2f1f] font-medium"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Task Progress
          </p>
          <div
            className="flex items-center gap-1 text-sm text-[#b0b0b0]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <span>
              {taskProgress.current}/{taskProgress.total}
            </span>
            <ChevronDown size={16} className="text-[#6d6d6d]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
