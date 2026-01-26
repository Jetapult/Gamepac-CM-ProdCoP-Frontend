import { useState, useEffect, useCallback } from "react";
import {
  getUserConnections,
  initiateConnection,
  disconnectConnection,
  mapConnectionToUI,
} from "../services/composioApi";

/**
 * Custom hook for managing Composio external tool connections
 * Provides state management and API integration for connections
 */
const useComposioConnections = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  /**
   * Fetch all connections for the current user
   */
  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserConnections();

      // API returns: { success: true, connections: [...] }
      const connectionsList = response.connections || response.data?.connections || [];

      // Map API response to UI format
      const mappedConnections = connectionsList.map(mapConnectionToUI);
      console.log("[Composio] Fetched connections:", mappedConnections);
      setConnections(mappedConnections);
    } catch (err) {
      console.error("[Composio] Failed to fetch connections:", err);
      // Don't show error for 404 (no connections yet) or auth errors
      if (err.response?.status !== 404 && err.response?.status !== 401) {
        setError(err.response?.data?.message || "Failed to load connections");
      }
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiate OAuth connection for an integration
   * Redirects to the OAuth URL in the same tab, returns back after auth
   */
  const connect = useCallback(async (integrationSlug) => {
    setIsConnecting(true);
    setError(null);
    try {
      console.log("[Composio] Initiating connection for:", integrationSlug);

      // Build redirect URL to return to current page after OAuth
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("callback", "true");
      const redirectUrl = currentUrl.toString();

      const response = await initiateConnection(integrationSlug, redirectUrl);
      // Handle nested data structure - API returns { data: { authUrl: "..." } }
      const authUrl = response.data?.authUrl || response.authUrl;

      if (authUrl) {
        console.log("[Composio] Got auth URL, redirecting in same tab...");
        // Redirect to OAuth URL in the same tab
        window.location.href = authUrl;
        return { success: true, authUrl };
      } else {
        throw new Error("No auth URL received from server");
      }
    } catch (err) {
      console.error("[Composio] Failed to initiate connection:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to connect";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect an integration
   */
  const disconnect = useCallback(async (connectionId) => {
    setIsDisconnecting(true);
    setError(null);
    try {
      console.log("[Composio] Disconnecting:", connectionId);
      await disconnectConnection(connectionId);
      // Remove from local state
      setConnections((prev) => prev.filter((conn) => conn.connectionId !== connectionId));
      return { success: true };
    } catch (err) {
      console.error("[Composio] Failed to disconnect:", err);
      const errorMessage = err.response?.data?.message || "Failed to disconnect";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsDisconnecting(false);
    }
  }, []);

  /**
   * Check if a specific integration is connected
   */
  const isConnected = useCallback((integrationSlug) => {
    const found = connections.find((conn) => conn.slug === integrationSlug);
    return found && found.status === "active";
  }, [connections]);

  /**
   * Get connection details for a specific integration
   */
  const getConnection = useCallback((integrationSlug) => {
    return connections.find((conn) => conn.slug === integrationSlug) || null;
  }, [connections]);

  /**
   * Get list of connected integration slugs
   */
  const getConnectedSlugs = useCallback(() => {
    const slugs = connections
      .filter((conn) => conn.status === "active")
      .map((conn) => conn.slug);
    return slugs;
  }, [connections]);

  /**
   * Refresh connections (useful after OAuth callback)
   */
  const refresh = useCallback(() => {
    return fetchConnections();
  }, [fetchConnections]);

  // Initial fetch on mount
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Handle OAuth callback - check URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.get("callback");

    if (isCallback === "true") {
      console.log("[Composio] OAuth callback detected, refreshing connections...");
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("callback");
      window.history.replaceState({}, "", url.toString());

      // Refresh connections after OAuth callback
      fetchConnections();
    }
  }, [fetchConnections]);

  return {
    // State
    connections,
    isLoading,
    error,
    isConnecting,
    isDisconnecting,

    // Actions
    connect,
    disconnect,
    refresh,

    // Utilities
    isConnected,
    getConnection,
    getConnectedSlugs,
  };
};

export default useComposioConnections;
