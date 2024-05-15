import { useState } from "react";
import UpdatesPopup from "./UpdatesPopup";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Helmet } from "react-helmet";

const data = [
  {
    id: "2",
    title: "Jetapult AI Update - 15th May 2024",
    short_description: "Hello Team, We are excited to share a bunch of exciting updates with you regarding HTML5 ads, our AI games, asset generation and more.",
    feature: [
      {
        id: "1",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/playable-games.png",
        update_type: "New Feature Launch",
        title: "HTML5 Playable Ads Prototype",
        description: `<ul>
        <li>- Releasing our very first attempts at creating HTML5 ads. These demos are rough and we are figuring out the dev pipeline that lets pump ads at scale. <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://app.gamepacai.com/html5-games">Try them here.</a></li>
        </ul>
        `,
      },
      {
        id: "2",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Dialogue_1.jpg",
        update_type: "AI Game updates",
        title: "AI Game Launch Update",
        description: `<ul><li>- Our intermediate release of the Murder Mystery AI Game. Please download here.   </li></ul>`,
      },
      {
        id: "3",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/word-levels.png",
        update_type: "Game Impact",
        title: "AI Generated Word Levels Impact (HDW5)",
        description: `<ul>
        <li>French:<br /> -D1 and D7 retention increased by 18% (25.15% to 29.62%) and 7% (8.96% to 9.58%) respectively.  </li>
        <li>Spanish:<br /> -Engagement time increased by 8% (32.4 min to 34.98 min) and as a result, Impressions/DAU increased by 6% (5.42 to 5.75).<br/> -D1 and D7 retention increased by 25% (22.7% to 28.45%) and 40% (6.04% to 8.44%) respectively. </li>
        </ul>`,
      },
      {
        id: "4",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/ml.png",
        update_type: "ML Models",
        title: "ML Models For Gaming",
        description: `<ul>
        <li>- We built churn, purchase propensity and LTV prediction models with an external agency. </li>
        <li>- We are currently planning their deployment into our games.</li>
        </ul>`,
      },
      {
        id: "5",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/looker-studio-analytics.png",
        update_type: "Game Development",
        title: "Gaming Dashboards",
        description: `<ul><li>- We have also developed and are testing a new furniture variation generator, working with Fastcode. </li>
        <li>- This will helps us monetise our furniture assets much better with more variety available.</li></ul>`,
      },
      {
        id: "6",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/image.png",
        update_type: "R&D",
        title: "Automated ASO Game Icon Generation[Coming Soon]",
        description: `<ul><li>- We already work closely with HolyCow team to help them create game icons. </li>
        <li>- We aim to automate this process and scale the ASO process for any studio.</li></ul>`,
      },
      {
        id: "7",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Masterlayer_Room1_SetA.png",
        update_type: "Game Developemnt",
        title: "Furniture Variation Generator ",
        description: `<ul><li>- We have also developed and are testing a new furniture variation generator, working with Fastcode. </li>
        <li>- This will helps us monetise our furniture assets much better with more variety available.</li></ul>`,
      },
    ],
    date: "Released on 15th May 2024",
  },
  {
    id: "1",
    title: "Jetapult AI Update - 29th April 2024",
    short_description: "Bi-weekly updates on current and future AI developments at Jetapult",
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
  const [show, setShow] = useState("2");
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
      <Helmet>
        <title>My Page Title</title>
        <meta property="og:title" content="GamePAC AI | Updates" />
        <meta
          property="og:description"
          content="Explore the latest updates on Gamepac AI, featuring new game developments, feature enhancements, and crucial bug fixes. Stay informed about our ongoing improvements and innovations in gaming technology."
        />
        <meta property="og:url" content="https://app.gamepacai.com/updates" />
        <meta
          property="og:image"
          content="https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gamepac-ai-updates-banner.png"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GamePAC AI | Updates" />
        <meta
          name="twitter:description"
          content="Explore the latest updates on Gamepac AI, featuring new game developments, feature enhancements, and crucial bug fixes. Stay informed about our ongoing improvements and innovations in gaming technology."
        />
        <meta
          name="twitter:image"
          content="https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gamepac-ai-updates-banner.png"
        />
      </Helmet>
      <p className="text-2xl font-bold pb-5">What's New</p>
      {data?.map((item) => (
        <div
          key={item.id}
          className="gap-2 py-4 px-4 border border-1 rounded-md cursor-pointer mb-4"
        >
          <div
            className="flex items-center justify-between"
            onClick={() => onExpand(item)}
          >
            <div className="">
              <p className="">{item?.title}</p>
            </div>
            <button className="border rounded py-1 px-4">
              View{" "}
              <ChevronDownIcon
                className={`w-5 h-5 ${
                  show === item.id ? "rotate-180" : ""
                } transition-all duration-300 inline`}
              />
            </button>
          </div>
          {show === item.id && (
            <div className="bg-[#1a1a1a] text-white mt-3">
              <header className="bg-gradient-to-r from-[#6b3fa0] to-[#8b5cf6] py-12 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto max-w-5xl flex flex-col items-center">
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                    Jetapult AI Updates
                  </h1>
                  <p className="mt-3 text-sm text-gray-300">
                    {item.short_description}
                  </p>
                </div>
              </header>
              <div className=" font-inter">
                <main className="mx-auto max-w-8xl py-8 px-4 md:px-6 lg:px-8">
                  <section className="mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {item?.feature?.map((feature) => (
                        <div
                          className="rounded-lg bg-[#262626] shadow-lg p-4"
                          key={feature.id}
                          onClick={() => setShowUpdatePopup(feature)}
                        >
                          {feature.img ? <img src={feature.img} alt="img" className="h-44 w-full mb-4 rounded-lg" /> : <></>}
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
export default Updates;
