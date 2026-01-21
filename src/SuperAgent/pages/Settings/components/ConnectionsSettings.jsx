import React, { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { MenuDots, PlugCircle } from "@solar-icons/react";
import ConnectorModal from "../../../components/ConnectorModal";
import googleSuiteIcon from "../../../../assets/super-agents/google-suite-icon.svg";


// Connector icon URLs - same as ChatInput integrations
const CONNECTOR_ICONS = {
  gmail: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
  jira: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
  slack: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
};

// All available connectors - matches ChatInput integrations
const ALL_CONNECTORS = [
  {
    id: "google_suite",
    name: "Google Suite",
    slug: "google-suite",
    description: "Search, create, and manage your emails, calendar events and save art-facts to your drive",
    icon: googleSuiteIcon,
    category: "productivity",
  },
  {
    id: "gmail",
    name: "Gmail",
    slug: "gmail",
    description: "Search, create, and manage your emails across your studio",
    icon: CONNECTOR_ICONS.gmail,
    category: "communication",
  },
  {
    id: "slack",
    name: "Slack",
    slug: "slack",
    description: "Search and post messages across your Slack workspace",
    icon: CONNECTOR_ICONS.slack,
    category: "communication",
  },
  {
    id: "jira",
    name: "Jira",
    slug: "jira",
    description: "Plan and track projects, tasks, and team workflows in Jira",
    icon: CONNECTOR_ICONS.jira,
    category: "project_management",
  },
  {
    id: "notion",
    name: "Notion",
    slug: "notion",
    description: "Search and create content on your Notion pages",
    icon: CONNECTOR_ICONS.notion,
    category: "documentation",
  },
];

// Mock installed connectors - this will be fetched from API later
const MOCK_INSTALLED_CONNECTORS = [
  {
    id: "google_suite",
    name: "Google Suite",
    slug: "google-suite",
    description: "Search, create, and manage your emails, calendar events and save art-facts to your drive",
    icon: googleSuiteIcon,
    status: "connected",
    connectedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "gmail",
    name: "Gmail",
    slug: "gmail",
    description: "Search, create, and manage your emails across your studio",
    icon: CONNECTOR_ICONS.gmail,
    status: "connected",
    connectedAt: "2024-01-10T14:20:00Z",
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
              <Menu.Button className="p-1 hover:bg-[#f6f6f6] rounded transition-colors">
                <MenuDots weight="Bold" size={20} color="#6D6D6D" />
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
                        Deactivate
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
            className="px-6 py-2 border border-[#141414] rounded-lg font-urbanist font-medium text-[14px] text-[#141414] hover:bg-[#f6f6f6] transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const ConnectionsSettings = ({ studioData }) => {
  // State for installed connectors - will be fetched from API
  const [installedConnectors, setInstalledConnectors] = useState(
    MOCK_INSTALLED_CONNECTORS
  );

  // Modal state
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);

  // Filter out installed connectors from available ones
  const availableConnectors = ALL_CONNECTORS.filter(
    (connector) => !installedConnectors.find((ic) => ic.id === connector.id)
  );

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

  // Handler for successful connection from modal
  const handleConnectSuccess = (connectorSlug) => {
    // Find the connector that was connected
    const connector = selectedConnector ||
      ALL_CONNECTORS.find((c) => c.slug === connectorSlug);

    if (connector) {
      // Add to installed connectors
      const newInstalled = {
        ...connector,
        status: "connected",
        connectedAt: new Date().toISOString(),
      };
      setInstalledConnectors((prev) => [...prev, newInstalled]);
    }

    handleCloseModal();
  };

  // Handler for deactivating a connector
  const handleDeactivate = async (connector) => {
    try {
      // TODO: Integrate with Composio MCP server
      // Example flow:
      // 1. Call Composio API to revoke OAuth token
      // 2. Delete connection from backend
      // 3. Update local state

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove from installed connectors
      setInstalledConnectors((prev) =>
        prev.filter((c) => c.id !== connector.id)
      );
    } catch (error) {
      console.error("Failed to deactivate:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
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

      {/* Connector Modal */}
      <ConnectorModal
        integration={selectedConnector}
        isOpen={showConnectorModal}
        onClose={handleCloseModal}
        onConnect={handleConnectSuccess}
      />
    </div>
  );
};

export default ConnectionsSettings;
