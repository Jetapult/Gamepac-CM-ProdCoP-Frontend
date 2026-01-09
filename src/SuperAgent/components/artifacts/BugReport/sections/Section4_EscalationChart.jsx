import escalationChartImage from "@/assets/bug-report/escalation-chart.png";

const Section4_EscalationChart = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      marginTop: "24px",
      width: "100%",
    },
    image: {
      width: "100%",
      borderRadius: "12px",
    },
  };

  return (
    <div style={styles.container}>
      <img
        src={escalationChartImage}
        alt="Escalation Trend Chart"
        style={styles.image}
      />
    </div>
  );
};

export default Section4_EscalationChart;
