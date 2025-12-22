import { useState, useEffect } from "react";
import loader1 from "../../assets/loader/loader-1.svg";
import loader2 from "../../assets/loader/loader-2.svg";
import loader3 from "../../assets/loader/loader-3.svg";
import loader4 from "../../assets/loader/loader-4.svg";
import loader5 from "../../assets/loader/loader-5.svg";
import loader6 from "../../assets/loader/loader-6.svg";
import loader7 from "../../assets/loader/loader-7.svg";
import loader8 from "../../assets/loader/loader-8.svg";

const loaderFrames = [
  loader1,
  loader2,
  loader3,
  loader4,
  loader5,
  loader6,
  loader7,
  loader8,
];

const Loader = ({ size = 18, className = "" }) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % loaderFrames.length);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <img
      src={loaderFrames[currentFrame]}
      alt="Loading..."
      width={size}
      height={size}
      className={`inline-block ${className}`}
    />
  );
};

export default Loader;
