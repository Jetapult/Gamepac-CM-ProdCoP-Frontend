const Section4_UserImpact = ({ data, sectionNumber }) => {
  if (!data) return null;
  const displayNumber = sectionNumber || "4.";

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "28px",
    },
    sectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "18px",
      color: "#141414",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    subsection: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    subsectionTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
      color: "#141414",
    },
    description: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
    },
    bold: {
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        {displayNumber} User Impact Analysis
      </div>

      <div style={styles.content}>
        {/* 4.1 Affected User Demographics */}
        <div style={styles.subsection}>
          <div style={styles.subsectionTitle}>
            4.1 Affected User Demographics
          </div>
          <p style={styles.description}>
            {data.demographicsDescription ||
              "The issue has a disproportionate impact on the iOS user base, which accounts for % of the reported incidents. All affected users are premium customers attempting to purchase the Battle Pass, a high-value, recurring revenue stream. Geographic patterns are currently non-specific, suggesting a global deployment issue rather than a regional payment processor problem."}
          </p>
        </div>

        {/* 4.2 Sentiment Impact */}
        <div style={styles.subsection}>
          <div style={styles.subsectionTitle}>4.2 Sentiment Impact</div>
          <p style={styles.description}>
            {data.sentimentDescription || (
              <>
                The bug is causing severe negative sentiment, as evidenced by
                user quotes: "I bought the Battle Pass and got charged twice —
                no extra rewards." and "Every attempt to buy the season pass
                doubles the billing." This directly impacts the app's overall
                rating and review scores on both app stores, with a projected{" "}
                <span style={styles.bold}>0.4 point drop</span> in the -day
                rolling average rating if not immediately addressed.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Section4_UserImpact;
