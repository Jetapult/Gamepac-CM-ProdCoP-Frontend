import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Copy,
  AltArrowLeft,
  SquareTopDown,
  Unread,
} from "@solar-icons/react";
import appStoreIcon from "../../../../assets/super-agents/app-store-icon.svg";
import playStoreIcon from "../../../../assets/super-agents/google-play-store-icon.svg";

// Copyable email component with feedback
const CopyableEmail = ({ email }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 bg-[#f6f6f6] rounded-lg font-mono text-sm">
      {email}
      <button
        onClick={handleCopy}
        className={`transition-colors focus:outline-none ${
          copied ? "text-[#00A251]" : "text-[#1F6744] hover:text-[#1a5a3a]"
        }`}
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <Unread weight={"Linear"} size={20} color="#1F6744" />
        ) : (
          <Copy weight="Linear" size={20} color="#6d6d6d" />
        )}
      </button>
    </span>
  );
};

// External link component
const ExternalLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-[#1F6744] hover:underline"
  >
    {children}
    <SquareTopDown weight="Linear" size={14} color="#1F6744" />
  </a>
);

// Integration data
const INTEGRATIONS = {
  "play-store": {
    id: "play_store",
    name: "Play Store",
    icon: playStoreIcon,
    documentationUrl: "https://developers.google.com/android-publisher/getting_started#setting_up_api_access_clients",
  },
  "app-store": {
    id: "app_store",
    name: "App Store",
    icon: appStoreIcon,
    documentationUrl: "https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api",
  },
};

// Documentation content for each integration
const DOCUMENTATION_CONTENT = {
  "play-store": {
    title: "Google Play Store Integration",
    subtitle: "Onboarding Steps for Fetching Google Reviews",
    description:
      "Allow reply to reviews access on Google Console by giving necessary permissions to our ID.",
    steps: [
      {
        title: "Go to Users & Permissions",
        description: (
          <>
            Navigate to the{" "}
            <ExternalLink href="https://play.google.com/console/users-and-permissions">
              Users & Permissions
            </ExternalLink>{" "}
            page on the Google Play Console.
          </>
        ),
      },
      {
        title: "Click Invite new users",
        description: "Find and click the 'Invite new users' button.",
      },
      {
        title: "Add our email address",
        description: (
          <>
            Put our email address in the email address field and grant the
            necessary rights to perform actions. In our case, select{" "}
            <strong>Reply to Reviews</strong>.
          </>
        ),
      },
      {
        title: "Email Address to be Added",
        description: (
          <CopyableEmail email="review-api@gamepac.iam.gserviceaccount.com" />
        ),
      },
      {
        title: "Add the Package Names",
        description:
          "Add the package names for the games you want to fetch reviews for.",
      },
    ],
  },
  "app-store": {
    title: "Apple App Store Integration",
    subtitle: "Onboarding Steps for Fetching Apple Store Reviews",
    description:
      "To generate a team API key to use with the App Store Connect API, follow these steps:",
    steps: [
      {
        title: "Log in to App Store Connect",
        description: (
          <>
            Go to{" "}
            <ExternalLink href="https://appstoreconnect.apple.com">
              App Store Connect
            </ExternalLink>{" "}
            and log in with your Apple ID.
          </>
        ),
      },
      {
        title: "Navigate to Users and Access",
        description:
          "Select Users and Access, and then select the API Keys tab.",
      },
      {
        title: "Select Team Keys tab",
        description: "Make sure the Team Keys tab is selected.",
      },
      {
        title: "Generate API Key",
        description:
          "Click Generate API Key or the Add (+) button to create a new key.",
      },
      {
        title: "Enter key details",
        description:
          "Enter a name for the key. The name is for your reference only and isn't part of the key itself.",
      },
      {
        title: "Select Access role",
        description:
          "Under Access, select the appropriate role for the key (e.g., Admin, Developer, etc.).",
      },
      {
        title: "Click Generate",
        description:
          "Click Generate. The new key's name, key ID, a download link, and other information appears on the page.",
      },
      {
        title: "Share the Details on GamePac",
        description:
          "Share the Key ID, Issuer ID, and download the Private Key (.p8 file) to configure on GamePac.",
      },
      {
        title: "Add package names",
        description:
          "Add the app IDs/package names for the games you want to fetch reviews for.",
      },
    ],
  },
};

const IntegrationDocumentationPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const integration = INTEGRATIONS[slug];
  const docs = DOCUMENTATION_CONTENT[slug];

  if (!docs || !integration) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f6f6]">
        <div className="text-center">
          <h2 className="font-urbanist font-semibold text-xl text-[#141414] mb-2">
            Documentation not found
          </h2>
          <p className="font-urbanist text-sm text-[#6d6d6d] mb-4">
            The requested integration documentation does not exist.
          </p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:bg-[#1a5a3a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-urbanist font-semibold text-xl text-[#141414]">
              {docs.title}
            </span>
          </div>

          {/* Documentation content */}
          <div className="bg-white border border-[#f6f6f6] rounded-lg p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              {/* Icon and title */}
              <div className="flex items-center gap-4">
                <div className="size-[50px] rounded-lg border border-[#dfdfdf] flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src={integration.icon}
                    alt={integration.name}
                    className="size-[30px] object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-urbanist font-semibold text-lg text-[#141414]">
                    {docs.subtitle}
                  </h3>
                  <p className="font-urbanist text-sm text-[#6d6d6d]">
                    {docs.description}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-4">
                {docs.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Step number */}
                    <div className="shrink-0 size-8 rounded-full bg-[#1F6744] flex items-center justify-center">
                      <span className="font-urbanist font-medium text-sm text-white">
                        {index + 1}
                      </span>
                    </div>
                    {/* Step content */}
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="font-urbanist font-medium text-sm text-[#141414]">
                        {step.title}
                      </h4>
                      <div className="font-urbanist text-sm text-[#6d6d6d]">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* External link */}
              <div className="pt-4 border-t border-[#f6f6f6]">
                <a
                  href={integration.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-urbanist font-medium text-sm text-[#1F6744] hover:underline"
                >
                  Visit official documentation
                  <SquareTopDown weight={"Linear"} size={16} color="#1F6744" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDocumentationPage;
