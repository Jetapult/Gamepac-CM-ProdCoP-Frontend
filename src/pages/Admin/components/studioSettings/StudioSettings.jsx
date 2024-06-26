import { useEffect, useState } from "react";
import api from "../../../../api";
import { emailRegex } from "../../../../utils";
import { useDispatch, useSelector } from "react-redux";
import { addStudioData } from "../../../../store/reducer/adminSlice";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useNavigate } from "react-router-dom";
import { updateUserData } from "../../../../store/reducer/userSlice";

const StudioSettings = ({ studioData, setToastMessage, setSelectedTab }) => {
  const userData = useSelector((state) => state.user.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState({});
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onImageUpload = (e) => {
    setLogo(e.target.files[0]);
    setLogoError(false);
  };

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
      if (logo === "" || (typeof logo === "object" && !logo.size)) {
        setLogoError(true);
        return;
      }
      const formData = new FormData();
      formData.append("studio_name", name);
      formData.append("contact_email", email);
      formData.append("phone", phone);
      formData.append("studio_logo", logo);
      studioData.studio_type.map((item) =>
        formData.append("studio_type", item)
      );
      const create_studio_response = await api.put(
        `v1/game-studios/${studioData?.slug}`,
        formData
      );
      if (create_studio_response.data.data) {
        setToastMessage({
          show: true,
          message: "Studio created successfully",
          type: "success",
        });
        setName(create_studio_response.data.data.studio_name);
        setPhone(create_studio_response.data.data.phone);
        setLogo(create_studio_response.data.data.studio_logo);
        const studioData = {
          studio_name: create_studio_response.data.data.studio_name,
          contact_email: create_studio_response.data.data.contact_email,
          phone: create_studio_response.data.data.phone,
          studio_logo: create_studio_response.data.data.studio_logo,
        };
        if((userData?.studio_type?.includes("studio_manager") && create_studio_response.data.data.id === userData?.studio_id) || !userData?.studio_type?.includes("studio_manager")){
          dispatch(updateUserData(studioData));
        }
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
      setEmail(studioData.contact_email || "");
      setPhone(studioData.phone || "");
      setLogo(studioData.studio_logo || {});
    }
  }, [studioData?.id]);
  return (
    <div className="w-[500px] h-[calc(100vh-165px)] overflow-auto">
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
            disabled={studioData.contact_email ? true : false}
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
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="Phone"
          >
            Company Logo<span className="text-red-500">*</span>
          </label>
          {!logo.size && studioData.studio_logo && (
            <img src={studioData.studio_logo} className="" alt="logo" />
          )}
          {logo.size && <img src={URL.createObjectURL(logo)} alt="logo" />}
          <input
            type="file"
            className="mt-1 w-full"
            accept="image/*"
            onChange={onImageUpload}
          />
          {logoError && (
            <span className="text-[#f58174] text-[12px]">
              This Field is required
            </span>
          )}
        </div>
        <button
          className="bg-[#ff1053] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mt-4"
          type="button"
          onClick={updateStudio}
        >
          Save
        </button>
      </form>
      {/* {userData?.studio_type?.includes("studio_manager") &&
        !studioData?.studio_type?.includes("studio_manager") && (
          <>
            <h1 className="mb-4 text-base">Delete Studio</h1>
            <button
              className="bg-[#ff1053] text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mt-4"
              type="button"
              onClick={() => setShowConfirmationPopup(!showConfirmationPopup)}
            >
              Delete
            </button>
          </>
        )} */}

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
