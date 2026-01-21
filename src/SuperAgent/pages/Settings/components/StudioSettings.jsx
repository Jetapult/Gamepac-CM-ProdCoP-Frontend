import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Pen } from "@solar-icons/react";
import api from "../../../../api";
import {
  addStudioData,
  addStudios,
} from "../../../../store/reducer/adminSlice";
import { updateUserData } from "../../../../store/reducer/userSlice";
import { emailRegex } from "../../../../utils";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import ToastMessage from "../../../../components/ToastMessage";

const ChevronDownIcon = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="#141414"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StudioSettings = ({ studioData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.user);
  const studioList = useSelector((state) => state.admin.studios);
  const isStudioManager = userData?.studio_type?.includes("studio_manager");
  const logoInputRef = useRef(null);

  const [studioName, setStudioName] = useState(studioData?.studio_name || "");
  const [phoneNumber, setPhoneNumber] = useState(studioData?.phone || "");
  const [email, setEmail] = useState(studioData?.contact_email || "");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    studioData?.studio_logo || null
  );
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  // Error states
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Check if there are any changes compared to original data (ignoring whitespace)
  const hasChanges =
    studioName.trim() !== (studioData?.studio_name || "").trim() ||
    phoneNumber.trim() !== (studioData?.phone || "").trim() ||
    email.trim() !== (studioData?.contact_email || "").trim() ||
    logo !== null; // logo is only set when user uploads a new file

  useEffect(() => {
    setStudioName(studioData?.studio_name || "");
    setPhoneNumber(studioData?.phone || "");
    setEmail(studioData?.contact_email || "");
    setLogoPreview(studioData?.studio_logo || null);
    setLogo(null);
  }, [studioData]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleSave = async () => {
    // Trim values before validation and submission
    const trimmedName = studioName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    // Validate fields
    let hasError = false;

    if (trimmedName.length < 2) {
      setNameError(true);
      hasError = true;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError(true);
      hasError = true;
    }
    if (trimmedPhone.length < 2) {
      setPhoneError(true);
      hasError = true;
    }
    if (!logoPreview && !logo) {
      setLogoError(true);
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("studio_name", trimmedName);
      formData.append("contact_email", trimmedEmail);
      formData.append("phone", trimmedPhone);
      if (logo) {
        formData.append("studio_logo", logo);
      } else if (studioData?.studio_logo) {
        formData.append("studio_logo", studioData.studio_logo);
      }
      if (studioData?.studio_type) {
        studioData.studio_type.forEach((type) => {
          formData.append("studio_type", type);
        });
      }

      const response = await api.put(
        `v1/game-studios/${studioData?.slug}`,
        formData
      );

      if (response.data.data) {
        const updatedStudio = response.data.data;

        // Update Redux store
        dispatch(addStudioData(updatedStudio));

        // Update studio list
        if (studioList?.length > 0) {
          const updatedList = studioList.map((s) =>
            s.id === updatedStudio.id ? updatedStudio : s
          );
          dispatch(addStudios(updatedList));
        }

        // Update user data if this is the user's own studio
        if (
          (userData?.studio_type?.includes("studio_manager") &&
            updatedStudio.id === userData?.studio_id) ||
          !userData?.studio_type?.includes("studio_manager")
        ) {
          dispatch(
            updateUserData({
              studio_name: updatedStudio.studio_name,
              contact_email: updatedStudio.contact_email,
              phone: updatedStudio.phone,
              studio_logo: updatedStudio.studio_logo,
            })
          );
        }

        setToastMessage({
          show: true,
          message: "Studio updated successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Failed to update studio:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to update studio",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudio = async () => {
    try {
      const response = await api.delete(`v1/game-studios/${studioData?.id}`);

      if (response.data.data) {
        // Clear studio data from Redux
        dispatch(addStudioData({}));

        // Remove from studios list
        if (studioList?.length > 0) {
          const updatedList = studioList.filter((s) => s.id !== studioData?.id);
          dispatch(addStudios(updatedList));
        }

        setToastMessage({
          show: true,
          message: "Studio deleted successfully",
          type: "success",
        });

        setShowDeleteConfirmation(false);

        // Navigate to user's dashboard
        navigate(`/${userData.slug}/dashboard`);
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to delete studio:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to delete studio",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Studio
        </h3>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !hasChanges}
          className="px-4 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Settings Card */}
      <div className="border border-[#f6f6f6] rounded-lg overflow-hidden">
        {/* Logo Section */}
        <div className="flex items-center gap-4 px-3 py-4 border-b border-[#f6f6f6]">
          <div
            className="relative w-[128px] h-[128px] rounded-lg border border-[#f6f6f6] overflow-hidden bg-white flex items-center justify-center cursor-pointer"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={handleLogoClick}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={studioData?.studio_name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-[#b0b0b0] text-sm">No logo</span>
            )}
            {/* Hover overlay with edit icon */}
            {isLogoHovered && (
            <div className="absolute bg-[#0000000d] w-full h-full flex items-center justify-center">
              <span className="cursor-pointer bg-white rounded-[5px] p-1">
                <Pen weight="Linear" size={20} color="#6D6D6D" />
              </span>
            </div>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          {logoError && (
            <span className="font-urbanist text-[12px] text-red-500">
              Logo is required
            </span>
          )}
        </div>

        {/* Studio Name Section */}
        <div className="flex flex-col gap-2 px-3 py-4 border-b border-[#f6f6f6]">
          <label className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
            Studio Name
          </label>
          <input
            type="text"
            value={studioName}
            onChange={(e) => {
              setStudioName(e.target.value);
              setNameError(false);
            }}
            className={`w-[280px] h-9 px-2 py-[9px] bg-white border rounded font-urbanist font-medium text-[14px] text-[#141414] leading-[21px] focus:outline-none focus:border-[#1f6744] ${
              nameError ? "border-red-400" : "border-[#f6f6f6]"
            }`}
          />
          {nameError && (
            <span className="font-urbanist text-[12px] text-red-500">
              Name must be at least 2 characters
            </span>
          )}
        </div>

        {/* Studio Contact Section */}
        <div className="flex flex-col gap-2 px-3 py-4 border-b border-[#f6f6f6]">
          <label className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
            Studio Contact
          </label>
          <div className="relative w-[275px] h-9 bg-white border border-[#f6f6f6] rounded overflow-hidden flex items-center">
            {/* <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center gap-0.5 px-[7px] h-full"
            >
              <span className="font-gilroy font-medium text-[14px] text-[#141414] leading-[21px]">
                {countryCode}
              </span>
              <ChevronDownIcon />
            </button>
            <div className="w-px h-9 bg-[#f6f6f6]" /> */}
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setPhoneError(false);
              }}
              className="flex-1 h-full px-2 font-urbanist font-medium text-[14px] text-[#141414] leading-[21px] focus:outline-none"
            />
            {/* {showCountryDropdown && (
              <div className="absolute left-0 top-full mt-1 w-[100px] bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-10">
                {["+91", "+1", "+44", "+61"].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCountryCode(code);
                      setShowCountryDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 font-gilroy text-[14px] text-[#141414] hover:bg-[#f6f6f6]"
                  >
                    {code}
                  </button>
                ))}
              </div>
            )} */}
          </div>
          {phoneError && (
            <span className="font-urbanist text-[12px] text-red-500">
              Please enter a valid phone number
            </span>
          )}
        </div>

        {/* Email Section */}
        <div className="flex flex-col gap-2 px-3 py-4 border-b border-[#f6f6f6]">
          <label className="font-urbanist font-medium text-[12px] text-[#b0b0b0]">
            Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              disabled={!isEmailEditable}
              className={`w-[280px] h-9 px-2 py-[9px] bg-white border rounded font-urbanist font-medium text-[14px] text-[#141414] leading-[21px] focus:outline-none focus:border-[#1f6744] ${
                emailError ? "border-red-400" : "border-[#f6f6f6]"
              } ${
                !isEmailEditable ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
              autoFocus
            />
            <button
              onClick={() => setIsEmailEditable(true)}
              className="w-9 h-9 flex items-center justify-center border border-[#f6f6f6] rounded-[5px] bg-white hover:bg-[#f6f6f6] transition-colors"
              title="Edit email"
            >
              <Pen weight="Linear" size={18} color="#6D6D6D" />
            </button>
          </div>
          {emailError && (
            <span className="font-urbanist text-[12px] text-red-500">
              Please enter a valid email address
            </span>
          )}
        </div>
      </div>

      {/* Delete Section - Only visible for non-managers */}
      {/* {!isStudioManager && (
        <div className="flex items-center justify-between px-3 py-4 border border-[#f6f6f6] rounded-lg">
          <div className="flex flex-col gap-2">
            <span className="font-urbanist font-medium text-[14px] text-[#141414] leading-[21px]">
              Workspace Access
            </span>
            <span className="font-urbanist font-medium text-[14px] text-[#b0b0b0] leading-[21px]">
              Schedule studio to be permanently deleted
            </span>
          </div>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="font-urbanist font-medium text-[14px] text-[#f25a5a] leading-6 hover:opacity-80 transition-opacity"
          >
            Delete
          </button>
        </div>
      )} */}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <ConfirmationPopup
          heading="Delete Studio"
          subHeading={`Are you sure you want to delete ${studioData?.studio_name}? On Delete, all the games, users and reviews under this studio will be deleted.`}
          onCancel={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeleteStudio}
        />
      )}

      {/* Toast Message */}
      {toastMessage?.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default StudioSettings;
