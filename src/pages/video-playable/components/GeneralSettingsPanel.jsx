import { Upload } from "lucide-react";
import React, { useRef } from "react";
import AssetSizeDisplay from "./AssetSizeDisplay";

const GeneralSettingsPanel = ({ videoPlayable, setVideoPlayable, handleVideoUpload, videoSource, setToastMessage }) => {
  const videoInputRef = useRef(null);
  return (
    <div className="space-y-4 py- pb-10 overflow-y-auto h-[calc(100vh-250px)]">
      <div>
        <label className="block text-white text-xs mb-1">
          Playable Ad Name
        </label>
        <input
          type="text"
          value={videoPlayable.general?.adName}
          onChange={(e) =>
            setVideoPlayable({
              ...videoPlayable,
              general: {
                ...videoPlayable.general,
                adName: e.target.value,
              },
            })
          }
          className="w-full px-2 py-1 rounded-md text-sm"
          placeholder="Enter ad name"
        />
      </div>

      <div>
        <label className="block text-white text-xs mb-1">Video Source</label>
        <div className="flex items-center">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="video-upload"
          />
          <input
            type="text"
            value={videoSource?.name}
            className="px-2 w-full py-1 rounded-l-md outline-none disabled:bg-black-800 text-sm"
            onClick={() => videoInputRef.current.click()}
            disabled
          />
          <div
            className="bg-[#b9ff66] px-2 py-1.5 rounded-r-md cursor-pointer"
            onClick={() => videoInputRef.current.click()}
          >
            <Upload className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white text-xs mb-1">
          iOS App Store URL
        </label>
        <input
          type="url"
          value={videoPlayable.general?.iosUrl}
          onChange={(e) =>
            setVideoPlayable({
              ...videoPlayable,
              general: {
                ...videoPlayable.general,
                iosUrl: e.target.value,
              },
            })
          }
          className="w-full px-2 py-1 rounded-md text-sm"
          placeholder="Enter iOS App Store URL"
        />
      </div>

      <div>
        <label className="block text-white text-xs mb-1">
          Google Play Store URL
        </label>
        <input
          type="url"
          value={videoPlayable.general?.playstoreUrl}
          onChange={(e) =>
            setVideoPlayable({
              ...videoPlayable,
              general: {
                ...videoPlayable.general,
                playstoreUrl: e.target.value,
              },
            })
          }
          className="w-full px-2 py-1 rounded-md text-sm"
          placeholder="Enter Play Store URL"
        />
      </div>
      <AssetSizeDisplay
        videoPlayable={videoPlayable}
        setToastMessage={setToastMessage}
        setVideoPlayable={setVideoPlayable}
      />
    </div>
  );
};

export default GeneralSettingsPanel;
