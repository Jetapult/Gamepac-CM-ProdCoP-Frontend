import React from "react";
import { CheckCircle, Loader2, Circle } from "lucide-react";

const Generating = ({ generateError, onRetry }) => {
  // Calculate progress: 3 completed + 1 in progress = 75%
//   const progress = 55;

  return (
    <div className="min-h-[78vh] flex flex-col">
      {/* Progress Bar */}
      {/* <div className="w-full bg-gray-700 h-1">
        <div
          className="bg-gradient-to-r from-[#27C128] to-[#20a120] h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div> */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-[520px] mx-auto">
          <h2 className="text-white text-2xl font-bold mb-6">
            Finding the right Opportunity for you…
          </h2>
          <div className="space-y-4 text-left inline-block">
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle className="text-[#27C128]" size={20} />
              <span>Creating a Market Snapshot</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <CheckCircle className="text-[#27C128]" size={20} />
              <span>Determining Fit Score</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <Loader2 className="animate-spin text-white" size={20} />
              <span>Identifying Top Games</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Circle size={20} />
              <span>Generating Insights</span>
            </div>
          </div>
          {generateError && (
            <div className="mt-6 text-red-400">
              {generateError}
              <button onClick={onRetry} className="ml-3 underline text-white">
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generating;
