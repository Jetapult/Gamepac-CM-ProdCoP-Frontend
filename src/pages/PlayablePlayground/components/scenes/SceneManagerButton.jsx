import { Square3Stack3DIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

const SceneManagerButton = ({ onToggle, isOpen }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg 
        ${isOpen ? 'bg-purple-600' : 'bg-[#333]'} 
        hover:bg-purple-500 transition-colors`}
      title="Manage Scenes"
    >
     <Square3Stack3DIcon className="text-white text-xl w-6 h-6" />
    </button>
  );
};

export default SceneManagerButton;