const DataTable = ({ headers, children, className = "data-table" }) => (
  <table className={className}>
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th key={index}>{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export default DataTable;
