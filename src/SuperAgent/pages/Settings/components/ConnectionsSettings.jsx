import React, { useState, useEffect, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { MenuDots, PlugCircle } from "@solar-icons/react";
import { Loader2 } from "lucide-react";
import ConnectorModal from "../../../components/ConnectorModal";
import BigQueryConnectionModal from "../../../components/BigQueryConnectionModal";
import useComposioConnections from "../../../../hooks/useComposioConnections";
import { listBqConnections } from "../../../../services/bigqueryApi";

// Connector icon URLs - same as ChatInput integrations
const CONNECTOR_ICONS = {
  gmail: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
  "google-drive": "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
  "google-calendar": "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
  "google-docs": "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
  "google-sheets": "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
  jira: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
  slack: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
};

// All available connectors - matches supported integrations
const ALL_CONNECTORS = [
  {
    id: "gmail",
    name: "Gmail",
    slug: "gmail",
    description: "Search, create, and manage your emails across your studio",
    icon: CONNECTOR_ICONS.gmail,
    category: "communication",
    website: "https://mail.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    slug: "google-drive",
    description: "Store, share, and access files from anywhere",
    icon: CONNECTOR_ICONS["google-drive"],
    category: "productivity",
    website: "https://drive.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    slug: "google-calendar",
    description: "Schedule meetings and manage your calendar events",
    icon: CONNECTOR_ICONS["google-calendar"],
    category: "productivity",
    website: "https://calendar.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: "google-docs",
    name: "Google Docs",
    slug: "google-docs",
    description: "Create, edit, and collaborate on documents",
    icon: CONNECTOR_ICONS["google-docs"],
    category: "productivity",
    website: "https://docs.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    slug: "google-sheets",
    description: "Create and edit spreadsheets, analyze data",
    icon: CONNECTOR_ICONS["google-sheets"],
    category: "productivity",
    website: "https://sheets.google.com",
    privacyPolicy: "https://policies.google.com/privacy",
  },
  {
    id: "jira",
    name: "Jira",
    slug: "jira",
    description: "Plan and track projects, tasks, and team workflows in Jira",
    icon: CONNECTOR_ICONS.jira,
    category: "project_management",
    website: "https://www.atlassian.com/software/jira",
    privacyPolicy: "https://www.atlassian.com/legal/privacy-policy",
  },
  {
    id: "slack",
    name: "Slack",
    slug: "slack",
    description: "Search and post messages across your Slack workspace",
    icon: CONNECTOR_ICONS.slack,
    category: "communication",
    website: "https://slack.com",
    privacyPolicy: "https://slack.com/trust/privacy/privacy-policy",
  },
];

// Icon component that renders image from URL or custom component
const ConnectorIcon = ({ src, alt }) => {
  return (
    <div className="size-[50px] rounded-lg border border-[#dfdfdf] rounded-[2px] flex items-center justify-center overflow-hidden shrink-0">
      <img src={src} alt={alt} className="size-[30px] object-contain" />
    </div>
  );
};

const ConnectorCard = ({
  connector,
  isInstalled = false,
  isLoading = false,
  onConnect,
  onDeactivate,
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#f6f6f6] last:border-b-0">
      <div className="flex items-center gap-4">
        <ConnectorIcon src={connector.icon} alt={connector.name} />
        <div className="flex flex-col gap-0.5">
          <span className="font-urbanist font-medium text-sm text-[#141414]">
            {connector.name}
          </span>
          <span className="font-urbanist text-sm font-medium text-[#b0b0b0]">
            {connector.description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isInstalled ? (
          <>
            <span className="font-urbanist font-medium text-[14px] text-[#1F6744]">
              Connected
            </span>
            <Menu as="div" className="relative">
              <Menu.Button
                className="p-1 hover:bg-[#f6f6f6] rounded transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#6D6D6D]" />
                ) : (
                  <MenuDots weight="Bold" size={20} color="#6D6D6D" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-1 w-36 origin-top-right bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-10 overflow-hidden">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onDeactivate?.(connector)}
                        className={`w-full flex items-center gap-2 text-left px-3 py-2.5 font-urbanist text-[14px] text-[#141414] ${
                          active ? "bg-[#f6f6f6]" : ""
                        }`}
                      >
                        <PlugCircle weight={"Broken"} size={20} color="#6d6d6d" />
                        Disconnect
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </>
        ) : (
          <button
            onClick={() => onConnect?.(connector)}
            disabled={isLoading}
            className="px-6 py-2 border border-[#141414] rounded-lg font-urbanist font-medium text-[14px] text-[#141414] hover:bg-[#f6f6f6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const ConnectionsSettings = ({ studioData }) => {
  // Use the Composio connections hook
  const {
    connections,
    isLoading,
    error,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    isConnected,
    getConnection,
  } = useComposioConnections();

  // Modal state
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);

  // BigQuery state
  const [showBqModal, setShowBqModal] = useState(false);
  const [bqConnection, setBqConnection] = useState(null);
  const [bqLoading, setBqLoading] = useState(true);

  const fetchBqConnection = async () => {
    setBqLoading(true);
    try {
      const res = await listBqConnections();
      setBqConnection(res.data?.[0] || null);
    } catch {
      setBqConnection(null);
    } finally {
      setBqLoading(false);
    }
  };

  useEffect(() => {
    fetchBqConnection();
  }, []);

  // Get installed connectors from API connections
  const installedConnectors = ALL_CONNECTORS.filter((connector) => {
    return isConnected(connector.slug);
  }).map((connector) => {
    const connection = getConnection(connector.slug);
    return {
      ...connector,
      connectionId: connection?.connectionId,
      connectedAt: connection?.connectedAt,
      status: "connected",
    };
  });

  // Filter out installed connectors from available ones
  const availableConnectors = ALL_CONNECTORS.filter((connector) => {
    return !isConnected(connector.slug);
  });

  // Handler for opening the connector modal
  const handleConnectClick = (connector) => {
    setSelectedConnector(connector);
    setShowConnectorModal(true);
  };

  // Handler for closing the modal
  const handleCloseModal = () => {
    setShowConnectorModal(false);
    setSelectedConnector(null);
  };

  // Handler for initiating connection from modal
  const handleConnect = async (connectorSlug) => {
    const result = await connect(connectorSlug);
    if (result.success) {
      handleCloseModal();
    }
  };

  // Handler for deactivating a connector
  const handleDeactivate = async (connector) => {
    const connection = getConnection(connector.slug);
    if (!connection?.connectionId) {
      console.error("No connection ID found for:", connector.slug);
      return;
    }

    setDisconnectingId(connection.connectionId);
    try {
      await disconnect(connection.connectionId);
    } finally {
      setDisconnectingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F6744]" />
        <span className="ml-3 font-urbanist text-[#6d6d6d]">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-urbanist text-[14px] text-red-600">{error}</p>
        </div>
      )}

      {/* Installed Connectors Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Installed Connectors
        </h3>
        <div className="border border-[#f6f6f6] rounded-lg px-6">
          {installedConnectors.length > 0 ? (
            installedConnectors.map((connector) => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                isInstalled={true}
                isLoading={disconnectingId === connector.connectionId}
                onDeactivate={handleDeactivate}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="font-urbanist text-[14px] text-[#6d6d6d]">
                No connectors installed yet. Connect your first integration
                below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available Connectors Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Available Connectors
        </h3>
        <div className="border border-[#f6f6f6] rounded-lg px-6">
          {availableConnectors.length > 0 ? (
            availableConnectors.map((connector) => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                isInstalled={false}
                isLoading={isConnecting}
                onConnect={handleConnectClick}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="font-urbanist text-[14px] text-[#6d6d6d]">
                All available connectors have been installed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BigQuery Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Data Connections
        </h3>
        <div className="border border-[#f6f6f6] rounded-lg px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="size-[50px] rounded-lg border border-[#dfdfdf] rounded-[2px] flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="https://cdn.worldvectorlogo.com/logos/google-bigquery-logo-1.svg"
                  alt="BigQuery"
                  className="size-[30px] object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-urbanist font-medium text-sm text-[#141414]">
                  Google BigQuery
                </span>
                <span className="font-urbanist text-sm font-medium text-[#b0b0b0]">
                  Connect your BigQuery data warehouse for analytics
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bqLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#6d6d6d]" />
              ) : bqConnection ? (
                <>
                  <span className="font-urbanist font-medium text-[14px] text-[#1F6744]">
                    Connected
                  </span>
                  <button
                    onClick={() => setShowBqModal(true)}
                    className="p-1 hover:bg-[#f6f6f6] rounded transition-colors"
                  >
                    <MenuDots weight="Bold" size={20} color="#6D6D6D" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowBqModal(true)}
                  className="px-6 py-2 border border-[#141414] rounded-lg font-urbanist font-medium text-[14px] text-[#141414] hover:bg-[#f6f6f6] transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connector Modal */}
      <ConnectorModal
        integration={selectedConnector}
        isOpen={showConnectorModal}
        onClose={handleCloseModal}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />

      {/* BigQuery Modal */}
      <BigQueryConnectionModal
        isOpen={showBqModal}
        onClose={() => setShowBqModal(false)}
        onConnectionChange={fetchBqConnection}
      />
    </div>
  );
};

export default ConnectionsSettings;
