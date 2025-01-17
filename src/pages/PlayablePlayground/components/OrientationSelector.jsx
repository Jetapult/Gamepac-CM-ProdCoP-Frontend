const OrientationSelector = ({ orientation, onOrientationChange, disabled }) => {
  return (
    <div className="mb-6">
      <h3 className="text-white text-lg font-medium mb-4">Orientation</h3>
      <div className="flex gap-4">
        <button
          onClick={() => onOrientationChange('landscape')}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded transition-colors ${
            orientation === 'landscape'
              ? 'bg-blue-500 text-white'
              : 'bg-[#333] text-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          Landscape
        </button>
        <button
          onClick={() => onOrientationChange('portrait')}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded transition-colors ${
            orientation === 'portrait'
              ? 'bg-blue-500 text-white'
              : 'bg-[#333] text-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          Portrait
        </button>
      </div>
    </div>
  );
};

export default OrientationSelector;
