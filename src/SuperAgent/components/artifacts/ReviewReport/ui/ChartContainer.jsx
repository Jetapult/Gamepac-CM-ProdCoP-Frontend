const ChartContainer = ({ src, alt }) => (
  <div
    style={{
      marginTop: "24pt",
      width: "100%",
      background: "#f5f5f5",
      borderRadius: "8px",
      padding: "24px",
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  </div>
);

export default ChartContainer;
