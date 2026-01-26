import { useState, useCallback } from "react";
import {
  getSlackChannels as fetchSlackChannelsApi,
  getSlackUsers as fetchSlackUsersApi,
  getJiraProjects as fetchJiraProjectsApi,
  getJiraUsers as fetchJiraUsersApi,
  getGoogleDocs as fetchGoogleDocsApi,
  getGoogleSheets as fetchGoogleSheetsApi,
} from "../services/composioApi";

/**
 * Custom hook for fetching action card dropdown data
 * Fetches channels, projects, users etc. for action cards
 */
const useActionCardData = () => {
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
    setIsLoading(prev => ({ ...prev, slackChannels: true }));
    try {
      const response = await fetchSlackChannelsApi({ limit: 100 });
      // API returns { data: { data: { channels: [...] } } }
      const channels = response?.data?.data?.channels || response?.data?.channels || response?.channels || [];
      setSlackChannels(channels);
      setErrors(prev => ({ ...prev, slackChannels: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Slack channels:", err);
      setErrors(prev => ({ ...prev, slackChannels: err.message }));
      setSlackChannels([]);
    } finally {
      setIsLoading(prev => ({ ...prev, slackChannels: false }));
    }
  }, []);

  /**
   * Fetch Slack users for @mentions
   */
  const fetchSlackUsers = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, slackUsers: true }));
    try {
      const response = await fetchSlackUsersApi({ limit: 100 });
      // API returns { data: { data: { members: [...] } } }
      const users = response?.data?.data?.members || response?.data?.members || response?.members || [];
      setSlackUsers(users);
      setErrors(prev => ({ ...prev, slackUsers: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Slack users:", err);
      setErrors(prev => ({ ...prev, slackUsers: err.message }));
      setSlackUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, slackUsers: false }));
    }
  }, []);

  /**
   * Fetch Jira projects
   */
  const fetchJiraProjects = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, jiraProjects: true }));
    try {
      const response = await fetchJiraProjectsApi({ maxResults: 50 });
      const projects = response?.data?.projects || response?.projects || [];
      setJiraProjects(projects);
      setErrors(prev => ({ ...prev, jiraProjects: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Jira projects:", err);
      setErrors(prev => ({ ...prev, jiraProjects: err.message }));
      setJiraProjects([]);
    } finally {
      setIsLoading(prev => ({ ...prev, jiraProjects: false }));
    }
  }, []);

  /**
   * Fetch Jira users for assignee suggestions
   */
  const fetchJiraUsers = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, jiraUsers: true }));
    try {
      const response = await fetchJiraUsersApi({ maxResults: 50 });
      const users = response?.data?.users || response?.users || [];
      setJiraUsers(users);
      setErrors(prev => ({ ...prev, jiraUsers: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Jira users:", err);
      setErrors(prev => ({ ...prev, jiraUsers: err.message }));
      setJiraUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, jiraUsers: false }));
    }
  }, []);

  /**
   * Fetch Google Docs list (optional)
   */
  const fetchGoogleDocs = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, googleDocs: true }));
    try {
      const response = await fetchGoogleDocsApi({ maxResults: 20 });
      const docs = response?.data?.files || response?.files || [];
      setGoogleDocs(docs);
      setErrors(prev => ({ ...prev, googleDocs: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Google Docs:", err);
      setErrors(prev => ({ ...prev, googleDocs: err.message }));
      setGoogleDocs([]);
    } finally {
      setIsLoading(prev => ({ ...prev, googleDocs: false }));
    }
  }, []);

  /**
   * Fetch Google Sheets list (optional)
   */
  const fetchGoogleSheets = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, googleSheets: true }));
    try {
      const response = await fetchGoogleSheetsApi({ maxResults: 20 });
      const sheets = response?.data?.files || response?.files || [];
      setGoogleSheets(sheets);
      setErrors(prev => ({ ...prev, googleSheets: null }));
    } catch (err) {
      console.error("[ActionCardData] Failed to fetch Google Sheets:", err);
      setErrors(prev => ({ ...prev, googleSheets: err.message }));
      setGoogleSheets([]);
    } finally {
      setIsLoading(prev => ({ ...prev, googleSheets: false }));
    }
  }, []);

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
