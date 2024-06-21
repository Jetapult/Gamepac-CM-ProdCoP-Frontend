import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadCrumbs from "./BreadCrumbs";

const AIReplies = () => {
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
  };
  return (
    <div className="flex flex-wrap py-6">
      <div className="w-full sm:w-3/4 px-6">
        <BreadCrumbs name="AI Replies" />
        <br />
        <h1 className="text-5xl text-[#092139] font-black mb-6">AI Replies</h1>
        <h2
          id="what-are-ai-replies"
          ref={(el) => (sectionsRef.current["what-are-ai-replies"] = el)}
          className="text-4xl text-[#092139] font-black mb-4"
        >
          What are AI Replies?
        </h2>
        <p className="text-lg text-[#092139] pb-4">
          FanCraft's AI Replies take the weight off your shoulders by crafting
          individual responses to repetitive user concerns. Trained on over 13
          years of experience from Yodo1's vast customer support network, our AI
          understands the nuances of user feedback. It analyzes reviews,
          identifies key issues, and suggests personalized responses that
          address the user's specific concerns. But FanCraft doesn't stop there.
          You can customize these AI-powered replies to perfectly match your
          game's tone and voice. This way, you can manage millions of users with
          efficient, personalized responses, while still maintaining your unique
          brand identity.
        </p>
        <h2
          id="understanding-ai-replies"
          ref={(el) => (sectionsRef.current["understanding-ai-replies"] = el)}
          className="text-4xl text-[#092139] font-black my-4"
        >
          Understanding AI Replies:
        </h2>
        <p className="text-lg text-[#092139] pb-4">
          AI Replies are dynamic responses suggested by FanCraft's AI based on
          the content of user reviews. These suggestions leverage pre-built
          templates, based on years of customer support experience and are
          tailored to the specific issue raised by the user. You can customize
          these AI Replies to perfectly match your game's tone and voice.
        </p>
        <h3
          id="review-ai-replies"
          ref={(el) => (sectionsRef.current["review-ai-replies"] = el)}
          className="text-2xl text-[#092139] font-black mb-4"
        >
          Review AI Replies
        </h3>
        <p className="text-lg text-[#092139] pb-4">
          With the help of tags, FanCraft gives you the ability to categorize
          reviews and automate responses based on specific tags. FanCraft's AI
          will analyze the review and suggest relevant AI Reply templates based
          on the content and identified tags.
        </p>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">{`Navigate to "Reviews" > "AI Replies" on the sidebar. FanCraft allows you to filter the period, app, and tags, language, country of the reviews to view AI Replies.After selecting the desired filters, click "Search" to view the Reviews and their AI Replies.`}</li>
          <li className="text-lg text-[#092139] py-3">
            If the review has an AI Reply, you will see the suggested response
            under the "AI Reply" column. Depending on whether the tag is
            assigned, the AI Reply may be automatically sent to the review.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Click the "Add Tags" button to assign relevant tags to the review
            for future automation. Assigning tags helps FanCraft categorize
            similar reviews and suggest appropriate AI Replies.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Click "Post Reply" to post the reply to the review.
          </li>
          <li className="text-lg text-[#092139] py-3">
            If you want to customize the AI Reply, click the "Generate AI Reply"
            button to modify the response. You may also save the customized
            response as a new template for future use by clicking "Save as
            template".
          </li>
        </ul>
        <h2
          id="creating-custom-templates"
          ref={(el) => (sectionsRef.current["creating-custom-templates"] = el)}
          className="text-2xl text-[#092139] font-black mb-4"
        >
          Creating Custom Templates
        </h2>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">{`Navigate to "Reviews" > "Templates" on the sidebar.`}</li>
          <li className="text-lg text-[#092139] py-3">
            Click the "Add New Template" button.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Choose a descriptive name for your template (e.g., "Difficulty
            Issue," "Bug Report").
          </li>
          <li className="text-lg text-[#092139] py-3">
            In the "Template Text" box, craft your response that FanCraft AI can
            use as an inspiration for future replies to specific apps, tags, and
            ratings ranges. For example, you may be a development team and want
            to address your user concerns with low ratings more sympathetically.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Click "Save Template" when complete.
          </li>
        </ul>
        <h2
          id="using-tags-for-smarter-automation"
          ref={(el) =>
            (sectionsRef.current["using-tags-for-smarter-automation"] = el)
          }
          className="text-4xl text-[#092139] font-black my-4"
        >
          Using Tags for Smarter Automation:
        </h2>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">{`Navigate to "Reviews" > "Tags" on the sidebar. By default, FanCraft provides a set of tags to help you categorize reviews.`}</li>
          <li className="text-lg text-[#092139] py-3">
            To add a new tag, simply add the tag name, color code, and a brief
            description of what the tag represents. Enter a clear and concise
            tag name (e.g., "difficulty," "bug," "login issue").
          </li>
          <li className="text-lg text-[#092139] py-3">
            Click "Add New Tag" when complete.
          </li>
        </ul>
        <p className="text-lg text-[#092139] py-4">
          The tags you create will help FanCraft categorize reviews and suggest
          appropriate AI Replies based on the content of the review and will be
          used for future assignments.
        </p>
        <div className="flex justify-between my-3">
          <div
            className="cursor-pointer w-2/4"
            onClick={() => navigate("/docs/app-onboarding")}
          >
            <span className="block">Previous</span>
            <p className="text-[#ff1053] text-lg font-black">
              <ChevronDoubleLeftIcon className="inline w-4 h-4 mr-2" />
              App Onboarding Setup
            </p>
          </div>
          <div
            className="cursor-pointer w-2/4 flex flex-col flex-end items-end"
            onClick={() => navigate("/docs/campaign")}
          >
            <span className="block">Next</span>
            <p className="text-[#ff1053] text-lg font-black">
              Campaign Integration
              <ChevronDoubleRightIcon className="inline w-4 h-4 ml-2" />
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/4 px-4 hidden sm:block">
        <div className="border-l border-l-[1px] border-[#dadde1] sticky top-[4rem]">
          <ul className="table-of-contents table-of-contents__left-border pl-6 py-3">
            <li className="pb-1">
              <a
                href="#what-are-ai-replies"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "what-are-ai-replies"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("what-are-ai-replies")}
              >
                What are AI Replies?
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#understanding-ai-replies"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "understanding-ai-replies"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("understanding-ai-replies")}
              >
                Understanding AI Replies:
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#review-ai-replies"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "review-ai-replies"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("review-ai-replies")}
              >
                Review AI Replies
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#creating-custom-templates"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "creating-custom-templates"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("creating-custom-templates")}
              >
                Creating Custom Templates:
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#using-tags-for-smarter-automation"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "using-tags-for-smarter-automation"
                    ? "active bg-[#f7e5e5] text-[#ff1053]"
                    : ""
                }`}
                onClick={() => handleClick("using-tags-for-smarter-automation")}
              >
                Using Tags for Smarter Automation:
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIReplies;
