import React from "react";
import UserMessage from "./UserMessage";
import LLMMessage from "./LLMMessage";
import AttachmentMessage from "./AttachmentMessage";
import TaskMessage from "./TaskMessage";

/**
 * Message component that renders different message types based on the message object
 *
 * Message object structure:
 * {
 *   id: string | number,
 *   sender: "user" | "llm",
 *   type: "text" | "attachment" | "task" | "artifact",
 *   data: object // varies based on type
 * }
 */
const Message = ({ message, isLatest, onSendMessage }) => {
  const { sender, type, data } = message;

  switch (type) {
    case "text":
      if (sender === "user") {
        return <UserMessage content={data.content} isLatest={isLatest} />;
      } else if (sender === "llm") {
        return (
          <LLMMessage
            content={data.content}
            agentName={data.agentName}
            isLatest={isLatest}
            relatedActions={data.relatedActions || []}
            onSendMessage={onSendMessage}
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

    // Add more message types here as needed
    case "artifact":
      // TODO: Implement artifact message component
      return <div>Artifact message (to be implemented)</div>;

    default:
      console.warn(`Unknown message type: ${type}`);
      return null;
  }
};

export default Message;
