import { useState } from "react";
import api from "../../api";
import ToastMessage from "../../components/ToastMessage";
import { authenticate } from "../../auth";
import { emailRegex } from "../../utils";
import loadingIcon from "../../assets/transparent-spinner.svg";

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
  return (
    <>
      <div className="flex items-center justify-center pt-10">
        <div className=" bg-white p-8 rounded-md shadow-md font-['Inter'] w-96">
          <h2 className="text-2xl font-bold mb-4">
            {showForgotPassword ? "Forgot password" : "Login"}
          </h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!showForgotPassword && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Password<span className="text-red-500">*</span>
                  </label>
                  <p
                    className="text-sm text-blue-500 cursor-pointer"
                    onClick={() => {
                      setShowForgotPassword(!showForgotPassword);
                      setEmail("");
                      setPassword("");
                    }}
                  >
                    Forgot Password?
                  </p>
                </div>

                <input
                  type="password"
                  id="password"
                  name="password"
                  className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            {showForgotPassword ? (
              <button
                type="submit"
                className={`w-full ${
                  emailRegex.test(email) ? "bg-[#f58174]" : "bg-gray-500"
                } text-white py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-gray-400`}
                onClick={handleForgotPassword}
              >
                Send Email
              </button>
            ) : (
              <>
                {email && password ? (
                  <>
                    {loginLoader ? (
                      <button
                        type="submit"
                        className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md flex justify-center outline-none"
                      >
                        <img
                          src={loadingIcon}
                          alt="loading"
                          className="w-8 h-8"
                        />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="w-full bg-[#f58174] text-white py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-gray-400"
                        onClick={handleLogin}
                      >
                        Login
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:border-gray-400"
                  >
                    Login
                  </button>
                )}
              </>
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
export default Login;
