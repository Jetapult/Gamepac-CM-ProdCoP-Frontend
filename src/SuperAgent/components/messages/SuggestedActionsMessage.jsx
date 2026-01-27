import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import SlackMessageCard from "./SlackMessageCard";
import SlackTaskCard from "./SlackTaskCard";
import JiraIssueCard from "./JiraIssueCard";
import CalendarEventCard from "./CalendarEventCard";
import GoogleDocsCard from "./GoogleDocsCard";
import GoogleSheetsCard from "./GoogleSheetsCard";
import EmailDraftCard from "./EmailDraftCard";

// Action type config for icons and labels
const actionTypeConfig = {
  slack_message: {
    icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    label: "Slack Message",
  },
  slack_task: {
    icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    label: "Slack Task",
  },
  jira_issue: {
    icon: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
    label: "Jira Issue",
  },
  calendar_event: {
    icon: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
    label: "Calendar Event",
  },
  google_docs: {
    icon: "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
    label: "Google Doc",
  },
  google_sheets: {
    icon: "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
    label: "Google Sheet",
  },
  gmail: {
    icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
    label: "Email",
  },
  email: {
    icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
    label: "Email",
  },
};

/**
 * Component to render suggested actions from the API response
 * Each action has: action_type, title, description, payload
 */
