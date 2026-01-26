import { useState, useEffect, useCallback } from "react";
import api from "../api";

/**
 * Custom hook for fetching action card dropdown data
 * Fetches channels, projects, users etc. for action cards
 */
const useActionCardData = (userId) => {
  const [slackChannels, setSlackChannels] = useState([]);
  const [slackUsers, setSlackUsers] = useState([]);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [jiraUsers, setJiraUsers] = useState([]);
  const [googleDocs, setGoogleDocs] = useState([]);
  const [googleSheets, setGoogleSheets] = useState([]);
  
  const [isLoading, setIsLoading] = useState({
    slackChannels: false,
    slackUsers: false,
    jiraProjects: false,
    jiraUsers: false,
    googleDocs: false,
    googleSheets: false,
  });
  
  const [errors, setErrors] = useState({});

  /**
   * Fetch Slack channels
   */
  const fetchSlackChannels = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, slackChannels: true }));
    try {
      const response = await api.get(`/v1/composio/slack/channels/${userId}`);
      const channels = response.data?.channels || response.data?.data?.channels || [];
      setSlackChannels(channels);
      setErrors(prev => ({ ...prev, slackChannels: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Slack channels:", err);
      setErrors(prev => ({ ...prev, slackChannels: err.message }));
      setSlackChannels([]);
    } finally {
      setIsLoading(prev => ({ ...prev, slackChannels: false }));
    }
  }, [userId]);

  /**
   * Fetch Slack users for @mentions
   */
  const fetchSlackUsers = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, slackUsers: true }));
    try {
      const response = await api.get(`/v1/composio/slack/users/${userId}`);
      const users = response.data?.users || response.data?.data?.users || [];
      setSlackUsers(users);
      setErrors(prev => ({ ...prev, slackUsers: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Slack users:", err);
      setErrors(prev => ({ ...prev, slackUsers: err.message }));
      setSlackUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, slackUsers: false }));
    }
  }, [userId]);

  /**
   * Fetch Jira projects
   */
  const fetchJiraProjects = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, jiraProjects: true }));
    try {
      const response = await api.get(`/v1/composio/jira/projects/${userId}`);
      const projects = response.data?.projects || response.data?.data?.projects || [];
      setJiraProjects(projects);
      setErrors(prev => ({ ...prev, jiraProjects: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Jira projects:", err);
      setErrors(prev => ({ ...prev, jiraProjects: err.message }));
      setJiraProjects([]);
    } finally {
      setIsLoading(prev => ({ ...prev, jiraProjects: false }));
    }
  }, [userId]);

  /**
   * Fetch Jira users for assignee suggestions
   */
  const fetchJiraUsers = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, jiraUsers: true }));
    try {
      const response = await api.get(`/v1/composio/jira/users/${userId}`);
      const users = response.data?.users || response.data?.data?.users || [];
      setJiraUsers(users);
      setErrors(prev => ({ ...prev, jiraUsers: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Jira users:", err);
      setErrors(prev => ({ ...prev, jiraUsers: err.message }));
      setJiraUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, jiraUsers: false }));
    }
  }, [userId]);

  /**
   * Fetch Google Docs list (optional)
   */
  const fetchGoogleDocs = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, googleDocs: true }));
    try {
      const response = await api.get(`/v1/composio/docs/${userId}`);
      const docs = response.data?.docs || response.data?.data?.docs || [];
      setGoogleDocs(docs);
      setErrors(prev => ({ ...prev, googleDocs: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Google Docs:", err);
      setErrors(prev => ({ ...prev, googleDocs: err.message }));
      setGoogleDocs([]);
    } finally {
      setIsLoading(prev => ({ ...prev, googleDocs: false }));
    }
  }, [userId]);

  /**
   * Fetch Google Sheets list (optional)
   */
  const fetchGoogleSheets = useCallback(async () => {
    if (!userId) return;
    setIsLoading(prev => ({ ...prev, googleSheets: true }));
    try {
      const response = await api.get(`/v1/composio/sheets/${userId}`);
      const sheets = response.data?.sheets || response.data?.data?.sheets || [];
      setGoogleSheets(sheets);
      setErrors(prev => ({ ...prev, googleSheets: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Google Sheets:", err);
      setErrors(prev => ({ ...prev, googleSheets: err.message }));
      setGoogleSheets([]);
    } finally {
      setIsLoading(prev => ({ ...prev, googleSheets: false }));
    }
  }, [userId]);

  /**
   * Fetch all Slack data
   */
  const fetchSlackData = useCallback(() => {
    fetchSlackChannels();
    fetchSlackUsers();
  }, [fetchSlackChannels, fetchSlackUsers]);

  /**
   * Fetch all Jira data
   */
  const fetchJiraData = useCallback(() => {
    fetchJiraProjects();
    fetchJiraUsers();
  }, [fetchJiraProjects, fetchJiraUsers]);

  return {
    // Data
    slackChannels,
    slackUsers,
    jiraProjects,
    jiraUsers,
    googleDocs,
    googleSheets,
    
    // Loading states
    isLoading,
    
    // Errors
    errors,
    
    // Fetch functions
    fetchSlackChannels,
    fetchSlackUsers,
    fetchSlackData,
    fetchJiraProjects,
    fetchJiraUsers,
    fetchJiraData,
    fetchGoogleDocs,
    fetchGoogleSheets,
  };
};

export default useActionCardData;
