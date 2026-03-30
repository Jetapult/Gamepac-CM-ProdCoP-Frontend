/**
 * Converts generic report JSON data to a markdown string.
 * Used for PDF export (via existing backend markdown→PDF endpoint)
 * and Google Docs export.
 */
export function generateMarkdownFromGenericReport(data) {
  if (!data) return "";
  const lines = [];

  // ── Header ──────────────────────────────────────────────
  const h = data.header || {};
  if (h.report_title) lines.push(`# ${h.report_title}`);
  const game = h.game || h.game_name;
  if (game) lines.push(`**${game}**`);
  if (h.period_start && h.period_end)
    lines.push(`*Period: ${h.period_start} – ${h.period_end}*`);
  if (h.agent) lines.push(`*Agent: ${h.agent}*`);
  if (h.summary) lines.push(`\n${h.summary}`);
  lines.push("");

  // ── Sections ─────────────────────────────────────────────
  for (const section of data.sections || []) {
    if (section.title) lines.push(`## ${section.title}`, "");

    switch (section.type) {
      case "metric_cards": {
        const items = section.content?.cards || section.items || [];
        for (const item of items) {
          const delta = item.delta ? ` *(${item.delta})*` : "";
          lines.push(`- **${item.label}:** ${item.value ?? "—"}${delta}`);
        }
        break;
      }

      case "table": {
        const cols = section.columns || section.content?.columns || [];
        const rows = section.rows || section.content?.rows || [];
        if (cols.length) {
          lines.push(`| ${cols.join(" | ")} |`);
          lines.push(`| ${cols.map(() => "---").join(" | ")} |`);
          for (const row of rows) {
            const cells = Array.isArray(row)
              ? row
              : cols.map((c) => row[c] ?? "");
            lines.push(`| ${cells.join(" | ")} |`);
          }
        }
        break;
      }

      case "list": {
        const items = section.content?.items || section.items || [];
        for (const item of items) {
          const text =
            typeof item === "string" ? item : item.text || item.label || "";
          lines.push(`- ${text}`);
          if (typeof item === "object" && item.description)
            lines.push(`  ${item.description}`);
        }
        break;
      }

      case "text": {
        const text =
          typeof section.content === "string"
            ? section.content
            : section.content?.body || "";
        if (text) lines.push(text);
        break;
      }

      case "kv_pairs": {
        const items = section.content?.items || section.items || [];
        for (const item of items)
          lines.push(`- **${item.key}:** ${item.value ?? "—"}`);
        break;
      }

      case "score_list": {
        const items = section.content?.items || section.items || [];
        for (const item of items)
          lines.push(`- **${item.label}:** ${item.score}/${item.max ?? 10}`);
        break;
      }

      case "two_column": {
        const left = section.content?.left || section.left;
        const right = section.content?.right || section.right;
        for (const col of [left, right]) {
          if (!col) continue;
          if (col.title) lines.push(`### ${col.title}`, "");
          const items = col.content?.items || col.items || [];
          for (const item of items) {
            const text =
              typeof item === "string" ? item : item.text || item.label || "";
            lines.push(`- ${text}`);
          }
          lines.push("");
        }
        break;
      }

      case "alert_list": {
        const items = section.content?.items || section.items || [];
        for (const item of items) {
          const level = (item.level || item.severity || "info").toUpperCase();
          const desc = item.description || item.body;
          lines.push(`**[${level}] ${item.title}**`);
          if (desc) lines.push(desc);
          lines.push("");
        }
        break;
      }

      default:
        break;
    }

    lines.push("");
  }

  return lines.join("\n");
}
