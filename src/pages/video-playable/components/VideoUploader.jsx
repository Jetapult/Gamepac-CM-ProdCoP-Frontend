import { Upload } from "lucide-react";
import React from "react";

const VideoUploader = ({handleVideoUpload}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
        id="video-upload"
      />
      <label
        htmlFor="video-upload"
        className="flex flex-col items-center cursor-pointer p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-[#b9ff66] transition-colors"
      >
        <Upload className="w-12 h-12 mb-4" />
        <span className="text-lg">Upload Video</span>
        <span className="text-sm text-gray-400 mt-2">
          Drag and drop or click to select
        </span>
      </label>
    </div>
  );
};

export default VideoUploader;
