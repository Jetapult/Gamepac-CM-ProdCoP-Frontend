import loginGif from "../assets/login-gif/login-animation-1.svg";
import loginGif2 from "../assets/login-gif/login-animation-2.svg";
import loginGif3 from "../assets/login-gif/login-animation-3.svg";
import loginGif4 from "../assets/login-gif/login-animation-4.svg";
import loginGif6 from "../assets/login-gif/login-animation-6.svg";
import loginGif7 from "../assets/login-gif/login-animation-7.svg";
import loginGif8 from "../assets/login-gif/login-animation-8.svg";
import loginGif11 from "../assets/login-gif/login-animation-11.svg";
import loginGif12 from "../assets/login-gif/login-animation-12.svg";
import { useEffect, useState } from "react";

const fadeInStyle = {
  animation: "fadeInUp 0.6s ease-out forwards",
};

// Animation phases:
// Phase 0-3: Typing animation (loginGif 1-4) - centered, one at a time
// Phase 4: loginGif2 moves to top
// Phase 5: loginGif6 (Gmail) appears below, loginGif2 fades
// Phase 6: loginGif8 (Jira) appears below, previous fade more
// Phase 7: loginGif7 (third action) appears, all previous fade
// Phase 8: loginGif11 (chat view)
// Phase 9: loginGif12 (report view)

const typingFrames = [loginGif, loginGif2, loginGif3, loginGif4];

const LoginGif = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 10);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Add keyframes to document on mount
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Phase 0-3: Typing animation
  if (phase < 4) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <img
          src={typingFrames[phase]}
          alt="login-gif"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500"
        />
      </div>
    );
  }

  // Phase 4: Just the input prompt at top
  if (phase === 4) {
    return (
      <div className="h-screen w-full flex flex-col items-center pt-6 overflow-hidden">
        <img
          src={loginGif2}
          alt="input-prompt"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500"
        />
      </div>
    );
  }

  // Phase 5: Input + Gmail action (loginGif6)
  if (phase === 5) {
    return (
      <div className="h-screen w-full flex flex-col items-center pt-6 gap-1 overflow-hidden">
        <img
          src={loginGif2}
          alt="input-prompt"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-60"
        />
        <img
          src={loginGif6}
          alt="gmail-action"
          className="w-[90%] max-w-[600px] object-contain"
          style={fadeInStyle}
        />
      </div>
    );
  }

  // Phase 6: Input + Gmail + Jira action (loginGif8)
  if (phase === 6) {
    return (
      <div className="h-screen w-full flex flex-col items-center pt-6 gap-1 overflow-hidden">
        <img
          src={loginGif3}
          alt="input-prompt"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-40"
        />
        <img
          src={loginGif6}
          alt="gmail-action"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-60"
        />
        <img
          src={loginGif8}
          alt="jira-action"
          className="w-[90%] max-w-[600px] object-contain"
          style={fadeInStyle}
        />
      </div>
    );
  }

  // Phase 7: Input + Gmail + Jira + Third action (loginGif7)
  if (phase === 7) {
    return (
      <div className="h-screen w-full flex flex-col items-center pt-6 gap-1 overflow-hidden">
        <img
          src={loginGif4}
          alt="input-prompt"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-30"
        />
        <img
          src={loginGif6}
          alt="gmail-action"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-40"
        />
        <img
          src={loginGif8}
          alt="jira-action"
          className="w-[90%] max-w-[600px] object-contain transition-all duration-500 opacity-60"
        />
        <img
          src={loginGif7}
          alt="third-action"
          className="w-[90%] max-w-[600px] object-contain"
          style={fadeInStyle}
        />
      </div>
    );
  }

  // Phase 8: Chat view (loginGif11)
  if (phase === 8) {
    return (
      <div className="h-screen w-full flex flex-col pt-4 overflow-hidden">
        <img
          src={loginGif11}
          alt="chat-view"
          className="w-full max-h-[calc(100vh-50px)] object-contain object-left"
          style={fadeInStyle}
        />
      </div>
    );
  }

  // Phase 9: Report view (loginGif12)
  return (
    <div className="h-screen w-full flex flex-col pt-4 overflow-hidden">
      <img
        src={loginGif12}
        alt="report-view"
        className="w-full max-h-[calc(100vh-50px)] object-contain object-left"
        style={fadeInStyle}
      />
    </div>
  );
};

export default LoginGif;
