import {
  ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadCrumbs from "./BreadCrumbs";

const Overview = () => {
  const [activeSection, setActiveSection] = useState("");
  const sectionsRef = useRef({});
  const navigate = useNavigate();

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
    setActiveSection(id);
  };
  return (
    <div className="flex flex-wrap py-6">
      <div className="w-full sm:w-3/4 px-6">
        <BreadCrumbs name="Overview" />
        <br />
        <h1 className="text-5xl text-[#092139] font-black mb-7">Overview</h1>
        <h2
          id="whats-Gamepac"
          ref={(el) => (sectionsRef.current["whats-Gamepac"] = el)}
          className="text-4xl text-[#092139] font-black mb-6"
        >
          What's Gamepac?
        </h2>
        <p className="text-lg text-[#092139] pb-5">
          Gamepac is your AI-powered secret weapon for managing user feedback on
          Google Play Store or App App Store and turning your users into your
          loyal gamers.
        </p>
        <p className="text-lg text-[#092139] pb-2">
          We at{" "}
          <a
            className="text-[#ff1053]"
            href="https://www.jetapult.me/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jetapult
          </a>{" "}
          have been in the game industry for over a decade, and we know how
          important it is to keep your players engaged and happy. That's why we
          created Gamepac, a platform that helps you manage user feedback,
          automate responses, and create targeted campaigns to keep your users
          excited and coming back for more.
        </p>
        <p className="text-lg text-[#092139] py-5">It empowers you to:</p>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">
            <b>Save Time:</b> Automate repetitive tasks and respond to users
            efficiently.
          </li>
          <li className="text-lg text-[#092139] py-3">
            <b>Boost Engagement:</b> Create targeted campaigns that keep users
            excited and coming back for more.
          </li>
          <li className="text-lg text-[#092139] py-3">
            <b>Improve Your App:</b> Gain valuable insights from user feedback
            to make data-driven decisions and refine your game.
          </li>
          <li className="text-lg text-[#092139] py-3">
            <b>Build a Community:</b> Foster a positive and supportive
            environment where users feel heard and valued.
          </li>
        </ul>
        <h2
          id="how-can-i-use-gamepac"
          ref={(el) => (sectionsRef.current["how-can-i-use-gamepac"] = el)}
          className="text-4xl text-[#092139] font-black my-4"
        >
          How can I use Gamepac?
        </h2>
        <p className="text-lg text-[#092139] pb-4">
          Get started on Gamepac is easy.
        </p>
        <p className="text-lg text-[#092139] pb-4">
          Simply subscribe for a free trial account, and your welcome email with
          your freshly minted Gamepac account details will be on its way!
        </p>
        <h2
          id="next-steps"
          ref={(el) => (sectionsRef.current["next-steps"] = el)}
          className="text-4xl text-[#092139] font-black my-4"
        >
          Next Steps
        </h2>
        <p className="text-lg text-[#092139] pb-4">
          Once you've signed up, you can start by{" "}
          <a
            className="text-[#ff1053] cursor-pointer"
            onClick={() => navigate("/docs/app-onboarding")}
          >
            onboarding your app
          </a>{" "}
          to Gamepac. This will allow you to start collecting reviews and
          feedback from your app store listings.
        </p>
        <div
          className="flex flex-col justify-items-end items-end cursor-pointer my-3"
          onClick={() => navigate("/docs/app-onboarding")}
        >
          <span className="block">Next</span>
          <p className="text-[#ff1053] text-lg font-black">
            App Onboarding Setup
            <ChevronDoubleRightIcon className="inline w-4 h-4 ml-2" />
          </p>
        </div>
      </div>
      <div className="w-1/4 px-4 hidden sm:block">
        <div className="border-l border-l-[1px] border-[#dadde1] sticky top-[4rem]">
          <ul className="pl-6 py-3">
            <li className="pb-1">
              <a
                className={`block py-2 w-full pl-3 rounded cursor-pointer ${
                  activeSection === "whats-Gamepac"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("whats-Gamepac")}
              >
                What's Gamepac?
              </a>
            </li>
            <li className="pb-1">
              <a
                className={`block py-2 w-full pl-3 rounded cursor-pointer ${
                  activeSection === "how-can-i-use-gamepac"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("how-can-i-use-gamepac")}
              >
                How can I use Gamepac?
              </a>
            </li>
            <li className="pb-1">
              <a
                className={`block py-2 w-full pl-3 rounded cursor-pointer ${
                  activeSection === "next-steps"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("next-steps")}
              >
                Next Steps
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
