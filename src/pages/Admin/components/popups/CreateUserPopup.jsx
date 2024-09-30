import { XMarkIcon } from "@heroicons/react/20/solid";
import React, { Fragment, useEffect, useState } from "react";
import api from "../../../../api";
import { Menu, Transition } from "@headlessui/react";
import { classNames } from "../../../../utils";
import loadingIcon from "../../../../assets/transparent-spinner.svg";

const userRoles = ["user", "manager", "admin", "owner"];

const CreateUserPopup = ({
  setShowModal,
  setToastMessage,
  setUsers,
  selectedUser,
  setSelectedUser,
  studio_id,
  userData
}) => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [rolesError, setRolesError] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);

  const closePopup = () => {
    setShowModal(false);
    setSelectedUser({});
  };

  const onNameChange = (e) => {
    setName(e.target.value);
    setNameError(false);
  };
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
  };
  const deleteRole = (index) => {
    const newRoles = [...roles];
    newRoles.splice(index, 1);
    setRoles(newRoles);
  };

  const createStudio = async () => {
    try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (name.length < 2) {
        setNameError(true);
        return;
      }
      if (!emailRegex.test(email)) {
        setEmailError(true);
        return;
      }
      if (roles.length < 1) {
        setRolesError(true);
        return;
      }
      setSubmitLoader(true);
      const requestbody = {
        name: name,
        email: email?.trim(),
        roles: roles,
        invite_status: selectedUser?.id ? selectedUser?.invite_status : "invited",
        studio_id: studio_id,
      };
      const create_studio_response = selectedUser?.id
        ? await api.put(`/v1/users/${studio_id}/${selectedUser?.id}`, requestbody)
        : await api.post("v1/auth/add-user", requestbody);
      setToastMessage({
        show: true,
        message: selectedUser.id
          ? "User data updated successfully"
          : "User added successfully",
        type: "success",
      });
      if (create_studio_response.status === 201) {
        selectedUser?.id
          ? setUsers((prev) =>
              prev.map((studio) =>
                studio.id === selectedUser.id
                  ? { ...requestbody, id: selectedUser.id }
                  : studio
              )
            )
          : setUsers((prev) => [
              ...prev,
              { ...requestbody, id: create_studio_response.data.data.id },
            ]);
        setEmail("");
        setName("");
        setRoles([]);
        closePopup();
      }
      setSubmitLoader(false);
    } catch (err) {
      console.log(err);
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
      setSubmitLoader(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      setName(selectedUser.name);
      setEmail(selectedUser.email);
      setRoles(selectedUser.roles);
    }
  }, [selectedUser]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">
              {selectedUser?.id ? "Edit" : "Add"} User
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-8 pt-6 pb-8">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                value={name}
                onChange={onNameChange}
              />
              {nameError && (
                <span className="text-[#f58174] text-[12px]">
                  Name must be at least 2 characters
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="Email"
              >
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                disabled={selectedUser?.id}
              />
              {emailError && (
                <span className="text-[#f58174] text-[12px]">
                  Please enter a valid email address
                </span>
              )}
            </div>
            <div className="">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="Roles"
              >
                Roles
              </label>
              <Menu as="div" className="relative text-left">
                <Menu.Button className="border rounded py-2 px-3 h-10 w-full text-start shadow" disabled={userData.id === selectedUser.id}>
                  {roles.map((role, index) => (
                    <span
                      key={index}
                      className="bg-[#e5e5e5] rounded-full px-2 py-1 mr-1 border border-[0.5px] border-[#e6e6e6]"
                    >
                      {role}{" "}
                      <XMarkIcon
                        className="w-5 h-5 inline cursor-pointer"
                        onClick={() => userData.id !== selectedUser.id && deleteRole(index)}
                      />
                    </span>
                  ))}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {userRoles.map((role, index) => (
                        <React.Fragment key={index}>
                          {!roles.includes(role) ? (
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    "block px-4 py-2 text-sm"
                                  )}
                                  onClick={() => {
                                    setRoles((prev) => [...prev, role]);
                                  }}
                                >
                                  {role}
                                </a>
                              )}
                            </Menu.Item>
                          ) : (
                            <></>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#ff1053] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <button
                className="bg-[#ff1053] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:opacity-80"
                type="button"
                onClick={createStudio}
              >
                {selectedUser?.id ? "Save" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPopup;
