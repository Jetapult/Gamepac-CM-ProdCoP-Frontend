import { useNavigate } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
const aiTools = [
  {
    id: 1,
    name: "ASO Assistant",
    description: "ASO Assistant.",
    icon: null,
    link: "/aso-assistant",
  },
  {
    id: 2,
    name: "Querypac",
    description: "AI-Powered Chat.",
    icon: ChatBubbleLeftRightIcon,
    link: "/ai-chat",
  },
  {
    id: 3,
    name: "Translate",
    description: "Translate your text to any language.",
    icon: LanguageIcon,
    link: "/translate",
  },
  {
    id: 4,
    name: "Level Automation",
    description: "Automate Levels with live Game Data",
    icon: ChatBubbleLeftRightIcon,
    link: "/data-visualization",
  },
  {
    id: 5,
    name: "Asset Generator",
    description: "Generate UI assets for your mobile game, ASO and more.",
    icon: SparklesIcon,
    link: "/asset-generator",
  },
  {
    id: 6,
    name: "AI Story Weaver",
    description:
      "Unleash your creativity with StoryWeaver, our platform for crafting immersive narratives and generating AI assets and Game Ready word search levels.",
    icon: SparklesIcon,
    link: "/aistories",
  },
];

const AIToolsLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full py-5">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-start justify-center space-y-4">
            <div className="inline-block rounded-lg bg-[#e5e5e5] px-3 py-1 text-sm">
              Gaming AI Tools
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Enhance Your Game Development Experience
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our suite of AI-powered tools to enhance your gaming
              skills and streamline your workflow.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-[#B9FF66] shadow transition-colors hover:bg-[#B9FF66] hover:text-[#000] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => navigate("/aistories")}
              >
                Try Story Weaver
              </button>
            </div>
          </div>
          <div className="grid gap-6">
            {aiTools.map((tool) => (
              <div
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-gray-100 relative"
                key={tool.id}
                onClick={() => navigate(tool?.link)}
              >
                <h3 className="text-xl font-bold">
                  {tool.icon && <tool.icon className="w-6 h-6 inline mr-2" />}
                  {tool.name}
                </h3>
                <p className="text-gray-500">{tool.description}</p>
                <button className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#B9FF66] px-4 py-2 text-sm font-medium text-[#000] shadow transition-colors hover:bg-[#000] hover:text-[#B9FF66] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950">
                  Try Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsLanding;
