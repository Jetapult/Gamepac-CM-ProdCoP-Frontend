const Section2_DetailedAnalytics = ({ data }) => {
  if (!data?.title) return null;

  return (
    <div
      style={{
        fontWeight: 500,
        fontSize: "18pt",
        lineHeight: "18pt",
        color: "#141414",
        marginTop: "37.5pt",
      }}
    >
      {data.title}
    </div>
  );
};

export default Section2_DetailedAnalytics;
