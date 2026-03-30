const Table = ({ section }) => {
  if (!section?.columns?.length || !section?.rows?.length) return null;

  return (
    <div style={{ marginTop: "16pt", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {section.columns.map((col, i) => (
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
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ background: ri % 2 === 0 ? "#ffffff" : "#fafafa" }}
            >
              {(Array.isArray(row) ? row : section.columns.map((c) => row[c])).map((cell, ci) => (
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
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
