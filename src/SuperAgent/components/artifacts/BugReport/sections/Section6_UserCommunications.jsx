const Section6_UserCommunications = ({ data = {} }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "20px",
    },
    title: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
      color: "#141414",
    },
    list: {
      margin: 0,
      paddingLeft: "21px",
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "21px",
      color: "#141414",
      listStyleType: "disc",
    },
    listItem: {
      marginBottom: "12px",
    },
    bold: {
      fontWeight: 700,
    },
  };

  const communications = data.userCommunications || [
    {
      label: "Support Ticket Summary:",
      text: "The majority of tickets (%) are direct inquiries regarding the double charge and request for immediate refund. Tone is generally frustrated but civil.",
    },
    {
      label: "Standard Response Template:",
      text: "We are aware of a critical issue affecting Battle Pass purchases and are working on an immediate fix and automated refund process. We apologize for the inconvenience and will notify you when the refund is processed.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.title}>User Communications</div>
      <ul style={styles.list}>
        {communications.map((item, index) => (
          <li key={index} style={styles.listItem}>
            <span style={styles.bold}>{item.label} </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Section6_UserCommunications;
