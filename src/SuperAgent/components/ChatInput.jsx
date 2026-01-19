import React, { useEffect, useRef, useState } from "react";
import {
  CloseCircle,
  CloseSquare,
  FileText,
  Paperclip,
  Plain,
  PlugCircle,
  SsdRound,
  StopCircle,
} from "@solar-icons/react";
import {
  uploadAttachment,
  uploadLiveopsAttachment,
  createLiveopsSession,
  validateFile,
  getFileTypeFromName,
  isImageFile,
  isVideoFile,
  MAX_ATTACHMENTS,
  ALLOWED_EXTENSIONS,
} from "../../services/superAgentApi";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedTemplate } from "../../store/reducer/superAgent";
import ConnectorModal from "./ConnectorModal";
import AddConnectorsModal from "./AddConnectorsModal";
import pdfIcon from "../../assets/file-icons/pdf.png";
import wordIcon from "../../assets/file-icons/word.png";
import excelIcon from "../../assets/file-icons/excel.png";
import mediaIcon from "../../assets/file-icons/media.png";
import codeIcon from "../../assets/file-icons/code.png";

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
    const isConnected = connectedIntegrations?.length
      ? connectedIntegrations?.includes(integration.slug)
      : false;
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
          const isConnected = connectedIntegrations?.length
            ? connectedIntegrations?.includes(integration.slug)
            : false;
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

