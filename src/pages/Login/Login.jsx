import { useState } from "react";
import api from "../../api";
import ToastMessage from "../../components/ToastMessage";
import { authenticate } from "../../auth";
import { emailRegex } from "../../utils";
import loadingIcon from "../../assets/transparent-spinner.svg";
import { ArrowRight, Eye, EyeClosed } from "@solar-icons/react";
import googleLogo from "../../assets/super-agents/google-logo.svg";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [loginLoader, setLoginLoader] = useState(false);
  const [emailPassword, setEmailPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async (event) => {
    try {
      event.preventDefault();
      if (!emailRegex.test(email)) {
        return;
      }
      const requestbody = {
        email,
      };
      const forgot_response = await api.post(
        `/v1/auth/forgot-password`,
        requestbody
      );
      if (forgot_response.status === 200) {
        setToastMessage({
          show: true,
          message: "Email sent successfully",
          type: "success",
        });
      }
    } catch (err) {
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoader(true);
      const requestbody = {
        email: email.trim(),
        password,
      };
      const login_response = await api.post(`/v1/auth/login`, requestbody);
      if (login_response.status === 200) {
        authenticate(login_response.data.data, () => {
          setToastMessage({
            show: true,
            message: "Login Successfully",
            type: "success",
          });
          window.location.href = "/";
        });
      }
      setLoginLoader(false);
    } catch (err) {
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
      setLoginLoader(false);
    }
  };

  const enableForgotPassword = () => {
    setShowForgotPassword(true);
    setEmailPassword(false);
  };
  return (
    <AuthLayout>
      {showForgotPassword ? (
        <div className="">
          <h5 className="text-[22px] text-[#0E0E0E] font-medium">
            Forgot password
          </h5>
          <p className="text-xs text-[#6D6D6D] font-normal mb-6">
            Enter your email address and we’ll send you a link to reset your
            password.{" "}
          </p>
        </div>
      ) : (
        <h5 className="text-[22px] text-[#0E0E0E] font-medium mb-4">
          Sign in to your account
        </h5>
      )}
      <form className="w-full">
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-xs text-[#76819A] font-normal mb-1"
          >
            Email Address{" "}
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full p-2 rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-sm font-urbanist h-[40px] border border-transparent focus:outline-none focus:border-[#C1C1C1]"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value && !emailPassword) {
                setEmailPassword(true);
              }
            }}
          />
        </div>
        {showForgotPassword ? (
          <></>
        ) : (
          <>
            {emailPassword ? (
              <div className="mb-4 relative">
                <label
                  htmlFor="email"
                  className="block text-xs text-[#76819A] font-normal mb-1"
                >
                  Enter your password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full p-2 max-h-[40px] rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] placeholder:text-sm placeholder:tracking-normal font-urbanist h-[40px] border border-transparent focus:outline-none focus:border-[#C1C1C1] ${
                    showPassword ? "text-sm" : "text-[40px]"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <Eye
                    weight={"Linear"}
                    size={20}
                    color="#B6B6B6"
                    className="absolute right-2 top-10 transform -translate-y-[50%] cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <EyeClosed
                    weight={"Linear"}
                    size={20}
                    color="#B6B6B6"
                    className="absolute right-2 top-10 transform -translate-y-[50%] cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
                <p
                  className="text-xs text-[#00A251] text-[11px] font-normal mt-2 cursor-pointer float-right"
                  onClick={enableForgotPassword}
                >
                  Forgot Password?
                </p>
              </div>
            ) : (
              <>
                <p className="flex text-xs text-[#76819A] font-normal my-4 after:content-[''] after:block after:w-full after:h-[1px] after:bg-[#D9DEE4] after:ml-4 after:my-2 before:content-[''] before:block before:w-full before:h-[1px] before:bg-[#D9DEE4] before:mr-4 before:my-2">
                  Or
                </p>
                <button className="bg-[#FFF] border border-[#DFDFDF] text-sm text-center rounded-lg py-2 w-full shadow-[0_2px_2px_0_rgba(0,0,0,0.08)] mt-4 h-[40px]">
                  <img
                    src={googleLogo}
                    alt="google-logo"
                    className="w-[18px] h-[18px] object-contain inline-flex mr-2"
                  />
                  Sign in with Google
                </button>
              </>
            )}
          </>
        )}

        {(email && password && !loginLoader) ||
        (showForgotPassword && emailRegex.test(email)) ? (
          <button
            className="mt-10 mb-4 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-enabled-btn"
            onClick={showForgotPassword ? handleForgotPassword : handleLogin}
          >
            {showForgotPassword ? "Send Reset Link " : "Login"}
          </button>
        ) : (
          <button className="mt-10 mb-4 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-disabled-btn">
            {showForgotPassword ? "Send Email" : "Login"}
          </button>
        )}
        {(emailPassword || showForgotPassword) && (
          <button
            type="button"
            className="mt-2 mb-4 h-[40px] text-center rounded-lg w-full py-2 bg-white relative"
            style={{
              background:
                "linear-gradient(#F6F6F6, #F6F6F6) padding-box, linear-gradient(333deg, #11A85F 13.46%, #1F6744 103.63%) border-box",
              border: "1px solid transparent",
            }}
            onClick={() =>
              showForgotPassword
                ? (setShowForgotPassword(false), setEmailPassword(true))
                : setEmailPassword(false)
            }
          >
            <span className="text-[#1F6744] text-sm font-normal">
              {showForgotPassword ? "Back to sign in  " : "Back"}
            </span>
          </button>
        )}
      </form>
      {!emailPassword && !showForgotPassword && (
        <>
          <p className="text-[#76819A] text-xs text-center cursor-pointer mb-10">
            Don’t have an account?{" "}
            <span className="text-[#1F6744]">
              Contact Us{" "}
              <ArrowRight weight={"Linear"} className="inline-flex" />
            </span>
          </p>
          <p className="text-[11px] text-[11px] text-center text-[#76819A]">
            By signing in you accept the{" "}
            <a className="underline cursor-pointer">Terms & Conditions</a> and
            acknowledge our <br />
            <a className="underline cursor-pointer">Privacy Policy</a>
          </p>
        </>
      )}
    </AuthLayout>
  );
};
export default Login;
