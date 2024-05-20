import { useState } from "react";
import api from "../../api";
import ToastMessage from "../../components/ToastMessage";
import { emailRegex } from "../../utils";
import loadingIcon from "../../assets/transparent-spinner.svg";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      setSignupLoader(true);
      if (!emailRegex.test(data.email)) {
        return;
      }
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
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
      setSignupLoader(false);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center pt-10">
        <div className=" bg-white p-8 rounded-md shadow-md font-['Inter'] w-96">
          <h2 className="text-2xl font-bold mb-4">Signup</h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-800"
              >
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                required
                value={data.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="studio_name"
                className="block text-sm font-medium text-gray-800"
              >
                Studio Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studio_name"
                name="studio_name"
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                required
                value={data.studio_name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Business Email<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                required
                value={data.email}
                onChange={handleChange}
              />
            </div>
            {data.email && data.studio_name && data.name ? (
              <>
                {signupLoader ? (
                  <button
                    type="submit"
                    className="w-full bg-[#f58174] text-white flex justify-center py-2 px-4 rounded-md outline-none"
                    onClick={handleSignup}
                  >
                    <img src={loadingIcon} alt="loading" className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md outline-none"
                    onClick={handleSignup}
                  >
                    Signup
                  </button>
                )}
              </>
            ) : (
              <button
                type="submit"
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md outline-none"
              >
                {isEmailSent ? "Email sent " : "Signup"}
              </button>
            )}
          </form>
        </div>
      </div>
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
