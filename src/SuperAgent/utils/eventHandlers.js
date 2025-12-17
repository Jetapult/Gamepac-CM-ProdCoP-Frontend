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
  // Show as raw JSON for now
  return {
    id: Date.now(),
    sender: "llm",
    type: "text",
    data: {
      content: "```json\n" + JSON.stringify(eventData, null, 2) + "\n```",
    },
  };
};

// Map of event types to handlers
const eventHandlers = {
  start: handleStartEvent,
  reason: handleReasonEvent,
  action: handleActionEvent,
  complete: handleCompleteEvent,
  error: handleErrorEvent,
};

/**
 * Process an SSE event and return a message object (or null to ignore)
 * @param {Object} eventData - The event data from the API
 * @param {Object} context - Context object with callbacks and state setters
 * @returns {Object|null} - Message object to add to messages, or null to ignore
 */
export const processEvent = (eventData, context) => {
  const eventType = eventData.event;
  const handler = eventHandlers[eventType];

  if (handler) {
    return handler(eventData, context);
  }

  // Unknown event type - show as raw JSON
  return {
    id: Date.now(),
    sender: "llm",
    type: "text",
    data: {
      content: "```json\n" + JSON.stringify(eventData, null, 2) + "\n```",
    },
  };
};

/**
 * Check if an event should stop the thinking state
 * @param {string} eventType - The event type
 * @returns {boolean}
 */
export const shouldStopThinking = (eventType) => {
  return eventType === "complete" || eventType === "error";
};
