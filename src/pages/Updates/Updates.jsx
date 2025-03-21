import { useState } from "react";
import UpdatesPopup from "./UpdatesPopup";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Helmet } from "react-helmet";

const data = [
  {
    id: "5",
    title: "Jetapult AI Update - 20th November 2024",
    short_description: "New analysis tool, AI asset pipelines and much more. ",
    feature: [
      {
        id: "1",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/querypac.png",
        update_type: "QueryPac",
        title: "KnowledgeBase + Copilot for your research journey.",
        // short_description: "Quick insights about reviews.",
        description: `<ul><li>- Your KnowledgeBase + Copilot for your research journey. Works with large PDF containing charts, diagrams and others. Also works with excel and CSVs. </li>
       </ul>`,
      },
      {
        id: "2",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/landing.png",
        update_type: "UI updates",
        title: "GamePac revamped to Jetapult brand colours.",
        // short_description: `Quick search filters for advanced searches. `,
        description: `<ul>
        <li>- GamePac revamped to Jetapult brand colours.	GamePac revamped to Jetapult brand colours. </a></li>
        </ul>
        `,
      },
      {
        id: "3",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/translatepac.png",
        update_type: "TranslatePac",
        title:
          "Use AI translations with high accuracy for better ASO and UA listings ",
        short_description: "We can welcome external studios to Gamepac Suite",
        description: `<ul><li>- Use AI translations with high accuracy for better ASO and UA listings </li></ul>`,
      },
      {
        id: "4",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/aipipeline.png",
        update_type: "AI Assets",
        title: "Successfully generated a christmas room!",
        // short_description: "High level dashboards with daa from authoratative sources now possible.",
        description: `<ul>
        <li>- AI Generated pipeline for Christmas, Valentines and future seasons being worked on with advisor Dr. Arjun Jain. </li> 
        <li>- We see better room quality and variations in style than previous pipelines. .  </li>
           <li>- Gameplay Link - <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://drive.google.com/drive/folders/1V2U2shwnR3nrJQ8HMkc4qO384i0Yxpkg">link</a>
        </ul>`,
      },
      {
        id: "5",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/datainfra.png",
        update_type: "Data update",
        title: "Data Enrichment for Marketing and Product Analytics",
        // short_description: "Jetapult's first playable ads.",
        description: `<ul>
        <li>- Enhanced data pipelines with attribution and engagement metrics from Adjust & Clevertap, supporting marketing and product analytics for user acquisition and retention insights. </li>
        </ul>`,
      },
      {
        id: "6",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Murdermysterylogo.png",
        update_type: "AI Game update",
        title: "Adjust Added.",
        short_description: `Play the Murder Mystery Game.`,
        description: `<ul>
        <li>- Adjust Added and will go to Open testing next week ! <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://play.google.com/store/apps/details?id=com.curiouscalf.murder.mystery.minds.story.unsolved.detective.crime.choice.hidden.criminal.games">Play now</a> </li>
        </ul>`,
      },
      {
        id: "7",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gcpcost.webp",
        update_type: "GCP update",
        title: "GCP workload and cost management",
        // short_description: "Jetapult's first playable ads.",
        description: `<ul>
        <li>- Conducted experiments with GCP plans to understand estimated workload requirements and resource usage. We also worked with analysts to rationalise queries and analyst time on GCP machines. </li>
        </ul>`,
      },
      {
        id: "8",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/datapipeline.png",
        update_type: "Data update",
        title: "Pipeline Maintenance and Issue Resolution",
        short_description: `Pipeline Maintenance and Issue Resolution`,
        description: `<ul>
        <li>- Managed and maintained the following data pipelines:
          Adjust to Cloud Bucket,CleverTap to Cloud Bucket,Cloud Bucket to BigQuery Table,Ad Networks Pipelines:,AdMob,Amazon Appstore,AppLovin,DT Exchange,IronSource,Liftoff,Meta,Mintegr,alPangle,Unity.</li>

          <li>-This involved monitoring data flows, troubleshooting and resolving failures caused by server-side changes, and ensuring seamless integration and consistent data updates across all systems for reliable analytics.</li>
           </li>
        </ul>`,
      },
    ],
    date: "Released on 20th November 2024",
  },
  {
    id: "4",
    title: "Jetapult AI Update - 21st June 2024",
    short_description: "Brand New Community Management Suite, Playable Ads and much more. Deep Dive into the work put in by the Data + AI from the last three weeks. Do reach out for giving feedback and to test things out. ",
    feature: [
      {
        id: "1",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gampac-ui-charts.png",
        update_type: "UI updates",
        title: "Review Tagging/Trends in Community Management Suite",
        short_description: "Quick insights about reviews.",
        description: `<ul><li>- We revamped the Community Management Suite to include tags, insights , trends and more. You can also see Weekly Reports with trends and sentiment analysis.  </li>
       </ul>`,
      },
      {
        id: "2",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gampac-organic-ua.png",
        update_type: "UI updates",
        title: "New Insight Filters in Community Management Suite",
        short_description: `Quick search filters for advanced searches. `,
        description: `<ul>
        <li>- We added Search, Filters, Tagging and additional Templates. Improved review search UI. </a></li>
        </ul>
        `,
      },
      {
        id: "3",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gamepac-onboarding.png",
        update_type: "New Feature updates",
        title: "External Studios can now be onboarded in Community Management Suite",
        short_description: "We can welcome external studios to Gamepac Suite",
        description: `<ul><li>- Community Management Suite is Multitenant and can onboard external studios, we would recommend a regular feedback loop to be set up so we can improve the product better for external use.</li></ul>`,
      },
      {
        id: "4",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/adrevenue.webp",
        update_type: "AD Revenue update",
        title: "All Ad Revenue Data on Bigquery ",
        short_description: "High level dashboards with daa from authoratative sources now possible.",
        description: `<ul>
        <li>We have pipelined all of ad revenue data to Bigquery. Accompanying the IAP data we get now capabilities to create central revenue and high level metrics.</li>   </li>
        </ul>`,
      },
      {
        id: "5",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/AI-Game-playable.png",
        update_type: "Playable ad update",
        title: "New Murder Mystery Game Playable Ads",
        short_description: "Jetapult's first playable ads.",
        description: `<ul>
        <li>- 2 Landscape Playable Ads for our AI game that are Ad networks Ready. Play Test them! </li>
        <li>- Murder Mystery Detective Game HOB - <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://app.gamepacai.com/html5-games/hidden-objects">link</a>
        <li>- Murder Mystery Detective Game Narration + HOB + Gameplay - <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://app.gamepacai.com/html5-games/narration">link</a>
        </ul>`,
      },
      {
        id: "6",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Murdermysterylogo.png",
        update_type: "AI Game update",
        title: "Final Build - AI Game Alpha link",
        short_description: `Play the Murder Mystery Game.`,
        description: `<ul>
        <li>- AI game has finished all QA tests, and we are now ready with our final build. Play our game on our internal testing store front! <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://play.google.com/store/apps/details?id=com.curiouscalf.murder.mystery.minds.story.unsolved.detective.crime.choice.hidden.criminal.games">Play now</a> </li>
        </ul>`,
      },
    ],
    date: "Released on 21st June 2024",
  },
  {
    id: "3",
    title: "Jetapult AI Update - 31st May 2024",
    short_description:
      "Hello Team, We are excited to share a bunch of exciting updates with you regarding HTML5 ads, our AI games, asset generation and more.",
    feature: [
      {
        id: "1",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Curios-Calf_blue.jpg",
        update_type: "New Studio logo update",
        title: "Curious Calf Studio",
        short_description: "Curious Calf Studios logo finalised.",
        description: `<ul><li>- We finalised the branding and logo of the new AI studio. Excited to build and launch many more games using AI and automation. </li>
       </ul>`,
      },
      {
        id: "2",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/gampac-organic-ua.png",
        update_type: "Gamapac New UI",
        title: "Oragnic UA Suite Updates",
        short_description: `Revamping our Organic UA Suite with potent filters and insightful visualizations for a clearer view of your player community.`,
        description: `<ul>
        <li>- We are completely revamping the user experience of our Organic UA Suite. The newer version comes with powerful filters and useful visualisations to get an idea of whats happening with your player community.</a></li>
        </ul>
        `,
      },
      {
        id: "3",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/playable-screenshot.png",
        update_type: "Playable Ad updates",
        title: "Playable Ad Minified Version",
        short_description:
          "Our Playable Ads passed some technical checks and is ready for large ad networks!",
        description: `<ul><li>-Our Playable Ads have successfully passed comprehensive technical evaluations, ensuring seamless integration across prominent ad networks. With a focus on captivating interactions, they're poised to elevate engagement and drive significant campaign success on a vast scale. Get ready to harness their potential and unlock unparalleled audience connections. <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://app.gamepacai.com/html5-games/word-search-puzzle">link</a></li></ul>`,
      },
      {
        id: "4",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/Sc3.2.jpg",
        update_type: "AI Game updates",
        title: "Murder Mystery Game - Analytics implemeted",
        short_description:
          "Murder Mystery: Word Detective is now ready for launch. Play test our latest build.",
        description: `<ul>
        <li>Our game is closed testing phase. We have added analytics, IAP options, ad monetisation for the muder mystery game. The developer account on Play Store has been setup. We will be discussing and planning the launch of the game next week.<a style="text-decoration: underline; color:#007bff" target="_blank" href="https://drive.google.com/file/d/1o2rKReCmToHjnovyrZCA_qiS9PHo1bBj/view?usp=drive_link">link</a></li>   </li>
        </ul>`,
      },
      {
        id: "5",
        img: "https://gamepacbucket.s3.ap-south-1.amazonaws.com/production/studioLogos/jetapult/data-discrepancy.png",
        update_type: "Data operation update",
        title: "Holy Cow IAP Data Discrepancy",
        short_description: "IAP Discrepancy report sent.",
        description: `<ul>
        <li>- We sent out a report analysing the IAP discrepancy with some trends in the industry. We will be working with the studio team to resolve the issue in coming weeks. </li>
        </ul>`,
      },
    ],
    date: "Released on 31st May 2024",
  },
  {
    id: "2",
    title: "Jetapult AI Update - 15th May 2024",
    short_description:
      "Hello Team, We are excited to share a bunch of exciting updates with you regarding HTML5 ads, our AI games, asset generation and more.",
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
        description: `<ul><li>- Our intermediate release of the Murder Mystery AI Game. Please download here. <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://drive.google.com/file/d/1SC6hsr0Ku_k9z2sQJPm0ejArqsVQ1CRY/view?usp=drive_link">link</a>   </li></ul>`,
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
        description: `<ul><li>- We have worked with an external agency to develop in gaming dashboards. Check them out here. <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://lookerstudio.google.com/u/0/reporting/b08e7772-0424-40c0-87f4-3210e5711377/page/p_35ykx5xegd">link</a> </li>
       </ul>`,
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
        description: `<ul>
        <li>- <a style="text-decoration: underline; color:#007bff" target="_blank" href="https://drive.google.com/drive/folders/10djeq2eU6IfOE2-c-a3qOx2PwSgQRlbf?usp=sharing">View</a></li>
        <li>- We have also developed and are testing a new furniture variation generator, working with Fastcode. </li>
        <li>- This will helps us monetise our furniture assets much better with more variety available.</li></ul>`,
      },
    ],
    date: "Released on 15th May 2024",
  },
  {
    id: "1",
    title: "Jetapult AI Update - 29th April 2024",
    short_description:
      "Bi-weekly updates on current and future AI developments at Jetapult",
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
  const [show, setShow] = useState("5");
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
        <title>Jetapult AI updates</title>
        <meta property="og:title" content="Gamepac | Jetapult AI updates" />
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
        <meta name="twitter:title" content="Gamepac | Jetapult AI updates" />
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
              <header className="bg-[#B9FF66] py-12 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto max-w-5xl flex flex-col items-center">
                  <h1 className="text-3xl text-[#000] font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                    Jetapult AI Updates
                  </h1>
                  <p className="mt-3 text-sm text-[#000] text-center">
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
                          {feature.img ? <img src={feature.img} alt="img" className="h-44 w-full mb-4 rounded-lg object-contain" /> : <></>}
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
