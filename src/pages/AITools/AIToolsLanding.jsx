import { useNavigate } from "react-router-dom";
import { ChatBubbleLeftRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

const AIToolsLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full py-10 md:py-20 lg:py-20">
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
                className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-[#B9FF66] shadow transition-colors hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => navigate("/aistories")}
              >
                Try Story Weaver
              </button>
            </div>
          </div>
          <div className="grid gap-6">
          <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-gray-100 relative">
              <div className="space-y-2" onClick={() => navigate("/html5-games")}>
                <h3 className="text-xl font-bold">HTML5 playables</h3>
                <p className="text-gray-500">
                  check out our HTML5 playables
                </p>
                <button
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                >
                  Try Now
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm relative hover:bg-gray-100"  onClick={() => navigate("/ai-chat")}>
              <div className="space-y-2">
                <h3 className="text-xl font-bold"><ChatBubbleLeftRightIcon className="w-6 h-6 inline" /> Querypac</h3>
                <p className="text-gray-500">
                  AI-Powered Chat.
                </p>
                <button
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  Try Now
                </button>
              </div>
            </div>
            <div
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate("/aistories")}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  <SparklesIcon className="w-6 h-6 inline" /> AI Story Weaver
                </h3>
                <p className="text-gray-500">
                  Unleash your creativity with StoryWeaver, our platform for
                  crafting immersive narratives and generating AI assets and
                  Game Ready word search levels.
                </p>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  //   onClick={() => navigate("/aistories")}
                >
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsLanding;
