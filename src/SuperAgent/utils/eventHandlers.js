/**
 * Event handlers for SSE events from the SuperAgent API
 * Each event type has its own handler function
 */

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
  return {
    id: Date.now(),
    sender: "llm",
    type: "agent_header",
    data: {
      agentName,
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
    id: Date.now(),
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
    id: Date.now(),
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
    id: Date.now(),
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
    id: Date.now(),
    sender: "llm",
    type: "error",
    data: {
      content: errorMessage,
    },
  };
};

// Handler for 'tool_result' event - handles report generation results
export const handleToolResultEvent = (eventData, context) => {
  const toolName = eventData.tool_name || "";
  const toolResult = eventData.tool_result || eventData.result || {};

  // Check if this is a report generation tool
  const artifactType = reportToolToArtifactType[toolName];

  if (artifactType && context.onStructuredArtifactUpdate) {
    // Call the artifact update callback with the report type and data
    context.onStructuredArtifactUpdate(artifactType, toolResult);

    // Return a message indicating the report was generated
    return {
      id: Date.now(),
      sender: "llm",
      type: "report_artifact",
      data: {
        reportType: artifactType,
        reportData: toolResult,
        toolName: toolName,
      },
    };
  }

  // For non-report tool results, return null (don't show anything)
  return null;
};

// Map of event types to handlers
const eventHandlers = {
  start: handleStartEvent,
  reason: handleReasonEvent,
  action: handleActionEvent,
  complete: handleCompleteEvent,
  error: handleErrorEvent,
  tool_result: handleToolResultEvent,
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

  // Unknown event type - ignore silently (don't show raw JSON)
  console.log("Unknown event type:", eventType, eventData);
  return null;
};

/**
 * Check if an event should stop the thinking state
 * @param {string} eventType - The event type (from 'event' or 'type' field)
 * @returns {boolean}
 */
export const shouldStopThinking = (eventType) => {
  const stopEvents = ["complete", "error", "done", "end", "finish"];
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