const SuggestedActionsMessage = ({
  actions = [],
  // Connection status
  isConnected,
  onConnect,
  // Data for dropdowns
  slackChannels = [],
  slackUsers = [],
  jiraProjects = [],
  // Loading states
  isLoadingChannels = false,
  isLoadingUsers = false,
  isLoadingProjects = false,
  // Fetch functions
  onFetchSlackChannels,
  onFetchSlackUsers,
  onFetchJiraProjects,
  // Action handlers
  onSend,
  onCancel,
}) => {
  const [dismissedActions, setDismissedActions] = useState([]);
  const [expandedActions, setExpandedActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState({});
  const [connectingActions, setConnectingActions] = useState({});
  const [completedActions, setCompletedActions] = useState({});

  const handleCancel = (actionIndex) => {
    setDismissedActions((prev) => [...prev, actionIndex]);
  };

  const handleConnect = async (integrationSlug, index) => {
    console.log("[SuggestedActions] Connecting:", integrationSlug);
    setConnectingActions((prev) => ({ ...prev, [index]: true }));
    try {
      await onConnect?.(integrationSlug);
    } catch (err) {
      console.error("[SuggestedActions] Connect failed:", err);
    } finally {
      setConnectingActions((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSend = async (action, payload, index) => {
    console.log("[SuggestedActions] Sending action:", action.action_type, payload);
    setLoadingActions((prev) => ({ ...prev, [index]: true }));
    
    try {
      const result = await onSend?.(action, payload);
      console.log("[SuggestedActions] Action completed:", result);
      setCompletedActions((prev) => ({ ...prev, [index]: { success: true, result } }));
      // Auto-collapse after success
      setTimeout(() => {
        setExpandedActions((prev) => prev.filter((i) => i !== index));
      }, 1500);
    } catch (err) {
      console.error("[SuggestedActions] Action failed:", err);
      setCompletedActions((prev) => ({ 
        ...prev, 
        [index]: { success: false, error: err.message || "Action failed" } 
      }));
    } finally {
      setLoadingActions((prev) => ({ ...prev, [index]: false }));
    }
  };

  const toggleExpand = (index) => {
    setExpandedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderCollapsedCard = (action, index) => {
    const config = actionTypeConfig[action.action_type] || { icon: null, label: action.action_type };
    
    return (
      <div
        key={index}
        className="bg-white border border-[#f1f1f1] rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            {config.icon && (
              <img src={config.icon} alt={config.label} className="w-6 h-6 object-contain" />
            )}
            <div className="flex flex-col">
              <span
                className="text-[14px] font-medium text-[#141414]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {action.title || config.label}
              </span>
              {action.description && (
                <span
                  className="text-[12px] text-[#6d6d6d] line-clamp-1"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {action.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleExpand(index)}
              className="p-1.5 text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-lg transition-colors"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={() => handleCancel(index)}
              className="p-1.5 text-[#6d6d6d] hover:bg-[#f6f6f6] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExpandedCard = (action, index) => {
    const { action_type, payload } = action;
    const isActionLoading = loadingActions[index] || false;
    const isActionConnecting = connectingActions[index] || false;
    const actionResult = completedActions[index];

    // Common props for all cards
    const commonProps = {
      onCancel: () => toggleExpand(index),
      isLoading: isActionLoading,
      isConnecting: isActionConnecting,
    };

    // Show success message if action completed
    if (actionResult?.success) {
      const config = actionTypeConfig[action_type] || { icon: null, label: action_type };
      return (
        <div key={index} className="bg-[#f0fdf4] border border-[#86efac] rounded-xl p-4 flex items-center gap-3">
          {config.icon && <img src={config.icon} alt={config.label} className="w-6 h-6 object-contain" />}
          <span className="text-[14px] text-[#166534] font-medium" style={{ fontFamily: "Urbanist, sans-serif" }}>
            {action.title || config.label} completed successfully!
          </span>
        </div>
      );
    }

    // Show error message if action failed
    if (actionResult && !actionResult.success) {
      const config = actionTypeConfig[action_type] || { icon: null, label: action_type };
      return (
        <div key={index} className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            {config.icon && <img src={config.icon} alt={config.label} className="w-6 h-6 object-contain" />}
            <span className="text-[14px] text-[#dc2626] font-medium" style={{ fontFamily: "Urbanist, sans-serif" }}>
              {action.title || config.label} failed
            </span>
          </div>
          <p className="text-[13px] text-[#991b1b]" style={{ fontFamily: "Urbanist, sans-serif" }}>
            {actionResult.error}
          </p>
          <button
            onClick={() => {
              setCompletedActions((prev) => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
              });
            }}
            className="mt-2 text-[13px] text-[#dc2626] underline"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Try again
          </button>
        </div>
      );
    }

    switch (action_type) {
      case "slack_message":
        return (
          <SlackMessageCard
            key={index}
            channel={payload?.channel || "#general"}
            text={payload?.text || ""}
            channels={slackChannels}
            users={slackUsers}
            onSend={(data) => handleSend(action, data, index)}
            onFocus={() => { onFetchSlackChannels?.(); onFetchSlackUsers?.(); }}
            isConnected={isConnected?.("slack")}
            onConnect={() => handleConnect("slack", index)}
            isLoadingChannels={isLoadingChannels || isLoadingUsers}
            {...commonProps}
          />
        );

      case "slack_task":
        return (
          <SlackTaskCard
            key={index}
            channel={payload?.channel || "#general"}
            task_title={payload?.task_title || ""}
            task_description={payload?.task_description || ""}
            priority={payload?.priority || "Medium"}
            channels={slackChannels}
            users={slackUsers}
            onSend={(data) => handleSend(action, data, index)}
            onFocus={() => { onFetchSlackChannels?.(); onFetchSlackUsers?.(); }}
            isConnected={isConnected?.("slack")}
            onConnect={() => handleConnect("slack", index)}
            isLoadingChannels={isLoadingChannels || isLoadingUsers}
            {...commonProps}
          />
        );

      case "jira_issue":
        return (
          <JiraIssueCard
            key={index}
            project_key={payload?.project_key || ""}
            issue_type={payload?.issue_type || "Task"}
            summary={payload?.summary || ""}
            description={payload?.description || ""}
            priority={payload?.priority || "Medium"}
            labels={payload?.labels || []}
            projects={jiraProjects}
            onSend={(data) => handleSend(action, data, index)}
            onFocus={onFetchJiraProjects}
            isConnected={isConnected?.("jira")}
            onConnect={() => handleConnect("jira", index)}
            isLoadingProjects={isLoadingProjects}
            {...commonProps}
          />
        );

      case "calendar_event":
        return (
          <CalendarEventCard
            key={index}
            summary={payload?.summary || ""}
            description={payload?.description || ""}
            start_date={payload?.start_date || ""}
            start_time={payload?.start_time || "09:00"}
            duration_hours={payload?.duration_hours || 1}
            attendees={payload?.attendees || []}
            time_zone={payload?.time_zone || "UTC"}
            onSend={(data) => handleSend(action, data, index)}
            isConnected={isConnected?.("google-calendar")}
            onConnect={() => handleConnect("google-calendar", index)}
            {...commonProps}
          />
        );

      case "google_docs":
        return (
          <GoogleDocsCard
            key={index}
            doc_title={payload?.doc_title || ""}
            content_summary={payload?.content_summary || ""}
            onSend={(data) => handleSend(action, data, index)}
            isConnected={isConnected?.("google-docs")}
            onConnect={() => handleConnect("google-docs", index)}
            {...commonProps}
          />
        );

      // Google Sheets action hidden for now
      // case "google_sheets":
      //   return (
      //     <GoogleSheetsCard
      //       key={index}
      //       sheet_title={payload?.sheet_title || ""}
      //       data_summary={payload?.data_summary || ""}
      //       onSend={(data) => handleSend(action, data, index)}
      //       isConnected={isConnected?.("google-sheets")}
      //       onConnect={() => handleConnect("google-sheets", index)}
      //       {...commonProps}
      //     />
      //   );

      case "gmail":
      case "email":
        return (
          <EmailDraftCard
            key={index}
            to={payload?.to || []}
            cc={payload?.cc || []}
            bcc={payload?.bcc || []}
            subject={payload?.subject || ""}
            body={payload?.body || ""}
            attachments={payload?.attachments || []}
            onSend={(data) => handleSend(action, data, index)}
            isConnected={isConnected?.("gmail")}
            onConnect={() => handleConnect("gmail", index)}
            {...commonProps}
          />
        );

      default:
        console.warn(`[SuggestedActions] Unknown action type: ${action_type}`);
        return null;
    }
  };

  // Filter out dismissed actions and hidden action types (google_sheets)
  const hiddenActionTypes = ["google_sheets"];
  const visibleActions = actions.filter((action, index) => 
    !dismissedActions.includes(index) && !hiddenActionTypes.includes(action.action_type)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div
        className="text-[14px] font-medium text-[#141414] mb-1"
        style={{ fontFamily: "Urbanist, sans-serif" }}
      >
        Suggested Actions
      </div>
      {actions.map((action, index) => {
        if (dismissedActions.includes(index)) return null;
        if (hiddenActionTypes.includes(action.action_type)) return null;
        return expandedActions.includes(index)
          ? renderExpandedCard(action, index)
          : renderCollapsedCard(action, index);
      })}
    </div>
  );
};

export default SuggestedActionsMessage;
