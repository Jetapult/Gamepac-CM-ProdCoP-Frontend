// Fields to skip in artifact rendering (internal/meta)
const SKIP_FIELDS = new Set([
  "artifact_type", "format", "status", "is_complete", "action",
]);

// Try to parse a string as JSON; return parsed object or null
const tryParseJson = (str) => {
  if (typeof str !== "string") return null;
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  const closingFence = cleaned.indexOf("```");
  if (closingFence !== -1) cleaned = cleaned.slice(0, closingFence);
  cleaned = cleaned.trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // not valid JSON
  }
  return null;
};

// Extract trailing markdown after a JSON code block in a string
const extractTrailingMarkdown = (str) => {
  if (typeof str !== "string") return "";
  const cleaned = str.trim();
  const jsonStart = cleaned.indexOf("{");
  if (jsonStart === -1) return "";
  let braceCount = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < cleaned.length; i++) {
    if (cleaned[i] === "{") braceCount++;
    else if (cleaned[i] === "}") braceCount--;
    if (braceCount === 0) { jsonEnd = i; break; }
  }
  if (jsonEnd === -1) return "";
  let trailing = cleaned.slice(jsonEnd + 1).trim();
  if (trailing.startsWith("```")) trailing = trailing.slice(3).trim();
  return trailing;
};

// Convert a structured JSON object into readable markdown
const objectToMarkdown = (obj, depth = 0) => {
  if (!obj || typeof obj !== "object") return String(obj ?? "");
  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return objectToMarkdown(item, depth + 1);
        }
        return `- ${item}`;
      })
      .join("\n");
  }

  const lines = [];
  const headingPrefix = depth === 0 ? "##" : depth === 1 ? "###" : "####";

  for (const [key, value] of Object.entries(obj)) {
    if (SKIP_FIELDS.has(key)) continue;

    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      const parsed = tryParseJson(value);
      if (parsed) {
        lines.push(`${headingPrefix} ${label}\n`);
        lines.push(objectToMarkdown(parsed, depth + 1));
        const trailing = extractTrailingMarkdown(value);
        if (trailing) lines.push(`\n${trailing}`);
      } else if (value.length > 100) {
        lines.push(`${headingPrefix} ${label}\n\n${value}`);
      } else if (value.length === 0) {
        continue;
      } else {
        lines.push(`**${label}:** ${value}`);
      }
    } else if (typeof value === "number" || typeof value === "boolean") {
      lines.push(`**${label}:** ${value}`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${headingPrefix} ${label}\n`);
      value.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          lines.push(objectToMarkdown(item, depth + 1));
          lines.push("");
        } else {
          lines.push(`- ${item}`);
        }
      });
    } else if (typeof value === "object") {
      lines.push(`${headingPrefix} ${label}\n`);
      lines.push(objectToMarkdown(value, depth + 1));
    }
  }

  return lines.join("\n");
};

/**
 * Extract markdown string from artifact data.
 * Handles: raw strings, objects with markdown/content/text/body fields, structured JSON objects.
 */
export const extractMarkdownFromData = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.markdown) return data.markdown;
  if (data.content) return data.content;
  if (data.text) return data.text;
  if (data.body) return data.body;
  if (typeof data === "object") return objectToMarkdown(data);
  return "";
};
