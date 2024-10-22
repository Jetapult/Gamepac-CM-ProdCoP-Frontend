import icon from "../assets/icon.svg";
import { useState, useEffect } from "react";
import "./landing.css";
import { signInWithGogle } from "../config";
import { auth } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import image from "../assets/landing1.png"
import holycow from "../assets/holycow.png"
import umx from "../assets/umx.png"
import search from "../assets/search.png"
import arrowb from "../assets/arrowb.png"
import arrow from "../assets/arrow.png"
import landing2 from '../assets/landing2.png'
import landing3 from '../assets/landing3.png'
import landing4 from '../assets/landing4.png'
import landing5 from '../assets/landing5.png'
import landing6 from '../assets/landing6.png'
import smiley from '../assets/smiley.png'
import Footer from "../components/Footer";



function Landing() {
  const [user, setUser] = useState("");
  const cardData = [
    { title: "Query PAC", image: search, link: "/ai-chat"},
    { title: "Playable Ads", image: landing2, link: "/html5-games" },
    { title: "Community Manager", image: landing6 , link: "/organic-ua/smart-feedback/holy-cow-studio-e9770"},
    { title: "Reporting Systems", image: landing3 , link: "/organic-ua/weekly-report/holy-cow-studio-e9770"},
    { title: "Data Dashboards", image: landing4 , link: "/analytics"},
    { title: "Meeting Insights", image: landing5, link: "/note-taker" },
  ];
  const getCardStyle = (index) => {
    const styles = [
      "bg-[#F3F3F3] text-black",
      "bg-[#B9FF66] text-black",
      "bg-black text-white",
    ];
    return styles[index % 3];
  };
  return (
    <div className="flex flex-col  items-center justify-center">
      <div className="flex flex-row h-[30%] items-center p-10">
        <div className="flex flex-col w-1/2 pr-8">
          <h1 className="text-3xl font-bold mb-4">
          Accelerate Your Growth Journey with GamePac!</h1>
          <p className="text-lg">GamePac by Jetapult is the first AI co-pilot platform for indie gaming studios to help them grow faster and smarter. With our powerful generative AI and data analytics solutions, you can create, grow and monetise like never before.</p>
          <button className="text-xl py-2 px-4 rounded text-white bg-black hover:bg-slate-700 w-fit mt-4" onClick={()=>window.location.href="/login"}>Join Now</button>
        </div>
        <div className="flex w-1/2 p-10"> 
          <img src={image} alt="Meeting" className="w-auto h-[300] object-contain" />
        </div>
      </div>
      <div className="h-[58px] w-full flex flex-row items-center justify-center space-x-10">
        <img src={holycow} alt="Holy Cow Logo" className="h-[58px] w-auto object-contain" />
        <img src={umx} alt="UMX Logo" className="h-[58px] w-auto object-contain" />
      </div>
      <section>
        <div className="flex flex-row p-10 items-center">
          <button className="w-fit bg-[#B9FF66] px-4 py-2 h-[51] text-2xl rounded-lg">Services</button>
          <p className="px-10 w-[50%]">
          With our powerful generative AI and data analytics solutions, you can
create, grow and monetise like never before.</p>
        </div>
        <div className="flex flex-wrap justify-between w-full p-10">
  {cardData.map((card, index) => (
    <div key={index} className={`flex flex-row h-[300px] w-[calc(50%-20px)] ${getCardStyle(index)} border-2 items-center justify-between px-10 rounded-[45px] border-b-8 border-black mb-10 transition-transform duration-300 hover:scale-105 cursor-ponter`} onClick={()=>window.location.href=card.link}>
      <div className="flex flex-col items-center space-y-14">
        <div className={`text-3xl text-black rounded px-2 border ${index % 3 === 1 || index%3===2 ? 'bg-[#F3F3F3]' : 'bg-[#B9FF66]'}`}>{card.title}</div>
        <div className="flex flex-row space-x-4 items-center">
          <img src={(index + 1) % 3 === 0 ? arrow : arrowb} alt={`card${index + 1}`} className="h-[41px] w-[41px] object-contain"/>
          <span className="text-xl leading-7">Learn More</span>
        </div>
      </div>
      <div>
        <img src={card.image} alt={`card${index + 1}`} className="h-[170px] w-auto object-contain" />
      </div>
    </div>
  ))}
</div>
      </section>
      <div className="h-[20%] flex flex-row  items-center justify-center bg-[#F3F3F3] border-2 rounded-[45px] w-fit mb-6">
        <div className="flex flex-col p-8">
          <h1 className="text-3xl font-bold mb-4">
          Let's make things happen</h1>
          <p className="text-lg">Contact us today to learn more about our AI capabilities that can help your games grow.</p>
          <button className="text-xl py-2 px-4 rounded text-white bg-black hover:bg-slate-700 w-fit mt-4 rounded-lg"            
          onClick={() => window.location.href = 'mailto:engineering@jetapult.me'}>Schedule a Call</button>
        </div>
        <div className="flex"> 
          <img src={smiley} alt="Meeting" className="w-[300px] h-[300px] object-contain" />
        </div>
      </div>
      <Footer/>
    </div>
    
  );
}
export default Landing;

