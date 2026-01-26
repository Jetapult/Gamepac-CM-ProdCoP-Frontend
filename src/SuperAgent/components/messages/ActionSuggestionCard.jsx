import React from "react";

// Integration icons mapping
const integrationIcons = {
  gmail: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
  jira: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
  slack: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
  "google-drive": "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
  "google-calendar": "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
  "google-docs": "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
  "google-sheets": "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
};

// Integration display names
const integrationNames = {
  gmail: "Gmail",
  jira: "Jira",
  slack: "Slack",
  "google-drive": "Google Drive",
  "google-calendar": "Google Calendar",
  "google-docs": "Google Docs",
  "google-sheets": "Google Sheets",
};

// Map backend action_type to integration key and action label
const actionTypeConfig = {
  slack_message: { integration: "slack", label: "Post Message" },
  slack_task: { integration: "slack", label: "Create Task" },
  jira_issue: { integration: "jira", label: "Create Issue" },
  calendar_event: { integration: "google-calendar", label: "Create Event" },
  google_docs: { integration: "google-docs", label: "Create Doc" },
  google_sheets: { integration: "google-sheets", label: "Create Sheet" },
  gmail: { integration: "gmail", label: "Send Email" },
  email: { integration: "gmail", label: "Send Email" },
};

// Fallback action labels for direct integration prop usage
const defaultActionLabels = {
  gmail: "Send",
  jira: "Create",
  slack: "Post",
  "google-drive": "Save",
  "google-calendar": "Schedule",
  "google-docs": "Create",
  "google-sheets": "Create",
  default: "Execute",
};

const ActionSuggestionCard = ({
  actionType,
  integration: integrationProp,
  title,
  description = "Send an email to Josh (Game Designer) sharing the Game Designer Report telling him that DAU # are rising exponentially",
  payload,
  onCancel,
  onAction,
  onConnect,
  userAvatar,
  isConnected = true,
  isLoading = false,
}) => {
  // Resolve integration and label from actionType or fallback to integration prop
  const config = actionType ? actionTypeConfig[actionType] : null;
  const integration = config?.integration || integrationProp || "gmail";
  const actionLabel = config?.label || defaultActionLabels[integration] || defaultActionLabels.default;
  
  const iconUrl = integrationIcons[integration] || integrationIcons.gmail;
  const integrationName = integrationNames[integration] || integration;

  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-[#f1f1f1] rounded-xl max-w-[600px]">
      {/* Integration Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-[#f6f7f8] flex items-center justify-center">
        <img
          src={iconUrl}
          alt={integration}
          className="w-6 h-6 object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[15px] text-[#141414] leading-[22px]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {description}
        </p>
        {/* Not connected hint */}
        {!isConnected && (
          <p
            className="text-[13px] text-[#f59e0b] mt-2 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            You're not connected to {integrationName}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Cancel
        </button>
        {isConnected ? (
          <button
            onClick={onAction}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {userAvatar && (
              <img
                src={userAvatar}
                alt="User"
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            {isLoading ? "Processing..." : actionLabel}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionSuggestionCard;
