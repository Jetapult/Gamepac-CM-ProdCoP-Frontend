/**
 * Event handlers for SSE events from the SuperAgent API
 * Each event type has its own handler function
 */

// Counter for unique message IDs
let messageIdCounter = 0;
const getUniqueId = () => `${Date.now()}-${++messageIdCounter}`;

// State for content_chunk processing
let contentChunkState = {
  isInsideThinkTag: false,
  currentThinkContent: "",
  currentMessageContent: "",
  currentStep: null,
  // Stable IDs for streaming messages (so they can be updated in place)
  streamingThinkId: null,
  streamingMessageId: null,
  // Flag to track if current response is an artifact (to prevent flushing)
  isArtifactResponse: false,
  // Flag to track if we're inside a ```json block (artifact content to skip)
  isInsideJsonBlock: false,
};

// Reset content chunk state (call on new conversation or complete)
export const resetContentChunkState = () => {
  contentChunkState = {
    isInsideThinkTag: false,
    currentThinkContent: "",
    currentMessageContent: "",
    currentStep: null,
    streamingThinkId: null,
    streamingMessageId: null,
    isArtifactResponse: false,
    isInsideJsonBlock: false,
  };
};

// Get current streaming message ID (for removal when artifact is detected)
export const getStreamingMessageId = () => contentChunkState.streamingMessageId;

// Check if current response is an artifact
export const isCurrentResponseArtifact = () => contentChunkState.isArtifactResponse;

// Agent name mapping from slug
const agentNameMap = {
  gamepac: "GamePac",
  commpac: "CommPac",
  liveops: "LiveOps",
  finops: "FinOps",
};

// Helper to get agent display name
export const getAgentDisplayName = (agentSlug) => {
  return agentNameMap[agentSlug] || agentSlug || "Agent";
};

// Handler for 'start' event - shows agent header
export const handleStartEvent = (eventData, context) => {
  const agentName = getAgentDisplayName(context.agentSlug);
  // New format includes session_id and query
  const sessionId = eventData.session_id || null;
  const query = eventData.query || null;
  return {
    id: getUniqueId(),
    sender: "llm",
    type: "agent_header",
    data: {
      agentName,
      sessionId,
      query,
    },
  };
};

// Handler for 'reason' event
export const handleReasonEvent = (eventData, context) => {
  const reasoning = eventData.reasoning || "";
  const agentName = getAgentDisplayName(context.agentSlug);

  // Only show if there's reasoning content
  if (!reasoning) {
    return null;
  }

  return {
    id: getUniqueId(),
    sender: "llm",
    type: "task",
    data: {
      title: `${agentName} is thinking`,
      description: reasoning,
      actions: [],
      relatedActions: [],
    },
  };
};

// Title mapping for tool names
const toolTitleMap = {
  update_plan_note: "Planning",
  fetch_feedback: "Loading App Store Reviews",
  fetch_bug_reports: "Loading Bug Reports",
  fetch_system_context: "Loading Game Metadata",
  filter_feedback: "Filtering Reviews",
  analyze_feedback: "Analyzing Feedback",
  quantitative_analysis: "Fetching Analytics",
  evaluate_escalations: "Evaluating Escalations",
  summarize_bug_report: "Summarizing Bug Report",
  compare_bug_reports: "Comparing Bug Reports",
  summarize_report: "Generating Report",
  prepare_slack: "Preparing Slack Messages",
  prepare_jira: "Preparing Jira Tickets",
  export_csv: "Exporting CSV",
  clear_pagination: "Resetting Pagination",
  request_clarification: "Requesting Clarification",
  finish: "Completing",
  market_search: "Searching Market Data",
  synthesize: "Synthesizing Findings",
  jira_validate: "Validating Jira Ticket",
  jira_create: "Creating Jira Ticket",
  generate_bug_report_detailed: "Generating Detailed Bug Report",
  generate_bug_report_short: "Generating Bug Report Summary",
  generate_review_report_detailed: "Generating Detailed Review Report",
  generate_review_report_short: "Generating Review Report Summary",
  get_google_play_reviews: "Loading Google Play Reviews",
  get_app_store_reviews: "Loading App Store Reviews",
  analyze_reviews: "Analyzing Reviews",
  get_reviews: "Fetching Reviews",
  // LiveOps agent tools
  catalogue_event: "Cataloguing Event",
  clone_event: "Cloning Event",
  search_events: "Searching Events",
  analyze_event_performance: "Analyzing Event Performance",
  get_calendar: "Loading Calendar",
  check_conflicts: "Checking Conflicts",
  generate_faq: "Generating FAQ",
  generate_patch_notes: "Generating Patch Notes",
  generate_jira_ticket: "Generating JIRA Ticket",
  get_event_details: "Loading Event Details",
  update_event: "Updating Event",
  delete_event: "Deleting Event",
  list_events: "Listing Events",
  // FinOps agent tools
  generate_financial_report: "Generating Financial Report",
  analyze_budget_variance: "Analyzing Budget Variance",
  analyze_ua_performance: "Analyzing UA Performance",
  calculate_runway: "Calculating Runway",
  check_financial_alerts: "Checking Financial Alerts",
  generate_slack_summary: "Generating Slack Summary",
  load_financial_data: "Loading Financial Data",
};

