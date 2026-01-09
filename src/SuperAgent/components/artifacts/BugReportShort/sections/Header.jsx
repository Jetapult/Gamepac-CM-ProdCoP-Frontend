const Header = ({ data = {} }) => {
  return (
    <div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "21px",
          color: "#141414",
        }}
      >
        {data.title || ""}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          color: "#6d6d6d",
          marginTop: "4px",
        }}
      >
        {data.dateRange || ""} | Generated: {data.generatedAt || ""}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "48px",
          lineHeight: "56px",
          color: "#141414",
          marginTop: "72px",
        }}
      >
        {data.mainTitle || ""}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: "24px",
          letterSpacing: "0.16px",
          color: "#141414",
          marginTop: "20px",
        }}
      >
        {data.summary || ""}
      </div>
    </div>
  );
};

export default Header;
