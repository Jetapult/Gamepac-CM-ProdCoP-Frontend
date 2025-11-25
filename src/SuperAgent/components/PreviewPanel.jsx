import React from "react";
import TaskProgress from "./TaskProgress";

const PreviewPanel = ({ taskProgress }) => {
  return (
    <div className="flex-1 bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col">
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
      <TaskProgress taskProgress={taskProgress} />
    </div>
  );
};

export default PreviewPanel;
