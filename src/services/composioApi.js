import api from "../api";
import { getAuthToken, parseJwt } from "../utils";

// Integration name mapping from UI slug to API integrationName (for connect request)
const INTEGRATION_NAME_MAP = {
  "gmail": "GMAIL",
  "google-drive": "GOOGLEDRIVE",
  "google-calendar": "GOOGLECALENDAR",
  "google-docs": "GOOGLEDOCS",
  "google-sheets": "GOOGLESHEETS",
  "slack": "SLACK",
  "jira": "JIRA",
};

// Reverse mapping from API appUniqueId/appName to UI slug
const APP_TO_SLUG_MAP = {
  "gmail": "gmail",
  "googledrive": "google-drive",
  "googlecalendar": "google-calendar",
  "googledocs": "google-docs",
  "googlesheets": "google-sheets",
  "slack": "slack",
  "jira": "jira",
};

// Jira requires an integrationId from Composio dashboard
const JIRA_INTEGRATION_ID = "ac_B8RLkt1HAIKW";

/**
 * Get the current user ID from JWT token
 */
export const getCurrentUserId = () => {
  const authData = getAuthToken();
  if (authData?.token) {
    const decoded = parseJwt(authData.token);
    return decoded?.id || decoded?.userId || decoded?.sub;
  }
  return null;
};

/**
 * Initiate OAuth connection for an external app
 * @param {string} integrationSlug - The integration slug (e.g., "gmail", "slack", "jira")
 * @param {string} redirectUrl - Optional custom redirect URL after OAuth
 * @returns {Promise<{authUrl: string, entityId: string}>}
 */
export const initiateConnection = async (integrationSlug, redirectUrl = null) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const integrationName = INTEGRATION_NAME_MAP[integrationSlug];
  if (!integrationName) {
    throw new Error(`Unknown integration: ${integrationSlug}`);
  }

  const payload = {
    userId,
    integrationName,
  };

  // Jira requires an integrationId
  if (integrationSlug === "jira") {
    payload.integrationId = JIRA_INTEGRATION_ID;
  }

  // Add redirect URL if provided
  if (redirectUrl) {
    payload.redirectUrl = redirectUrl;
  }

  const response = await api.post("/v1/composio/connect", payload);
  return response.data;
};

/**
 * Get all connections for the current user
 * @returns {Promise<{success: boolean, connections: Array}>}
 */
export const getUserConnections = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await api.get(`/v1/composio/connections/${userId}`);
  return response.data;
};

/**
 * Disconnect/remove a connection
 * @param {string} connectionId - The connection ID to remove
 * @returns {Promise<{success: boolean}>}
 */
export const disconnectConnection = async (connectionId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await api.delete(`/v1/composio/connections/${userId}/${connectionId}`);
  return response.data;
};

/**
 * Map API connection response to UI format
 * Based on Composio v3 API response structure:
 * {
 *   id: "ca_D0oQDOIhyNwo",
 *   toolkit: { slug: "gmail" },
 *   auth_config: { id: "ac_...", auth_scheme: "OAUTH2", ... },
 *   status: "ACTIVE",
 *   is_disabled: false,
 *   created_at: "2026-01-26T13:02:03.311Z",
 *   updated_at: "2026-01-26T13:02:16.552Z",
 *   ...
 * }
 */
export const mapConnectionToUI = (connection) => {
  // v3 uses toolkit.slug; fall back to legacy appUniqueId/appName for safety
  const appId = (
    connection.toolkit?.slug ||
    connection.appUniqueId ||
    connection.appName ||
    ""
  ).toLowerCase();

  // Map to UI slug
  const slug = APP_TO_SLUG_MAP[appId] || appId;

  // Normalize status - API returns "ACTIVE", we use "active" in UI
  const rawStatus = connection.status || "ACTIVE";
  const status = rawStatus.toLowerCase();

  return {
    connectionId: connection.id,
    appId: appId,
    appName: connection.toolkit?.slug || connection.appName,
    slug,
    status,
    enabled: connection.is_disabled === undefined ? connection.enabled : !connection.is_disabled,
    connectedAt: connection.created_at || connection.createdAt,
    updatedAt: connection.updated_at || connection.updatedAt,
  };
};

/**
 * Check if a specific integration is connected
 * @param {Array} connections - List of user connections (already mapped to UI format)
 * @param {string} integrationSlug - The integration slug to check
 * @returns {boolean}
 */
export const isIntegrationConnected = (connections, integrationSlug) => {
  return connections.some(
    (conn) => conn.slug === integrationSlug && conn.status === "active"
  );
};

