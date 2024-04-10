import { XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import api from "../../../../api";
import { emailRegex } from "../../../../utils";

const CreateStudioPopup = ({
  setShowModal,
  setToastMessage,
  setStudios,
  selectedStudio,
  setSelectedStudio,
}) => {
  const [domains, setDomains] = useState([]);
  const [domainText, setDomainText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [domainsError, setDomainsError] = useState(false);

  const closePopup = () => {
    setShowModal(false);
    setSelectedStudio({});
  };

  const onNameChange = (e) => {
    setName(e.target.value);
    setNameError(false);
  };
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
  };
  const onPhoneChange = (e) => {
    setPhone(e.target.value);
    setPhoneError(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      if (e.target.value.length > 2) {
        setDomains(prev => [...prev, e.target.value]);
        setDomainText("");
        setDomainsError(false);
      }
    }
  };
  const deleteDomain = (index) => {
    const newDomains = [...domains];
    newDomains.splice(index, 1);
    setDomains(newDomains);
  };

  const createStudio = async () => {
    try {
      if (name.length < 2) {
        setNameError(true);
        return;
      }
      if (!emailRegex.test(email)) {
        setEmailError(true);
        return;
      }
      if (phone.length < 2) {
        setPhoneError(true);
        return;
      }
      if (domains.length < 1) {
        setDomainsError(true);
        return;
      }
      const requestbody = {
        studio_name: name,
        contact_email: email,
        studio_type: selectedStudio?.id ? selectedStudio.studio_type : ["studio"],
        phone: phone,
        domains: domains,
      };
      const create_studio_response = selectedStudio?.id
        ? await api.put(`v1/game-studios/${selectedStudio?.id}`, requestbody)
        : await api.post("v1/game-studios", requestbody);
      setToastMessage({
        show: true,
        message: "Studio created successfully",
        type: "success",
      });
      if (create_studio_response.data.data) {
        selectedStudio?.id
          ? setStudios((prev) =>
              prev.map((studio) =>
                studio.id === selectedStudio.id
                  ? create_studio_response.data.data
                  : studio
              )
            )
          : setStudios((prev) => [...prev, create_studio_response.data.data]);
        setEmail("");
        setPhone("");
        setName("");
        setDomains([]);
        setDomainText("");
        closePopup();
      }
    } catch (err) {
      console.log(err);
      if (err.response.data.message || err.response.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    if (selectedStudio?.id) {
      setName(selectedStudio.studio_name);
      setEmail(selectedStudio.contact_email);
      setPhone(selectedStudio.phone);
      setDomains(selectedStudio.domains);
    }
  }, [selectedStudio]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative w-auto my-6 mx-auto max-w-3xl w-[500px]">
        {/*content*/}
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/*header*/}
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">
              {selectedStudio?.id ? "Edit" : "Create"} Studio
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          {/*body*/}
          <form className="px-8 pt-6 pb-8">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Studio Name
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
                Studio Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                disabled={selectedStudio?.id}
              />
              {emailError && (
                <span className="text-[#f58174] text-[12px]">
                  Please enter a valid email address
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="Phone"
              >
                Studio contact number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phone"
                type="text"
                value={phone}
                onChange={onPhoneChange}
              />
              {phoneError && (
                <span className="text-[#f58174] text-[12px]">
                  Please enter a valid phone number
                </span>
              )}
            </div>
            <div className="">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="Domains"
              >
                Your Company domains
                <span className="text-[#a5a4aa] text-[12px] pl-2">
                  (type your domain and press ENTER to add multiple domains)
                </span>
              </label>
              {domains?.map((domain, index) => (
                <span
                  key={index}
                  className="bg-[#e6e6e6] py-1 px-2 rounded-full mr-2 mb-2 inline-block"
                >
                  {domain}
                  <XMarkIcon
                    className="w-5 h-5 text-[#a5a4aa] inline-block ml-2 cursor-pointer"
                    onClick={() => deleteDomain(index)}
                  />
                </span>
              ))}
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="domains"
                type="text"
                onKeyDown={handleKeyDown}
                value={domainText}
                onChange={(e) => setDomainText(e.target.value)}
              />
              {domainsError && (
                <span className="text-[#f58174] text-[12px]">
                  Please enter at least one domain
                </span>
              )}
            </div>
          </form>
          {/*footer*/}
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            <button
              className="bg-[#f58174] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={createStudio}
            >
              {selectedStudio?.id ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudioPopup;
