import React from "react";
import { Lightbulb, FileText, Workflow, Share2 } from "lucide-react"
import Layout from "./Layout";

const GameDesignDocument = () => {
  const features = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Game Concept Generator",
      description:
        "Generate game concepts based on genre, platform, and theme preferences.",
      link: "/gdd/concept-generator",
      buttonText: "Generate Concepts",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "GDD Editor",
      description:
        "Create and edit modular game design documents with AI assistance.",
      link: "/gdd-editor",
      buttonText: "Open Editor",
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "Design Translator",
      description:
        "Convert your design into visualizations, flowcharts, and exportable formats.",
      link: "/gdd/translator",
      buttonText: "Translate Design",
    },
    {
      icon: <Share2 className="h-8 w-8" />,
      title: "Collaboration",
      description: "Share your GDD with team members and collect feedback.",
      link: "/gdd/collaboration",
      buttonText: "Collaborate",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8 px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">GDD Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, refine, and collaborate on game design documents with AI
            assistance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Recent Projects</h3>
              <p className="text-sm text-muted-foreground">
                Continue working on your recent game design documents
              </p>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                <li className="p-3 rounded-md hover:bg-accent flex justify-between items-center">
                  <div>
                    <p className="font-medium">Space Explorer RPG</p>
                    <p className="text-sm text-muted-foreground">
                      Last edited: 2 days ago
                    </p>
                  </div>
                  <a href="/gdd/project-1">
                    <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded">
                      Open
                    </button>
                  </a>
                </li>
                <li className="p-3 rounded-md hover:bg-accent flex justify-between items-center">
                  <div>
                    <p className="font-medium">Puzzle Adventure</p>
                    <p className="text-sm text-muted-foreground">
                      Last edited: 5 days ago
                    </p>
                  </div>
                  <a href="/gdd/project-2">
                    <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded">
                      Open
                    </button>
                  </a>
                </li>
              </ul>
            </div>
            <div className="p-6 pt-2">
              <a
                href="/gdd-editor"
                className="w-full flex items-center justify-center"
              >
                <button className="w-full py-2 bg-black text-white rounded-md">
                  View All Projects
                </button>
              </a>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Start a new project or access key features
              </p>
            </div>
            <div className="p-6 space-y-4">
              <a href="/gdd/concept-generator">
                <button className="w-full py-2 px-4 bg-[#b9ff66] rounded-md hover:bg-primary/90 mb-4">
                  Generate New Game Concept
                </button>
              </a>
              <a href="/gdd/new">
                <button className="w-full py-2 bg-black text-white rounded-md">
                  Create Empty GDD
                </button>
              </a>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-lg shadow-sm bg-white">
              <div className="p-6 pb-2">
                <div className="mb-2 text-primary">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <div className="p-6 pt-2">
                <a href={feature.link} className="w-full">
                  <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-primary/90">
                    {feature.buttonText}
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GameDesignDocument;
