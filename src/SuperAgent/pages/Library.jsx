import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import {
  Notebook2,
  SmileCircle,
  Refresh
} from "@solar-icons/react";
import FeedCard from "../components/FeedCard";

// Placeholder images - these should be replaced with actual assets
const placeholderImages = {
  marketOpportunity: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Market+Analysis",
  narrative: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Narrative",
  artLevel: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Art+%26+Level",
  community: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Community",
  rapidArt: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Rapid+Art"
};

const Library = () => {
  const [activeFilter, setActiveFilter] = useState("recommended");

  const filters = [
    "Game Director Report",
    "ComPac",
    "ScalePac",
    "LiveOps",
    "UA Playbook",
    "Financial Reporting"
  ];

  const useCases = [
    {
      id: 1,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Market Opportunity Finder",
      description: "Turn market signals into clear, high-signal opportunity cards. IdeaPac synthesizes competitor moves, emerging trends, and genre gaps into concise, decision-ready concept seeds.",
      image: placeholderImages.marketOpportunity,
      iconBg: "#1f6744"
    },
    {
      id: 2,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Concept Narrative Companion",
      description: "Generate fast, expressive story hooks and emotional beats that bring your concepts to life. Perfect for defining tone, player motivation, and early experience arcs.",
      image: placeholderImages.narrative,
      iconBg: "#1f6744"
    },
    {
      id: 3,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Art & Level Generator",
      description: "From concept to playable in hours—not weeks. DevPac produces concept art, levels, and lightweight demos that clarify direction and speed up decision-making.",
      image: placeholderImages.artLevel,
      iconBg: "#1f6744"
    },
    {
      id: 4,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Community Communications Suite",
      description: "Draft release notes, community updates, FAQs, and internal summaries—all aligned to your prototype or feature test.",
      image: placeholderImages.community,
      iconBg: "#1f6744"
    },
    {
      id: 5,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Opportunity Analysis Tool",
      description: "Identify key opportunities by analyzing market trends. IdeaPac delivers actionable insights by synthesizing competitor strategies and identifying untapped niches.",
      image: placeholderImages.marketOpportunity,
      iconBg: "#1f6744"
    },
    {
      id: 6,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Narrative Design Assistant",
      description: "Quickly generate compelling story elements and emotional cues. Perfect for defining tone, player motivation, and early game experiences.",
      image: placeholderImages.narrative,
      iconBg: "#1f6744"
    },
    {
      id: 7,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Rapid Art & Level Prototyper",
      description: "Go from concept to playable prototype in hours. DevPac generates concept art, levels, and demos, accelerating decision-making.",
      image: placeholderImages.rapidArt,
      iconBg: "#1f6744"
    },
    {
      id: 8,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Community Engagement Toolkit",
      description: "Generate drafts for release notes, community updates, FAQs, and internal summaries, all tailored to your prototype or feature test.",
      image: placeholderImages.community,
      iconBg: "#1f6744"
    }
  ];

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* <Header /> */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-[64px] h-full overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center py-10 px-8">
          <p
            className="text-[20px] text-[#898989] mb-6 text-center"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Library
          </p>
          <h1
            className="text-[36px] font-semibold text-[#1f6744] mb-4 text-center max-w-[760px]"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Explore different use cases from our collection
          </h1>
          <p
            className="text-[16px] text-[#898989] text-center max-w-[760px]"
            style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '24px' }}
          >
            Learn how GamePac handles real-world tasks through step-by-step replays
          </p>
        </div>

        <div className="flex flex-col items-center px-8 mb-10">
          <div className="flex gap-4 flex-wrap items-center justify-center max-w-[1034px]">
            <button
              onClick={() => setActiveFilter("recommended")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] transition-all ${
                activeFilter === "recommended"
                  ? "bg-[#103f28] text-white"
                  : "bg-[#f1f1f1] text-[#a6a6a6] border border-[#dfdfdf]"
              }`}
              style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '16px' }}
            >
              <span>Recommended</span>
              <div className="h-6 w-px bg-white/30" />
              <Refresh weight={"Linear"} size={20} />
            </button>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-2 rounded-[10px] transition-all ${
                  activeFilter === filter
                    ? "bg-[#103f28] text-white"
                    : "bg-[#f1f1f1] text-[#a6a6a6] border border-[#dfdfdf]"
                }`}
                style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '16px' }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="px-[140px] pb-20">
          <div className="grid grid-cols-4 gap-5 max-w-[1172px] mx-auto">
            {useCases.map((useCase) => (
              <FeedCard key={useCase.id} {...useCase} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
