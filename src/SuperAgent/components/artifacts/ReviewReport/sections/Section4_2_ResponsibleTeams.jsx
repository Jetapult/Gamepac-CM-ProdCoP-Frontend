import { SectionTitle } from "@/SuperAgent/components/artifacts/ReviewReport/ui";

const Section4_2_ResponsibleTeams = ({ data }) => {
  if (!data) return null;

  return (
    <>
      {data.title && (
        <SectionTitle style={{ marginTop: "37.5pt" }}>
          {data.title}
        </SectionTitle>
      )}

      {data.teams?.length > 0 && (
        <div style={{ marginTop: "16pt" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
            {data.teams.map(
              (team, index) =>
                team?.title && (
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
                    <strong>{team.title}:</strong> {team.description || ""}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Section4_2_ResponsibleTeams;
