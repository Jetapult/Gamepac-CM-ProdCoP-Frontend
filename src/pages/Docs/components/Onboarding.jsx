import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadCrumbs from "./BreadCrumbs";

const Onboarding = () => {
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
        <BreadCrumbs name="App Onboarding Setup" />
        <br />
        <h1 className="text-5xl text-[#092139] font-black mb-6">
          App Onboarding Setup
        </h1>
        <p className="text-lg text-[#092139] pb-4">
          Onboarding on Gamepac takes <b>less than 15 minutes</b>. Here's a
          step-by-step guide to get you started for onboarding with either your
          Google Play Store or Apple App Store account to Gamepac.
        </p>
        <div className="bg-[#eef9fc] border-l border-l-[#4bb3d4] border-l-[5px] rounded-[0.4rem] px-3 py-3 my-4">
          <p className="flex items-center">
            <InformationCircleIcon className="inline w-5 h-5 mr-2 mb-1 text-[#193c47]" />{" "}
            <span className="text-lg font-black text-[#4bb3d4]">IMPORTANT</span>
          </p>
          <p className="text-lg font-light text-[#4bb3d4]">
            All your access keys are stored securely and encrypted at rest. We
            only use them to fetch the app details and collect reviews from
            store to display on your Gamepac dashboard, and enable AI replies.
          </p>
        </div>
        <h2
          id="google-play-store"
          ref={(el) => (sectionsRef.current["google-play-store"] = el)}
          className="text-4xl text-[#092139] font-black my-4"
        >
          Google Play Store
        </h2>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">
            You can always refer to the Google Play Store documentation{" "}
            <a
              href="https://developers.google.com/android-publisher/getting_started#setting_up_api_access_clients"
              target="_blank"
              className="text-black underline underline-offset-1"
            >
              here
            </a>
            .
            <ul className="list-[circle] pl-5 py-3">
              <li className="text-lg text-[#092139] py-3">
                If you don't have an existing Google cloud project. You can
                easily create one by heading over to Google cloud console with
                the same Google email you are registered on{" "}
                <a
                  href="https://console.cloud.google.com/projectcreate"
                  target="_blank"
                  className="text-black underline underline-offset-1"
                >
                  Google Play Console
                </a>
                .
              </li>
              <li className="text-lg text-[#092139] py-3">
                Once the cloud project is created, enable Google Play Developer
                API{" "}
                <a
                  href="https://console.developers.google.com/apis/api/androidpublisher.googleapis.com/"
                  target="_blank"
                  className="text-black underline underline-offset-1"
                >
                  Google Play Developer API page
                </a>
                <img
                  src="https://docs.fancraft.com/assets/images/developer_api-25e1383163ee52561d679a855cca850c.png"
                  alt="screenshot"
                  className="mt-4"
                />
              </li>
              <li className="text-lg text-[#092139] py-3">
                Create a service account.
              </li>
            </ul>
          </li>
          <li className="text-lg text-[#092139] py-3">
            Once a service account is created, click on the service account’s
            email.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Go to “Keys” tab.
            <img
              src="https://docs.fancraft.com/assets/images/developer_key_tab-c38ad6a34cb8c6006800d027ff7e3944.png"
              alt=""
              className="block mt-3"
            />
          </li>
          <li className="text-lg text-[#092139] py-3">
            Click “Add Key”, and create a new key.
            <img
              src="	https://docs.fancraft.com/assets/images/developers_add_new_key-bef54deef83f11f5c4accaf117cfa471.png"
              alt=""
              className="block mt-3"
            />
          </li>
          <li className="text-lg text-[#092139] py-3">
            Once the key is created you can download the JSON key.
            <img
              src="https://docs.fancraft.com/assets/images/developers…ownload_json-a287dbc1952be6d9b72144892d8f9f32.png"
              alt=""
              className="block mt-3"
            />
            <p className="text-lg font-light">
              The service key looks something like below.
            </p>
            <img
              src="	https://docs.fancraft.com/assets/images/service_key_example-197e82c7e0013e06f964af091a0d4fa2.png"
              alt=""
              className="mt-3"
            />
          </li>
          <li className="text-lg text-[#092139] py-3">
            Go to "App Onboarding" on your Gamepac account and click on "Add New
            App" on the top-right.
            <img
              src="https://docs.fancraft.com/assets/images/add_new_app-ef100c5ef22a3730ce2b66d13653f77f.png"
              alt=""
              className="block mt-3"
            />
          </li>
          <li className="text-lg text-[#092139] py-3">
            Upload the{" "}
            <code className="bg-[#f6f7f8] border border-[0.5px] border-[#0000001a] rounded px-1 py-[2px] text-[12px]">
              .json
            </code>{" "}
            key file, add the Google Play Store links of the apps you want to
            onboard with the support email address you want to use. This helps
            us personalize the AI replies.
            <img
              src="https://docs.fancraft.com/assets/images/google_play_app_onboarding-3ed71a05fbad75253482e58062d74310.png"
              alt=""
              className="block mt-3"
            />
          </li>
        </ul>

        <h2
          id="apple-app-store"
          ref={(el) => (sectionsRef.current["apple-app-store"] = el)}
          className="text-4xl text-[#092139] font-black my-4"
        >
          Apple App Store
        </h2>
        <ul className="list-disc pl-4">
          <li className="text-lg text-[#092139] py-3">
            Create a new App Store Connect API Key in the{" "}
            <a
              href="https://appstoreconnect.apple.com/access/api"
              target="_blank"
              className="text-black underline underline-offset-1"
            >
              Users page
            </a>
            .
            <ul className="list-[circle] pl-6">
              <li className="text-lg text-[#092139] py-3">
                For more info, you may refer to the{" "}
                <a
                  href="https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api"
                  target="_blank"
                  className="text-black underline underline-offset-1"
                >
                  App Store Connect API Docs
                </a>
                .
              </li>
              <li className="text-lg text-[#092139] py-3">
                Select the "Keys" tab.
              </li>
              <li className="text-lg text-[#092139] py-3">
                Give your API Key a “Admin” role. Rest assured you only need to
                provide the "Admin" role to the key.
              </li>
            </ul>
          </li>
          <li className="text-lg text-[#092139] py-3">
            Download the newly created API Key file (
            <code className="bg-[#f6f7f8] border border-[0.5px] border-[#0000001a] rounded px-1 py-[2px] text-[12px]">
              .p8
            </code>
            ). This file cannot be downloaded again after the page has been
            refreshed
          </li>
          <li className="text-lg text-[#092139] py-3">
            Note down the Issuer ID, Key ID, and the newly downloaded{" "}
            <code className="bg-[#f6f7f8] border border-[0.5px] border-[#0000001a] rounded px-1 py-[2px] text-[12px]">
              .p8
            </code>{" "}
            key file.
          </li>
          <li className="text-lg text-[#092139] py-3">
            Go to "App Onboarding" on your Gamepac account and click on "Add New
            App" on the top-right. Use the downloaded{" "}
            <code className="bg-[#f6f7f8] border border-[0.5px] border-[#0000001a] rounded px-1 py-[2px] text-[12px]">
              .json
            </code>{" "}
            key to onboard on Gamepac.
            <img
              src="	https://docs.fancraft.com/assets/images/add_new_app-ef100c5ef22a3730ce2b66d13653f77f.png"
              alt=""
              className="block mt-3"
            />
          </li>
          <li className="text-lg text-[#092139] py-3">
            Upload the{" "}
            <code className="bg-[#f6f7f8] border border-[0.5px] border-[#0000001a] rounded px-1 py-[2px] text-[12px]">
              .p8
            </code>{" "}
            key file, the issuer ID, along with the Google Play Store links of
            the apps you want to onboard on Gamepac with the support email
            address you want to use for each one of them. This helps us
            personalize the AI replies.
            <img
              src="	https://docs.fancraft.com/assets/images/apple_stor…p_onboarding-0da16e9d1b04341289ac8259a0b3f198.png"
              alt=""
              className="block mt-3"
            />
          </li>
        </ul>
        <h2
          id="next-steps"
          ref={(el) => (sectionsRef.current["next-steps"] = el)}
          className="text-4xl text-[#092139] font-black mb-4"
        >
          Next Steps
        </h2>
        <p className="text-lg text-[#092139] pb-4">
          Once you've successfully onboarded your app, we start collecting
          reviews and feedback from your app store listings. You can also start
          using AI replies to respond to player reviews. Simply head over to{" "}
          <a
            className="text-black underline underline-offset-1 cursor-pointer"
            onClick={() => navigate("/docs/ai-replies")}
          >
            AI Replies
          </a>{" "}
          on the dashboard to play with AI replies.
        </p>
        <div className="flex justify-between my-3">
          <div
            className="cursor-pointer w-2/4"
            onClick={() => navigate("/docs/overview")}
          >
            <span className="block">Previous</span>
            <p className="text-black text-lg font-black">
              <ChevronDoubleLeftIcon className="inline w-4 h-4 mr-2" />
              Overview
            </p>
          </div>
          <div
            className="cursor-pointer w-2/4 flex flex-col flex-end items-end"
            onClick={() => navigate("/docs/ai-replies")}
          >
            <span className="block">Next</span>
            <p className="text-black text-lg font-black">
              AI Replies
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
                href="#google-play-store"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "google-play-store"
                    ? "active bg-[#F3F3F3] text-black"
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
                    ? "active bg-[#F3F3F3] text-black"
                    : ""
                }`}
                onClick={() => handleClick("apple-app-store")}
              >
                Apple App Store
              </a>
            </li>
            <li className="pb-1">
              <a
                href="#next-steps"
                className={`table-of-contents__link toc-highlight block py-2 w-full pl-3 rounded ${
                  activeSection === "next-steps"
                    ? "active bg-[#F3F3F3] text-black"
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

export default Onboarding;
