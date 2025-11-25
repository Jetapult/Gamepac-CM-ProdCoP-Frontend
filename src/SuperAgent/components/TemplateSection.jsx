import React from "react";
import FeedCard from "./FeedCard";
import { Notebook2, SmileCircle, Refresh } from "@solar-icons/react";

const placeholderImages = {
  marketOpportunity:
    "https://via.placeholder.com/244x126/e0e0e0/757575?text=Market+Analysis",
  narrative: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Narrative",
  artLevel:
    "https://via.placeholder.com/244x126/e0e0e0/757575?text=Art+%26+Level",
  community: "https://via.placeholder.com/244x126/e0e0e0/757575?text=Community",
};

const TemplateSection = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    "Game Director Report",
    "ComPac",
    "ScalePac",
    "LiveOps",
    "UA Playbook",
    "Financial Reporting",
  ];

  const useCases = [
    {
      id: 1,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Market Opportunity Finder",
      description:
        "Turn market signals into clear, high-signal opportunity cards. IdeaPac synthesizes competitor moves, emerging trends, and genre gaps into concise, decision-ready concept seeds.",
      image: placeholderImages.marketOpportunity,
      iconBg: "#1f6744",
    },
    {
      id: 2,
      icon: <Notebook2 weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Concept Narrative Companion",
      description:
        "Generate fast, expressive story hooks and emotional beats that bring your concepts to life. Perfect for defining tone, player motivation, and early experience arcs.",
      image: placeholderImages.narrative,
      iconBg: "#1f6744",
    },
    {
      id: 3,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Art & Level Generator",
      description:
        "From concept to playable in hours—not weeks. DevPac produces concept art, levels, and lightweight demos that clarify direction and speed up decision-making.",
      image: placeholderImages.artLevel,
      iconBg: "#1f6744",
    },
    {
      id: 4,
      icon: <SmileCircle weight={"Linear"} className="size-[16px] #6D6D6D" />,
      title: "Community Communications Suite",
      description:
        "Draft release notes, community updates, FAQs, and internal summaries—all aligned to your prototype or feature test.",
      image: placeholderImages.community,
      iconBg: "#1f6744",
    },
  ];
  return (
    <div className="mt-6 w-full max-w-[1300px] mx-auto z-20">
      {/* Filters Section */}
      <div className="flex gap-3 flex-wrap items-center justify-center mb-6">
        {/* Recommended Filter with Refresh Icon */}
        <button
          onClick={() => setActiveFilter("recommended")}
          className={`flex items-center gap-2.5 px-2.5 py-1 rounded-[10px] transition-all ${
            activeFilter === "recommended"
              ? "bg-[#1f6744] text-white"
              : "bg-[#f1f1f1] text-[#a6a6a6] border border-[#dfdfdf]"
          }`}
          style={{ fontFamily: "Urbanist, sans-serif", fontSize: "16px" }}
        >
          <span>Recommended</span>
          <div className="h-6 w-px bg-white/30" />
          <Refresh weight={"Linear"} size={20} />
        </button>

        {/* Other Filters */}
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-[10px] transition-all ${
              activeFilter === filter
                ? "bg-[#1f6744] text-white"
                : "bg-[#f1f1f1] text-[#a6a6a6] border border-[#dfdfdf]"
            }`}
            style={{ fontFamily: "Urbanist, sans-serif", fontSize: "16px" }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Use Cases Grid */}
      <div className="grid grid-cols-4 gap-5">
        {useCases.map((useCase) => (
          <FeedCard key={useCase.id} {...useCase} />
        ))}
      </div>
    </div>
  );
};

export default TemplateSection;
