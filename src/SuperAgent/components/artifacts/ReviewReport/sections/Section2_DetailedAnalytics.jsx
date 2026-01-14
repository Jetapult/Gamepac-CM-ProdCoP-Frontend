import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section2_DetailedAnalytics = ({ data, sectionNumber }) => {
  if (!data?.title) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

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
      {displayTitle}
    </div>
  );
};

export default Section2_DetailedAnalytics;
