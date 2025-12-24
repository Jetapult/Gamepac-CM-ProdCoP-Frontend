import { SectionTitle } from "@/SuperAgent/components/ReviewReport/ui";

const Section4_3_TimelineExpectations = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
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