const FILE_TYPE_ICONS = {
  pdf: pdfIcon,
  doc: wordIcon,
  docx: wordIcon,
  xls: excelIcon,
  xlsx: excelIcon,
  csv: excelIcon,
  txt: codeIcon,
  png: mediaIcon,
  jpg: mediaIcon,
  jpeg: mediaIcon,
  svg: mediaIcon,
  mp4: mediaIcon,
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPreview = ({ attachment, onRemove }) => {
  const { name, fileType, size, progress, status, previewUrl } = attachment;
  const isImage = ["png", "jpg", "jpeg", "svg"].includes(fileType);
  const isVideo = fileType === "mp4";
  const hasPreview = (isImage || isVideo) && previewUrl;
  const fileIcon = FILE_TYPE_ICONS[fileType] || mediaIcon;

  return (
    <div className="relative group">
      <div
        className={`relative flex items-center gap-2 p-2 rounded-lg border ${
          status === "error"
            ? "border-red-300 bg-red-50"
            : "border-[#e6e6e6] bg-white"
        }`}
        style={{
          minWidth: "140px",
          maxWidth: "180px",
          height: "52px",
        }}
      >
        {hasPreview ? (
          <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
            {isImage ? (
              <img
                src={previewUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                muted
              />
            )}
            {status === "uploading" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ffffff40"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeDasharray={`${progress * 0.88} 88`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <img
            src={fileIcon}
            alt={fileType}
            className="w-8 h-8 shrink-0 object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[#141414] font-urbanist font-medium truncate">
            {name}
          </p>
          <p className="text-[10px] text-[#6D6D6D] font-urbanist">
            {formatFileSize(size)}
          </p>
          {status === "uploading" && (
            <div className="mt-1 h-1 bg-[#e6e6e6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1f6744] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {status === "error" && (
          <span className="text-[10px] text-red-500 font-urbanist">Failed</span>
        )}

        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-[#e6e6e6] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[#f6f6f6]"
        >
          <CloseCircle weight="Bold" size={12} color="#6D6D6D" />
        </button>
      </div>
    </div>
  );
};

const ChatInput = ({
  onSendMessage,
  isThinking = false,
  onStop,
  agentSlug = "",
  liveopsSessionId = null,
  onLiveopsSessionCreated = null,
}) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [showIntegrationDropdown, setShowIntegrationDropdown] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showAddConnectorsModal, setShowAddConnectorsModal] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState();
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const selectedTemplate = useSelector(
    (state) => state.superAgent.selectedTemplate,
  );
  const selectedAgent = useSelector((state) => state.superAgent.selectedAgent);
  const userRef = useRef(null);
  const dropdownRef = useRef(null);
  const integrationDropdownRef = useRef(null);
  const uploadQueueRef = useRef([]);

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
        return [...(prev || []), integrationSlug];
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

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setShowAttachmentDropdown(false);
    setUploadError(null);

    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      setUploadError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setUploadError(
        `Only ${remainingSlots} more file(s) can be added. Max ${MAX_ATTACHMENTS} attachments.`,
      );
    }

    for (const file of filesToUpload) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error);
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const fileType = getFileTypeFromName(file.name);
      const previewUrl =
        isImageFile(fileType) || isVideoFile(fileType)
          ? URL.createObjectURL(file)
          : null;

      const newAttachment = {
        tempId,
        file,
        name: file.name,
        fileType,
        size: file.size,
        progress: 0,
        status: "uploading",
        previewUrl,
        id: null,
        file_url: null,
      };

      setAttachments((prev) => [...prev, newAttachment]);
      uploadQueueRef.current.push({ tempId, file });
    }

    processUploadQueue();
    e.target.value = "";
  };

  const processUploadQueue = async () => {
    if (isUploading || uploadQueueRef.current.length === 0) return;

    setIsUploading(true);

    // For liveops agent, ensure we have a session before uploading
    let currentSessionId = liveopsSessionId;
    if (agentSlug === "liveops" && !currentSessionId) {
      try {
        const sessionResponse = await createLiveopsSession();
        if (sessionResponse.success && sessionResponse.data?.session_id) {
          currentSessionId = sessionResponse.data.session_id;
          if (onLiveopsSessionCreated) {
            onLiveopsSessionCreated(currentSessionId);
          }
          console.log(
            "[Liveops] Created session for upload:",
            currentSessionId,
          );
        }
      } catch (err) {
        console.error("[Liveops] Failed to create session:", err);
        setUploadError("Failed to create liveops session for upload");
        setIsUploading(false);
        return;
      }
    }

    while (uploadQueueRef.current.length > 0) {
      const { tempId, file } = uploadQueueRef.current.shift();

      try {
        let response;
        const progressCallback = (progress) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.tempId === tempId ? { ...att, progress } : att,
            ),
          );
        };

        // Use liveops upload endpoint for liveops agent
        if (agentSlug === "liveops" && currentSessionId) {
          response = await uploadLiveopsAttachment(
            file,
            currentSessionId,
            progressCallback,
          );
          // Liveops response has different structure: { attachment, liveops_uploaded, description }
          if (response.success && response.data) {
            const { attachment, liveops_uploaded, description } = response.data;
            setAttachments((prev) =>
              prev.map((att) =>
                att.tempId === tempId
                  ? {
                      ...att,
                      status: "uploaded",
                      progress: 100,
                      id: attachment.id,
                      file_url: attachment.file_url,
                      liveops_uploaded,
                      description, // Description for non-liveops-supported files
                    }
                  : att,
              ),
            );
          } else {
            throw new Error("Upload failed");
          }
        } else {
          // Standard upload for other agents
          response = await uploadAttachment(file, progressCallback);
          if (response.success && response.data) {
            setAttachments((prev) =>
              prev.map((att) =>
                att.tempId === tempId
                  ? {
                      ...att,
                      status: "uploaded",
                      progress: 100,
                      id: response.data.id,
                      file_url: response.data.file_url,
                    }
                  : att,
              ),
            );
          } else {
            throw new Error("Upload failed");
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        setAttachments((prev) =>
          prev.map((att) =>
            att.tempId === tempId
              ? { ...att, status: "error", progress: 0 }
              : att,
          ),
        );
        setUploadError(
          error.response?.data?.message || "Failed to upload file",
        );
      }
    }

    setIsUploading(false);
  };

  const removeAttachment = (tempId) => {
    setAttachments((prev) => {
      const attachment = prev.find((att) => att.tempId === tempId);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((att) => att.tempId !== tempId);
    });
    uploadQueueRef.current = uploadQueueRef.current.filter(
      (item) => item.tempId !== tempId,
    );
  };

  const handleSend = () => {
    const hasContent =
      inputValue.trim() || attachments.some((att) => att.status === "uploaded");
    const allUploaded = attachments.every(
      (att) => att.status === "uploaded" || att.status === "error",
    );

    if (
      hasContent &&
      onSendMessage &&
      !isThinking &&
      !isUploading &&
      allUploaded &&
      selectedAgent?.id
    ) {
      const uploadedAttachments = attachments
        .filter((att) => att.status === "uploaded" && att.id)
        .map((att) => ({
          id: att.id,
          name: att.name,
          file_type: att.fileType,
          file_url: att.file_url,
          size: att.size,
        }));

      onSendMessage(inputValue, uploadedAttachments);
      setInputValue("");
      attachments.forEach((att) => {
        if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
      });
      setAttachments([]);
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
    <div className="w-full bg-[#f6f6f6] border border-[#f6f6f6] rounded-2xl p-2 px-4 pt-3 mb-5 relative flex flex-col">
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
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.tempId}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.tempId)}
            />
          ))}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 text-sm flex-1">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <CloseCircle weight="Linear" size={16} />
          </button>
        </div>
      )}

      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Generate a professional sentiment analysis report"
        className="w-full bg-transparent border-none outline-none text-lg text-[#141414] placeholder:text-[#b0b0b0] font-urbanist "
        rows={selectedTemplate.id || attachments.length > 0 ? 2 : 4}
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
              <div className="absolute bottom-full left-0 mb-2 w-[250px] bg-white border border-[#f1f1f1] rounded-[8px] shadow-lg z-50 p-2">
                <div className="relative overflow-hidden">
                  <button
                    className={`w-full flex items-center gap-3 p-2 hover:bg-[#f6f7f8] hover:rounded-[8px] transition-colors ${
                      attachments.length >= MAX_ATTACHMENTS
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      attachments.length < MAX_ATTACHMENTS &&
                      userRef.current?.click()
                    }
                    disabled={attachments.length >= MAX_ATTACHMENTS}
                  >
                    <FileText weight="Linear" size={20} color="#6D6D6D" />
                    <span className="text-[14px] text-[#141414] font-urbanist font-medium">
                      Add from local files
                    </span>
                    <span className="text-[12px] text-[#6D6D6D] font-urbanist ml-auto">
                      {attachments.length}/{MAX_ATTACHMENTS}
                    </span>
                    <input
                      type="file"
                      ref={userRef}
                      className="hidden"
                      onChange={handleFileSelect}
                      accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(
                        ",",
                      )}
                      multiple
                    />
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
              (!inputValue.trim() &&
                !attachments.some((att) => att.status === "uploaded")) ||
              !selectedAgent?.id ||
              isUploading
                ? "bg-[#E6E6E6]"
                : "bg-[linear-gradient(333deg,#11A85F_13.46%,#1F6744_103.63%)]"
            }`}
            disabled={
              (!inputValue.trim() &&
                !attachments.some((att) => att.status === "uploaded")) ||
              !selectedAgent?.id ||
              isUploading
            }
          >
            <Plain
              weight={"Linear"}
              size={20}
              color={
                (!inputValue.trim() &&
                  !attachments.some((att) => att.status === "uploaded")) ||
                !selectedAgent?.id ||
                isUploading
                  ? "#B0B0B0"
                  : "#FFFFFF"
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
