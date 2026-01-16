/**
 * Event handlers for SSE events from the SuperAgent API
 * Each event type has its own handler function
 */

// Counter for unique message IDs
let messageIdCounter = 0;
const getUniqueId = () => `${Date.now()}-${++messageIdCounter}`;

// Agent name mapping from slug
const agentNameMap = {
  gamepac: "GamePac",
  commpac: "CommPac",
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
  const toolName = eventData.tool_name || "action";
  const toolArgs = eventData.tool_args || {};

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
  const messageId = eventData.message_id || null;

  // Extract thinking content from <think>...</think> tags
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  const thinkingContent = thinkMatch ? thinkMatch[1].trim() : null;

  // Strip <think>...</think> tags from main content
  const mainContent = content
    .replace(/<think>[\s\S]*?<\/think>\s*/g, "")
    .trim();

  // If no content at all, return null
  if (!mainContent && !thinkingContent) {
    return null;
  }

  // Return as LLM text message with optional thinking
  return {
    id: getUniqueId(),
    sender: "llm",
    type: "text",
    apiMessageId: messageId,
    data: {
      content: mainContent,
      thinking: thinkingContent,
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
  const toolName = eventData.tool || eventData.tool_name || "action";
  const toolArgs = eventData.args || eventData.tool_args || {};
  const step = eventData.step || null;

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
  cancelled: handleCancelledEvent,
};

/**
 * Process an SSE event and return a message object (or null to ignore)
 * @param {Object} eventData - The event data from the API
 * @param {Object} context - Context object with callbacks and state setters
 * @returns {Object|null} - Message object to add to messages, or null to ignore
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
