const TextBlock = ({ section }) => {
  if (!section?.content) return null;

  return (
    <div
      style={{
        marginTop: "16pt",
        fontSize: "14px",
        lineHeight: "21px",
        color: "#333",
        whiteSpace: "pre-wrap",
      }}
    >
      {section.content}
    </div>
  );
};

export default TextBlock;
