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

export { INTEGRATION_NAME_MAP, APP_TO_SLUG_MAP };
