import ReactMarkdown from "react-markdown";

// Handles both schemas:
// Designed: section.content (plain string)
// Agent:    section.content.body (markdown string)
const TextBlock = ({ section }) => {
  const raw = section?.content;
  const text = typeof raw === "string" ? raw : raw?.body;
  if (!text) return null;

  return (
    <div style={{ marginTop: "16pt", fontSize: "14px", lineHeight: "21px", color: "#333" }}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#141414", marginTop: "20px", marginBottom: "8px" }}>
              {children}
            </div>
          ),
          h3: ({ children }) => (
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#141414", marginTop: "14px", marginBottom: "6px" }}>
              {children}
            </div>
          ),
          p: ({ children }) => (
            <p style={{ margin: "0 0 10px", lineHeight: "21px", color: "#333" }}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 600, color: "#141414" }}>{children}</strong>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingLeft: "20px", margin: "6px 0 10px" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: "20px", margin: "6px 0 10px" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: "4px", color: "#333" }}>{children}</li>
          ),
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "16px 0" }} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default TextBlock;