// Report tool name to artifact type mapping
const reportToolToArtifactType = {
  generate_bug_report_detailed: "bug-report",
  generate_bug_report_short: "bug-report-short",
  generate_review_report_detailed: "review-report",
  generate_review_report_short: "review-report-short",
};

// Handler for 'action' event
export const handleActionEvent = (eventData, context) => {
  console.log("[Action Event]", eventData);
  
  const toolName = eventData.tool_name || "";
  const toolArgs = eventData.tool_args || {};

  // Skip if no tool name
  if (!toolName) {
    return null;
  }

  // Get title from mapping or use tool name
  const title = toolTitleMap[toolName] || toolName;

  // Get description based on tool type
  let description = "";
  if (toolName === "update_plan_note") {
    // For update_plan_note, show the note as thinking content
    description = toolArgs.note || "";
  } else if (toolName === "request_clarification") {
    // For request_clarification, show the reason as description
    description = toolArgs.reason || "";
  } else {
    // Default: show tool_args as formatted key-value pairs (only if not empty)
    const hasContent = Object.keys(toolArgs).length > 0;
    if (hasContent) {
      description = Object.entries(toolArgs)
        .map(([key, value]) => {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const formattedValue =
            typeof value === "object" ? JSON.stringify(value) : value;
          return `**${formattedKey}:** ${formattedValue}`;
        })
        .join("\n\n");
    }
  }

  // Get formatted_message for action subtitle
  const formattedMessage = eventData.formatted_message || "";

  return {
    id: getUniqueId(),
    sender: "llm",
    type: "task",
    data: {
      title: title,
      description: description,
      actions: [
        {
          id: `action-${Date.now()}`,
          toolName: toolName,
          type: "executing",
          text: title,
          detail: formattedMessage,
          status: "completed",
        },
      ],
      relatedActions: [],
    },
  };
};

