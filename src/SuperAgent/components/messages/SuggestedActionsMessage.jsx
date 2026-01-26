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
  jiraProjects = [],
  // Loading states
  isLoadingChannels = false,
  isLoadingProjects = false,
  // Fetch functions
  onFetchSlackChannels,
  onFetchJiraProjects,
  // Action handlers
  onSend,
  onCancel,
}) => {
  const [dismissedActions, setDismissedActions] = useState([]);
  const [expandedActions, setExpandedActions] = useState([]);

  const handleCancel = (actionIndex) => {
    setDismissedActions((prev) => [...prev, actionIndex]);
  };

  const handleSend = (action, payload) => {
    console.log("[SuggestedActions] Sending action:", action.action_type, payload);
    onSend?.(action, payload);
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

    // Common props for all cards
    const commonProps = {
      onCancel: () => toggleExpand(index),
    };

    switch (action_type) {
      case "slack_message":
        return (
          <SlackMessageCard
            key={index}
            channel={payload?.channel || "#general"}
            text={payload?.text || ""}
            channels={slackChannels}
            onSend={(data) => handleSend(action, data)}
            onFocus={onFetchSlackChannels}
            isConnected={isConnected?.("slack")}
            onConnect={() => onConnect?.("slack")}
            isLoadingChannels={isLoadingChannels}
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
            onSend={(data) => handleSend(action, data)}
            onFocus={onFetchSlackChannels}
            isConnected={isConnected?.("slack")}
            onConnect={() => onConnect?.("slack")}
            isLoadingChannels={isLoadingChannels}
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
            onSend={(data) => handleSend(action, data)}
            onFocus={onFetchJiraProjects}
            isConnected={isConnected?.("jira")}
            onConnect={() => onConnect?.("jira")}
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
            onSend={(data) => handleSend(action, data)}
            isConnected={isConnected?.("google-calendar")}
            onConnect={() => onConnect?.("google-calendar")}
            {...commonProps}
          />
        );

      case "google_docs":
        return (
          <GoogleDocsCard
            key={index}
            doc_title={payload?.doc_title || ""}
            content_summary={payload?.content_summary || ""}
            onSend={(data) => handleSend(action, data)}
            isConnected={isConnected?.("google-docs")}
            onConnect={() => onConnect?.("google-docs")}
            {...commonProps}
          />
        );

      case "google_sheets":
        return (
          <GoogleSheetsCard
            key={index}
            sheet_title={payload?.sheet_title || ""}
            data_summary={payload?.data_summary || ""}
            onSend={(data) => handleSend(action, data)}
            isConnected={isConnected?.("google-sheets")}
            onConnect={() => onConnect?.("google-sheets")}
            {...commonProps}
          />
        );

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
            onSend={(data) => handleSend(action, data)}
            isConnected={isConnected?.("gmail")}
            onConnect={() => onConnect?.("gmail")}
            {...commonProps}
          />
        );

      default:
        console.warn(`[SuggestedActions] Unknown action type: ${action_type}`);
        return null;
    }
  };

  // Filter out dismissed actions
  const visibleActions = actions.filter((_, index) => !dismissedActions.includes(index));

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
        return expandedActions.includes(index)
          ? renderExpandedCard(action, index)
          : renderCollapsedCard(action, index);
      })}
    </div>
  );
};

export default SuggestedActionsMessage;
