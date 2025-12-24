import { SectionTitle } from "@/SuperAgent/components/ReviewReport/ui";

const Section3_3_FeatureSpecificFeedback = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
        </SectionTitle>
      )}

      {data.features?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.features.map(
              (feature, index) =>
                feature?.title && (
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
                    <strong>{feature.title}:</strong>{" "}
                    {feature.description || ""}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Section3_3_FeatureSpecificFeedback;
