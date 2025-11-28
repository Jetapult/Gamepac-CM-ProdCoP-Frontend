import React, { useState, useEffect } from "react";

// Import all frames
import frame01 from "../../assets/zero-state-animation/frame-01.svg";
import frame02 from "../../assets/zero-state-animation/frame-02.svg";
import frame03 from "../../assets/zero-state-animation/frame-03.svg";
import frame04 from "../../assets/zero-state-animation/frame-04.svg";
import frame05 from "../../assets/zero-state-animation/frame-05.svg";
import frame06 from "../../assets/zero-state-animation/frame-06.svg";
import frame07 from "../../assets/zero-state-animation/frame-07.svg";
import frame08 from "../../assets/zero-state-animation/frame-08.svg";
import frame09 from "../../assets/zero-state-animation/frame-09.svg";
import frame10 from "../../assets/zero-state-animation/frame-10.svg";
import frame11 from "../../assets/zero-state-animation/frame-11.svg";
import frame12 from "../../assets/zero-state-animation/frame-12.svg";
import frame13 from "../../assets/zero-state-animation/frame-13.svg";
import frame14 from "../../assets/zero-state-animation/frame-14.svg";

const frames = [
  frame01,
  frame02,
  frame03,
  frame04,
  frame05,
  frame06,
  frame07,
  frame08,
  frame09,
  frame10,
  frame11,
  frame12,
  frame13,
  frame14,
];

const ZeroStateAnimation = () => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= frames.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[296px] h-[177px] mx-auto relative bg-white rounded-[8px] overflow-hidden">
      {frames.map((frame, index) => (
        <img
          key={index}
          src={frame}
          alt="Building document"
          className="absolute inset-0 w-full h-full transition-opacity duration-500"
          style={{
            opacity: index <= currentFrame ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
};

export default ZeroStateAnimation;
