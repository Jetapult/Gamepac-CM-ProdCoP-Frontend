import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseJwt } from "../../utils";
import api from "../../api";
import { authenticate } from "../../auth";
import AuthLayout from "./AuthLayout";
import { Eye, EyeClosed, CheckCircle, CloseCircle } from "@solar-icons/react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation rules
  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 9,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{}|\\:'",.<>/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  const passwordsMatch = useMemo(() => {
    return password && confirmPassword && password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    return isPasswordValid && passwordsMatch;
  }, [isPasswordValid, passwordsMatch]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!isFormValid) {
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
      setError("Something went wrong. Please try again.");
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <li className={`flex items-center gap-2 text-xs ${isValid ? "text-[#B0B0B0]" : "text-[#E53935]"}`}>
      {isValid ? (
        <CheckCircle weight={"Bold"} size={16} color="#00A251" />
      ) : (
        <CloseCircle weight={"Bold"} size={16} color="#E53935" />
      )}
      {text}
    </li>
  );

  const InactiveValidationItem = ({ text }) => (
    <li className="flex items-center gap-2 text-xs text-[#B0B0B0]">
      <CheckCircle weight={"Bold"} size={16} color="#B0B0B0" />
      {text}
    </li>
  );

  if (showResetPasswordSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle weight={"Bold"} size={64} color="#00A251" />
          </div>
          <h5 className="text-[22px] text-[#0E0E0E] font-medium mb-2">
            Password Updated!
          </h5>
          <p className="text-xs text-[#6D6D6D] font-normal mb-6">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <button
            className="mt-4 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-enabled-btn"
            onClick={handleLoginRedirect}
          >
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="">
        <h5 className="text-[22px] text-[#0E0E0E] font-medium">
          Set new password
        </h5>
        <p className="text-xs text-[#6D6D6D] font-normal mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>
      <form className="w-full">
        <div className="mb-4 relative">
          <label
            htmlFor="password"
            className="block text-xs text-[#76819A] font-normal mb-1"
          >
            New password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full p-2 max-h-[40px] text-[#292929] rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] placeholder:text-sm placeholder:tracking-normal font-urbanist h-[40px] border focus:outline-none ${
              password && !isPasswordValid
                ? "border-[#E53935] focus:border-[#E53935]"
                : "border-transparent focus:border-[#C1C1C1]"
            } ${showPassword ? "text-sm" : "text-[40px]"}`}
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
        </div>

        <div className="mb-2 relative">
          <label
            htmlFor="confirmPassword"
            className="block text-xs text-[#76819A] font-normal mb-1"
          >
            Confirm new password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`w-full p-2 text-[#292929] max-h-[40px] rounded-lg shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] placeholder:text-sm placeholder:tracking-normal font-urbanist h-[40px] border focus:outline-none ${
              confirmPassword && !passwordsMatch
                ? "border-[#E53935] focus:border-[#E53935]"
                : "border-transparent focus:border-[#C1C1C1]"
            } ${showConfirmPassword ? "text-sm" : "text-[40px]"}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {showConfirmPassword ? (
            <Eye
              weight={"Linear"}
              size={20}
              color="#B6B6B6"
              className="absolute right-2 top-10 transform -translate-y-[50%] cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          ) : (
            <EyeClosed
              weight={"Linear"}
              size={20}
              color="#B6B6B6"
              className="absolute right-2 top-10 transform -translate-y-[50%] cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          )}
        </div>

        {confirmPassword && (
          <div className={`flex items-center gap-2 text-xs mb-4 ${passwordsMatch ? "text-[#00A251]" : "text-[#E53935]"}`}>
            {passwordsMatch ? (
              <>
                <CheckCircle weight={"Bold"} size={16} color="#00A251" />
                Matches perfectly
              </>
            ) : (
              <>
                <CloseCircle weight={"Bold"} size={16} color="#E53935" />
                {isPasswordValid ? "Passwords do not match" : "Password too weak"}
              </>
            )}
          </div>
        )}

        {password && (
          <div className="border border-[#D9DEE4] rounded-md p-4 bg-white mt-4">
            <p className="text-xs font-normal mb-3">
              Your password must contain :
            </p>
            <ul className="list-type-none grid grid-cols-2 gap-2">
              <ValidationItem isValid={passwordValidation.minLength} text="At least 9 characters" />
              <ValidationItem isValid={passwordValidation.hasNumber} text="Numbers (0-9)" />
              <ValidationItem isValid={passwordValidation.hasUppercase} text="Upper case letter (A-Z)" />
              <ValidationItem isValid={passwordValidation.hasLowercase} text="Lower case letter (a-z)" />
              <ValidationItem isValid={passwordValidation.hasSpecial} text="Special character (!@#$%*^&%)" />
            </ul>
          </div>
        )}

        {!password && (
          <div className="border border-[#D9DEE4] rounded-md p-4 bg-white mt-4">
            <p className="text-xs font-normal mb-3">
              Your password must contain :
            </p>
            <ul className="list-type-none grid grid-cols-2 gap-2">
              <InactiveValidationItem text="At least 9 characters" />
              <InactiveValidationItem text="Numbers (0-9)" />
              <InactiveValidationItem text="Upper case letter (A-Z)" />
              <InactiveValidationItem text="Lower case letter (a-z)" />
              <InactiveValidationItem text="Special character (!@#$%*^&%)" />
            </ul>
          </div>
        )}

        {error && (
          <p className="text-[#E53935] text-xs mt-2">{error}</p>
        )}

        {/* Submit Button */}
        {isFormValid ? (
          <button
            type="button"
            className="mt-6 mb-4 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-enabled-btn"
            onClick={handleSubmit}
          >
            Change Password
          </button>
        ) : (
          <button
            type="button"
            className="mt-6 mb-4 h-[40px] text-center rounded-lg w-full py-2 text-white bg-login-disabled-btn cursor-not-allowed"
            disabled
          >
            Change Password
          </button>
        )}
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
