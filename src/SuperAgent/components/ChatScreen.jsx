import React from "react";
import ChatHeader from "./ChatHeader";
import ConversationPanel from "./ConversationPanel";
import PreviewPanel from "./PreviewPanel";

const ChatScreen = () => {
  // Sample data - replace with actual data from props/state
  const chatTitle = "CommPac Report Analysis";
  const taskProgress = { current: 1, total: 5 };

  const handleEditClick = () => {
    // Handle edit click
    console.log("Edit clicked");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header - Full Width */}
      <ChatHeader chatTitle={chatTitle} onEditClick={handleEditClick} />

      {/* Main Content - Left and Right Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Conversation */}
        <ConversationPanel />

        {/* Right Side - Preview */}
        <PreviewPanel taskProgress={taskProgress} />
      </div>
    </div>
  );
};

export default ChatScreen;
