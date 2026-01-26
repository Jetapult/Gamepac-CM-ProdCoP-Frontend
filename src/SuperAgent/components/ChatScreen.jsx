import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ConversationPanel from "./ConversationPanel";
import PreviewPanel from "./PreviewPanel";
import { getAgentDisplayName } from "../utils/eventHandlers";
import api from "../../api";

const ChatScreen = ({
  chatId,
  initialQuery = "",
  initialAttachments = [],
  agentSlug = "",
  initialFinopsSessionId = null,
  initialLiveopsSessionId = null,
}) => {
  const navigate = useNavigate();

  // Chat title state
  const [chatTitle, setChatTitle] = useState("");

  // Favourite state
  const [isFavourite, setIsFavourite] = useState(false);

  // Task progress state
  const [currentTask, setCurrentTask] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [allTasks, setAllTasks] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // Artifact content for preview panel
  const [artifactContent, setArtifactContent] = useState(null);
  const [artifactType, setArtifactType] = useState(null);
  const [artifactData, setArtifactData] = useState(null);

  // Chat public/private state
  const [isPublic, setIsPublic] = useState(false);

  // Access denied state
  const [accessDenied, setAccessDenied] = useState(false);

  const handleTitleChange = (newTitle) => {
    setChatTitle(newTitle);
  };

  // Toggle favourite for the chat
  const toggleFavourite = async () => {
    if (!chatId) return;
    try {
      const response = await api.post(`/v1/superagent/chats/${chatId}/favourite`);
      const result = response.data;
      if (result.success) {
        const newFavState = result.data.is_favourite;
        setIsFavourite(newFavState);
        // Dispatch event to refresh sidebar
        window.dispatchEvent(
          new CustomEvent("chat-favourite-toggled", { detail: { chatId, isFavourite: newFavState } })
        );
      }
    } catch (error) {
      console.error("Failed to toggle favourite:", error);
    }
  };

  // Show access denied message for the whole page
  if (accessDenied) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2
            className="text-xl font-medium text-[#141414] mb-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Access Denied
          </h2>
          <p
            className="text-[#6d6d6d]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            You don't have permission to view this chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header - Full Width */}
      <ChatHeader
        chatId={chatId}
        chatTitle={chatTitle}
        onTitleChange={handleTitleChange}
        isPublic={isPublic}
        onPublicChange={setIsPublic}
        isFavourite={isFavourite}
        onToggleFavourite={toggleFavourite}
        onFavouriteChange={setIsFavourite}
        onDelete={() => {
          // Dispatch event to refresh sidebar
          window.dispatchEvent(
            new CustomEvent("chat-deleted", { detail: { chatId } }),
          );
          // Navigate to dashboard
          navigate("/super-agent");
        }}
      />

      {/* Main Content - Left and Right Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Conversation */}
        <ConversationPanel
          chatId={chatId}
          initialQuery={initialQuery}
          initialAttachments={initialAttachments}
          agentSlug={agentSlug}
          initialFinopsSessionId={initialFinopsSessionId}
          initialLiveopsSessionId={initialLiveopsSessionId}
          onTaskUpdate={(task, index, time, tasks) => {
            setCurrentTask(task);
            setCurrentTaskIndex(index);
            setElapsedTime(time);
            if (tasks) {
              setAllTasks(tasks);
            }
          }}
          onThinkingChange={setIsThinking}
          onArtifactUpdate={setArtifactContent}
          onStructuredArtifactUpdate={(type, data) => {
            setArtifactType(type);
            setArtifactData(data);
          }}
          onTitleUpdate={handleTitleChange}
          onPublicUpdate={setIsPublic}
          onFavouriteUpdate={setIsFavourite}
          onAccessDenied={() => setAccessDenied(true)}
        />

        {/* Right Side - Preview */}
        <PreviewPanel
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          elapsedTime={elapsedTime}
          allTasks={allTasks}
          isThinking={isThinking}
          artifactContent={artifactContent}
          artifactType={artifactType}
          artifactData={artifactData}
          agentName={getAgentDisplayName(agentSlug)}
        />
      </div>
    </div>
  );
};

export default ChatScreen;
