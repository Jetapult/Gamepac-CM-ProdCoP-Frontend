import React, { useEffect, useRef, useState } from "react";
import {
  CloseSquare,
  FileText,
  Paperclip,
  Plain,
  PlugCircle,
  SsdRound,
  StopCircle,
} from "@solar-icons/react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedTemplate } from "../../store/reducer/superAgent";
import ConnectorModal from "./ConnectorModal";
import AddConnectorsModal from "./AddConnectorsModal";

const integrations = [
  {
    id: 1,
    name: "Gmail",
    slug: "gmail",
    icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
    connected: false,
  },
  {
    id: 3,
    name: "Google Drive",
    slug: "google-drive",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    connected: false,
  },
  {
    id: 5,
    name: "Google Calendar",
    slug: "google-calendar",
    icon: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
    connected: false,
  },
  {
    id: 2,
    name: "Jira",
    slug: "jira",
    icon: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
    connected: false,
  },
  {
    id: 4,
    name: "Slack",
    slug: "slack",
    icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    connected: false,
  },
];

const getIntegrationBySlug = (slug) => {
  return integrations.find((integration) => integration.slug === slug);
};

const IntegrationDropdown = ({
  onClose,
  onIntegrationClick,
  connectedIntegrations,
  onToggleConnection,
  onAddConnectors,
}) => {
  const handleConnect = (integration) => {
    const isConnected = connectedIntegrations?.length ? connectedIntegrations?.includes(integration.slug) : false;
    if (!isConnected) {
      onIntegrationClick(integration);
      onClose();
    }
  };

  const handleToggle = (e, integration) => {
    e.stopPropagation();
    onToggleConnection(integration.slug);
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-[250px] bg-white border border-[#f1f1f1] rounded-[8px] shadow-lg z-50">
      <div className="p-1.5">
        {integrations.map((integration, index) => {
          const isConnected = connectedIntegrations?.length ? connectedIntegrations?.includes(integration.slug) : false;
          return (
            <button
              key={integration.id}
              className={`w-full flex items-center justify-between p-3 transition-colors hover:bg-[#f6f7f8] hover:rounded-[4px]`}
              onClick={() => handleConnect(integration)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={integration.icon}
                  alt={integration.name}
                  className="size-[18px] object-contain"
                />
                <span className="font-urbanist font-medium text-[14px] text-[#30333b]">
                  {integration.name}
                </span>
              </div>
              {isConnected ? (
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={(e) => handleToggle(e, integration)}
                >
                  <div className="w-[36px] h-[20px] bg-[#1f6744] rounded-full transition-colors relative">
                    <div className="absolute top-[2px] right-[2px] w-[16px] h-[16px] bg-white rounded-full transition-transform" />
                  </div>
                </div>
              ) : (
                <span className="font-urbanist font-medium text-[12px] text-[#1f6744]">
                  Connect
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#f1f1f1] p-1.5">
        <button
          className="w-full flex items-center justify-between p-2.5 bg-white rounded-[8px] hover:bg-[#f6f7f8] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectors();
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span className="font-urbanist font-medium text-[14px] text-[#141414]">
              Add connectors
            </span>
          </div>
          <div className="flex items-center -space-x-1.5">
            <div className="size-[28px] rounded-full border border-[#dfdfdf] flex items-center justify-center overflow-hidden">
              <img
                src={integrations[0].icon}
                alt="Gmail"
                className="size-[16px] object-contain"
              />
            </div>
            <div className="size-[28px] rounded-full border border-[#dfdfdf] flex items-center justify-center overflow-hidden">
              <img
                src={integrations[3].icon}
                alt="Jira"
                className="size-[16px] object-contain"
              />
            </div>
            <div className="size-[28px] bg-white rounded-full border border-[#dfdfdf] flex items-center justify-center text-[10px] font-urbanist font-medium text-[#575757]">
              +10
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

const ChatInput = ({ onSendMessage, isThinking = false, onStop }) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [showIntegrationDropdown, setShowIntegrationDropdown] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showAddConnectorsModal, setShowAddConnectorsModal] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState();
  const selectedTemplate = useSelector(
    (state) => state.superAgent.selectedTemplate
  );
  const selectedAgent = useSelector((state) => state.superAgent.selectedAgent);
  const userRef = useRef(null);
  const dropdownRef = useRef(null);
  const integrationDropdownRef = useRef(null);

  const handleIntegrationClick = (integration) => {
    setSelectedIntegration(integration);
    setShowConnectorModal(true);
  };

  const handleCloseModal = () => {
    setShowConnectorModal(false);
    setSelectedIntegration(null);
  };

  const handleToggleConnection = (integrationSlug) => {
    setConnectedIntegrations((prev) => {
      if (prev.includes(integrationSlug)) {
        return prev.filter((slug) => slug !== integrationSlug);
      } else {
        return [...prev, integrationSlug];
      }
    });
  };

  const handleConnectSuccess = (integrationSlug) => {
    setConnectedIntegrations((prev) => {
      if (!prev?.includes(integrationSlug)) {
        return [...prev || [], integrationSlug];
      }
      return prev;
    });
    handleCloseModal();
  };

  const handleAddIntegration = (integration) => {
    setSelectedIntegration(integration);
    setShowAddConnectorsModal(false);
    setShowConnectorModal(true);
  };

  const handleSend = () => {
    if (
      inputValue.trim() &&
      onSendMessage &&
      !isThinking &&
      selectedAgent?.id
    ) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAttachmentDropdown(false);
      }
      if (
        integrationDropdownRef.current &&
        !integrationDropdownRef.current.contains(event.target)
      ) {
        setShowIntegrationDropdown(false);
      }
    };

    if (showAttachmentDropdown || showIntegrationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachmentDropdown, showIntegrationDropdown]);

  return (
    <div className="w-full bg-[#f6f6f6] border border-[#f6f6f6] rounded-2xl p-2 px-4 pt-3 mb-5 relative relative max-h-[190px]">
      {selectedTemplate.id && (
        <div className="flex items-flex-start justify-between gap-2 mb-1 rounded-lg p-2 border border-[#e6e6e6] bg-[#f1f1f1] inline-flex">
          <img
            src={selectedTemplate.image}
            alt={selectedTemplate.title}
            className="w-[66px] h-auto rounded-lg"
          />
          <div className="flex flex-col">
            <p className="text-sm text-[#141414] font-urbanist font-medium">
              {selectedTemplate.title}
            </p>
            <ul className="flex items-center gap-1">
              <li className="text-[13px] text-[#B0B0B0] font-urbanist font-normal first:after:content-[''] first:after:w-[4px] first:after:h-[4px] first:after:bg-[#B0B0B0] first:after:rounded-full first:after:inline-block first:after:ml-1">
                Doc
              </li>
              <li className="text-[13px] text-[#B0B0B0] font-urbanist font-normal">
                12.3 mb
              </li>
            </ul>
          </div>
          <span
            className="cursor-pointer"
            onClick={() => dispatch(setSelectedTemplate({}))}
          >
            <CloseSquare weight={"Linear"} size={16} color="#6D6D6D" />
          </span>
        </div>
      )}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Generate a professional sentiment analysis report"
        className="w-full bg-transparent border-none outline-none text-lg text-[#141414] placeholder:text-[#b0b0b0] font-urbanist "
        rows={selectedTemplate.id ? 2 : 4}
        autoFocus
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-9 h-9 bg-white border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] hover:bg-[#E6E6E6] transition-colors"
              onClick={() => setShowAttachmentDropdown(!showAttachmentDropdown)}
            >
              <Paperclip weight={"Linear"} size={16} color="#6D6D6D" />
            </button>

            {showAttachmentDropdown && (
              <div className="absolute top-full left-0 mt-2 w-[250px] bg-white border border-[#f1f1f1] rounded-[8px] shadow-lg z-50 p-2">
                <div className="relative overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#f6f7f8] hover:rounded-[8px] transition-colors"
                    onClick={() => userRef.current?.click()}
                  >
                    <FileText weight="Linear" size={20} color="#6D6D6D" />
                    <span className="text-[14px] text-[#141414] font-urbanist font-medium">
                      Add from local files
                    </span>
                    <input type="file" ref={userRef} className="hidden" />
                  </button>
                  <hr className="my-1 bg-[#f1f1f1]" />

                  <button className="w-full flex items-center gap-3 p-2 hover:bg-[#f6f7f8] rounded-[8px] transition-colors">
                    <SsdRound weight="Linear" size={20} color="#6D6D6D" />
                    <span className="text-[14px] text-[#141414] font-urbanist font-medium">
                      Choose from GamePac Drive
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={integrationDropdownRef}>
            <button
              className={`w-9 h-9 border border-[#e6e6e6] rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors ${
                showIntegrationDropdown
                  ? "bg-[#f1f1f1]"
                  : "bg-white hover:bg-[#E6E6E6]"
              }`}
              onClick={() =>
                setShowIntegrationDropdown(!showIntegrationDropdown)
              }
            >
              {connectedIntegrations?.length ? (
                <>
                  {connectedIntegrations.map((integration) => (
                    <img
                      key={integration}
                      src={getIntegrationBySlug(integration).icon}
                      alt={integration}
                      className="size-[16px] object-contain"
                    />
                  ))}
                </>
              ) : (
                <PlugCircle weight={"Linear"} size={16} color="#6D6D6D" />
              )}
            </button>

            {showIntegrationDropdown && (
              <IntegrationDropdown
                onClose={() => setShowIntegrationDropdown(false)}
                onIntegrationClick={handleIntegrationClick}
                connectedIntegrations={connectedIntegrations}
                onToggleConnection={handleToggleConnection}
                onAddConnectors={() => {
                  setShowIntegrationDropdown(false);
                  setShowAddConnectorsModal(true);
                }}
              />
            )}
          </div>
        </div>

        {isThinking ? (
          <button
            onClick={onStop}
            className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all cursor-pointer border border-[rgba(255,255,255,0.3)]"
            style={{
              background:
                "linear-gradient(0deg, #E6E6E6 0%, #E6E6E6 100%), radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.00) 12%, rgba(255, 255, 255, 0.20) 24%)",
            }}
          >
            <StopCircle weight={"Bold"} size={20} color="#0f4159" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all relative overflow-hidden cursor-pointer disabled:cursor-not-allowed border border-[rgba(255,255,255,0.3)] ${
              !inputValue.trim() || !selectedAgent?.id
                ? "bg-[#E6E6E6]"
                : "bg-[linear-gradient(333deg,#11A85F_13.46%,#1F6744_103.63%)]"
            }`}
            disabled={!inputValue.trim() || !selectedAgent?.id}
          >
            <Plain
              weight={"Linear"}
              size={20}
              color={
                !inputValue.trim() || !selectedAgent?.id ? "#B0B0B0" : "#FFFFFF"
              }
            />
          </button>
        )}
      </div>

      {/* Connector Modal */}
      <ConnectorModal
        integration={selectedIntegration}
        isOpen={showConnectorModal}
        onClose={handleCloseModal}
        onConnect={handleConnectSuccess}
      />

      {/* Add Connectors Modal */}
      <AddConnectorsModal
        isOpen={showAddConnectorsModal}
        onClose={() => setShowAddConnectorsModal(false)}
        connectedIntegrations={connectedIntegrations}
        onAddIntegration={handleAddIntegration}
      />
    </div>
  );
};

export default ChatInput;