/**
 * Get connection for a specific integration
 * @param {Array} connections - List of user connections (already mapped to UI format)
 * @param {string} integrationSlug - The integration slug
 * @returns {Object|null}
 */
export const getConnectionBySlug = (connections, integrationSlug) => {
  return connections.find((conn) => conn.slug === integrationSlug) || null;
};

// ============================================
// ACTION CARD API FUNCTIONS
// ============================================

// --- SLACK ---

/**
 * Get Slack channels for the current user
 * @param {Object} options - Query options
 * @param {number} options.limit - Max channels to return (default 100)
 * @param {string} options.types - Channel types (default "public_channel,private_channel")
 * @returns {Promise<{success: boolean, data: {channels: Array}}>}
 */
export const getSlackChannels = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  params.append("limit", options.limit || 500);

  const queryString = params.toString();
  const url = `/v1/composio/slack/channels/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get Slack users for @mentions
 * @param {Object} options - Query options
 * @param {number} options.limit - Max users to return (default 100)
 * @returns {Promise<{success: boolean, data: {members: Array}}>}
 */
export const getSlackUsers = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit);

  const queryString = params.toString();
  const url = `/v1/composio/slack/users/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Search Slack channels by name
 * @param {Object} options - Search options
 * @param {string} options.searchQuery - Channel name to search for
 * @param {number} options.limit - Max results to return
 * @param {string} options.types - Channel types (default "public_channel,private_channel")
 * @param {boolean} options.exactMatch - Exact name match only
 * @param {boolean} options.excludeArchived - Exclude archived channels
 * @param {boolean} options.memberOnly - Only channels user is a member of
 * @returns {Promise<{data: {data: {channels: Array}}, successful: boolean}>}
 */
export const searchSlackChannels = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.searchQuery) params.append("searchQuery", options.searchQuery);
  if (options.limit) params.append("limit", options.limit);
  if (options.types) params.append("types", options.types);
  if (options.exactMatch !== undefined) params.append("exactMatch", options.exactMatch);
  if (options.excludeArchived !== undefined) params.append("excludeArchived", options.excludeArchived);
  if (options.memberOnly !== undefined) params.append("memberOnly", options.memberOnly);

  const queryString = params.toString();
  const url = `/v1/composio/slack/channels/${userId}/search${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Search Slack user by email
 * @param {Object} options - Search options
 * @param {string} options.email - Email address to search for
 * @returns {Promise<{data: {data: {user: Object}}, successful: boolean}>}
 */
export const searchSlackUsers = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.email) params.append("email", options.email);

  const queryString = params.toString();
  const url = `/v1/composio/slack/users/${userId}/search${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Send a Slack message
 * @param {Object} data - Message data
 * @param {string} data.channel - Channel ID (e.g., "C123ABC")
 * @param {string} data.text - Message text
 * @param {string} data.threadTs - Optional thread timestamp for replies
 * @returns {Promise<{success: boolean, data: {ok: boolean, ts: string, channel: string}}>}
 */
export const sendSlackMessage = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/slack/message", {
    userId,
    channel: data.channel,
    text: data.text,
    ...(data.threadTs && { threadTs: data.threadTs }),
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

/**
 * Send a Slack task notification
 * @param {Object} data - Task data
 * @param {string} data.channel - Channel ID
 * @param {string} data.taskTitle - Task title
 * @param {string} data.taskDescription - Task description
 * @param {string} data.priority - Priority (Critical/High/Medium/Low)
 * @param {string} data.assignee - Assignee name or email
 * @param {string} data.dueDate - Due date (ISO format)
 * @param {string} data.additionalMessage - Extra message content
 * @returns {Promise<{success: boolean, data: {ok: boolean, ts: string}}>}
 */
export const sendSlackTaskNotification = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/slack/task-notification", {
    userId,
    channel: data.channel,
    taskTitle: data.taskTitle,
    taskDescription: data.taskDescription,
    taskOrigination: data.taskOrigination || "chat",
    ...(data.priority && { priority: data.priority }),
    ...(data.assignee && { assignee: data.assignee }),
    ...(data.dueDate && { dueDate: data.dueDate }),
    ...(data.additionalMessage && { additionalMessage: data.additionalMessage }),
    ...(data.sendInThread !== undefined && { sendInThread: data.sendInThread }),
    ...(data.threadTs && { threadTs: data.threadTs }),
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

// --- JIRA ---

/**
 * Get Jira projects
 * @param {Object} options - Query options
 * @param {number} options.maxResults - Max projects to return (default 50)
 * @param {string} options.query - Search query
 * @returns {Promise<{success: boolean, data: {projects: Array}}>}
 */
export const getJiraProjects = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.maxResults) params.append("maxResults", options.maxResults);
  if (options.query) params.append("query", options.query);

  const queryString = params.toString();
  const url = `/v1/composio/jira/projects/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get Jira users
 * @param {Object} options - Query options
 * @param {number} options.maxResults - Max users to return (default 50)
 * @returns {Promise<{success: boolean, data: {users: Array}}>}
 */
export const getJiraUsers = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.maxResults) params.append("maxResults", options.maxResults);

  const queryString = params.toString();
  const url = `/v1/composio/jira/users/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Create a Jira issue
 * @param {Object} data - Issue data
 * @param {string} data.projectKey - Jira project key (e.g., "PROJ")
 * @param {string} data.summary - Issue title
 * @param {string} data.description - Issue description
 * @param {string} data.issueType - Issue type (Bug/Task/Story/Epic)
 * @param {string} data.priority - Priority (Highest/High/Medium/Low/Lowest)
 * @param {string} data.assignee - Assignee accountId
 * @param {string[]} data.labels - Array of labels
 * @returns {Promise<{success: boolean, data: {id: string, key: string, self: string}}>}
 */
