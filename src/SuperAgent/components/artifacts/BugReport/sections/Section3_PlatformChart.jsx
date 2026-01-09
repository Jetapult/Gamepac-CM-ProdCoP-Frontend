import platformChartImage from "@/assets/bug-report/platform-chart.png";

const Section3_PlatformChart = ({ data }) => {
  if (!data) return null;

  const styles = {
    container: {
      marginTop: "24px",
      width: "100%",
    },
    image: {
      width: "100%",
      borderRadius: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <img
        src={platformChartImage}
        alt="Platform Distribution Chart"
        style={styles.image}
      />
    </div>
  );
};

export default Section3_PlatformChart;
