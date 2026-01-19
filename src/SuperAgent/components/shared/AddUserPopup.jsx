import React, { useState, useEffect, useRef, Fragment } from "react";
import { X } from "lucide-react";
import { AltArrowDown } from "@solar-icons/react";
import api from "../../../api";

// Role hierarchy: owner > admin > manager > user
// When selecting a role, all lower roles are automatically included
const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  manager: 2,
  user: 1,
};

const USER_ROLES = [
  { value: "owner", label: "Owner", level: 4 },
  { value: "admin", label: "Admin", level: 3 },
  { value: "manager", label: "Manager", level: 2 },
  { value: "user", label: "User", level: 1 },
];

// Get all roles that should be included based on the selected role
const getRolesForLevel = (roleValue) => {
  const selectedLevel = ROLE_HIERARCHY[roleValue];
  return USER_ROLES
    .filter((r) => r.level <= selectedLevel)
    .map((r) => r.value);
};

// Get the highest role from an array of roles
const getHighestRole = (roles) => {
  if (!roles || roles.length === 0) return null;
  let highest = null;
  let highestLevel = 0;
  for (const role of roles) {
    if (ROLE_HIERARCHY[role] > highestLevel) {
      highestLevel = ROLE_HIERARCHY[role];
      highest = role;
    }
  }
  return highest;
};

