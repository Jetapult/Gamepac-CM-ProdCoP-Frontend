import React, { useState, useEffect } from "react";

function TxtViewer({ url, selectedPdf }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [url]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <h1 className="text-xl font-bold pt-3">{selectedPdf?.title}</h1>
      <div className="h-[calc(100vh-90px)] overflow-auto">
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {content}
        </pre>
      </div>
    </>
  );
}

export default TxtViewer;