export const createJiraIssue = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/jira/issue", {
    userId,
    projectKey: data.projectKey,
    summary: data.summary,
    description: data.description,
    issueType: data.issueType,
    ...(data.priority && { priority: data.priority }),
    ...(data.assignee && { assignee: data.assignee }),
    ...(data.labels?.length > 0 && { labels: data.labels }),
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

// --- GOOGLE CALENDAR ---

/**
 * Create a Google Calendar event
 * @param {Object} data - Event data
 * @param {string} data.summary - Event title
 * @param {string} data.description - Event description
 * @param {string} data.startDateTime - Start time (ISO 8601)
 * @param {string} data.endDateTime - End time (ISO 8601)
 * @param {string} data.timeZone - Timezone (e.g., "America/New_York")
 * @param {string[]} data.attendees - Array of attendee emails
 * @param {string} data.location - Event location
 * @returns {Promise<{success: boolean, data: {id: string, htmlLink: string, status: string}}>}
 */
export const createCalendarEvent = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/calendar/events", {
    userId,
    summary: data.summary,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    ...(data.description && { description: data.description }),
    ...(data.timeZone && { timeZone: data.timeZone }),
    ...(data.attendees?.length > 0 && { attendees: data.attendees }),
    ...(data.location && { location: data.location }),
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

// --- GOOGLE DOCS ---

/**
 * List Google Docs
 * @param {Object} options - Query options
 * @param {number} options.maxResults - Max docs to return (default 20)
 * @param {string} options.query - Search query
 * @returns {Promise<{success: boolean, data: {files: Array}}>}
 */
export const getGoogleDocs = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.maxResults) params.append("maxResults", options.maxResults);
  if (options.query) params.append("query", options.query);

  const queryString = params.toString();
  const url = `/v1/composio/docs/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Create a Google Doc
 * @param {Object} data - Document data
 * @param {string} data.title - Document title
 * @param {string} data.content - Initial document content
 * @param {string} data.folderId - Parent folder ID in Drive
 * @returns {Promise<{success: boolean, data: {documentId: string, title: string}}>}
 */
export const createGoogleDoc = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/docs/create", {
    userId,
    title: data.title,
    ...(data.content && { content: data.content }),
    ...(data.folderId && { folderId: data.folderId }),
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

// --- GOOGLE SHEETS ---

/**
 * List Google Sheets
 * @param {Object} options - Query options
 * @param {number} options.maxResults - Max sheets to return (default 20)
 * @param {string} options.query - Search query
 * @returns {Promise<{success: boolean, data: {files: Array}}>}
 */
export const getGoogleSheets = async (options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const params = new URLSearchParams();
  if (options.maxResults) params.append("maxResults", options.maxResults);
  if (options.query) params.append("query", options.query);

  const queryString = params.toString();
  const url = `/v1/composio/sheets/${userId}${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Create a Google Sheet
 * @param {Object} data - Spreadsheet data
 * @param {string} data.title - Spreadsheet title
 * @returns {Promise<{success: boolean, data: {spreadsheetId: string, spreadsheetUrl: string}}>}
 */
export const createGoogleSheet = async (data) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await api.post("/v1/composio/sheets/create", {
    userId,
    title: data.title,
    ...(data.message_id && { message_id: data.message_id }),
    ...(data.action_index !== undefined && { action_index: data.action_index }),
    ...(data.action_type && { action_type: data.action_type }),
  });
  return response.data;
};

export { INTEGRATION_NAME_MAP, APP_TO_SLUG_MAP };
