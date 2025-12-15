import React, { useState, useRef, useEffect, useCallback } from "react";
import Message from "./messages/Message";
import TaskMessage from "./messages/TaskMessage";
import ChatInput from "./ChatInput";
import thinkingSphere from "../../assets/thinking_sphere.gif";
import { getAuthToken } from "../../utils";

const API_BASE_URL = "http://localhost:3000";

const ConversationPanel = ({
  chatId,
  initialQuery,
  agentSlug: propAgentSlug = "",
  onTaskUpdate,
  onThinkingChange,
  onArtifactUpdate,
}) => {
  const [messages, setMessages] = useState([]);
  const [streamingTask, setStreamingTask] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [fetchedAgentSlug, setFetchedAgentSlug] = useState("");
  const messagesEndRef = useRef(null);
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
      const token = getAuthToken()?.token;
      const response = await fetch(
        `${API_BASE_URL}/v1/superagent/chats/${chatId}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.agent_slug) {
          setFetchedAgentSlug(result.data.agent_slug);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat details:", error);
    }
  }, [chatId, propAgentSlug]);

  // Fetch chat history on mount
  const fetchChatHistory = useCallback(async () => {
    if (!chatId || historyFetchedRef.current) return;

    setIsLoadingHistory(true);
    try {
      const token = getAuthToken()?.token;
      const response = await fetch(
        `${API_BASE_URL}/v1/superagent/chats/${chatId}/messages?limit=50&offset=0`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
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
                },
              };
            } else if (msg.sender === "agent") {
              // For agent messages, we need to process raw_events to extract content
              // For now, create a task message from the events
              const rawEvents = msg.data?.raw_events || [];
              const task = processRawEventsToTask(rawEvents);
              return {
                id: msg.id,
                sender: "llm",
                type: "task",
                data: task,
              };
            }
            return null;
          })
          .filter(Boolean);

        setMessages(transformedMessages);
        historyFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [chatId]);

  // Helper to process raw_events into a task structure
  const processRawEventsToTask = (rawEvents) => {
    let description = "";
    const actions = [];

    for (const event of rawEvents) {
      const { type, data } = event;

      // Extract reasoning from thinking_complete
      if (type === "thinking_complete") {
        try {
          const parsed = JSON.parse(data?.full_text || "{}");
          if (parsed?.reasoning) {
            description = parsed.reasoning;
          }
        } catch {
          // ignore parse errors
        }
      }

      // Extract summary from synthesis events (look for tool_result of synthesize)
      if (
        type === "tool_result" &&
        data?.tool === "synthesize" &&
        data?.has_data
      ) {
        // Summary would be in the synthesis tokens, but we can use data_preview as fallback
      }

      // Add tool calls as actions - skip duplicates
      if (type === "tool_call") {
        const toolName = data?.tool || "action";
        // Check if this tool already exists in actions
        const existingAction = actions.find(
          (action) => action.toolName === toolName
        );
        if (!existingAction) {
          const toolLabels = {
            market_search: "Executing market research",
            synthesize: "Synthesizing findings",
            jira_validate: "Validating Jira ticket",
            jira_create: "Creating Jira ticket",
            finish: "Completing workflow",
          };
          const toolTypes = {
            market_search: "reading",
            synthesize: "executing",
            jira_validate: "creating",
            jira_create: "creating",
            finish: "executing",
          };
          actions.push({
            id: `action-${actions.length}`,
            toolName: toolName,
            type: toolTypes[toolName] || "executing",
            text: toolLabels[toolName] || `Executing ${toolName}`,
            detail: "",
            status: "completed", // Historical actions are completed
          });
        }
      }
    }

    return {
      title: "Load and explore data",
      description,
      actions,
      relatedActions: [],
    };
  };

  // Fetch chat details and history on mount
  useEffect(() => {
    fetchChatDetails();
    fetchChatHistory();
  }, [fetchChatDetails, fetchChatHistory]);

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
          finish: "executing",
        };
        return types[toolName] || "executing";
      };

      const processEvent = (event) => {
        const { type, data } = event;

        // Stream thinking tokens - parse to extract only reasoning content
        if (type === "thinking_token") {
          const content = data?.content || "";
          reasoningBuffer += content;

          // Check if we've hit the start of reasoning value
          if (!insideReasoning && reasoningBuffer.includes('"reasoning": "')) {
            insideReasoning = true;
            // Extract everything after "reasoning": "
            const startIdx = reasoningBuffer.indexOf('"reasoning": "') + 14;
            reasoningBuffer = reasoningBuffer.substring(startIdx);
          }

          // If inside reasoning, stream the content
          if (insideReasoning) {
            // Check if reasoning has ended (unescaped quote followed by comma or newline)
            const endMatch = reasoningBuffer.match(/([^\\])"/);
            if (endMatch) {
              // Reasoning ended - extract final part and stop
              const endIdx = endMatch.index + 1;
              const finalContent = reasoningBuffer
                .substring(0, endIdx)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
              setStreamingTask((prev) => ({
                ...prev,
                description: finalContent,
              }));
              insideReasoning = false;
              reasoningBuffer = "";
            } else {
              // Still streaming reasoning - update description
              const displayContent = reasoningBuffer
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
              setStreamingTask((prev) => ({
                ...prev,
                description: displayContent,
              }));
            }
          }
          return;
        }

        // On thinking_complete, reset for next iteration
        if (type === "thinking_complete") {
          insideReasoning = false;
          reasoningBuffer = "";
          return;
        }

        // Stream synthesis tokens - parse to extract only summary content
        if (type === "synthesis_token") {
          const content = data?.content || "";
          summaryBuffer += content;

          // Check if we've hit the start of summary value
          if (!insideSummary && summaryBuffer.includes('"summary": "')) {
            insideSummary = true;
            const startIdx = summaryBuffer.indexOf('"summary": "') + 12;
            summaryBuffer = summaryBuffer.substring(startIdx);
          }

          // If inside summary, stream the content
          if (insideSummary) {
            const endMatch = summaryBuffer.match(/([^\\])"/);
            if (endMatch) {
              const endIdx = endMatch.index + 1;
              const finalContent = summaryBuffer
                .substring(0, endIdx)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
              setStreamingTask((prev) => ({
                ...prev,
                description:
                  prev.description +
                  (prev.description ? "\n\n" : "") +
                  finalContent,
              }));
              insideSummary = false;
              summaryBuffer = "";
            } else {
              const displayContent = summaryBuffer
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
              setStreamingTask((prev) => ({
                ...prev,
                description:
                  prev.description.split("\n\n")[0] +
                  (prev.description ? "\n\n" : "") +
                  displayContent,
              }));
            }
          }
          return;
        }

        // Reset synthesis buffer on synthesis start
        if (type === "synthesis_start") {
          insideSummary = false;
          summaryBuffer = "";
          return;
        }

        // Reset jira buffer on jira start
        if (type === "jira_start") {
          jiraBuffer = "";
          return;
        }

        // Stream jira tokens - append directly to description
        if (type === "jira_token") {
          const content = data?.content || "";
          jiraBuffer += content;
          // Display jira content as it streams (it's markdown-like content)
          const displayContent = jiraBuffer
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"');
          setStreamingTask((prev) => {
            // Find where jira content starts (after previous content)
            const baseDescription = prev.description.split(
              "\n\n**Jira Ticket:**"
            )[0];
            return {
              ...prev,
              description:
                baseDescription +
                (baseDescription ? "\n\n" : "") +
                "**Jira Ticket:**\n" +
                displayContent,
            };
          });
          return;
        }

        // Add tool_call as a new action (pending) - skip if duplicate
        if (type === "tool_call") {
          const toolName = data?.tool || "action";
          setStreamingTask((prev) => {
            // Check if this tool already exists in actions
            const existingAction = prev.actions.find(
              (action) => action.toolName === toolName
            );
            if (existingAction) {
              // Skip duplicate tool call
              return prev;
            }
            const actionId = `action-${Date.now()}`;
            return {
              ...prev,
              actions: [
                ...prev.actions,
                {
                  id: actionId,
                  toolName: toolName,
                  type: getToolType(toolName),
                  text: getToolLabel(toolName),
                  detail: "",
                  status: "pending",
                },
              ],
            };
          });
          return;
        }

        // Mark action as completed on tool_result
        if (type === "tool_result") {
          const toolName = data?.tool || "";
          setStreamingTask((prev) => ({
            ...prev,
            actions: prev.actions.map((action) =>
              action.toolName === toolName && action.status === "pending"
                ? { ...action, status: "completed" }
                : action
            ),
          }));
          return;
        }

        // Handle complete event - extract final analysis and add as LLM message
        if (type === "complete") {
          const final = data?.trajectory?.final;
          if (final) {
            // Build a formatted summary from the analysis
            const analysis = final.analysis;
            const jiraTicket = final.jira_ticket;

            let content = "";

            // Add analysis summary
            if (analysis?.summary) {
              content += `**Summary**\n${analysis.summary}\n\n`;
            }

            // Add key findings
            if (analysis?.key_findings?.length > 0) {
              content += `**Key Findings**\n`;
              analysis.key_findings.forEach((finding, i) => {
                content += `${i + 1}. ${finding.claim}\n   - Evidence: ${
                  finding.evidence
                }\n   - Source: ${finding.source_id}\n\n`;
              });
            }

            // Add risk flags
            if (analysis?.risk_flags?.length > 0) {
              content += `**Risks**\n`;
              analysis.risk_flags.forEach((risk) => {
                content += `- ${risk}\n`;
              });
              content += "\n";
            }

            // Add Jira ticket info
            if (jiraTicket) {
              content += `**Jira Ticket Created**\n`;
              content += `- Title: ${jiraTicket.title}\n`;
              content += `- Project: ${jiraTicket.project_key}\n`;
              content += `- Assignee: ${jiraTicket.assignee}\n`;
              content += `- Story Points: ${jiraTicket.story_points}\n`;
            }

            // Send markdown content to preview panel (not as a message)
            if (content && onArtifactUpdate) {
              onArtifactUpdate(content.trim());
            }
          }

          // Keep streaming task visible, just stop thinking
          setIsThinking(false);
          if (onThinkingChange) onThinkingChange(false);
        }
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const token = getAuthToken()?.token;
        const response = await fetch(
          `${API_BASE_URL}/v1/superagent/chats/${chatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              message: content.trim(),
              agent_slug: agentSlug,
            }),
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
              try {
                const event = JSON.parse(line);
                processEvent(event);
              } catch (e) {
                console.warn("Failed to parse event:", line);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer);
            processEvent(event);
          } catch (e) {
            console.warn("Failed to parse final buffer:", buffer);
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request aborted by user");
        } else {
          console.error("Failed to send message:", error);
        }
        setIsThinking(false);
        if (onThinkingChange) onThinkingChange(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [chatId, agentSlug, onThinkingChange]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingTask]);

  // Send initial query on mount if present (wait for agentSlug)
  useEffect(() => {
    console.log(
      "ConversationPanel useEffect - initialQuery:",
      initialQuery,
      "chatId:",
      chatId,
      "agentSlug:",
      agentSlug,
      "alreadySent:",
      initialQuerySentRef.current
    );
    if (initialQuery && chatId && agentSlug && !initialQuerySentRef.current) {
      initialQuerySentRef.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, chatId, agentSlug, sendMessage]);

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

        {/* Streaming Task Display */}
        {streamingTask && (
          <TaskMessage
            task={streamingTask}
            isLatest={false}
            onSendMessage={handleSendMessage}
          />
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