// Handler for 'response' event - the actual LLM response
export const handleResponseEvent = (eventData, context) => {
  let content = eventData.content || "";
  // Generate a unique message ID if not provided by backend
  const messageId = eventData.message_id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const actions = eventData.actions || [];
  const isArtifact = eventData.is_artifact || false;
  const artifact = eventData.artifact || null;

  console.log("[handleResponseEvent] Entry:", { isArtifact, hasArtifact: !!artifact, messageId });

  // Handle artifact responses - display in right panel and remove streamed content from conversation
  if (isArtifact && artifact) {
    // Mark this as an artifact response to prevent flushContentChunkState from re-adding the message
    contentChunkState.isArtifactResponse = true;
    
    // Remove the last streaming text message since it contains artifact content, not conversation content
    // This happens because content_chunk events stream the artifact text before we know it's an artifact
    if (context.setMessages && contentChunkState.streamingMessageId) {
      context.setMessages((prevMessages) => {
        // Remove the streaming message that was built from content chunks
        return prevMessages.filter(msg => msg.id !== contentChunkState.streamingMessageId);
      });
    }
    // Reset the streaming message state since we removed it (or don't want to flush it)
    contentChunkState.streamingMessageId = null;
    contentChunkState.currentMessageContent = "";

    // Handle markdown format artifacts
    if (artifact.format === "markdown" && artifact.data?.markdown) {
      if (context.onArtifactUpdate) {
        context.onArtifactUpdate(artifact.data.markdown);
      }
      if (context.onStructuredArtifactUpdate) {
        context.onStructuredArtifactUpdate("markdown", artifact.data);
      }
    }
    
    // Handle structured report artifacts (review_report_short, etc.)
    console.log("[handleResponseEvent] artifact check:", { artifact_type: artifact.artifact_type, hasData: !!artifact.data });
    if (artifact.artifact_type && artifact.data) {
      const reportTypeToArtifactType = {
        review_report_short: "review-report-short",
        review_report_detailed: "review-report",
        bug_report_short: "bug-report-short",
        bug_report_detailed: "bug-report",
      };
      const mappedType = reportTypeToArtifactType[artifact.artifact_type] || artifact.artifact_type;
      
      if (context.onStructuredArtifactUpdate) {
        context.onStructuredArtifactUpdate(mappedType, artifact.data, messageId);
      }
      
      // Return both an LLM text message AND a report_artifact message
      // The text message is needed for the artifact card to attach to
      const textMsg = {
        id: getUniqueId(),
        sender: "llm",
        type: "text",
        apiMessageId: messageId,
        data: {
          content: "",
          actions: actions.length > 0 ? [...actions] : undefined,
        },
      };
      
      const reportArtifactMsg = {
        id: `${messageId}-artifact`,
        sender: "llm",
        type: "report_artifact",
        apiMessageId: messageId,
        data: {
          reportType: mappedType,
          reportData: artifact.data,
        },
      };
      
      const result = [textMsg, reportArtifactMsg];
      console.log("[handleResponseEvent] Returning artifact messages:", result);
      return result;
    }
    
    // If artifact response has actions, return a message to hold them
    // (since we removed the streaming message, we need a new one for actions)
    if (actions.length > 0) {
      return {
        id: getUniqueId(),
        sender: "llm",
        type: "text",
        apiMessageId: messageId,
        data: {
          content: "", // No content, just actions
          actions: [...actions],
        },
      };
    }
    
    // Artifact handled, no message to return
    return null;
  }

  // Extract thinking content from <think>...</think> tags
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  const thinkingContent = thinkMatch ? thinkMatch[1].trim() : null;

  // Strip <think>...</think> tags from main content
  const mainContent = content
    .replace(/<think>[\s\S]*?<\/think>\s*/g, "")
    .trim();

  // If actions exist but no content, merge actions into the last LLM message
  if (actions.length > 0 && !mainContent && !thinkingContent) {
    if (context.setMessages) {
      context.setMessages((prevMessages) => {
        // Find the last LLM text message
        const lastLLMIndex = [...prevMessages].reverse().findIndex(
          (msg) => msg.sender === "llm" && msg.type === "text"
        );
        if (lastLLMIndex !== -1) {
          const actualIndex = prevMessages.length - 1 - lastLLMIndex;
          const updatedMessages = [...prevMessages];
          // Create a completely new message object to ensure React detects the change
          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            id: updatedMessages[actualIndex].id, // Keep same ID
            _actionsUpdatedAt: Date.now(), // Force new reference detection
            data: {
              ...updatedMessages[actualIndex].data,
              actions: [...actions], // Create new array reference
            },
          };
          return updatedMessages;
        }
        return prevMessages;
      });
    }
    return null; // Don't create a new message
  }

  // If no content and no actions, return null
  if (!mainContent && !thinkingContent && actions.length === 0) {
    return null;
  }

  // Return as LLM text message with optional thinking and actions
  return {
    id: getUniqueId(),
    sender: "llm",
    type: "text",
    apiMessageId: messageId,
    data: {
      content: mainContent,
      thinking: thinkingContent,
      actions: actions.length > 0 ? actions : undefined,
    },
  };
};

