import React from 'react';
import { useLocation } from 'react-router-dom';

const TranscriptionPage = () => {
    const location=useLocation();
    const transcription = location.state?.copy||'';
  
    return (
      <div>
        <h3>Transcription:</h3>
        <p>{transcription}</p>
      </div>
    );
  };

export default TranscriptionPage;
