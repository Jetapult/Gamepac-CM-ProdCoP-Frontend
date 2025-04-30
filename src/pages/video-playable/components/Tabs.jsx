import React from "react";

const Tabs = ({tabs, handleTabClick, activeTab}) => {
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto bg-[#252627] py-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center">
          <button
            className={`px-2 py-2 rounded bg-transparent ${
              activeTab.id === tab.id
                ? "text-white"
                : "text-[#b5b5b5] hover:text-white"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Tabs;
