import { useEffect, useState } from "react";
import api from "../../../../api";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { emailRegex } from "../../../../utils";
import { useDispatch, useSelector } from "react-redux";
import { addStudioData } from "../../../../store/reducer/adminSlice";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useNavigate } from "react-router-dom";

const StudioSettings = ({ studioData, setToastMessage, setSelectedTab }) => {
  const userData = useSelector((state) => state.user.user);
  const [domains, setDomains] = useState([]);
  const [domainText, setDomainText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [domainsError, setDomainsError] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deleteStudio = async () => {
    try {
      const delete_studio_response = await api.delete(
        `v1/game-studios/${studioData?.id}`
      );
      if (delete_studio_response.data.data) {
        dispatch(addStudioData({}));
        setToastMessage({
          show: true,
          message: "Studio deleted successfully",
          type: "success",
        });
        setShowConfirmationPopup(!showConfirmationPopup);
        setSelectedTab("overview");
        navigate(`/${userData.slug}/dashboard`);
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      if (err.response.data.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message,
          type: "error",
        });
      }
    }
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
        setDomains((prev) => [...prev, e.target.value]);
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

  const updateStudio = async () => {
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
        studio_type: studioData.studio_type,
        phone: phone,
        domains: domains,
      };
      const create_studio_response = await api.put(
        `v1/game-studios/${studioData?.id}`,
        requestbody
      );
      if (create_studio_response.data.data) {
        setToastMessage({
          show: true,
          message: "Studio created successfully",
          type: "success",
        });
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
    if (studioData?.id) {
      setName(studioData.studio_name);
      setEmail(studioData.contact_email);
      setPhone(studioData.phone);
      setDomains(studioData.domains);
    }
  }, [studioData?.id]);
  return (
    <div className="w-[500px]">
      <form className="px-8 pt-6 pb-8">
        <h1 className="mb-4 text-base">Edit Studio</h1>
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
            disabled={studioData?.id}
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
        <button
          className="bg-[#f58174] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mt-4"
          type="button"
          onClick={updateStudio}
        >
          Save
        </button>
      </form>
      {!studioData?.studio_type?.includes("studio_manager") && (
        <>
          <h1 className="mb-4 text-base">Delete Studio</h1>
          <button
            className="bg-[#f58174] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mt-4"
            type="button"
            onClick={() => setShowConfirmationPopup(!showConfirmationPopup)}
          >
            Delete
          </button>
        </>
      )}

      {showConfirmationPopup && (
        <ConfirmationPopup
          heading="Delete Studio"
          subHeading="Are you sure you want to delete this studio?
        On Delete, all the games,users and reviews under this studio will be deleted."
          onCancel={() => setShowConfirmationPopup(!showConfirmationPopup)}
          onConfirm={deleteStudio}
        />
      )}
    </div>
  );
};

export default StudioSettings;
