// Handles both schemas:
// Designed: columns = string[], rows = string[][] | object[]
// Agent:    columns = {key, label, align}[], rows = object[] keyed by col.key
const Table = ({ section }) => {
  const rawCols = section?.content?.columns || section?.columns || [];
  const rows = section?.content?.rows || section?.rows || [];
  if (!rawCols.length || !rows.length) return null;

  // Normalise columns to {key, label}
  const columns = rawCols.map((col) =>
    typeof col === "string" ? { key: col, label: col } : { key: col.key ?? col.label, label: col.label ?? col.key }
  );

  return (
    <div style={{ marginTop: "16pt", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  background: "#f5f5f5",
                  borderBottom: "1px solid #e5e5e5",
                  fontWeight: 600,
                  color: "#141414",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#ffffff" : "#fafafa" }}>
              {columns.map((col, ci) => {
                const cell = Array.isArray(row) ? row[ci] : row[col.key];
                return (
                  <td
                    key={ci}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#333",
                      verticalAlign: "top",
                    }}
                  >
                    {cell ?? "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
