import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Message from "./messages/Message";
import TaskMessage from "./messages/TaskMessage";
import ChatInput from "./ChatInput";
import SuggestedActionsMessage from "./messages/SuggestedActionsMessage";
import thinkingSphere from "../../assets/thinking_sphere.gif";
import { getAuthToken } from "../../utils";
import {
  processEvent as processEventHandler,
  shouldStopThinking,
  getAgentDisplayName,
  flushContentChunkState,
  resetContentChunkState,
} from "../utils/eventHandlers";
import api from "@/api";
import { updateChat, getAttachment } from "../../services/superAgentApi";
import useComposioConnections from "../../hooks/useComposioConnections";
import useActionCardData from "../../hooks/useActionCardData";
import {
  sendSlackMessage,
  sendSlackTaskNotification,
  createJiraIssue,
  createCalendarEvent,
  createGoogleDoc,
  createGoogleSheet,
} from "../../services/composioApi";

const ConversationPanel = ({
  chatId,
  initialQuery,
  initialAttachments = [],
  agentSlug: propAgentSlug = "",
  initialFinopsSessionId = null,
  initialLiveopsSessionId = null,
  onTaskUpdate,
  onThinkingChange,
  onArtifactUpdate,
  onStructuredArtifactUpdate,
  onTitleUpdate,
  onPublicUpdate,
  onFavouriteUpdate,
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
  const [chatPermission, setChatPermission] = useState(null); // "read" or "write"
  const [messageVersions, setMessageVersions] = useState({}); // { parentId: { versions: [msg1, msg2], activeIndex: 1 } }
  const [liveopsSessionId, setLiveopsSessionId] = useState(
    initialLiveopsSessionId,
  ); // Liveops agent session ID
  const [finopsSessionId, setFinopsSessionId] = useState(
    initialFinopsSessionId,
  ); // Finops agent session ID
  const [cashBalance, setCashBalance] = useState(425000.0); // Finops cash balance
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userHasScrolledUpRef = useRef(false);
  const selectedGame = useSelector((state) => state.superAgent.selectedGame);
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData,
  );
  const initialQuerySentRef = useRef(false);
  const abortControllerRef = useRef(null);
  const historyFetchedRef = useRef(false);

  // Use prop if available, otherwise use fetched value (for existing chats)
  const agentSlug = propAgentSlug || fetchedAgentSlug;

  // Composio connections for action cards
  const { isConnected, connect } = useComposioConnections();

  // Action card data (channels, projects, etc.)
  const {
    slackChannels,
    slackUsers,
    jiraProjects,
    isLoading: actionDataLoading,
    fetchSlackChannels,
    fetchSlackUsers,
    fetchJiraProjects,
  } = useActionCardData();

  // Handle action card send
  const handleActionSend = useCallback(async (action, payload) => {
    console.log("[ConversationPanel] Action send:", action.action_type, payload);
    
    try {
      let result;
      const actionType = action.action_type;
      
      switch (actionType) {
        case "slack_message":
          result = await sendSlackMessage({
            channel: payload.channel,
            text: payload.text,
          });
          break;
          
        case "slack_task":
          result = await sendSlackTaskNotification({
            channel: payload.channel,
            taskTitle: payload.task_title,
            taskDescription: payload.task_description,
            priority: payload.priority,
            assignee: payload.assignee,
            dueDate: payload.due_date,
          });
          break;
          
        case "jira_issue":
          result = await createJiraIssue({
            projectKey: payload.project_key,
            summary: payload.summary,
            description: payload.description,
            issueType: payload.issue_type,
            priority: payload.priority,
            assignee: payload.assignee,
            labels: payload.labels,
          });
          break;
          
        case "calendar_event":
          // Calculate end time from duration
          const startDateTime = `${payload.start_date}T${payload.start_time}:00`;
          const startDate = new Date(startDateTime);
          const endDate = new Date(startDate.getTime() + (payload.duration_hours || 1) * 60 * 60 * 1000);
          const endDateTime = endDate.toISOString().slice(0, 19);
          
          result = await createCalendarEvent({
            summary: payload.summary,
            description: payload.description,
            startDateTime,
            endDateTime,
            timeZone: payload.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            attendees: payload.attendees,
          });
          break;
          
        case "google_doc":
        case "google_docs":
          result = await createGoogleDoc({
            title: payload.doc_title,
            content: payload.content_summary,
          });
          break;
          
        case "google_sheet":
        case "google_sheets":
          result = await createGoogleSheet({
            title: payload.sheet_title,
          });
          break;
          
        default:
          console.warn("[ConversationPanel] Unknown action type:", actionType);
          return { success: false, error: `Unknown action type: ${actionType}` };
      }
      
      console.log("[ConversationPanel] Action result:", result);
      return result;
    } catch (err) {
      console.error("[ConversationPanel] Action failed:", err);
      throw err;
    }
  }, []);

  const stopRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    if (onThinkingChange) onThinkingChange(false);
  }, [onThinkingChange]);

  // Fetch chat details to get agent_slug for existing chats
  // Returns the agent_slug so it can be used by fetchChatHistory
  const fetchChatDetails = useCallback(async () => {
    if (!chatId) return null;
    if (propAgentSlug) return propAgentSlug; // Return prop if available

    try {
      const response = await api.get(`/v1/superagent/chats/${chatId}`);
      const result = response.data;
      if (result.success && result.data) {
        const agentSlugFromApi = result.data.data?.agent_slug || "";
        if (agentSlugFromApi) {
          setFetchedAgentSlug(agentSlugFromApi);
        }
        if (result.data.title && onTitleUpdate) {
          onTitleUpdate(result.data.title);
        }
        if (onPublicUpdate) {
          onPublicUpdate(result.data.is_public || false);
        }
        if (onFavouriteUpdate) {
          onFavouriteUpdate(result.data.is_favourite || false);
        }
        
        // Restore session IDs if available
        if (result.data.finops_session_id) setFinopsSessionId(result.data.finops_session_id);
        if (result.data.liveops_session_id) setLiveopsSessionId(result.data.liveops_session_id);
        
        // Also check inside data bag just in case
        if (result.data.data?.finops_session_id) setFinopsSessionId(result.data.data.finops_session_id);
        if (result.data.data?.liveops_session_id) setLiveopsSessionId(result.data.data.liveops_session_id);

        // Track permission for shared chats
        if (result.data.permission) {
          setChatPermission(result.data.permission);
        }

        return agentSlugFromApi;
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
    return null;
  }, [chatId, propAgentSlug]);

  // Fetch chat history on mount
  // Accepts agentSlugOverride to ensure we have the correct agent slug from fetchChatDetails
  const fetchChatHistory = useCallback(
    async (agentSlugOverride) => {
      if (!chatId || historyFetchedRef.current) return;
      
      // Skip fetching history for new chats (when initialQuery is present)
      // This prevents overwriting the first message with empty history
      if (initialQuery) {
        historyFetchedRef.current = true;
        return;
      }

      const effectiveAgentSlug = agentSlugOverride || agentSlug;

      setIsLoadingHistory(true);
      try {
        const response = await api.get(
          `/v1/superagent/chats/${chatId}/messages`,
          { params: { limit: 50, offset: 0 } },
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
                // For agent messages, process raw_events
                const rawEvents = msg.data?.raw_events || [];
                const processedMessages = [];

                // For history loading: accumulate all content_chunk content first,
                // then parse think tags manually (don't use streaming handler)
                let allContent = "";
                let actionsFromEvents = []; // Collect actions from response events
                let isArtifactResponse = false; // Track if response has is_artifact: true
                
                // First pass: check if this is an artifact response and accumulate content
                for (const event of rawEvents) {
                  const eventType = event.type || event.event;
                  
                  // Accumulate content chunks first (needed for artifact content)
                  if (eventType === "content_chunk") {
                    allContent += event.content || "";
                  }
                  
                  if (eventType === "response" && event.is_artifact) {
                    isArtifactResponse = true;
                    // Handle artifact data for right panel
                    if (event.artifact) {
                      const artifact = event.artifact;
                      // Handle markdown artifacts first (higher priority)
                      if (artifact.format === "markdown" && artifact.data?.markdown) {
                        latestArtifact = { type: "markdown", data: artifact.data };
                      }
                      // Handle structured report artifacts (only if not already set as markdown)
                      else if (artifact.artifact_type && artifact.data) {
                        const reportTypeMap = {
                          review_report_short: "review-report-short",
                          review_report_detailed: "review-report",
                          bug_report_short: "bug-report-short",
                          bug_report_detailed: "bug-report",
                        };
                        const mappedType = reportTypeMap[artifact.artifact_type] || artifact.artifact_type;
                        latestArtifact = { type: mappedType, data: artifact.data };
                      }
                    }
                  }
                }
                
                // If is_artifact is true but no structured artifact, use accumulated content as markdown
                if (isArtifactResponse && !latestArtifact && allContent.trim()) {
                  // Strip think tags from content for artifact display
                  const artifactContent = allContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
                  if (artifactContent) {
                    latestArtifact = { type: "markdown", data: { markdown: artifactContent } };
                  }
                }
                
                for (const event of rawEvents) {
                  const eventType = event.type || event.event;
                  
                  if (eventType === "content_chunk") {
                    // Always accumulate content chunks (we need them for thinking blocks)
                    allContent += event.content || "";
                    continue;
                  }
                  
                  // Extract actions from response events
                  if (eventType === "response" && event.actions?.length > 0) {
                    actionsFromEvents = event.actions;
                  }

                  const result = processEventHandler(event, {
                    agentSlug: effectiveAgentSlug,
                    // Don't pass onStructuredArtifactUpdate here - we handle artifacts in the first pass above
                  });
                  if (result) {
                    // Handle both single message and array of messages
                    const messages = Array.isArray(result) ? result : [result];
                    for (const message of messages) {
                      if (message && message.type) {
                        processedMessages.push({
                          ...message,
                          id: `${msg.id}-${processedMessages.length}`,
                          apiMessageId: msg.id, // Store original API message ID for regenerate
                        });
                      }
                    }
                  }
                }

                // Parse accumulated content for think tags
                if (allContent) {
                  // Extract think blocks and regular content
                  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
                  let thinkMatch;
                  let lastIndex = 0;
                  let regularContent = "";

                  while ((thinkMatch = thinkRegex.exec(allContent)) !== null) {
                    // Add content before this think block to regular content
                    regularContent += allContent.slice(lastIndex, thinkMatch.index);
                    lastIndex = thinkRegex.lastIndex;

                    // Add thinking message
                    const thinkContent = thinkMatch[1].trim();
                    if (thinkContent) {
                      processedMessages.push({
                        id: `${msg.id}-${processedMessages.length}`,
                        sender: "llm",
                        type: "thinking",
                        apiMessageId: msg.id,
                        data: {
                          content: thinkContent,
                          isStreaming: false,
                        },
                      });
                    }
                  }

                  // Add remaining content after last think block
                  regularContent += allContent.slice(lastIndex);

                  // Strip ```json...``` blocks from content (artifact JSON that shouldn't be displayed)
                  regularContent = regularContent.replace(/```json[\s\S]*?```/g, "").trim();

                  // Add regular content message if any
                  if (regularContent.trim()) {
                    processedMessages.push({
                      id: `${msg.id}-${processedMessages.length}`,
                      sender: "llm",
                      type: "text",
                      apiMessageId: msg.id,
                      data: {
                        content: regularContent.trim(),
                        feedback: msg.data?.feedback || null,
                        actions: actionsFromEvents.length > 0 ? actionsFromEvents : undefined,
                      },
                    });
                  }
                }
                
                // If we have actions but no text message was created, add them to the last text message
                // or create a new message to hold the actions (for artifact responses)
                if (actionsFromEvents.length > 0) {
                  const lastTextMsg = [...processedMessages].reverse().find(m => m.type === "text");
                  if (lastTextMsg && !lastTextMsg.data.actions) {
                    lastTextMsg.data.actions = actionsFromEvents;
                  } else if (!lastTextMsg) {
                    // No text message exists (artifact response), create one to hold actions
                    processedMessages.push({
                      id: `${msg.id}-actions`,
                      sender: "llm",
                      type: "text",
                      apiMessageId: msg.id,
                      data: {
                        content: "",
                        actions: actionsFromEvents,
                      },
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

          // Only update messages if the content has changed (compare by first user message id)
          setMessages((prevMessages) => {
            // If we already have messages and the first message IDs match, skip update
            if (prevMessages.length > 0 && transformedMessages.length > 0) {
              const prevFirstUserMsg = prevMessages.find(m => m.sender === "user");
              const newFirstUserMsg = transformedMessages.find(m => m.sender === "user");
              if (prevFirstUserMsg && newFirstUserMsg && prevFirstUserMsg.id === newFirstUserMsg.id) {
                // Messages already loaded, skip update to prevent flicker
                return prevMessages;
              }
            }
            return transformedMessages;
          });
          historyFetchedRef.current = true;

          // Restore the latest artifact in the preview panel
          if (latestArtifact) {
            // For markdown artifacts, also call onArtifactUpdate with the markdown content
            if (latestArtifact.type === "markdown" && latestArtifact.data?.markdown && onArtifactUpdate) {
              onArtifactUpdate(latestArtifact.data.markdown);
            }
            if (onStructuredArtifactUpdate) {
              onStructuredArtifactUpdate(
                latestArtifact.type,
                latestArtifact.data,
              );
            }
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
    },
    [chatId, agentSlug, onArtifactUpdate, onStructuredArtifactUpdate, initialQuery],
  );

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
          (action) => action.toolName === toolName,
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

  // Track previous chatId to detect actual changes
  const prevChatIdRef = useRef(chatId);

  // Reset state and fetch history when chatId changes
  useEffect(() => {
    if (!chatId) return;

    const chatIdChanged = prevChatIdRef.current !== chatId;
    prevChatIdRef.current = chatId;

    // Only reset state if chatId actually changed (not on initial mount with same chatId)
    if (chatIdChanged) {
      setMessages([]);
      setStreamingTask(null);
      setIsThinking(false);
      setError(null);
      setFetchedAgentSlug("");
      setNeedsClarification(false);
      setChatNotFound(false);
      setAccessDenied(false);
      setChatPermission(null);
      setMessageVersions({});
      setLiveopsSessionId(initialLiveopsSessionId);
      setFinopsSessionId(initialFinopsSessionId);
      setCashBalance(425000.0);
      historyFetchedRef.current = false;
      initialQuerySentRef.current = false;
    }

    // Fetch chat details and history
    const loadChat = async () => {
      const agentSlugFromDetails = await fetchChatDetails();
      await fetchChatHistory(agentSlugFromDetails);
    };
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const sendMessage = useCallback(
    async (content, attachments = []) => {
      if ((!content.trim() && attachments.length === 0) || !chatId) return;

      if (!selectedGame) {
        setError("Please select a game to continue.");
        return;
      }

      // Session IDs are auto-fetched from chat data by the backend using chatId
      // No need to create or pass session IDs here

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

      // Reset content chunk state before starting
      resetContentChunkState();

      // Helper to update or add messages by ID (for streaming updates)
      const updateOrAddMessages = (messagesToProcess) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          for (const msg of messagesToProcess) {
            const existingIdx = newMessages.findIndex((m) => m.id === msg.id);
            if (existingIdx !== -1) {
              newMessages[existingIdx] = msg;
            } else {
              newMessages.push(msg);
            }
          }
          return newMessages;
        });
      };

      const processEvent = (eventData) => {
        const eventType = eventData.event || eventData.type;

        // On complete event, flush any remaining content
        if (eventType === "complete") {
          const flushedMessages = flushContentChunkState(eventData.steps);
          if (flushedMessages) {
            updateOrAddMessages(flushedMessages);
          }
        }

        const result = processEventHandler(eventData, {
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

        // Handle both single message and array of messages (from content_chunk)
        // Update existing messages by ID for streaming updates
        if (result) {
          const msgs = Array.isArray(result) ? result : [result];
          updateOrAddMessages(msgs);
        }

        // Stop thinking on complete or error
        if (shouldStopThinking(eventType)) {
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
              // Backend will auto-fetch session IDs from chat data using chatId
              // Only pass cash_balance for finops if needed
              ...(agentSlug === "finops" && {
                cash_balance: cashBalance,
              }),
            }),
            signal: abortControllerRef.current.signal,
          },
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
            errorData.message || `Request failed. Please try again.`,
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
            error.message || "Failed to send message. Please try again.",
          );
        }
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      chatId,
      agentSlug,
      onThinkingChange,
      selectedGame,
      ContextStudioData?.slug,
      cashBalance,
    ],
  );

  // Handle feedback (like/dislike) for a message
  const handleFeedback = useCallback(async (messageId, feedback) => {
    if (!messageId) return;
    
    try {
      await api.post(`/v1/superagent/messages/${messageId}/feedback`, {
        feedback: feedback, // 'like' | 'dislike' | null
      });
      
      // Update local message state with new feedback
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.apiMessageId === messageId
            ? { ...msg, data: { ...msg.data, feedback } }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  }, []);

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

      // Tool label mapping for regenerate
      const getToolLabel = (toolName) => {
        const labels = {
          market_search: "Executing market research",
          synthesize: "Synthesizing findings",
          jira_validate: "Validating Jira ticket",
          jira_create: "Creating Jira ticket",
          request_clarification: "Requesting clarification",
          finish: "Completing workflow",
          get_google_play_reviews: "Loading Google Play Reviews",
          get_app_store_reviews: "Loading App Store Reviews",
        };
        return labels[toolName] || `Executing ${toolName}`;
      };

      // Tool type mapping for regenerate
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

      // Reset content chunk state before starting
      resetContentChunkState();

      // Helper to update or add messages by ID (for streaming updates)
      const updateOrAddMessages = (messagesToProcess) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          for (const msg of messagesToProcess) {
            const existingIdx = newMessages.findIndex((m) => m.id === msg.id);
            if (existingIdx !== -1) {
              newMessages[existingIdx] = msg;
            } else {
              newMessages.push(msg);
            }
          }
          return newMessages;
        });
      };

      const processEvent = (eventData) => {
        const eventType = eventData.event || eventData.type;

        // On complete event, flush any remaining content
        if (eventType === "complete") {
          const flushedMessages = flushContentChunkState(eventData.steps);
          if (flushedMessages) {
            updateOrAddMessages(flushedMessages);
          }
        }

        const result = processEventHandler(eventData, {
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

        // Handle both single message and array of messages (from content_chunk)
        // Update existing messages by ID for streaming updates
        if (result) {
          const msgs = Array.isArray(result) ? result : [result];
          updateOrAddMessages(msgs);
        }

        // Stop thinking on complete or error
        if (shouldStopThinking(eventType)) {
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
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("jwt");
            window.location.href = "/login";
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Regenerate failed. Please try again.`,
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
            error.message || "Failed to regenerate message. Please try again.",
          );
        }
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [agentSlug, isThinking, onThinkingChange, onArtifactUpdate],
  );

  // Handle scroll events to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    userHasScrolledUpRef.current = !isNearBottom;
  }, []);

  // Auto-scroll to bottom when messages change, but only if user hasn't scrolled up
  useEffect(() => {
    if (!userHasScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, streamingTask]);

  // Reset scroll lock when streaming completes
  useEffect(() => {
    if (!isThinking) {
      userHasScrolledUpRef.current = false;
    }
  }, [isThinking]);

  // Keep sendMessage ref up to date
  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Send initial query on mount if present (wait for agentSlug and history loading to complete)
  useEffect(() => {
    if (
      (!initialQuery && initialAttachments.length === 0) ||
      !chatId ||
      !agentSlug
    )
      return;
    if (initialQuerySentRef.current) return;
    // Wait for history loading to complete before sending initial query
    if (isLoadingHistory) return;

    initialQuerySentRef.current = true;
    sendMessage(initialQuery, initialAttachments);
  }, [initialQuery, initialAttachments, chatId, agentSlug, isLoadingHistory, sendMessage]);

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
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 space-y-4"
      >
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

          // Check if this is the latest LLM message and we're still streaming
          const isStreamingMessage =
            isThinking &&
            message.sender === "llm" &&
            index === lastLLMMessageIndex;

          return (
            <Message
              key={message.id}
              message={message}
              isLatest={isLatestUserMessage || isLatestLLMMessage}
              isFirstLLMAfterUser={isFirstLLMAfterUser}
              isStreaming={isStreamingMessage}
              onSendMessage={handleSendMessage}
              onRegenerate={regenerateMessage}
              onFeedback={handleFeedback}
              // Action card props
              isConnected={isConnected}
              onConnect={connect}
              slackChannels={slackChannels}
              jiraProjects={jiraProjects}
              isLoadingChannels={actionDataLoading.slackChannels}
              isLoadingProjects={actionDataLoading.jiraProjects}
              onFetchSlackChannels={fetchSlackChannels}
              onFetchJiraProjects={fetchJiraProjects}
              onActionSend={handleActionSend}
            />
          );
        })}

        {/* Streaming Task Display - disabled since tool calls are now added directly to messages */}

        {/* Suggested Actions - Rendered at bottom so user sees them immediately */}
        {(() => {
          // Find the latest LLM message with actions
          const lastLLMWithActions = [...messages].reverse().find(
            (msg) => msg.sender === "llm" && msg.type === "text" && msg.data?.actions?.length > 0
          );
          if (lastLLMWithActions && !isThinking && chatPermission !== "read") {
            return (
              <SuggestedActionsMessage
                actions={lastLLMWithActions.data.actions}
                isConnected={isConnected}
                onConnect={connect}
                slackChannels={slackChannels}
                slackUsers={slackUsers}
                jiraProjects={jiraProjects}
                isLoadingChannels={actionDataLoading.slackChannels}
                isLoadingUsers={actionDataLoading.slackUsers}
                isLoadingProjects={actionDataLoading.jiraProjects}
                onFetchSlackChannels={fetchSlackChannels}
                onFetchSlackUsers={fetchSlackUsers}
                onFetchJiraProjects={fetchJiraProjects}
                onSend={handleActionSend}
              />
            );
          }
          return null;
        })()}

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
        {chatPermission === "read" ? (
          <div
            className="text-center py-3 text-[#6d6d6d] text-sm bg-[#f6f6f6] rounded-lg"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            You're not the owner of this chat.
          </div>
        ) : (
          <ChatInput
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onStop={stopRequest}
            agentSlug={agentSlug}
            chatId={chatId}
            liveopsSessionId={liveopsSessionId}
            onLiveopsSessionCreated={setLiveopsSessionId}
            finopsSessionId={finopsSessionId}
            onFinopsSessionCreated={setFinopsSessionId}
            hasMessages={messages.length > 0}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;
