import React, { useState, use } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SummaryPage = () => {
  // const location=useLocation();
  // const summary = location.state?.summary||'';
  const [todos, setTodos] = useState("");

  return (
    <div>
      <h3>Summary:</h3>
      <p>{summary}</p>
    </div>
  );
};

export default SummaryPage;
