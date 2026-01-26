import React from "react";
import UserMessage from "./UserMessage";
import LLMMessage from "./LLMMessage";
import AttachmentMessage from "./AttachmentMessage";
import TaskMessage from "./TaskMessage";
import ThinkingMessage from "./ThinkingMessage";
import AgentHeader from "./AgentHeader";

/**
 * Message component that renders different message types based on the message object
 *
 * Message object structure:
 * {
 *   id: string | number,
 *   sender: "user" | "llm",
 *   type: "text" | "attachment" | "task" | "artifact" | "thinking",
 *   data: object // varies based on type
 * }
 */
const Message = ({
  message,
  isLatest,
  isFirstLLMAfterUser,
  isStreaming = false,
  onSendMessage,
  onRegenerate,
  versionInfo,
}) => {
  const { sender, type, data } = message;

  switch (type) {
    case "text":
      if (sender === "user") {
        return (
          <UserMessage
            content={data.content}
            attachments={data.attachments}
            isLatest={isLatest}
          />
        );
      } else if (sender === "llm") {
        return (
          <LLMMessage
            content={data.content}
            thinking={data.thinking}
            isLatest={isLatest}
            isStreaming={isStreaming}
            relatedActions={data.relatedActions || []}
            onSendMessage={onSendMessage}
            onRegenerate={() =>
              onRegenerate && onRegenerate(message.apiMessageId)
            }
            versionInfo={versionInfo}
            canRegenerate={!!message.apiMessageId}
          />
        );
      }
      return null;

    case "attachment":
      return <AttachmentMessage attachment={data} sender={sender} />;

    case "task":
      return (
        <TaskMessage
          task={data}
          isLatest={isLatest}
          onSendMessage={onSendMessage}
        />
      );

    case "thinking":
      return (
        <ThinkingMessage
          content={data.content}
          nextAction={data.nextAction}
          isStreaming={data.isStreaming}
        />
      );

    case "agent_header":
      return <AgentHeader agentName={data.agentName} />;

    case "error":
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 text-sm">{data.content}</span>
        </div>
      );

    // Add more message types here as needed
    case "artifact":
      // TODO: Implement artifact message component
      return <div>Artifact message (to be implemented)</div>;

    case "report_artifact":
      // Report shows in preview panel, no message needed
      return null;

    default:
      console.warn(`Unknown message type: ${type}`);
      return null;
  }
};

export default Message;
