const Section4_ActionableInsights = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
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
      )}

      {data.summary && (
        <div
          style={{
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "21px",
            color: "#141414",
            marginTop: "16pt",
          }}
        >
          {data.summary}
        </div>
      )}
    </>
  );
};

export default Section4_ActionableInsights;
