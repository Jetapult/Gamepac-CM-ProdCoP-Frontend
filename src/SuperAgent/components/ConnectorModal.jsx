import React, { useState } from "react";
import { ExternalLink, Plus, X, Loader2 } from "lucide-react";

const ConnectorModal = ({
  integration,
  isOpen,
  onClose,
  onConnect,
  isConnecting = false,
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  if (!isOpen || !integration) return null;

  const handleConnect = async () => {
    if (isConnecting || localLoading) return;

    setLocalLoading(true);
    try {
      // Call the onConnect handler with the integration slug
      // This will trigger the OAuth flow via the Composio API
      if (onConnect) {
        await onConnect(integration.slug);
      }
    } catch (error) {
      console.error(`Failed to connect to ${integration.name}:`, error);
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isConnecting || localLoading;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.16)] to-[rgba(102,102,102,0.48)]" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-[16px] w-[500px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 text-[#6d6d6d] hover:text-[#1f6744] transition-colors disabled:opacity-50"
        >
          <X className="text-[#111111]" strokeWidth={1.5} />
        </button>

        {/* Integration Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-[70px] rounded-[12px] border border-[#e6e6e6] flex items-center justify-center p-3">
            <img
              src={integration.icon}
              alt={integration.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Integration Name */}
        <h2 className="font-urbanist text-[20px] text-[#141414] text-center mb-3">
          {integration.name}
        </h2>

        {/* Description */}
        <p className="font-urbanist font-normal text-sm text-black text-center mb-6 leading-[21px]">
          {integration.description ||
            `Connect ${integration.name} to access, search, and manage your data seamlessly with GamePac for improved productivity.`}
        </p>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mx-auto bg-[#1F6744] text-white rounded-[8px] py-3 px-5 border border-[rgba(255,255,255,0.30)] shadow-[0_0_0_1px_#1F6744] font-urbanist font-medium text-[16px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plus strokeWidth={1.5} />
              Connect
            </>
          )}
        </button>

        {/* Info Text */}
        <p className="font-urbanist text-xs text-[#6d6d6d] text-center mb-4">
          You will be redirected to {integration.name} to authorize the connection.
        </p>

        {/* Details Grid */}
        <div className="mb-4 border border-[#DFDFDF] rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Connector type</p>
            <p className="font-urbanist text-sm text-[#6d6d6d]">App</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Author</p>
            <p className="font-urbanist text-sm text-[#6d6d6d]">GamePac</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Website</p>
            <a
              href={integration.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <ExternalLink strokeWidth={2} size={16} className="text-[#1E80EA]" />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Privacy Policy</p>
            <a
              href={integration.privacyPolicy}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <ExternalLink strokeWidth={2} size={16} className="text-[#1E80EA]" />
            </a>
          </div>
        </div>

        {/* Provide Feedback Link */}
        {/* <div className="text-center">
          <a
            href="#"
            className="font-urbanist font-medium text-[14px] text-[#6d6d6d] underline hover:text-[#1f6744] transition-colors"
          >
            Provide Feedback
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default ConnectorModal;
