import { useState } from "react";
import ChevronDown from "../../assets/chevron-down.svg";

const data = [
  {
    id: "1",
    title: "GamePac v2.0.0",
    description: `StoryWeaver: AI-Powered Storytelling Revolutionized
      Unleash your creativity with StoryWeaver, our platform for crafting immersive narratives and generating AI assets and Game Ready word search levels. Any user can now:
      - Create their own captivating stories across multiple genres
      - Leverage Midjourney prompts to generate stunning visual assets for their narratives
      - Design engaging word search levels based on their stories for an interactive experience
      AI Game Prototype
      If you haven’t already played our game download it from here : https://drive.google.com/file/d/1fctHjUL9satveSDYWLWcDKSTC_APHybZ/view?usp=drivesdk
      and new games can be made leveraging-> StoryWeaver.
      GamePac AI: Empowering Studios with Multitenancy and More
      GamePac AI continues to empower game studios with cutting-edge features:
      - Multitenancy support: Studios can now leverage all our features with their own dedicated environments, ensuring privacy and customization.
      - Streamlined UMX onboarding: Seamlessly onboard new users to your studio's environment.
      - Roles and permissions: Assign granular access controls to team members for secure collaboration.
      Plus, enjoy our comprehensive suite of tools, including social features, analytics, note-taking, and more, all tailored to drive your studio's success.
      Embrace the future of game development with GamePac AI's innovative solutions.`,
    feature: [
      {
        id: "1",
        update_type: "New Feature Launch",
        title: "StoryWeaver: AI-Powered Storytelling Revolutionized",
        description: `Unleash your creativity with StoryWeaver, our platform for crafting immersive narratives and generating AI assets and Game Ready word search levels. Any user can now:
          - Create their own captivating stories across multiple genres
          - Leverage Midjourney prompts to generate stunning visual assets for their narratives
          - Design engaging word search levels based on their stories for an interactive experience`,
      },
      {
        id: "2",
        update_type: "New Feature Launch",
        title: "GamePac AI: Empowering Studios with Multitenancy and More",
        description: `GamePac AI continues to empower game studios with cutting-edge features:
          - Multitenancy support: Studios can now leverage all our features with their own dedicated environments, ensuring privacy and customization.
          - Streamlined UMX onboarding: Seamlessly onboard new users to your studio's environment.
          - Roles and permissions: Assign granular access controls to team members for secure collaboration.
          Plus, enjoy our comprehensive suite of tools, including social features, analytics, note-taking, and more, all tailored to drive your studio's success.
          Embrace the future of game development with GamePac AI's innovative solutions.`,
      },
      {
        id: "3",
        update_type: "New Game Launch",
        title: "AI Game Prototype",
        description: `If you haven’t already played our game download it from here : <a style="text-decoration: underline; color: #1a0dab;" href="https://drive.google.com/file/d/1fctHjUL9satveSDYWLWcDKSTC_APHybZ/view?usp=drivesdk" target="_blank">Click Link</a>
          and new games can be made leveraging-> StoryWeaver.`,
      },
    ],
    date: "2024-04-29",
  },
];
const Updates = () => {
  const [show, setShow] = useState("");
  const onExpand = (item) => {
    if (show === item.id) {
      setShow("");
    } else {
      setShow(item.id);
    }
  };
  return (
    <div className="py-10 px-10 bg-white min-h-screen">
      <p className="text-2xl font-bold pb-5">GamePac Updates</p>
      {data?.map((item) => (
        <div
          key={item.id}
          className="gap-2 py-4 px-4 border border-1 rounded cursor-pointer"
          onClick={() => onExpand(item)}
        >
          <p className="flex items-center justify-between">
            {item?.title} - {item?.date}
            <img src={ChevronDown} className={`w-5 h-5 ${show === item.id ? "rotate-180" : "animate-bounce"} transition-all duration-300`} />
          </p>
          {show === item.id && <div className=" font-inter">
            <main className="mx-auto max-w-8xl py-8 px-4 md:px-6 lg:px-8">
              <section className="mb-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {item.feature.map((feature) => (
                    <div className="rounded-lg bg-white shadow-lg border-[0.5px] p-4" key={feature.id}>
                      <h3 className="mb-2 text-md font-semibold">
                        {feature.update_type}
                      </h3>
                      <h2 className="mb-2 text-xl font-semibold">{feature.title}</h2>
                      <p
                        className=" break-words"
                        dangerouslySetInnerHTML={{
                          __html: feature.description,
                        }}
                      ></p>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>}
        </div>
      ))}
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
