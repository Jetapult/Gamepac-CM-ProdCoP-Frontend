import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";
import { replaceNumberInTitle } from "@/SuperAgent/components/artifacts/ReviewReport/utils/sectionNumbering";

const Section4_4_FinalValidation = ({ data, sectionNumber }) => {
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

      {data.validation?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.validation.map(
              (item, index) =>
                item?.title && (
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
                    <strong>{item.title}:</strong> {item.value || "N/A"}
                  </li>
                )
            )}
          </ul>
        </div>
      )}

      {data.reportMetadata?.length > 0 && (
        <div style={{ marginTop: "24pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.reportMetadata.map(
              (item, index) =>
                item?.title && (
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
                    <strong>{item.title}:</strong> {item.value || "N/A"}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Section4_4_FinalValidation;
