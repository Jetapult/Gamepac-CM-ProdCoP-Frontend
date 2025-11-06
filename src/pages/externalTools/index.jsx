import { useEffect, useState } from "react";
import api from "../../api";

const ExternalTools = () => {
  const [tools, setTools] = useState([
    {
      id: 1,
      name: "Google Suite",
      slug: "google-workspace",
      description:
        "Access your Google Workspace Suite, including Gmail, Calendar, Drive, and more.",
      icons: [
        "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        "https://cdn-icons-png.flaticon.com/512/5968/5968523.png",
      ],
      installed: false,
      url: "https://workspace.google.com",
    },
    {
      id: 2,
      name: "Google Drive",
      service: "drive",
      slug: "google-workspace",
      description: "Access your Google Drive, upload and share files.",
      icons: ["https://cdn-icons-png.flaticon.com/512/5968/5968523.png"],
      installed: false,
      url: "https://drive.google.com",
    },
    {
      id: 3,
      name: "Google Calendar",
      service: "calendar",
      slug: "google-workspace",
      description: "Access your Google Calendar, create and edit events.",
      icons: ["https://cdn-icons-png.flaticon.com/512/5968/5968523.png"],
      installed: false,
      url: "https://calendar.google.com",
    },
    {
      id: 4,
      name: "Gmail",
      service: "gmail",
      slug: "google-workspace",
      description: "Access your Gmail, send and receive emails.",
      icons: ["https://cdn-icons-png.flaticon.com/512/5968/5968523.png"],
      installed: false,
      url: "https://gmail.com",
    },
    {
      id: 5,
      name: "Slack",
      slug: "slack",
      description:
        "Connect with your team, send messages, and collaborate in real-time.",
      icons: ["https://cdn-icons-png.flaticon.com/512/2111/2111615.png"],
      installed: false,
      url: "https://slack.com",
    },
  ]);

  const handleIntegrateExternalTool = async (tool) => {
    try {
      const response = await api.post(
        `/v1/${
          tool.name.toLowerCase() === "slack" ? "slack" : "google-workspace"
        }/connect${tool.service ? `/${tool.service}` : ""}`
      );
      window.location.href = response.data.data.authUrl;
    } catch (error) {
      console.error(error);
    }
  };

  const getExternalToolsStatus = async () => {
    try {
      const response = await api.get("/v1/external-tools/status");
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);
      
      // Handle both response.data and response.data.data structures
      const data = response.data?.data || response.data;
      console.log("Extracted data:", data);
      
      const { google_workspace, slack } = data;
      console.log("Google Workspace:", google_workspace);
      console.log("Slack object:", slack);
      console.log("Slack connected value:", slack?.connected);
      console.log("Type of slack?.connected:", typeof slack?.connected);
      
      // Check if all Google Workspace services are connected
      const allGoogleServicesConnected =
        google_workspace?.drive &&
        google_workspace?.calendar &&
        google_workspace?.gmail;

      setTools((prevTools) =>
        prevTools.map((tool) => {
          let installed = false;

          if (tool.slug === "google-workspace") {
            // For individual Google services (Drive, Calendar, Gmail)
            if (tool.service) {
              installed = google_workspace?.[tool.service] || false;
            } else {
              // For Google Suite (all services combined)
              installed = allGoogleServicesConnected;
            }
          } else if (tool.slug === "slack") {
            // For Slack
            installed = slack?.connected === true;
          }

          console.log(`Tool: ${tool.name}, Slug: ${tool.slug}, Installed: ${installed}`);
          return { ...tool, installed };
        })
      );
    } catch (error) {
      console.error("Error fetching external tools status:", error);
    }
  };

  const handleDisconnect = async (tool) => {
    try {
      const endpoint =
        tool.slug === "slack"
          ? "/v1/slack/disconnect"
          : `/v1/google-workspace/disconnect${
              tool.service ? `/${tool.service}` : ""
            }`;

      const response = await api.delete(endpoint);
      console.log(response, "response");
      
      // Refresh status after disconnect
      await getExternalToolsStatus();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getExternalToolsStatus();
  }, []);

  
  return (
    <div className="min-h-screen bg-[#1c1c1e] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-3xl font-semibold">Tools</h1>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-[#2c2c2e] rounded-2xl p-6 flex items-start justify-between hover:bg-[#333335] transition-colors"
            >
              {/* Left section - Icon and Text */}
              <div className="flex items-start gap-4 flex-1">
                {/* Icons */}
                <div className="flex gap-2">
                  {tool.icons.map((icon, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <img
                        src={icon}
                        alt={`${tool.name} icon`}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Right section - Button */}
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() =>
                    tool.installed
                      ? handleDisconnect(tool)
                      : handleIntegrateExternalTool(tool)
                  }
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    tool.installed
                      ? "bg-[#3c3c3e] text-white hover:bg-[#4c4c4e]"
                      : "bg-[#007aff] text-white hover:bg-[#0066d6]"
                  }`}
                >
                  {tool.installed ? "Uninstall" : "Install"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalTools;
