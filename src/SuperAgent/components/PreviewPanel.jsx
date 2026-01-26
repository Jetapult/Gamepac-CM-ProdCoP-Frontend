import React from "react";
import ReactMarkdown from "react-markdown";
import TaskProgress from "./TaskProgress";
import ZeroStateAnimation from "./ZeroStateAnimation";
import ArtifactPlaceholder from "./ArtifactPlaceholder";

// Simple markdown detection - checks for common markdown patterns
const isMarkdown = (text) => {
  if (!text || typeof text !== "string") return false;
  const markdownPatterns = [
    /\*\*[^*]+\*\*/, // Bold
    /\*[^*]+\*/, // Italic
    /^#+\s/m, // Headers
    /^\s*[-*+]\s/m, // Lists
    /^\s*\d+\.\s/m, // Numbered lists
    /\[.+\]\(.+\)/, // Links
    /`[^`]+`/, // Inline code
    /```[\s\S]*```/, // Code blocks
  ];
  return markdownPatterns.some((pattern) => pattern.test(text));
};

const PreviewPanel = ({
  currentTask,
  currentTaskIndex,
  elapsedTime,
  allTasks = [],
  isThinking = false,
  artifactContent = null,
  artifactType = null,
  artifactData = null,
  agentName = "GamePac",
}) => {
  const hasArtifact = artifactContent && isMarkdown(artifactContent);
  // Exclude "markdown" type from structured artifacts - it's handled by artifactContent
  const hasStructuredArtifact = artifactType && artifactData && artifactType !== "markdown";

  return (
    <div className="flex-1 bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col relative">
      {/* Building State - Show animation */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
          isThinking ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="mb-6">
            <ZeroStateAnimation />
          </div>
          <p
            className="text-sm text-black"
            style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
          >
            {agentName} is building the document. Hang tight ✌️
          </p>
        </div>
      </div>

      {/* Artifact Content - Rendered Markdown */}
      {hasArtifact && !isThinking && (
        <div className="absolute inset-0 overflow-y-auto p-6 pb-24">
          <div
            className="prose prose-sm max-w-none"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-[#141414] mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-[#141414] mb-3 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-[#141414] mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-[#333] mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm text-[#333]">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#141414]">
                    {children}
                  </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-[#e8e8e8] px-1 py-0.5 rounded text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {artifactContent}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Structured Artifact (Review Reports) */}
      {hasStructuredArtifact && !isThinking && (
        <div className="absolute inset-0">
          <ArtifactPlaceholder type={artifactType} data={artifactData} />
        </div>
      )}

      {/* Task Progress Footer - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <TaskProgress
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          totalTasks={allTasks.length || 5}
          elapsedTime={elapsedTime}
          allTasks={allTasks}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
