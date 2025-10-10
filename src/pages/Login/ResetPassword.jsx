import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseJwt } from "../../utils";
import info from "../../assets/info.svg";
import api from "../../api";
import { authenticate } from "../../auth";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showResetPasswordSuccess, setShowResetPasswordSuccess] =
    useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const userData = parseJwt(token);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  function validatePassword() {
    const minLengthRegex = /.{9,}/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{}|\\:'",.<>/?]/;

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (!minLengthRegex.test(password)) {
      return "Password must be at least 9 characters long.";
    }
    if (!uppercaseRegex.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!lowercaseRegex.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!numberRegex.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character.";
    }
    return "";
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const validationError = validatePassword(password);
      if (validationError) {
        setError(validationError);
        return;
      }
      const requestbody = {
        password: password,
        email: userData.email,
      };
      const passwordResponse = location.pathname.includes("reset-password")
        ? await api.post(`/v1/auth/reset-password`, requestbody)
        : await api.post(`/v1/auth/set-password`, requestbody);
      if (passwordResponse.status === 200) {
        if (location.pathname.includes("reset-password")) {
          setConfirmPassword("");
          setPassword("");
          setShowResetPasswordSuccess(true);
        } else {
          authenticate(passwordResponse.data.data, () => {
            window.location.href = "/";
          });
        }
      }
    } catch (err) {
      console.log(err, "err");
    }
  };
  return (
    <div className="flex items-center justify-center pt-10">
      <div className=" bg-white p-8 rounded-md shadow-md font-['Inter'] w-96">
        {showResetPasswordSuccess ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              Your password has been successfully updated!
            </h2>
            <p className="mb-6">You can now log in with your new password.</p>
            <button
              onClick={handleLoginRedirect}
              className="bg-[#B9FF66] text-[#000] py-2 px-4 rounded-md hover:bg-[#000] hover:text-[#B9FF66]"
            >
              Log In
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Set Password</h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-800"
                >
                  Password
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="bg-[#e6e6e6] rounded text-[#808080] mb-4 p-2 text-[12px]">
                <p className="flex items-center font-bold">
                  <img
                    src={info}
                    alt="info"
                    width={20}
                    height={20}
                    className="inline mr-1"
                  />
                  Note
                </p>
                <ul>
                  <li>Minimum length: 9 characters</li>
                  <li>Must contain at least one:</li>
                  <ul className="list-disc ml-4">
                    <li>Uppercase letter (A-Z)</li>
                    <li>Lowercase letter (a-z)</li>
                    <li>Number (0-9)</li>
                    <li>{`Special character (! @ # $ % ^ & * _ - + = [ ] { } | \ : ' " , . < > / ?)`}</li>
                  </ul>
                </ul>
              </div>
              <p className="text-red-500 text-sm">{error}</p>
              {validatePassword() ? (
                <button
                  type="submit"
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:border-gray-400 cursor-not-allowed"
                  disabled
                >
                  Change Password
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-[#B9FF66] text-[#000] py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-gray-400"
                  onClick={handleSubmit}
                >
                  Change Password
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
