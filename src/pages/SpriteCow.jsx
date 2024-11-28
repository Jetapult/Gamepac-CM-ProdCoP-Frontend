import React, { useState } from "react";
import ToastMessage from "../components/ToastMessage";

const SpriteCow = () => {
  const [cssRule, setCssRule] = useState("");
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  function convertSpriteToFrame(cssRule) {
    // Extract values using more flexible regex patterns
    const bgPosMatch = cssRule.match(/(-?\d+)px\s+(-?\d+)px/) || 
                       cssRule.match(/(-?\d+)px/) || 
                       ['0', '0', '0']; // default values if no match
    
    const widthMatch = cssRule.match(/width:\s*(\d+)px/) || ['0', '0'];
    const heightMatch = cssRule.match(/height:\s*(\d+)px/) || ['0', '0'];

    // Convert to positive numbers by removing the negative sign
    const x = Math.abs(parseInt(bgPosMatch[1] || 0));
    const y = Math.abs(parseInt(bgPosMatch[2] || 0));
    const w = parseInt(widthMatch[1] || 0);
    const h = parseInt(heightMatch[1] || 0);

    // Create the desired JSON structure
    return { x, y, w, h };
  }

  function copyCssToClipboard() {
    const json = convertSpriteToFrame(cssRule);
    navigator.clipboard.writeText(JSON.stringify(json));
    setToastMessage({
      show: true,
      message: "JSON copied to clipboard",
      type: "success",
      duration: 3000,
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <textarea className="" value={cssRule} onChange={(e) => setCssRule(e.target.value)} cols={100} rows={10} />
      <div className="flex gap-2">
        <button onClick={copyCssToClipboard} className="bg-blue-500 text-white p-2 rounded">copy css to clipboard</button>
        <button onClick={() => setCssRule("")} className="bg-blue-500 text-white p-2 rounded">reset</button>
      </div>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default SpriteCow;
