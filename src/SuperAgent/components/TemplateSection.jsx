import React from "react";
import TemplateCard from "./TemplateCard";
import { Notebook2, SmileCircle } from "@solar-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTemplate } from "../../store/reducer/superAgent";

const placeholderImages = {
  marketOpportunity:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80",
  narrative:
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&h=400&fit=crop&q=80",
  artLevel:
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop&q=80",
  community:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80",
};

const TemplateSection = ({ activeFilter, setActiveFilter }) => {
  const dispatch = useDispatch();
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );
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
    <div
      className={`mt-4 w-full mx-auto z-20 ${
        isSiderbarOpen ? "max-w-[1000px] 2xl:max-w-[1180px]" : "max-w-[1180px]"
      }`}
    >
      <div className="flex items-center justify-center">
        <hr className="w-[128px]" />
        <h2 className="text-[24px] font-semibold font-urbanist text-lg sa-text-primary text-center my-6 mx-4">
          {" "}
          Sample Templates
        </h2>
        <hr className="w-[128px]" />
      </div>
      <div
        className={`grid ${
          isSiderbarOpen ? "grid-cols-3" : "grid-cols-4"
        } gap-5`}
      >
        {useCases.map((useCase) => (
          <TemplateCard
            key={useCase.id}
            {...useCase}
            onClick={() =>
              dispatch(
                setSelectedTemplate({
                  id: useCase.id,
                  title: useCase.title,
                  description: useCase.description,
                  image: useCase.image,
                })
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateSection;
