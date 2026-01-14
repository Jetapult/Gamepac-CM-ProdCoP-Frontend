import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Message from "./messages/Message";
import TaskMessage from "./messages/TaskMessage";
import ChatInput from "./ChatInput";
import thinkingSphere from "../../assets/thinking_sphere.gif";
import { getAuthToken } from "../../utils";
import {
  processEvent as processEventHandler,
  shouldStopThinking,
  getAgentDisplayName,
} from "../utils/eventHandlers";
import api from "@/api";

const ConversationPanel = ({
  chatId,
  initialQuery,
  initialAttachments = [],
  agentSlug: propAgentSlug = "",
  onTaskUpdate,
  onThinkingChange,
  onArtifactUpdate,
  onStructuredArtifactUpdate,
  onTitleUpdate,
  onPublicUpdate,
  onAccessDenied,
}) => {
  const [messages, setMessages] = useState([]);
  const [streamingTask, setStreamingTask] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedAgentSlug, setFetchedAgentSlug] = useState("");
  const [needsClarification, setNeedsClarification] = useState(false);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [messageVersions, setMessageVersions] = useState({}); // { parentId: { versions: [msg1, msg2], activeIndex: 1 } }
  const messagesEndRef = useRef(null);
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );
  const initialQuerySentRef = useRef(false);
  const abortControllerRef = useRef(null);
  const historyFetchedRef = useRef(false);

  // Use prop if available, otherwise use fetched value (for existing chats)
  const agentSlug = propAgentSlug || fetchedAgentSlug;

  const stopRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    if (onThinkingChange) onThinkingChange(false);
  }, [onThinkingChange]);

  // Fetch chat details to get agent_slug for existing chats
  const fetchChatDetails = useCallback(async () => {
    if (!chatId || propAgentSlug) return; // Skip if we already have agent slug from prop

    try {
      const response = await api.get(`/v1/superagent/chats/${chatId}`);
      const result = response.data;
      if (result.success && result.data) {
        if (result.data.data?.agent_slug) {
          setFetchedAgentSlug(result.data.data.agent_slug);
        }
        if (result.data.title && onTitleUpdate) {
          onTitleUpdate(result.data.title);
        }
        if (onPublicUpdate) {
          onPublicUpdate(result.data.is_public || false);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setChatNotFound(true);
      } else if (error.response?.status === 403) {
        if (onAccessDenied) onAccessDenied();
      } else {
        console.error("Failed to fetch chat details:", error);
      }
    }
  }, [chatId, propAgentSlug]);

  // Fetch chat history on mount
  const fetchChatHistory = useCallback(async () => {
    if (!chatId || historyFetchedRef.current) return;

    setIsLoadingHistory(true);
    try {
      const response = await api.get(
        `/v1/superagent/chats/${chatId}/messages`,
        { params: { limit: 50, offset: 0 } }
      );

      const result = response.data;
      if (result.success && result.data) {
        // Track the latest artifact to restore in preview panel
        let latestArtifact = null;

        // Transform API messages to our format
        const transformedMessages = result.data
          .map((msg) => {
            if (msg.sender === "user") {
              return {
                id: msg.id,
                sender: "user",
                type: "text",
                data: {
                  content: msg.data?.content || "",
                  attachments: msg.data?.attachments || [],
                },
              };
            } else if (msg.sender === "agent") {
              // For agent messages, process raw_events using the same handlers as streaming
              const rawEvents = msg.data?.raw_events || [];
              const processedMessages = [];

              for (const event of rawEvents) {
                const message = processEventHandler(event, {
                  agentSlug,
                  onStructuredArtifactUpdate: (type, data) => {
                    // Capture the latest artifact for restoration
                    latestArtifact = { type, data };
                  },
                });
                if (message) {
                  processedMessages.push({
                    ...message,
                    id: `${msg.id}-${processedMessages.length}`,
                    apiMessageId: msg.id, // Store original API message ID for regenerate
                  });
                }
              }

              // Return array of messages (will be flattened later)
              return processedMessages.length > 0 ? processedMessages : null;
            }
            return null;
          })
          .filter(Boolean)
          .flat(); // Flatten arrays from agent messages

        setMessages(transformedMessages);
        historyFetchedRef.current = true;

        // Restore the latest artifact in the preview panel
        if (latestArtifact && onStructuredArtifactUpdate) {
          onStructuredArtifactUpdate(latestArtifact.type, latestArtifact.data);
        }
      }
    } catch (error) {
      if (error.response?.status === 403) {
        if (onAccessDenied) onAccessDenied();
      } else {
        console.error("Failed to fetch chat history:", error);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [chatId, agentSlug, onStructuredArtifactUpdate]);

  // Helper to process raw_events into a task structure
  const processRawEventsToTask = (rawEvents) => {
    let description = "";
    const actions = [];

    const toolLabels = {
      market_search: "Executing market research",
      synthesize: "Synthesizing findings",
      jira_validate: "Validating Jira ticket",
      jira_create: "Creating Jira ticket",
      request_clarification: "Requesting clarification",
      finish: "Completing workflow",
    };
    const toolTypes = {
      market_search: "reading",
      synthesize: "executing",
      jira_validate: "creating",
      jira_create: "creating",
      request_clarification: "executing",
      finish: "executing",
    };

    for (const event of rawEvents) {
      // API uses 'event' field
      const eventType = event.event;

      // Handle 'reason' event - contains reasoning directly
      if (eventType === "reason" && event.reasoning) {
        description = event.reasoning;
      }

      // Handle 'action' event - contains tool_name directly
      if (eventType === "action") {
        const toolName = event.tool_name || "action";
        const existingAction = actions.find(
          (action) => action.toolName === toolName
        );
        if (!existingAction) {
          actions.push({
            id: `action-${actions.length}`,
            toolName: toolName,
            type: toolTypes[toolName] || "executing",
            text:
              event.formatted_message ||
              toolLabels[toolName] ||
              `Executing ${toolName}`,
            detail: "",
            status: "completed",
          });
        }
      }

      // Handle 'complete' event - contains report with summary
      if (eventType === "complete" && event.report?.summary) {
        description = event.report.summary;
      }
    }

    return {
      title: "Load and explore data",
      description,
      actions,
      relatedActions: [],
    };
  };

  // Reset state when chatId changes
  useEffect(() => {
    // Reset all state for new chat
    setMessages([]);
    setStreamingTask(null);
    setIsThinking(false);
    setError(null);
    setFetchedAgentSlug("");
    setNeedsClarification(false);
    setChatNotFound(false);
    setAccessDenied(false);
    setMessageVersions({});
    historyFetchedRef.current = false;
    initialQuerySentRef.current = false;
  }, [chatId]);

  // Fetch chat details and history on mount or chatId change
  useEffect(() => {
    fetchChatDetails();
    fetchChatHistory();
  }, [fetchChatDetails, fetchChatHistory]);

  const sendMessage = useCallback(
    async (content, attachments = []) => {
      if ((!content.trim() && attachments.length === 0) || !chatId) return;

      if (!selectedGame) {
        setError("Please select a game to continue.");
        return;
      }

      const trimmedContent = content.trim();
      const messageToSend = trimmedContent;

      // Add user message to UI (show modified content with previous context if applicable)
      const userMessage = {
        id: Date.now(),
        sender: "user",
        type: "text",
        data: {
          content: messageToSend,
          attachments: attachments,
        },
      };
      setMessages((prev) => [...prev, userMessage]);

      // Extract attachment IDs for API request
      const attachmentIds = attachments.map((att) => att.id);

      // Start streaming
      setIsThinking(true);
      if (onThinkingChange) onThinkingChange(true);

      // Initialize streaming task state
      setStreamingTask({
        title: "Load and explore data",
        description: "",
        actions: [],
        relatedActions: [],
      });

      // Track if we're inside the reasoning/summary/jira value in the JSON
      let insideReasoning = false;
      let reasoningBuffer = "";
      let insideSummary = false;
      let summaryBuffer = "";
      let jiraBuffer = "";

      // Tool label mapping
      const getToolLabel = (toolName) => {
        const labels = {
          market_search: "Executing market research",
          synthesize: "Synthesizing findings",
          jira_validate: "Validating Jira ticket",
          jira_create: "Creating Jira ticket",
          request_clarification: "Requesting clarification",
          finish: "Completing workflow",
        };
        return labels[toolName] || `Executing ${toolName}`;
      };

      // Tool type mapping (for icon)
      const getToolType = (toolName) => {
        const types = {
          market_search: "reading",
          synthesize: "executing",
          jira_validate: "creating",
          jira_create: "creating",
          request_clarification: "executing",
          finish: "executing",
        };
        return types[toolName] || "executing";
      };

      const processEvent = (eventData) => {
        const message = processEventHandler(eventData, {
          setMessages,
          setStreamingTask,
          setIsThinking,
          setError,
          setNeedsClarification,
          onThinkingChange,
          onArtifactUpdate,
          onStructuredArtifactUpdate,
          agentSlug,
        });

        if (message) {
          setMessages((prev) => [...prev, message]);
        }

        // Stop thinking on complete or error (check both 'event' and 'type' fields)
        const eventType = eventData.event || eventData.type;
        if (shouldStopThinking(eventType)) {
          setStreamingTask(null);
          setIsThinking(false);
          if (onThinkingChange) onThinkingChange(false);
        }
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const token = getAuthToken()?.token;
        const response = await fetch(
          `${api.defaults.baseURL}v1/superagent/chats/${chatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              message: messageToSend,
              agent_slug: agentSlug,
              game_id: selectedGame?.id || null,
              studio_slug: ContextStudioData?.slug || null,
              ...(attachmentIds.length > 0 && {
                attachment_ids: attachmentIds,
              }),
            }),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          // Handle 401 unauthorized - clear token and redirect to login
          if (response.status === 401) {
            localStorage.removeItem("jwt");
            window.location.href = "/login";
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed. Please try again.`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log("[SSE] Received chunk:", chunk.length, "chars");
          buffer += chunk;

          // SSE events are separated by double newlines
          const eventBlocks = buffer.split("\n\n");
          buffer = eventBlocks.pop() || ""; // Keep incomplete event in buffer

          for (const eventBlock of eventBlocks) {
            const lines = eventBlock.split("\n");
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine && trimmedLine.startsWith("data: ")) {
                try {
                  const jsonStr = trimmedLine.slice(6);
                  const event = JSON.parse(jsonStr);
                  console.log("[SSE] Event received:", event.type, event);
                  processEvent(event);
                } catch (e) {
                  console.warn("Failed to parse event:", trimmedLine, e);
                }
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.startsWith("data: ")) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const event = JSON.parse(jsonStr);
                console.log("[SSE] Final event received:", event.type, event);
                processEvent(event);
              } catch (e) {
                console.warn("Failed to parse final event:", trimmedLine, e);
              }
            }
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request aborted by user");
        } else {
          console.error("Failed to send message:", error);
          setError(
            error.message || "Failed to send message. Please try again."
          );
        }
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [chatId, agentSlug, onThinkingChange, selectedGame, ContextStudioData?.slug]
  );

  // Regenerate a message
  const regenerateMessage = useCallback(
    async (messageId) => {
      if (!messageId || isThinking) return;

      // Start streaming
      setIsThinking(true);
      if (onThinkingChange) onThinkingChange(true);

      // Initialize streaming task state
      setStreamingTask({
        title: "Regenerating response",
        description: "",
        actions: [],
        relatedActions: [],
      });

      const processEvent = (eventData) => {
        const message = processEventHandler(eventData, {
          setMessages,
          setStreamingTask,
          setIsThinking,
          setError,
          setNeedsClarification,
          onThinkingChange,
          onArtifactUpdate,
          onStructuredArtifactUpdate,
          agentSlug,
        });

        if (message) {
          setMessages((prev) => [...prev, message]);
        }

        // Stop thinking on complete or error (check both 'event' and 'type' fields)
        const eventType = eventData.event || eventData.type;
        if (shouldStopThinking(eventType)) {
          setStreamingTask(null);
          setIsThinking(false);
          if (onThinkingChange) onThinkingChange(false);
        }
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const token = getAuthToken()?.token;
        const response = await fetch(
          `${api.defaults.baseURL}v1/superagent/messages/${messageId}/regenerate`,
          {
            method: "POST",
            headers: {
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("jwt");
            window.location.href = "/login";
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Regenerate failed. Please try again.`
          );
        }

        // Remove all messages after the user message that triggered this LLM response
        // Find the message being regenerated and remove it and all subsequent messages
        setMessages((prev) => {
          const messageIndex = prev.findIndex((m) => m.id === messageId);
          if (messageIndex === -1) return prev;

          // Find the user message before this LLM message
          let userMessageIndex = messageIndex - 1;
          while (
            userMessageIndex >= 0 &&
            prev[userMessageIndex].sender !== "user"
          ) {
            userMessageIndex--;
          }

          // Keep messages up to and including the user message
          return prev.slice(0, userMessageIndex + 1);
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // SSE events are separated by double newlines
          const eventBlocks = buffer.split("\n\n");
          buffer = eventBlocks.pop() || ""; // Keep incomplete event in buffer

          for (const eventBlock of eventBlocks) {
            const lines = eventBlock.split("\n");
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine && trimmedLine.startsWith("data: ")) {
                try {
                  const jsonStr = trimmedLine.slice(6);
                  const event = JSON.parse(jsonStr);
                  processEvent(event);
                } catch (e) {
                  console.warn("Failed to parse event:", trimmedLine, e);
                }
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.startsWith("data: ")) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const event = JSON.parse(jsonStr);
                processEvent(event);
              } catch (e) {
                console.warn("Failed to parse final event:", trimmedLine, e);
              }
            }
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Regenerate request aborted by user");
        } else {
          console.error("Failed to regenerate message:", error);
          setError(
            error.message || "Failed to regenerate message. Please try again."
          );
        }
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [agentSlug, isThinking, onThinkingChange, onArtifactUpdate]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingTask]);

  // Keep sendMessage ref up to date
  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Send initial query on mount if present (wait for agentSlug)
  useEffect(() => {
    if (
      (!initialQuery && initialAttachments.length === 0) ||
      !chatId ||
      !agentSlug
    )
      return;
    if (initialQuerySentRef.current) return;

    initialQuerySentRef.current = true;

    // Use setTimeout to defer execution and prevent StrictMode double-send
    const timer = setTimeout(() => {
      sendMessageRef.current(initialQuery, initialAttachments);
    }, 0);

    return () => clearTimeout(timer);
  }, [initialQuery, initialAttachments, chatId, agentSlug]);

  const handleSendMessage = (content, attachments = []) => {
    setError(null);
    sendMessage(content, attachments);
  };

  // Show chat not found message
  if (chatNotFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2
            className="text-xl font-medium text-[#141414] mb-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Chat not found
          </h2>
          <p
            className="text-[#6d6d6d]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            This chat may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
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

          // Check if this is the first LLM text message after a user message
          // Look backwards to find if there's a user message before any other text message
          let isFirstLLMAfterUser = false;
          if (message.sender === "llm" && message.type === "text") {
            isFirstLLMAfterUser = true;
            // Check if there's another LLM text message before this one (after the last user message)
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i].sender === "user") {
                break; // Found user message, this is the first LLM text after it
              }
              if (messages[i].sender === "llm" && messages[i].type === "text") {
                isFirstLLMAfterUser = false; // Found another LLM text message before
                break;
              }
            }
          }

          return (
            <Message
              key={message.id}
              message={message}
              isLatest={isLatestUserMessage || isLatestLLMMessage}
              isFirstLLMAfterUser={isFirstLLMAfterUser}
              onSendMessage={handleSendMessage}
              onRegenerate={regenerateMessage}
            />
          );
        })}

        {/* Streaming Task Display */}
        {streamingTask &&
          (streamingTask.description || streamingTask.actions?.length > 0) && (
            <TaskMessage
              task={streamingTask}
              isLatest={false}
              onSendMessage={handleSendMessage}
            />
          )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-600 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
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
              {getAgentDisplayName(agentSlug)} is thinking...
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
