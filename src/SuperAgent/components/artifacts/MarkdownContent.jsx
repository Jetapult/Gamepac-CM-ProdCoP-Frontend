import React from "react";
import ReactMarkdown from "react-markdown";

const MarkdownContent = ({ data }) => {
  // Try to extract markdown content from various possible fields
  const getMarkdownContent = () => {
    if (!data) return "";
    
    // If data is a string, use it directly
    if (typeof data === "string") return data;
    
    // Check common markdown field names
    if (data.markdown) return data.markdown;
    if (data.content) return data.content;
    if (data.text) return data.text;
    if (data.body) return data.body;
    
    // If data is an object, try to stringify it nicely
    try {
      return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
    } catch {
      return "";
    }
  };

  const content = getMarkdownContent();

  if (!content) {
    return null;
  }

  return (
    <div className="p-6">
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
            pre: ({ children }) => (
              <pre className="bg-[#f5f5f5] p-4 rounded-lg overflow-x-auto text-xs mb-4">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownContent;