// Handler for 'complete' event
export const handleCompleteEvent = (eventData, context) => {
  const report = eventData.report || {};
  const summary = report.summary || "";
  const status = report.status || "";
  const messageId = eventData.message_id || null; // API message UUID if provided

  // Track if clarification is needed for next message
  if (status === "needs_clarification" && context.setNeedsClarification) {
    context.setNeedsClarification(true);
  }

  // If no summary, return null (don't show anything)
  if (!summary) {
    return null;
  }

  // Return as LLM text message - LLMMessage already renders markdown
  return {
    id: getUniqueId(),
    sender: "llm",
    type: "text",
    apiMessageId: messageId, // Store API message ID for regenerate (null if not provided)
    data: {
      content: summary,
    },
  };
};

// Handler for 'error' event
export const handleErrorEvent = (eventData, context) => {
  // Handle both formats: {event: "error", message: "..."} and {type: "error", data: {message: "..."}}
  const errorMessage =
    eventData.data?.message ||
    eventData.message ||
    eventData.error ||
    "An error occurred";

  return {
    id: getUniqueId(),
    sender: "llm",
    type: "error",
    data: {
      content: errorMessage,
    },
  };
};

// Handler for 'tool_call' event - shows tool being called
// New format: { type: "tool_call", step: 2, tool: "get_google_play_reviews", args: {...} }
export const handleToolCallEvent = (eventData, context) => {
  const toolName = eventData.tool || eventData.tool_name || "";
  const toolArgs = eventData.args || eventData.tool_args || {};
  const step = eventData.step || null;

  // Skip if no tool name (malformed event)
  if (!toolName) {
    return null;
  }

  // Get title from mapping or use tool name
  const title = toolTitleMap[toolName] || toolName;

  // Get description based on tool type
  let description = "";
  if (toolName === "update_plan_note") {
    description = toolArgs.note || "";
  } else if (toolName === "request_clarification") {
    description = toolArgs.reason || "";
  } else {
    const hasContent = Object.keys(toolArgs).length > 0;
    if (hasContent) {
      description = Object.entries(toolArgs)
        .map(([key, value]) => {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const formattedValue =
            typeof value === "object" ? JSON.stringify(value) : value;
          return `**${formattedKey}:** ${formattedValue}`;
        })
        .join("\n\n");
    }
  }

  return {
    id: getUniqueId(),
    sender: "llm",
    type: "task",
    data: {
      title: title,
      description: description,
      step: step,
      actions: [
        {
          id: `action-${Date.now()}`,
          toolName: toolName,
          type: "executing",
          text: title,
          detail: "",
          status: "in_progress",
        },
      ],
      relatedActions: [],
    },
  };
};

// Handler for 'tool_result' event - handles tool completion results
// New format: { type: "tool_result", step: 3, tool: "get_app_store_reviews", result: "{...}" }
export const handleToolResultEvent = (eventData, context) => {
  const toolName = eventData.tool || eventData.tool_name || "";
  const step = eventData.step || null;
  // Handle result as either object or JSON string (truncated to 200 chars in new format)
  let toolResult = eventData.result || eventData.tool_result || {};
  if (typeof toolResult === "string") {
    try {
      toolResult = JSON.parse(toolResult);
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }

  // Check if this is a report generation tool
  const artifactType = reportToolToArtifactType[toolName];

  if (artifactType && context.onStructuredArtifactUpdate) {
    // Call the artifact update callback with the report type and data
    context.onStructuredArtifactUpdate(artifactType, toolResult);

    // Return a message indicating the report was generated
    return {
      id: getUniqueId(),
      sender: "llm",
      type: "report_artifact",
      data: {
        reportType: artifactType,
        reportData: toolResult,
        toolName: toolName,
        step: step,
      },
    };
  }

  // For non-report tool results, return null (don't show anything)
  return null;
};

// Report type mapping from artifact content
const reportTypeToArtifactType = {
  bug_report_detailed: "bug-report",
  bug_report_short: "bug-report-short",
  review_report_detailed: "review-report",
  review_report_short: "review-report-short",
};

// Handler for 'artifact' event - handles report JSON for artifact panel (RIGHT side)
// New format: { type: "artifact", step: 6, artifact_type: "report_json", content: "{...}" }
export const handleArtifactEvent = (eventData, context) => {
  const artifactType = eventData.artifact_type || "";
  const step = eventData.step || null;
  let content = eventData.content || {};

  // Parse content if it's a JSON string
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }

  // Handle report_json artifact type
  if (artifactType === "report_json" && context.onStructuredArtifactUpdate) {
    // Get report_type from content to determine artifact panel type
    const reportType = content.report_type || "";
    const mappedArtifactType =
      reportTypeToArtifactType[reportType] || "review-report";

    // Call the artifact update callback with the report type and data
    context.onStructuredArtifactUpdate(mappedArtifactType, content);

    // Return a message indicating the report was generated
    return {
      id: getUniqueId(),
      sender: "llm",
      type: "report_artifact",
      data: {
        reportType: mappedArtifactType,
        reportData: content,
        artifactType: artifactType,
        step: step,
      },
    };
  }

  // For other artifact types, return null
  return null;
};

