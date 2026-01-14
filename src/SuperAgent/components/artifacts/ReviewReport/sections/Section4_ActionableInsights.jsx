import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section4_ActionableInsights = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

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
          {displayTitle}
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
