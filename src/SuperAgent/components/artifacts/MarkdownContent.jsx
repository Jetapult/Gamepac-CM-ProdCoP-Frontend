import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractMarkdownFromData } from "@/SuperAgent/utils/markdownExtractor";

const MarkdownContent = ({ data }) => {
  const content = extractMarkdownFromData(data);

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
          remarkPlugins={[remarkGfm]}
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
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#f5f5f5]">{children}</thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-[#e5e5e5]">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-semibold text-[#141414] border border-[#e0e0e0] bg-[#f5f5f5]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-[#333] border border-[#e0e0e0]">
                {children}
              </td>
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
