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
 * Based on actual API response structure:
 * {
 *   id: "uuid",
 *   appUniqueId: "gmail",
 *   appName: "gmail",
 *   status: "ACTIVE",
 *   createdAt: "2026-01-23T11:28:32.686Z",
 *   updatedAt: "2026-01-25T09:45:22.116Z",
 *   ...
 * }
 */
export const mapConnectionToUI = (connection) => {
  // Use appUniqueId or appName to get the app identifier
  const appId = (connection.appUniqueId || connection.appName || "").toLowerCase();

  // Map to UI slug
  const slug = APP_TO_SLUG_MAP[appId] || appId;

  // Normalize status - API returns "ACTIVE", we use "active" in UI
  const rawStatus = connection.status || "ACTIVE";
  const status = rawStatus.toLowerCase();

  return {
    connectionId: connection.id,
    appId: appId,
    appName: connection.appName,
    slug,
    status,
    enabled: connection.enabled,
    connectedAt: connection.createdAt,
    updatedAt: connection.updatedAt,
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

export { INTEGRATION_NAME_MAP, APP_TO_SLUG_MAP };
