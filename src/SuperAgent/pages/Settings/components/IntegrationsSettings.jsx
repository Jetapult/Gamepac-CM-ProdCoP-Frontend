import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  CheckCircle,
  AltArrowLeft,
  DangerTriangle,
  SquareTopDown,
  Paperclip,
  AltArrowDown,
  AltArrowUp,
  CloseCircle,
} from "@solar-icons/react";
import appStoreIcon from "../../../../assets/super-agents/app-store-icon.svg";
import playStoreIcon from "../../../../assets/super-agents/google-play-store-icon.svg";
import api from "../../../../api";
import ToastMessage from "../../../../components/ToastMessage";

// Integration status types
const INTEGRATION_STATUS = {
  CONNECTED: "connected",
  NOT_CONFIGURED: "not_configured",
  WARNING: "warning",
};

// All available integrations
const ALL_INTEGRATIONS = [
  {
    id: "play_store",
    name: "Play Store",
    slug: "play-store",
    description:
      "Fetch player reviews, ratings, and performance metrics to identify sentiment trends and feature impact.",
    icon: playStoreIcon,
    documentationUrl: "https://developers.google.com/android-publisher",
    configureUrl: "https://play.google.com/console",
    configFields: [], // Play Store uses OAuth, no manual config needed
  },
  {
    id: "app_store",
    name: "App store",
    slug: "app-store",
    description:
      "Analyze user feedback and update history to generate insights for product improvements and release notes.",
    icon: appStoreIcon,
    documentationUrl: "https://developer.apple.com/documentation/appstoreconnectapi",
    configFields: [
      {
        id: "apple_key_id",
        label: "Key ID",
        type: "text",
        placeholder: "",
      },
      {
        id: "apple_issuer_id",
        label: "Issuer ID",
        type: "text",
        placeholder: "",
      },
      {
        id: "private_key_file",
        label: "Private Key",
        type: "file",
        placeholder: "Add attachment",
        accept: ".p8",
      },
    ],
  },
];

