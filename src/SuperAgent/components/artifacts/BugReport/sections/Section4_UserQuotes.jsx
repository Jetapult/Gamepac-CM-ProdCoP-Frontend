const QuoteCard = ({ quote, author }) => (
  <div
    style={{
      background: "#f5f5f5",
      borderLeft: "5px solid #2c2c2c",
      padding: "12px 16px",
      height: "96px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width: "100%",
      boxSizing: "border-box",
    }}
  >
    <p
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontStyle: "italic",
        fontSize: "14px",
        lineHeight: "21px",
        color: "#141414",
        margin: 0,
      }}
    >
      "{quote}"
    </p>
    <p
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "21px",
        color: "#6d6d6d",
        margin: 0,
      }}
    >
      {author}
    </p>
  </div>
);

const Section4_UserQuotes = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "16px",
    },
  };

  const quotes = data.quotes || [
    {
      quote:
        "This is completely unacceptable. I was charged twice for my Battle Pass and now my account is overdrawn. Fix this immediately or I'm uninstalling",
      author: "iOS User - Premium Customer since 2022",
    },
    {
      quote:
        "I'm beyond frustrated! I've been charged twice for the Valoria Pass. Sort this out ASAP, or I'm done with this game!",
      author: "iOS User - Premium Customer since 2022",
    },
  ];

  return (
    <div style={styles.container}>
      {quotes.map((item, index) => (
        <QuoteCard key={index} quote={item.quote} author={item.author} />
      ))}
    </div>
  );
};

export default Section4_UserQuotes;
