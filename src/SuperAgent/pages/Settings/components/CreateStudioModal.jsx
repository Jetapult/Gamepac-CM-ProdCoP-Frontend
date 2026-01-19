import React, { useState } from "react";
import api from "../../../../api";
import { emailRegex } from "../../../../utils";
import { X } from "lucide-react";

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14V4M10 4L14 8M10 4L6 8" stroke="#6D6D6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 14V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V14" stroke="#6D6D6D" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CreateStudioModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoError(false);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validate
    let hasError = false;
    if (name.length < 2) {
      setNameError(true);
      hasError = true;
    }
    if (!emailRegex.test(email)) {
      setEmailError(true);
      hasError = true;
    }
    if (phone.length < 2) {
      setPhoneError(true);
      hasError = true;
    }
    if (!logo) {
      setLogoError(true);
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("studio_name", name);
      formData.append("contact_email", email);
      formData.append("phone", phone);
      formData.append("studio_logo", logo);
      formData.append("studio_type", "studio");

      const response = await api.post("v1/game-studios", formData);
      if (response.data.data) {
        onSuccess(response.data.data);
      }
    } catch (err) {
      console.error("Failed to create studio:", err);
      setErrorMessage(err.response?.data?.message || "Failed to create studio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f6f6f6]">
          <h2 className="font-urbanist font-semibold text-[18px] text-[#141414]">
            Create Studio
          </h2>
          <button
            onClick={onClose}
            className="text-[#6d6d6d] hover:text-[#141414] transition-colors"
          >
            <X size={24} color="#6d6d6d" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-urbanist text-[14px] text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Studio Name */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-[14px] text-[#141414]">
              Studio Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(false); }}
              placeholder="Enter studio name"
              className={`w-full h-10 px-3 bg-white border rounded-lg font-urbanist text-[14px] text-[#141414] focus:outline-none focus:border-[#1f6744] ${
                nameError ? "border-red-400" : "border-[#f6f6f6]"
              }`}
            />
            {nameError && (
              <span className="font-urbanist text-[12px] text-red-500">
                Name must be at least 2 characters
              </span>
            )}
          </div>

          {/* Studio Email */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-[14px] text-[#141414]">
              Studio Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
              placeholder="Enter studio email"
              className={`w-full h-10 px-3 bg-white border rounded-lg font-urbanist text-[14px] text-[#141414] focus:outline-none focus:border-[#1f6744] ${
                emailError ? "border-red-400" : "border-[#f6f6f6]"
              }`}
            />
            {emailError && (
              <span className="font-urbanist text-[12px] text-red-500">
                Please enter a valid email address
              </span>
            )}
          </div>

          {/* Studio Phone */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-[14px] text-[#141414]">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(false); }}
              placeholder="Enter contact number"
              className={`w-full h-10 px-3 bg-white border rounded-lg font-urbanist text-[14px] text-[#141414] focus:outline-none focus:border-[#1f6744] ${
                phoneError ? "border-red-400" : "border-[#f6f6f6]"
              }`}
            />
            {phoneError && (
              <span className="font-urbanist text-[12px] text-red-500">
                Please enter a valid phone number
              </span>
            )}
          </div>

          {/* Studio Logo */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-[14px] text-[#141414]">
              Studio Logo <span className="text-red-500">*</span>
            </label>
            <div className={`border border-dashed rounded-lg p-4 ${logoError ? "border-red-400" : "border-[#aaa]"}`}>
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain rounded-lg border border-[#f6f6f6]" />
                  <div className="flex-1">
                    <p className="font-urbanist text-[14px] text-[#141414]">{logo?.name}</p>
                    <button
                      onClick={() => { setLogo(null); setLogoPreview(null); }}
                      className="font-urbanist text-[12px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <UploadIcon />
                  <span className="font-urbanist text-[14px] text-[#1f6744]">Click to upload logo</span>
                  <span className="font-urbanist text-[12px] text-[#6d6d6d]">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {logoError && (
              <span className="font-urbanist text-[12px] text-red-500">
                Please upload a logo
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f6f6f6]">
          <button
            onClick={onClose}
            className="px-4 py-2 font-urbanist font-medium text-[14px] text-[#6d6d6d] hover:text-[#141414] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Studio"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStudioModal;
