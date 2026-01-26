import React, { useState } from "react";
import { X, Search, Plus, Check } from "lucide-react";

const allIntegrations = [
  {
    id: 1,
    name: "Gmail",
    slug: "gmail",
    icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
    description:
      "Draft replies, search your inbox, and summarize email threads instantly",
    website: "https://mail.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: 2,
    name: "Google Calendar",
    slug: "google-calendar",
    icon: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
    description:
      "Understand your schedule, manage events, and optimize your time effectively",
    website: "https://calendar.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: 3,
    name: "Google Drive",
    slug: "google-drive",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    description:
      "Store files securely, share documents, and collaborate in real-time",
    website: "https://drive.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: 4,
    name: "Google Docs",
    slug: "google-docs",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
    description:
      "Create, edit, and format documents with ease while working with others",
    website: "https://docs.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: 5,
    name: "Google Sheets",
    slug: "google-sheets",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
    description:
      "Analyze data, create spreadsheets, and visualize information efficiently",
    website: "https://sheets.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: 6,
    name: "Jira",
    slug: "jira",
    icon: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
    description:
      "Host video conferences, connect with colleagues, and share screens effortlessly",
    website: "https://www.atlassian.com/software/jira",
    privacyPolicy: "https://www.atlassian.com/legal/privacy-policy",
  },
  {
    id: 7,
    name: "Slack",
    slug: "slack",
    icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    description:
      "Organize notes, set reminders, and share lists to stay productive",
    website: "https://slack.com",
    privacyPolicy: "https://slack.com/trust/privacy/privacy-policy",
  },
];

const AddConnectorsModal = ({ isOpen, onClose, connectedIntegrations, onAddIntegration }) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredIntegrations = allIntegrations.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddIntegration = (integration) => {
    if (!connectedIntegrations.includes(integration.slug)) {
      onAddIntegration(integration);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.16)] to-[rgba(102,102,102,0.48)]" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-[12px] w-[808px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-5 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2.5">
              <h2 className="font-urbanist font-semibold text-[24px] text-[#30333b] leading-[24px]">
                Supercharge GamePac with essential integrations
              </h2>
              <p className="font-urbanist font-medium text-[14px] text-[#8894a9] leading-[21px]">
                Enable integrations to make Query Pack work smarter—and faster.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6d6d6d] hover:text-[#1f6744] transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative bg-[#f1f1f1] border border-[#e6e6e6] rounded-[6px] h-10 flex items-center px-3 gap-2">
            <Search size={16} className="text-[#a1a9b8]" />
            <input
              type="text"
              placeholder="Search app"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-urbanist font-medium text-[14px] text-[#141414] placeholder:text-[#a1a9b8]"
            />
          </div>
        </div>

        {/* Integration Grid */}
        <div className="flex flex-col gap-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-5">
            {filteredIntegrations.slice(0, 2).map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.slug);
              return (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  isConnected={isConnected}
                  onAdd={handleAddIntegration}
                />
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-5">
            {filteredIntegrations.slice(2, 4).map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.slug);
              return (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  isConnected={isConnected}
                  onAdd={handleAddIntegration}
                />
              );
            })}
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-5">
            {filteredIntegrations.slice(4, 6).map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.slug);
              return (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  isConnected={isConnected}
                  onAdd={handleAddIntegration}
                />
              );
            })}
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-5">
            {filteredIntegrations.slice(6, 8).map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.slug);
              return (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  isConnected={isConnected}
                  onAdd={handleAddIntegration}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const IntegrationCard = ({ integration, isConnected, onAdd }) => {
  return (
    <div className="bg-white border border-[#e6e6e6] rounded-[12px] p-4 flex items-center gap-4">
      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-[45px] h-[50px] border border-[#e6e6e6] rounded-[6px] flex items-center justify-center p-2">
          <img
            src={integration.icon}
            alt={integration.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-[7px] flex-1">
          <p className="font-urbanist font-medium text-[14px] text-[#141414] leading-[21px]">
            {integration.name}
          </p>
          <p className="font-urbanist font-normal text-[12px] text-[#898989] leading-[16px]">
            {integration.description}
          </p>
        </div>
      </div>
      <button
        onClick={() => !isConnected && onAdd(integration)}
        className={`shrink-0 size-5 flex items-center justify-center ${
          isConnected ? "cursor-default" : "cursor-pointer hover:opacity-80"
        }`}
      >
        {isConnected ? (
          <Check size={20} className="text-[#1f6744]" strokeWidth={2} />
        ) : (
          <Plus size={20} className="text-[#6d6d6d]" strokeWidth={2} />
        )}
      </button>
    </div>
  );
};

export default AddConnectorsModal;
