import { useNavigate } from "react-router-dom";
import {
  GraphUp,
  ChatRoundLine,
  Gamepad,
  Lightbulb,
  Notebook2,
} from "@solar-icons/react";
import { Globe, Code, ArrowRight } from "lucide-react";

const aiTools = [
  {
    id: 1,
    name: "ASO Assistant",
    description:
      "Optimize your app store presence with AI-powered keyword analysis and metadata suggestions.",
    icon: <GraphUp weight="Linear" className="size-[16px]" />,
    link: "/aso-assistant",
  },
  {
    id: 2,
    name: "Querypac",
    description:
      "AI-powered chat assistant for game development queries and insights.",
    icon: <ChatRoundLine weight="Linear" className="size-[16px]" />,
    link: "/ai-chat",
  },
  {
    id: 3,
    name: "Translate",
    description:
      "Translate your text to any language with AI-powered accuracy.",
    icon: <Globe className="size-[16px]" />,
    link: "/translate",
  },
  {
    id: 4,
    name: "Level Automation",
    description:
      "Automate level design and balancing with live game data visualization.",
    icon: <Gamepad weight="Linear" className="size-[16px]" />,
    link: "/data-visualization",
  },
  {
    id: 5,
    name: "Asset Generator",
    description:
      "Generate UI assets for your mobile game, ASO creatives, and more.",
    icon: <Lightbulb weight="Linear" className="size-[16px]" />,
    link: "/asset-generator",
  },
  {
    id: 6,
    name: "AI Story Weaver",
    description:
      "Craft immersive narratives, generate AI assets, and create game-ready word search levels.",
    icon: <Notebook2 weight="Linear" className="size-[16px]" />,
    link: "/aistories",
  },
  {
    id: 7,
    name: "Playable Editor",
    description:
      "Build and edit interactive playable ad prototypes directly in your browser.",
    icon: <Code className="size-[16px]" />,
    link: "/video-editor",
  },
];

const ToolCard = ({ tool, onClick }) => {
  return (
    <div
      className="bg-[#f1f1f1] border border-[#e6e6e6] rounded-[12px] hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        {/* Icon Badge */}
        <div className="mb-3.5 inline-flex">
          <div className="w-8 h-8 rounded-full bg-[#1f6744] flex items-center justify-center text-[#f6f6f6]">
            {tool.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-urbanist text-[14px] text-[#575757] leading-[21px] mb-2">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="font-urbanist text-[12px] text-[#6d6d6d] leading-[15px] min-h-[45px]">
          {tool.description}
        </p>

        {/* CTA */}
        <div className="mt-3 flex items-center text-[#1f6744]">
          <span className="text-[12px] font-medium font-urbanist">
            Try Now
          </span>
          <ArrowRight className="size-[14px] ml-1" />
        </div>
      </div>
    </div>
  );
};

const AIToolsLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1180px] mx-auto px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center pt-16 pb-6">
          <p className="font-urbanist text-[20px] text-[#898989] mb-6 text-center">
            Gaming AI Tools
          </p>
          <h1 className="font-urbanist font-semibold text-[36px] text-[#1f6744] mb-3 text-center">
            Enhance Your Game Development Experience
          </h1>
          <p className="font-urbanist text-[16px] text-[#898989] text-center leading-[24px] max-w-[600px]">
            Discover our suite of AI-powered tools to enhance your gaming skills
            and streamline your workflow.
          </p>
        </div>

        {/* Section Divider */}
        <div className="flex items-center justify-center my-8">
          <hr className="w-[128px] border-[#e6e6e6]" />
          <h2 className="font-urbanist font-semibold text-[24px] text-[#141414] text-center mx-4 whitespace-nowrap">
            Explore Tools
          </h2>
          <hr className="w-[128px] border-[#e6e6e6]" />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
          {aiTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => navigate(tool.link)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIToolsLanding;
