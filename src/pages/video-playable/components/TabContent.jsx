import React from "react";
import GeneralSettingsPanel from "./GeneralSettingsPanel";
import ModificationControls from "./ModificationControls";

export const TabContent = ({
  activeTab,
  tabs,
  videoPlayable,
  setVideoPlayable,
  handleRemoveTab,
  assets,
  handleVideoUpload,
  videoSource,
  setToastMessage
}) => {
  const activeTabData = tabs.find((tab) => tab.id === activeTab.id);
  if (!activeTabData) return null;

  switch (activeTabData.type) {
    case "general":
      return (
        <GeneralSettingsPanel
          videoPlayable={videoPlayable}
          setVideoPlayable={setVideoPlayable}
          handleVideoUpload={handleVideoUpload}
          videoSource={videoSource}
          setToastMessage={setToastMessage}
        />
      );
    case "break":
      return (
        <ModificationControls
          activeTab={activeTabData}
          videoPlayable={videoPlayable}
          setVideoPlayable={setVideoPlayable}
          handleRemoveTab={handleRemoveTab}
          assets={assets}
        />
      );
    case "overlay":
      return (
        <ModificationControls
          activeTab={activeTab}
          videoPlayable={videoPlayable}
          setVideoPlayable={setVideoPlayable}
          handleRemoveTab={handleRemoveTab}
          assets={assets}
        />
      );
    case "end_screen":
      return (
        <ModificationControls
          activeTab={activeTab}
          videoPlayable={videoPlayable}
          setVideoPlayable={setVideoPlayable}
          handleRemoveTab={handleRemoveTab}
          assets={assets}
        />
      );
    default:
      return null;
  }
};
