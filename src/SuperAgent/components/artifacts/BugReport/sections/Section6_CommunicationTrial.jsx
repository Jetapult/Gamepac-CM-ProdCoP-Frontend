const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 2V6"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2V6"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 10H21"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChartBarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 20V10"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 20V4"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20V16"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#6d6d6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoteItem = ({ icon, title, description }) => (
  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      width: "100%",
    }}
  >
    <div
      style={{
        width: "54px",
        height: "53px",
        background: "#f8f8f8",
        border: "1px solid #dfdfdf",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "21px",
          color: "#141414",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "21px",
          color: "#6d6d6d",
        }}
      >
        {description}
      </span>
    </div>
  </div>
);

const Section6_CommunicationTrial = ({ data = {}, sectionNumber }) => {
  const displayNumber = sectionNumber || "6.";
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
      gap: "16px",
    },
    notesTitle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
    },
    notesContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  const notes = data.internalNotes || [
    {
      icon: <CalendarIcon />,
      title: "Jan 12, 2025 -Initial Discovery",
      description:
        "Decision: Prioritize server-side fix over client update due to App Store review times.",
    },
    {
      icon: <ChartBarIcon />,
      title: "Jan 13, 2025 -Impact Assessment Complete",
      description:
        "Backend analysis confirmed webhook race condition. User impact quantified at 1,742-2,310 affected",
    },
    {
      icon: <UsersIcon />,
      title: "Jan 14, 2025 - Solution Planning Session",
      description:
        "Engineering leads aligned on Approach B. Resource allocation approved by Product VP.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>{displayNumber} Communication Trial</div>

      <div style={styles.content}>
        <div style={styles.notesTitle}>Internal Notes</div>
        <div style={styles.notesContainer}>
          {notes.map((note, index) => (
            <NoteItem
              key={index}
              icon={note.icon || <CalendarIcon />}
              title={note.title}
              description={note.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section6_CommunicationTrial;