// Handler for 'content_chunk' event - accumulates streaming content
// Separates think blocks from regular messages
// Returns an array of messages (think blocks and/or text messages) or null
// Uses stable IDs for streaming messages so they can be updated in place
export const handleContentChunkEvent = (eventData, context) => {
  const content = eventData.content || "";
  const step = eventData.step;

  if (!content) {
    return null;
  }

  // If we're inside a JSON block, skip content until we find closing ```
  if (contentChunkState.isInsideJsonBlock) {
    // Check if this chunk contains the closing ```
    if (content.includes("```") && !content.includes("```json")) {
      contentChunkState.isInsideJsonBlock = false;
    }
    // Skip this content - don't accumulate or emit
    return null;
  }

  // Check if we're entering a ```json block (artifact content to skip)
  // This can happen across chunks, so check accumulated content + new content
  const combinedContent = contentChunkState.currentMessageContent + content;
  if (combinedContent.includes("```json")) {
    contentChunkState.isInsideJsonBlock = true;
    // Keep any content before the json block, discard the rest
    const jsonIdx = combinedContent.indexOf("```json");
    const contentBeforeJson = combinedContent.slice(0, jsonIdx).trim();
    // Reset message content to only what was before the JSON
    contentChunkState.currentMessageContent = contentBeforeJson;
    // Don't process this chunk further
    return null;
  }

  const messages = [];
  let remaining = content;

  // Process the content, looking for think tags
  while (remaining.length > 0) {
    if (contentChunkState.isInsideThinkTag) {
      // We're inside a think tag, look for closing </think>
      const closeIdx = remaining.indexOf("</think>");
      if (closeIdx !== -1) {
        // Found closing tag - complete this think block
        contentChunkState.currentThinkContent += remaining.slice(0, closeIdx);
        remaining = remaining.slice(closeIdx + 8); // Skip </think>
        contentChunkState.isInsideThinkTag = false;

        // Create a completed think message
        if (contentChunkState.currentThinkContent.trim()) {
          messages.push({
            id: contentChunkState.streamingThinkId || getUniqueId(),
            sender: "llm",
            type: "thinking",
            data: {
              content: contentChunkState.currentThinkContent.trim(),
              step: step,
              isStreaming: false,
            },
          });
        }
        contentChunkState.currentThinkContent = "";
        contentChunkState.streamingThinkId = null; // Reset for next think block
      } else {
        // No closing tag yet, accumulate and emit streaming update
        contentChunkState.currentThinkContent += remaining;
        remaining = "";

        // Emit streaming think message with stable ID
        if (contentChunkState.currentThinkContent.trim()) {
          if (!contentChunkState.streamingThinkId) {
            contentChunkState.streamingThinkId = getUniqueId();
          }
          messages.push({
            id: contentChunkState.streamingThinkId,
            sender: "llm",
            type: "thinking",
            data: {
              content: contentChunkState.currentThinkContent.trim(),
              step: step,
              isStreaming: true,
            },
          });
        }
      }
    } else {
      // We're outside a think tag, look for opening <think>
      const openIdx = remaining.indexOf("<think>");
      if (openIdx !== -1) {
        // Found opening tag
        // First, emit any accumulated content before the tag as a completed message
        const beforeThink = remaining.slice(0, openIdx);
        contentChunkState.currentMessageContent += beforeThink;
        if (contentChunkState.currentMessageContent.trim()) {
          messages.push({
            id: contentChunkState.streamingMessageId || getUniqueId(),
            sender: "llm",
            type: "text",
            data: {
              content: contentChunkState.currentMessageContent.trim(),
              step: step,
            },
          });
          contentChunkState.currentMessageContent = "";
          contentChunkState.streamingMessageId = null; // Reset for next message
        }

        remaining = remaining.slice(openIdx + 7); // Skip <think>
        contentChunkState.isInsideThinkTag = true;
        contentChunkState.currentThinkContent = "";
      } else {
        // No think tag, accumulate and emit streaming update
        contentChunkState.currentMessageContent += remaining;
        remaining = "";

        // Emit streaming message with stable ID
        if (contentChunkState.currentMessageContent.trim()) {
          if (!contentChunkState.streamingMessageId) {
            contentChunkState.streamingMessageId = getUniqueId();
          }
          messages.push({
            id: contentChunkState.streamingMessageId,
            sender: "llm",
            type: "text",
            data: {
              content: contentChunkState.currentMessageContent.trim(),
              step: step,
              isStreaming: true,
            },
          });
        }
      }
    }
  }

  contentChunkState.currentStep = step;

  // Return array of messages, or null if empty
  return messages.length > 0 ? messages : null;
};

