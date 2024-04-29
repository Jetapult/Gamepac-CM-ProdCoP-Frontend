import { useState } from "react";
import ChevronDown from "../../assets/chevron-down.svg";
import UpdatesPopup from "./UpdatesPopup";

const data = [
  {
    id: "1",
    title: "GamePac Version 2.0.0",
    feature: [
      {
        id: "1",
        update_type: "New Feature Launch",
        title: "Multitenancy Enabled GamePac Suite",
        description: `<ul>
        <li>- Multitenancy support: Studios can now leverage all our features with their own dedicated environments, ensuring privacy and customization.</li>
        <li>- Streamlined studio onboarding: We can now seamlessly onboard new studios/users to studio's environment.</li>
        <li>- Roles and permissions: We can assign granular access controls to team members for secure collaboration.</li>
        </ul>
        `,
      },
      {
        id: "2",
        update_type: "New Feature Launch",
        title: "StoryWeaver (Story Narrative Generator)",
        description: `<ul><li>- Users can create their own captivating stories across multiple genres.</li>
        <li>- Automatically generates Midjourney prompts to generate stunning visual assets for their narratives.</li>
        <li>- Automatically generates engaging word search levels based on their stories for an interactive experience.</li></ul>`,
      },
      {
        id: "3",
        update_type: "New Game Launch",
        title: "First AI Game Prototype ",
        description: `<ul>
        <li>- "Murder Mystery: Word Detective" MVP has been developed, and we're ready with a launch plan.</li>
        <li>- We've also gathered feedback to improve the game and make it launch-ready.</li>
        </ul>`,
      },
      {
        id: "4",
        update_type: "Improvements",
        title: "Organic UA Email Improvements",
        description: `<ul>
        <li>- Organic UA Suite weekly emails now include game versions where bug fixes are required or users are facing problems </li>
        </ul>`,
      },
      {
        id: "5",
        update_type: "Improvements",
        title: "Organic UA automation",
        description: `<ul>
        <li>- Organic UA has been automated for 3 games (HDD, HDW5, HDW2) for the past month. We are monitoring the replies for bugs.</li>
        </ul>`,
      },
      {
        id: "6",
        update_type: "R&D",
        title: "HTML5 Playable Ads R&D ",
        description: `<ul><li>- We have started HTML5 playable ads R&D. And looking to come up with a feasibility plus development pipeline. </li></ul>`,
      },
      {
        id: "7",
        update_type: "Improved Performance",
        title: "AI Generated Word Levels Impact (HDW5)",
        description: `<ul><li>- Portuguese levels doubled the Ad ARPDAU from 0.043 to 0.085 for a specific time period.</li>
        <li>- Spanish levels helped significantly improve D1 and D7 metrics for Spanish players.</li></ul>`,
      },
      {
        id: "8",
        update_type: "Improved Performance",
        title: "AI Generated Word Levels R&D (HDW)",
        description: `<ul>
        <li>- Following the impact of HDW5, HDW level generation for other languages is undergoing R&D. With Word Search solved, R&D for Arabic levels is in progress with QC.</li>
        </ul>`,
      },
      {
        id: "9",
        update_type: "Game Personalisation",
        title: "ML Models For In Game Personalisation",
        description: `<ul>
        <li>- Trained ML models relating to churn prediction and payer propensity. Planning activation strategies with Product team..</li>
        </ul>`,
      },
      {
        id: "10",
        update_type: "Game Personalisation",
        title: "Room Generation",
        description: `<ul>
        <li>- Working with Fastcode, we have developed an alternative art pipeline to make rooms quickly. We are improving the pipeline in the next iteration but we intend to introduce these AI generated rooms to players soon. <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://drive.google.com/file/d/13aXzMcSi61duoj4dVaDcT-3mims9qspX/view?usp=drive_link">Demo link.</a></li>
        </ul>`,
      },
    ],
    date: "Released on 29th April 2024",
  },
];
const Updates = () => {
  const [show, setShow] = useState("");
  const [showUpdatePopup, setShowUpdatePopup] = useState({});
  const onExpand = (item) => {
    if (show === item.id) {
      setShow("");
    } else {
      setShow(item.id);
    }
  };
  return (
    <div className="py-10 px-10 bg-white min-h-screen">
      <p className="text-2xl font-bold pb-5">What's New</p>
      {data?.map((item) => (
        <div
          key={item.id}
          className="gap-2 py-4 px-4 border border-1 rounded-md cursor-pointer"
        >
          <div
            className="flex items-center justify-between"
            onClick={() => onExpand(item)}
          >
            <div className="">
              <p className="">{item?.title}</p>
              <span className="text-gray-400">{item?.date}</span>
            </div>
            <img
              src={ChevronDown}
              className={`w-5 h-5 ${
                show === item.id ? "rotate-180" : "animate-bounce"
              } transition-all duration-300`}
            />
          </div>
          {show === item.id && (
            <div className="bg-[#1a1a1a] text-white">
              <header className="bg-gradient-to-r from-[#6b3fa0] to-[#8b5cf6] py-12 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto max-w-5xl flex flex-col items-center">
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                    Jetapult AI Updates
                  </h1>
                  <p className="mt-3 text-sm text-gray-300">
                    Bi-weekly updates on current and future AI developments at
                    Jetapult
                  </p>
                </div>
              </header>
              <div className=" font-inter">
                <main className="mx-auto max-w-8xl py-8 px-4 md:px-6 lg:px-8">
                  <section className="mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {item.feature.map((feature) => (
                        <div
                          className="rounded-lg bg-[#262626] shadow-lg p-4"
                          key={feature.id}
                          onClick={() => setShowUpdatePopup(feature)}
                        >
                          <h3 className="mb-2 text-md font-semibold">
                            {feature.update_type}
                          </h3>
                          <h2 className="mb-2 text-xl font-semibold">
                            {feature.title}
                          </h2>
                          <p
                            className="text-gray-400 break-words line-clamp-5"
                            dangerouslySetInnerHTML={{
                              __html: feature.description,
                            }}
                          ></p>
                        </div>
                      ))}
                    </div>
                  </section>
                </main>
              </div>
            </div>
          )}
        </div>
      ))}
      {Object.keys(showUpdatePopup).length > 0 && (
        <UpdatesPopup
          showUpdatePopup={showUpdatePopup}
          setShowModal={setShowUpdatePopup}
        />
      )}
    </div>
  );
};

function AwardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function BriefcaseIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function CloudIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function CpuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}

function RocketIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export default Updates;
