import React, { useState, useRef, useEffect, useCallback } from "react";
import Message from "./messages/Message";
import ChatInput from "./ChatInput";
import thinkingSphere from "../../assets/thinking_sphere.gif";
import { getAuthToken } from "../../utils";

const API_BASE_URL = "http://localhost:3000";

const ConversationPanel = ({
  chatId,
  initialQuery,
  onTaskUpdate,
  onThinkingChange,
}) => {
  const [messages, setMessages] = useState([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const initialQuerySentRef = useRef(false);
  const abortControllerRef = useRef(null);

  const stopRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    if (onThinkingChange) onThinkingChange(false);
  }, [onThinkingChange]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !chatId) return;

      // Add user message to UI
      const userMessage = {
        id: Date.now(),
        sender: "user",
        type: "text",
        data: {
          content: content.trim(),
        },
      };
      setMessages((prev) => [...prev, userMessage]);

      // Start streaming
      setIsThinking(true);
      if (onThinkingChange) onThinkingChange(true);
      setStreamingResponse("");

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const token = getAuthToken()?.token;
        const response = await fetch(
          `${API_BASE_URL}/v1/superagent/chats/${chatId}/messages/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ message: content.trim() }),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              setStreamingResponse((prev) => prev + line + "\n");
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          setStreamingResponse((prev) => prev + buffer + "\n");
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request aborted by user");
        } else {
          console.error("Failed to send message:", error);
          setStreamingResponse((prev) => prev + `\nError: ${error.message}`);
        }
      } finally {
        abortControllerRef.current = null;
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      }
    },
    [chatId, onThinkingChange]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingResponse]);

  // Send initial query on mount if present
  useEffect(() => {
    console.log(
      "ConversationPanel useEffect - initialQuery:",
      initialQuery,
      "chatId:",
      chatId,
      "alreadySent:",
      initialQuerySentRef.current
    );
    if (initialQuery && chatId && !initialQuerySentRef.current) {
      initialQuerySentRef.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, chatId, sendMessage]);

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((message, index) => {
          // Find the last user message index
          const lastUserMessageIndex = messages
            .map((m, i) => (m.sender === "user" ? i : -1))
            .filter((i) => i !== -1)
            .pop();
          // Find the last LLM message index
          const lastLLMMessageIndex = messages
            .map((m, i) => (m.sender === "llm" ? i : -1))
            .filter((i) => i !== -1)
            .pop();

          const isLatestUserMessage =
            message.sender === "user" && index === lastUserMessageIndex;
          // Don't mark as latest LLM if thinking (so related actions hide)
          const isLatestLLMMessage =
            !isThinking &&
            message.sender === "llm" &&
            index === lastLLMMessageIndex;

          return (
            <Message
              key={message.id}
              message={message}
              isLatest={isLatestUserMessage || isLatestLLMMessage}
              onSendMessage={handleSendMessage}
            />
          );
        })}

        {/* Streaming Response */}
        {streamingResponse && (
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {streamingResponse}
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && !streamingResponse && (
          <div className="flex items-center gap-[9px]">
            <div className="w-4 h-4 shrink-0">
              <img
                src={thinkingSphere}
                alt="Thinking"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-base text-black"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Gamepac is thinking...
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
          onStop={stopRequest}
        />
      </div>
    </div>
  );
};

export default ConversationPanel;
