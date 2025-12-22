import { useState } from "react";
import api from "../../api";
import ToastMessage from "../../components/ToastMessage";
import { emailRegex } from "../../utils";
import Loader from "../../components/Loader";
import AuthLayout from "./AuthLayout";

const Signup = () => {
  const [data, setData] = useState({
    studio_name: "",
    name: "",
    email: "",
  });
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [signupLoader, setSignupLoader] = useState(false);
  const [isEmailSent, setEmailSent] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSignupError("");
  };

  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      if (!emailRegex.test(data.email)) {
        setSignupError("Please enter a valid email address");
        return;
      }
      setSignupLoader(true);
      setSignupError("");
      const requestbody = {
        email: data.email.trim(),
        studio_name: data.studio_name.trim(),
        name: data.name.trim(),
      };
      const signup_response = await api.post(
        `/v1/game-studios/external-studio`,
        requestbody
      );
      if (signup_response.status === 201) {
        setToastMessage({
          show: true,
          message: "Invite email sent to your email address",
          type: "success",
        });
        setData({
          name: "",
          email: "",
          studio_name: "",
        });
        setEmailSent(true);
      }
      setSignupLoader(false);
    } catch (err) {
      if (err.response?.data?.message) {
        setSignupError(err.response.data.message);
      } else {
        setSignupError("Something went wrong. Please try again.");
      }
      setSignupLoader(false);
    }
  };

  const isFormValid = data.email && data.studio_name && data.name;

  if (isEmailSent) {
    return (
      <AuthLayout>
        <div className="">
          <h5 className="text-[22px] text-[#0E0E0E] font-normal mb-2">
            Check Your Inbox
          </h5>
          <p className="text-xs text-[#6D6D6D] font-normal mb-6">
            We've sent an invite email to {data.email || "your email address"}. Please check your inbox to complete the signup process.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <AuthLayout>
        <div className="">
          <h5 className="text-[22px] text-[#0E0E0E] font-medium">
            Add your Studio Details
          </h5>
          <p className="text-xs text-[#6D6D6D] font-normal mb-6">
            This will help us in tailoring GamePac to your creative needs.
          </p>
        </div>
        <form className="w-full">
          <div className="mb-4">
            <label
              htmlFor="studio_name"
              className="block text-xs text-[#76819A] font-normal mb-1"
            >
              Studio Name<span className="text-[#E53935]">*</span>
            </label>
            <input
              type="text"
              id="studio_name"
              name="studio_name"
              placeholder="Add Studio Name here"
              className="w-full p-2 rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-sm font-urbanist h-[40px] border border-transparent focus:outline-none focus:border-[#C1C1C1]"
              value={data.studio_name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs text-[#76819A] font-normal mb-1"
            >
              Business Email<span className="text-[#E53935]">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              className={`w-full p-2 rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-sm font-urbanist h-[40px] border border-transparent focus:outline-none focus:border-[#C1C1C1] ${signupError.includes("email") ? "border-[#D92D20]" : "border-transparent"}`}
              value={data.email}
              onChange={(e) => {
                handleChange(e);
                setSignupError("");
              }}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-xs text-[#76819A] font-normal mb-1"
            >
              User Name<span className="text-[#E53935]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Add User_name"
              className="w-full p-2 rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-sm font-urbanist h-[40px] border border-transparent focus:outline-none focus:border-[#C1C1C1]"
              value={data.name}
              onChange={handleChange}
            />
          </div>

          {signupError && (
            <p className="text-[#E53935] text-xs mt-2 mb-2">{signupError}</p>
          )}

          {signupLoader ? (
            <button
              type="button"
              className="mt-6 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-enabled-btn flex items-center justify-center"
              disabled
            >
              <Loader size={18} />
            </button>
          ) : isFormValid ? (
            <button
              type="button"
              className="mt-6 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-enabled-btn"
              onClick={handleSignup}
            >
              Add Studio
            </button>
          ) : (
            <button
              type="button"
              className="mt-6 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-disabled-btn cursor-not-allowed"
              disabled
            >
              Add Studio
            </button>
          )}
        </form>
      </AuthLayout>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </>
  );
};

export default Signup;
