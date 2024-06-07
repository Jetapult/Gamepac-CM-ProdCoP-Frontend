import { useEffect, useRef, useState } from "react";
import BreadCrumbs from "./BreadCrumbs";

const Campaign = () => {
  const [activeSection, setActiveSection] = useState("");
  const sectionsRef = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.7 }
    );

    Object.values(sectionsRef.current).forEach((section) => {
      observer.observe(section);
    });

    return () => {
      Object.values(sectionsRef.current).forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const handleClick = (id) => {
    sectionsRef.current[id].scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex flex-wrap py-6">
      <div className="w-full sm:w-3/4 px-6">
        <BreadCrumbs name="Campaign Integration" />
        <br />
        <h1 className="text-5xl text-[#092139] font-black mb-6">
          Campaign Integration
        </h1>
        <p className="text-lg text-[#092139] pb-4">
          Onboarding on Gamepac takes <b>less than 15 minutes</b>. Here's a
          step-by-step guide to get you started for onboarding with either your
          Google Play Store or Apple App Store account to Gamepac.
        </p>
      </div>
      <div className="w-1/4 px-4">
        {/* <div className="border-l border-l-[1px] border-[#dadde1] sticky top-[4rem]">
          <ul className="table-of-contents table-of-contents__left-border pl-6 py-3">
            <li className="pb-1">
              <a
                href="#google-play-store"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "google-play-store"
                    ? "active bg-[#f0f6ff] text-[#1e96fc]"
                    : ""
                }`}
                onClick={() => handleClick("google-play-store")}
              >
                Google Play Store
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#apple-app-store"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "apple-app-store"
                    ? "active bg-[#f0f6ff] text-[#1e96fc]"
                    : ""
                }`}
                onClick={() => handleClick("apple-app-store")}
              >
                Apple App Store
              </a>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Campaign;