// Integration card component
const IntegrationCard = ({
  integration,
  integrationData,
  onConfigure,
  onGoToConfigure,
}) => {
  const [isGamesListExpanded, setIsGamesListExpanded] = useState(false);

  const status = integrationData?.status || INTEGRATION_STATUS.NOT_CONFIGURED;
  const hasConfigFields = integration.configFields?.length > 0;
  const isConnected = status === INTEGRATION_STATUS.CONNECTED;
  const needsConfiguration = integrationData?.keysConfigured === false;
  const needsDetails =
    status === INTEGRATION_STATUS.WARNING ||
    status === INTEGRATION_STATUS.NOT_CONFIGURED ||
    needsConfiguration;

  // Stats and games from API
  const totalGames = integrationData?.totalGames || 0;
  const connectedGames = integrationData?.connectedGames || 0;
  const games = integrationData?.games || [];

  // Separate games by status
  const connectedGamesList = games.filter((g) => g.status === "connected");
  const errorGamesList = games.filter((g) => g.status === "error");

  return (
    <div className="border border-[#f6f6f6] rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          {/* Icon with status indicator */}
          <div className="relative w-fit">
            <div className="size-[50px] rounded-lg border border-[#dfdfdf] flex items-center justify-center overflow-hidden">
              <img
                src={integration.icon}
                alt={integration.name}
                className="size-[30px] object-contain"
              />
            </div>
            {/* Status indicator dot */}
            {isConnected && !needsConfiguration && (
              <div className="absolute -bottom-1 -right-1">
                <CheckCircle weight="Bold" size={16} color="#00A251" />
              </div>
            )}
            {needsDetails && hasConfigFields && (
              <div className="absolute -bottom-1 -right-1 bg-[#fff]">
                <DangerTriangle weight="Linear" size={16} color="#BC7F01" />
              </div>
            )}
          </div>

          {/* Name and description */}
          <h4 className="font-urbanist font-medium text-base text-[#141414]">
            {integration.name}
          </h4>
          <p className="font-urbanist text-sm text-[#b0b0b0] max-w-[600px]">
            {integration.description}
          </p>

          {/* Action links */}
          <div className="flex flex-col gap-3 mt-4">
            {isConnected && !needsConfiguration ? (
              <div className="flex flex-col gap-1">
                <span className="font-urbanist font-medium text-sm text-[#00A251]">
                  Connected
                </span>
                {totalGames > 0 && (
                  <button
                    onClick={() => setIsGamesListExpanded(!isGamesListExpanded)}
                    className="flex items-center gap-1 font-urbanist text-xs text-[#6d6d6d] hover:text-[#141414] transition-colors"
                  >
                    {connectedGames} of {totalGames} games connected
                    {isGamesListExpanded ? (
                      <AltArrowUp weight="Linear" size={14} />
                    ) : (
                      <AltArrowDown weight="Linear" size={14} />
                    )}
                  </button>
                )}
              </div>
            ) : needsConfiguration && hasConfigFields ? (
              <button
                onClick={() => onConfigure?.(integration)}
                className="font-urbanist font-medium text-sm text-[#916603] hover:underline text-left"
              >
                Go to configure
              </button>
            ) : hasConfigFields ? (
              <button
                onClick={() => onConfigure?.(integration)}
                className="font-urbanist font-medium text-sm text-[#916603] hover:underline text-left"
              >
                Add details
              </button>
            ) : (
              <button
                onClick={() => onGoToConfigure?.(integration)}
                className="font-urbanist font-medium text-sm text-[#1F6744] hover:underline flex items-center gap-1 text-left"
              >
                Go to configure
                <SquareTopDown weight={"Linear"} size={16} color="#1f6744" />
              </button>
            )}

            <a
              href={`/super-agent/settings/integrations/${integration.slug}/documentation`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-urbanist font-medium text-sm text-[#1F6744] hover:underline flex items-center gap-1"
            >
              Check documentation
              <SquareTopDown weight={"Linear"} size={16} color="#1F6744" />
            </a>
          </div>
        </div>

        {/* Action button */}
        {hasConfigFields && (
          <button
            onClick={() => onConfigure?.(integration)}
            className="px-4 py-2 border border-[#141414] rounded-lg font-urbanist font-medium text-sm text-[#141414] hover:bg-[#f6f6f6] transition-colors"
          >
            {isConnected && !needsConfiguration ? "Edit details" : "Add details"}
          </button>
        )}
      </div>

      {/* Expandable Games List */}
      {isGamesListExpanded && games.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#f6f6f6]">
          <div className="flex flex-col gap-4">
            {/* Connected Games */}
            {connectedGamesList.length > 0 && (
              <div className="flex flex-col gap-2">
                <h5 className="font-urbanist font-medium text-sm text-[#141414] flex items-center gap-2">
                  <CheckCircle weight="Bold" size={14} color="#00A251" />
                  Connected ({connectedGamesList.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {connectedGamesList.map((game) => (
                    <span
                      key={game.game_id}
                      className="inline-flex items-center px-3 py-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full text-xs font-urbanist text-[#166534]"
                    >
                      {game.game_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Games */}
            {errorGamesList.length > 0 && (
              <div className="flex flex-col gap-2">
                <h5 className="font-urbanist font-medium text-sm text-[#141414] flex items-center gap-2">
                  <CloseCircle weight="Bold" size={14} color="#f25a5a" />
                  Errors ({errorGamesList.length})
                </h5>
                <div className="flex flex-col gap-1.5">
                  {errorGamesList.map((game) => (
                    <div
                      key={game.game_id}
                      className="flex items-start gap-2 px-3 py-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg"
                    >
                      <span className="font-urbanist text-xs font-medium text-[#991b1b] shrink-0">
                        {game.game_name}
                      </span>
                      <span className="font-urbanist text-xs text-[#b91c1c]">
                        — {game.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to mask sensitive values (hide entire value with asterisks)
const maskValue = (value) => {
  if (!value) return "";
  return "*".repeat(value.length);
};

// Configuration form component for App Store
const AppStoreConfigForm = ({
  integration,
  integrationData,
  studioData,
  onBack,
  onSave,
  setToastMessage,
}) => {
  const isEditing = !!integrationData?.config?.id;

  const [formData, setFormData] = useState({
    apple_key_id: "",
    apple_issuer_id: "",
    private_key_file: {},
  });
  const [existingKeyId, setExistingKeyId] = useState(
    integrationData?.config?.id || null
  );
  const [errors, setErrors] = useState({
    apple_key_id: false,
    apple_issuer_id: false,
    private_key_file: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Track if user has started editing each field (to show real value vs masked)
  const [isFieldEditing, setIsFieldEditing] = useState({
    apple_key_id: false,
    apple_issuer_id: false,
  });

  // Get display value - show masked if existing and not being edited
  const getDisplayValue = (fieldId) => {
    if (isFieldEditing[fieldId] || !isEditing) {
      return formData[fieldId];
    }
    // Show masked value for existing credentials
    const existingValue = integrationData?.config?.[fieldId] || "";
    return maskValue(existingValue);
  };

  const handleInputFocus = (fieldId) => {
    if (isEditing && !isFieldEditing[fieldId]) {
      // When focusing, clear the field so user can enter new value
      setIsFieldEditing((prev) => ({ ...prev, [fieldId]: true }));
      setFormData((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: false }));
  };

  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, private_key_file: file }));
    setErrors((prev) => ({ ...prev, private_key_file: false }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, private_key_file: {} }));
  };

  const handleSave = async () => {
    // Get actual values - use formData if field was edited, otherwise use existing value
    const keyId = isFieldEditing.apple_key_id
      ? formData.apple_key_id
      : integrationData?.config?.apple_key_id || "";
    const issuerId = isFieldEditing.apple_issuer_id
      ? formData.apple_issuer_id
      : integrationData?.config?.apple_issuer_id || "";

    // Validation - Key ID must be 10 characters
    if (keyId.length !== 10) {
      setErrors((prev) => ({ ...prev, apple_key_id: true }));
      return;
    }

    // Validation - Issuer ID must be 36 characters (UUID format)
    if (issuerId.length !== 36) {
      setErrors((prev) => ({ ...prev, apple_issuer_id: true }));
      return;
    }

    // Validation - Private key file required for new entries
    if (
      typeof formData.private_key_file === "object" &&
      !formData.private_key_file.size &&
      !existingKeyId
    ) {
      setErrors((prev) => ({ ...prev, private_key_file: true }));
      return;
    }

    setIsSaving(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("apple_key_id", keyId);
      apiFormData.append("apple_issuer_id", issuerId);
      apiFormData.append("studio_id", studioData.id);

      if (formData.private_key_file.size) {
        apiFormData.append("private_key_file", formData.private_key_file);
      }

      const response = existingKeyId
        ? await api.put(
            `v1/games/apple-api-keys/${studioData.id}/${existingKeyId}`,
            apiFormData
          )
        : await api.post(`v1/games/apple-api-keys`, apiFormData);

      const keysData = response.data.data;

      if (keysData) {
        setToastMessage?.({
          show: true,
          message: existingKeyId
            ? "API keys updated successfully"
            : "API keys created successfully",
          type: "success",
        });

        // Update the existing key ID for future updates
        setExistingKeyId(keysData.id);

        // Reset field editing state so masked values show again
        setIsFieldEditing({
          apple_key_id: false,
          apple_issuer_id: false,
        });

        // Reset form data
        setFormData({
          apple_key_id: "",
          apple_issuer_id: "",
          private_key_file: {},
        });

        // Call onSave to update parent state
        onSave?.(integration.id, {
          id: keysData.id,
          apple_key_id: keysData.apple_key_id,
          apple_issuer_id: keysData.apple_issuer_id,
        });
      }
    } catch (err) {
      console.error("Failed to save configuration:", err);
      setToastMessage?.({
        show: true,
        message: err.response?.data?.message || "Failed to save API keys",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 hover:bg-[#f6f6f6] rounded transition-colors"
          >
            <AltArrowLeft weight={"Linear"} size={20} color="#6d6d6d" />
          </button>
          <span className="font-urbanist text-base text-[#b0b0b0]">
            Integrations/
          </span>
          <span className="font-urbanist font-medium text-lg text-[#141414]">
            {integration.name}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-2 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:bg-[#1a5a3a] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Form fields */}
      <div className="border border-[#f6f6f6] rounded-lg p-6">
        <div className="flex flex-col gap-5 max-w-[400px]">
          {/* Key ID */}
          <div className="flex flex-col gap-1.5">
            <label className="font-urbanist text-xs text-[#b0b0b0]">
              Key ID
            </label>
            <input
              type="text"
              value={getDisplayValue("apple_key_id")}
              onChange={(e) => handleInputChange("apple_key_id", e.target.value)}
              onFocus={() => handleInputFocus("apple_key_id")}
              placeholder=""
              className={`px-4 py-3 border rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#B0B0B0] focus:outline-none transition-colors ${
                errors.apple_key_id
                  ? "border-[#f25a5a]"
                  : "border-[#E7EAEE] focus:border-[#1F6744]"
              }`}
            />
            {errors.apple_key_id && (
              <span className="text-xs text-[#f25a5a]">
                Key ID must be exactly 10 characters
              </span>
            )}
          </div>

          {/* Issuer ID */}
          <div className="flex flex-col gap-1.5">
            <label className="font-urbanist text-xs text-[#b0b0b0]">
              Issuer ID
            </label>
            <input
              type="text"
              value={getDisplayValue("apple_issuer_id")}
              onChange={(e) =>
                handleInputChange("apple_issuer_id", e.target.value)
              }
              onFocus={() => handleInputFocus("apple_issuer_id")}
              placeholder=""
              className={`px-4 py-3 border rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#B0B0B0] focus:outline-none transition-colors ${
                errors.apple_issuer_id
                  ? "border-[#f25a5a]"
                  : "border-[#E7EAEE] focus:border-[#1F6744]"
              }`}
            />
            {errors.apple_issuer_id && (
              <span className="text-xs text-[#f25a5a]">
                Issuer ID must be exactly 36 characters (UUID format)
              </span>
            )}
          </div>

          {/* Private Key File */}
          <div className="flex flex-col gap-1.5">
            <label className="font-urbanist text-xs text-[#b0b0b0]">
              Private Key
            </label>
            <div className="relative">
              {formData.private_key_file?.name ? (
                // New file selected by user
                <div
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg bg-[#F6F6F6] ${
                    errors.private_key_file
                      ? "border-[#f25a5a]"
                      : "border-[#E7EAEE]"
                  }`}
                >
                  <Paperclip weight={"Linear"} size={15} color="#6d6d6d" />
                  <span className="font-urbanist text-sm text-[#141414] flex-1 truncate">
                    {formData.private_key_file.name}
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="p-0.5 hover:bg-[#E7EAEE] rounded transition-colors"
                  >
                    <X size={16} color="#6d6d6d" />
                  </button>
                </div>
              ) : existingKeyId ? (
                // Existing file already uploaded (editing mode)
                <div className="flex items-center gap-2 px-4 py-3 border border-[#E7EAEE] rounded-lg bg-[#F6F6F6]">
                  <Paperclip weight={"Linear"} size={15} color="#1F6744" />
                  <span className="font-urbanist text-sm text-[#141414] flex-1">
                    Private key uploaded
                  </span>
                  <label className="font-urbanist text-sm text-[#1F6744] cursor-pointer hover:underline">
                    Replace
                    <input
                      type="file"
                      accept=".p8"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                // No file - show upload prompt
                <label
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer hover:border-[#1F6744] transition-colors ${
                    errors.private_key_file
                      ? "border-[#f25a5a]"
                      : "border-[#E7EAEE]"
                  }`}
                >
                  <Paperclip weight={"Linear"} size={15} color="#6d6d6d" />
                  <span className="font-urbanist text-sm text-[#B0B0B0]">
                    Add attachment
                  </span>
                  <input
                    type="file"
                    accept=".p8"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.private_key_file && (
              <span className="text-xs text-[#f25a5a]">
                Private key file is required
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const IntegrationsSettings = ({ studioData }) => {
  // State for integration data
  const [integrationData, setIntegrationData] = useState({
    play_store: {
      status: INTEGRATION_STATUS.NOT_CONFIGURED,
      config: {},
    },
    app_store: {
      status: INTEGRATION_STATUS.NOT_CONFIGURED,
      config: {},
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // View state - list or configuration form
  const [currentView, setCurrentView] = useState("list");
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Fetch integration status on mount and when studio changes
  useEffect(() => {
    if (!studioData?.id) return;

    // Reset loading state when studio changes
    setIsLoading(true);

    const fetchIntegrationStatus = async () => {

      try {
        // Fetch Play Store and App Store status in parallel
        const [playStoreRes, appStoreRes] = await Promise.all([
          api.get(`/v1/games/playstore-status/${studioData.id}`).catch(() => null),
          api.get(`/v1/games/appstore-status/${studioData.id}`).catch(() => null),
        ]);

        const playStoreData = playStoreRes?.data?.data;
        const appStoreData = appStoreRes?.data?.data;

        setIntegrationData((prev) => ({
          ...prev,
          play_store: {
            status: playStoreData?.connected
              ? INTEGRATION_STATUS.CONNECTED
              : INTEGRATION_STATUS.NOT_CONFIGURED,
            totalGames: playStoreData?.totalGames || 0,
            connectedGames: playStoreData?.connectedGames || 0,
            games: playStoreData?.games || [],
          },
          app_store: {
            status: appStoreData?.connected
              ? INTEGRATION_STATUS.CONNECTED
              : INTEGRATION_STATUS.NOT_CONFIGURED,
            keysConfigured: appStoreData?.keysConfigured,
            totalGames: appStoreData?.totalGames || 0,
            connectedGames: appStoreData?.connectedGames || 0,
            games: appStoreData?.games || [],
            config: prev.app_store.config,
          },
        }));
      } catch (err) {
        console.error("Failed to fetch integration status:", err);
      }
    };

    const fetchAppStoreKeys = async () => {
      try {
        const response = await api.get(
          `v1/games/apple-api-keys/${studioData.id}`
        );
        const keysData = response.data.data;

        if (keysData) {
          setIntegrationData((prev) => ({
            ...prev,
            app_store: {
              ...prev.app_store,
              config: {
                id: keysData.id,
                apple_key_id: keysData.apple_key_id,
                apple_issuer_id: keysData.apple_issuer_id,
              },
            },
          }));
        }
      } catch (err) {
        // No existing keys found - keep as NOT_CONFIGURED
        console.log("No App Store keys found for this studio");
      }
    };

    // Fetch both status and keys, then stop loading
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchIntegrationStatus(), fetchAppStoreKeys()]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [studioData?.id]);

  // Handle opening configuration form
  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setCurrentView("configure");
  };

  // Handle going to external configuration URL
  const handleGoToConfigure = (integration) => {
    if (integration.configureUrl) {
      window.open(integration.configureUrl, "_blank");
    }
  };

  // Handle going back to list
  const handleBack = () => {
    setCurrentView("list");
    setSelectedIntegration(null);
  };

  // Handle saving configuration
  const handleSaveConfig = (integrationId, config) => {
    setIntegrationData((prev) => ({
      ...prev,
      [integrationId]: {
        status: INTEGRATION_STATUS.CONNECTED,
        config,
      },
    }));
    handleBack();
  };

  // Render configuration form for App Store
  if (currentView === "configure" && selectedIntegration?.id === "app_store") {
    return (
      <>
        <AppStoreConfigForm
          integration={selectedIntegration}
          integrationData={integrationData.app_store}
          studioData={studioData}
          onBack={handleBack}
          onSave={handleSaveConfig}
          setToastMessage={setToastMessage}
        />
        {toastMessage?.show && (
          <ToastMessage
            message={toastMessage}
            setToastMessage={() => setToastMessage(null)}
          />
        )}
      </>
    );
  }

  // Loading state - Skeleton cards
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Integrations
        </h3>
        <div className="flex flex-col gap-4">
          {/* Skeleton cards */}
          {[1, 2].map((item) => (
            <div
              key={item}
              className="border border-[#f6f6f6] rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  {/* Icon skeleton */}
                  <div className="size-[50px] rounded-lg bg-[#E7EAEE]" />
                  {/* Title skeleton */}
                  <div className="h-5 w-28 bg-[#E7EAEE] rounded" />
                  {/* Description skeleton */}
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-[400px] bg-[#E7EAEE] rounded" />
                    <div className="h-4 w-[300px] bg-[#E7EAEE] rounded" />
                  </div>
                  {/* Action links skeleton */}
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="h-4 w-24 bg-[#E7EAEE] rounded" />
                    <div className="h-4 w-36 bg-[#E7EAEE] rounded" />
                  </div>
                </div>
                {/* Button skeleton */}
                <div className="h-10 w-28 bg-[#E7EAEE] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render integration list
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
        Integrations
      </h3>

      {/* Integration cards */}
      <div className="flex flex-col gap-4">
        {ALL_INTEGRATIONS.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            integrationData={integrationData[integration.id]}
            onConfigure={handleConfigure}
            onGoToConfigure={handleGoToConfigure}
          />
        ))}
      </div>

      {toastMessage?.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default IntegrationsSettings;
