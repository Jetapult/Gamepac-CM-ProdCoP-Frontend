import React from "react";



const OnboardingModal = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Jetapult Logo */}
        <div className="absolute top-4 right-4 text-sm font-bold text-gray-800">
          JETAP LT
        </div>

        {/* Main Content */}
        <div className="text-center">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete the onboarding process to access Ideapac
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm mb-8">Let&apos;s have a quick chat!</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;


