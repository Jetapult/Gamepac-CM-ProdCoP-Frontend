import React from 'react';

const HighlightText = ({ text, searchTerm }) => {
  if (!searchTerm) {
    return <p className="text-md">{text}</p>;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <p className="text-md">
      {parts.map((part, index) => (
        regex.test(part) ? <mark key={index} style={{ backgroundColor: 'yellow' }}>{part}</mark> : part
      ))}
    </p>
  );
};

export default HighlightText;