const RoleBadge = ({ role, onRemove }) => {
  const roleConfig = USER_ROLES.find((r) => r.value === role);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium text-[#1976D2] bg-[#edfbfe]">
      {roleConfig?.label || role}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

const AddUserPopup = ({
  setShowModal,
  setToastMessage,
  setUsers,
  selectedUser,
  setSelectedUser,
  studio_id,
  userData,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);
  const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
  const rolesDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rolesDropdownRef.current &&
        !rolesDropdownRef.current.contains(event.target)
      ) {
        setIsRolesDropdownOpen(false);
      }
    };
    if (isRolesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRolesDropdownOpen]);

  // Load existing user data for edit mode
  useEffect(() => {
    if (selectedUser?.id) {
      setName(selectedUser.name || "");
      setEmail(selectedUser.email || "");
      setRoles(selectedUser.roles || []);
    }
  }, [selectedUser]);

  const closePopup = () => {
    setShowModal(false);
    setSelectedUser?.(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (roles.length < 1) {
      newErrors.roles = "Please select at least one role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoader(true);
      const requestBody = {
        name: name,
        email: email?.trim(),
        roles: roles,
        invite_status: selectedUser?.id ? selectedUser?.invite_status : "invited",
        studio_id: studio_id,
      };

      const response = selectedUser?.id
        ? await api.put(`/v1/users/${studio_id}/${selectedUser.id}`, requestBody)
        : await api.post("v1/auth/add-user", requestBody);

      setToastMessage({
        show: true,
        message: selectedUser?.id
          ? `${name} updated successfully`
          : `${name} added successfully`,
        type: "success",
      });

      if (response.status === 201 || response.status === 200) {
        if (selectedUser?.id) {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === selectedUser.id
                ? { ...requestBody, id: selectedUser.id }
                : user
            )
          );
        } else {
          setUsers((prev) => [
            ...prev,
            { ...requestBody, id: response.data.data.id },
          ]);
        }
        closePopup();
      }
    } catch (err) {
      console.error("Failed to save user:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to save user",
        type: "error",
      });
    } finally {
      setSubmitLoader(false);
    }
  };

  const selectRole = (roleValue) => {
    if (userData?.id === selectedUser?.id) return; // Prevent editing own roles

    // When selecting a role, include all lower roles in the hierarchy
    const newRoles = getRolesForLevel(roleValue);
    setRoles(newRoles);
    setErrors((prev) => ({ ...prev, roles: "" }));
    setIsRolesDropdownOpen(false);
  };

  // Remove a role and all higher roles, keeping only lower roles
  const removeRole = (roleValue) => {
    if (userData?.id === selectedUser?.id) return;

    const roleLevel = ROLE_HIERARCHY[roleValue];
    // Keep only roles with level lower than the removed role
    const newRoles = roles.filter((r) => ROLE_HIERARCHY[r] < roleLevel);
    setRoles(newRoles);
  };

  // Get the highest role to display
  const highestRole = getHighestRole(roles);

  const isOwnProfile = userData?.id === selectedUser?.id;

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto w-[450px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-5">
            <h3 className="text-lg font-semibold text-[#141414]">
              {selectedUser?.id ? "Edit user" : "Add user"}
            </h3>
            <button
              className="p-1 text-[#6d6d6d] hover:text-[#141414]"
              onClick={closePopup}
            >
              <X size={24} color="#6d6d6d" strokeWidth={1.5} />
            </button>
          </div>

          {/* Form */}
          <div className="px-5 pb-5 flex flex-col gap-4">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6d6d6d]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Add name"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
                  errors.name ? "border-[#f25a5a]" : "border-[#E7EAEE]"
                }`}
              />
              {errors.name && (
                <span className="text-xs text-[#f25a5a]">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6d6d6d]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="Add an email"
                disabled={selectedUser?.id}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors ${
                  errors.email ? "border-[#f25a5a]" : "border-[#E7EAEE]"
                } ${selectedUser?.id ? "bg-[#F6F6F6] cursor-not-allowed" : ""}`}
              />
              {errors.email && (
                <span className="text-xs text-[#f25a5a]">{errors.email}</span>
              )}
            </div>

            {/* Roles Field */}
            <div className="flex flex-col gap-2" ref={rolesDropdownRef}>
              <label className="text-sm font-medium text-[#6d6d6d]">Roles</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !isOwnProfile && setIsRolesDropdownOpen(!isRolesDropdownOpen)}
                  disabled={isOwnProfile}
                  className={`w-full px-4 py-3 rounded-lg border text-sm text-left flex items-center justify-between transition-colors ${
                    isRolesDropdownOpen ? "border-[#1F6744]" : "border-[#E7EAEE]"
                  } ${errors.roles ? "border-[#f25a5a]" : ""} ${
                    isOwnProfile ? "bg-[#F6F6F6] cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex items-center gap-1 flex-wrap">
                    {roles.length > 0 ? (
                      // Display roles in hierarchy order (highest first)
                      [...roles]
                        .sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a])
                        .map((role) => (
                          <RoleBadge
                            key={role}
                            role={role}
                            onRemove={!isOwnProfile ? () => removeRole(role) : null}
                          />
                        ))
                    ) : (
                      <span className="text-[#B0B0B0]">Select role</span>
                    )}
                  </div>
                  <AltArrowDown
                    size={16}
                    color="#6d6d6d"
                    weight="Linear"
                    className={`transition-transform shrink-0 ${
                      isRolesDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isRolesDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E7EAEE] rounded-lg shadow-lg z-10 overflow-hidden p-2">
                    {USER_ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => selectRole(role.value)}
                        className={`w-full py-3 text-left text-sm border-b border-[#f1f1f1] last:border-b-0 ${
                          highestRole === role.value ? "bg-[#f6f6f6]" : ""
                        }`}
                      >
                        <span className="text-[#1976D2] font-medium bg-[#edfbfe] rounded-full px-2 py-1.5">{role.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.roles && (
                <span className="text-xs text-[#f25a5a]">{errors.roles}</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-5 border-t border-[#E7EAEE]">
            {(() => {
              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              const isFormValid = name.length >= 2 && emailRegex.test(email) && roles.length >= 1;
              const isDisabled = submitLoader || !isFormValid;

              return (
                <button
                  className={`px-10 py-1.5 rounded-lg text-base font-medium transition-colors ${
                    isDisabled
                      ? "bg-[#E7EAEE] text-[#B0B0B0] cursor-not-allowed"
                      : "bg-[#1F6744] text-white hover:bg-[#1a5a3a]"
                  }`}
                  onClick={handleSubmit}
                  disabled={isDisabled}
                >
                  {submitLoader ? "Saving..." : selectedUser?.id ? "Save" : "Add"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserPopup;
