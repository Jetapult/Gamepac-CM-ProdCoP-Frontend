const PlayModePanel = ({ onStopPreview, game }) => {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg">
      <h2 className="text-white text-lg mb-4">Playable Preview</h2>
      <button
        onClick={() => onStopPreview(game?.playground)}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
      >
        Back to Edit Mode
      </button>
    </div>
  );
};

export default PlayModePanel;
