import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section4_3_TimelineExpectations = ({ data, sectionNumber }) => {
  if (!data) return null;

  const displayTitle = sectionNumber
    ? replaceNumberInTitle(data.title, sectionNumber)
    : data.title;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {displayTitle}
        </SectionTitle>
      )}

      {data.expectations?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.expectations.map(
              (expectation, index) =>
                expectation && (
                  <li
                    key={index}
                    style={{
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "#141414",
                      marginBottom: "12px",
                    }}
                  >
                    {expectation}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Section4_3_TimelineExpectations;
