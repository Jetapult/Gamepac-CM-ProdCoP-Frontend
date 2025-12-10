import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import ConversationPanel from "./ConversationPanel";
import PreviewPanel from "./PreviewPanel";

const ChatScreen = ({ initialQuery = "" }) => {
  // Chat title state
  const [chatTitle, setChatTitle] = useState("");

  // Task progress state
  const [currentTask, setCurrentTask] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [allTasks, setAllTasks] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleTitleChange = (newTitle) => {
    setChatTitle(newTitle);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header - Full Width */}
      <ChatHeader chatTitle={chatTitle} onTitleChange={handleTitleChange} />

      {/* Main Content - Left and Right Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Conversation */}
        <ConversationPanel
          onTaskUpdate={(task, index, time, tasks) => {
            setCurrentTask(task);
            setCurrentTaskIndex(index);
            setElapsedTime(time);
            if (tasks) {
              setAllTasks(tasks);
            }
          }}
          onThinkingChange={setIsThinking}
        />

        {/* Right Side - Preview */}
        <PreviewPanel
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          elapsedTime={elapsedTime}
          allTasks={allTasks}
          isThinking={isThinking}
        />
      </div>
    </div>
  );
};

export default ChatScreen;