// Flush any remaining content as a final message (call on complete event)
// Uses the existing stable streaming IDs to update in place
export const flushContentChunkState = (step) => {
  const messages = [];

  // Flush any remaining think content (use existing streaming ID)
  // Think content is always flushed, even for artifact responses
  if (contentChunkState.currentThinkContent.trim()) {
    messages.push({
      id: contentChunkState.streamingThinkId || getUniqueId(),
      sender: "llm",
      type: "thinking",
      data: {
        content: contentChunkState.currentThinkContent.trim(),
        step: step,
        isStreaming: false,
      },
    });
  }

  // Flush any remaining message content (use existing streaming ID)
  // Skip flushing message content if this was an artifact response (content was already removed)
  if (contentChunkState.currentMessageContent.trim() && !contentChunkState.isArtifactResponse) {
    messages.push({
      id: contentChunkState.streamingMessageId || getUniqueId(),
      sender: "llm",
      type: "text",
      data: {
        content: contentChunkState.currentMessageContent.trim(),
        step: step,
      },
    });
  }

  // Reset state
  resetContentChunkState();

  return messages.length > 0 ? messages : null;
};

// Handler for 'cancelled' event - request was cancelled
// New format: { type: "cancelled", reason: "client_disconnect" }
export const handleCancelledEvent = (eventData, context) => {
  const reason = eventData.reason || "Request cancelled";

  return {
    id: getUniqueId(),
    sender: "llm",
    type: "cancelled",
    data: {
      reason: reason,
    },
  };
};

// Map of event types to handlers
const eventHandlers = {
  start: handleStartEvent,
  reason: handleReasonEvent,
  action: handleActionEvent,
  tool_call: handleToolCallEvent,
  response: handleResponseEvent,
  complete: handleCompleteEvent,
  error: handleErrorEvent,
  tool_result: handleToolResultEvent,
  artifact: handleArtifactEvent,
  content_chunk: handleContentChunkEvent,
  cancelled: handleCancelledEvent,
};

/**
 * Process an SSE event and return a message object (or null to ignore)
 * @param {Object} eventData - The event data from the API
 * @param {Object} context - Context object with callbacks and state setters
 * @returns {Object|Object[]|null} - Message object, array of messages (for content_chunk), or null to ignore
 */
export const processEvent = (eventData, context) => {
  // Handle both 'event' and 'type' fields for event type
  const eventType = eventData.event || eventData.type;
  const handler = eventHandlers[eventType];

  if (handler) {
    return handler(eventData, context);
  }

  // Unknown event type - ignore silently
  return null;
};

/**
 * Check if an event should stop the thinking state
 * @param {string} eventType - The event type (from 'event' or 'type' field)
 * @returns {boolean}
 */
export const shouldStopThinking = (eventType) => {
  const stopEvents = [
    "complete",
    "error",
    "done",
    "end",
    "finish",
    "cancelled",
  ];
  return stopEvents.includes(eventType);
};

/**
 * Get event type from event data (handles both 'event' and 'type' fields)
 * @param {Object} eventData - The event data
 * @returns {string|undefined}
 */
export const getEventType = (eventData) => {
  return eventData.event || eventData.type;
};
