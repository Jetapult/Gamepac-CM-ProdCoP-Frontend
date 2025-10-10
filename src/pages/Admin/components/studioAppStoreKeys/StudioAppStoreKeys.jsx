import { useEffect, useState } from "react";
import api from "../../../../api";
import { useSelector } from "react-redux";

const StudioAppStoreKeys = ({
  studioData,
  setToastMessage,
  setSelectedTab,
}) => {
  const userData = useSelector((state) => state.user.user);
  const [appStoreKeyData, setAppStoreKeyData] = useState({
    apple_key_id: "",
    apple_issuer_id: "",
    studio_id: "",
    private_key_file: {},
  });
  const [appStoreKeyError, setAppStoreKeyError] = useState({
    apple_key_id: false,
    apple_issuer_id: false,
    studio_id: false,
    private_key_file: false,
  });

  const onImageUpload = (e) => {
    setAppStoreKeyData((prev) => ({
      ...prev,
      private_key_file: e.target.files[0],
    }));
    const { name } = e.target;
    setAppStoreKeyError((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const onhandleChange = (e) => {
    const { name, value } = e.target;
    setAppStoreKeyData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAppStoreKeyError((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const updateStudio = async () => {
    try {
      if (appStoreKeyData.apple_key_id.length !== 10) {
        setAppStoreKeyError((prev) => ({
          ...prev,
          apple_key_id: true,
        }));
        return;
      }
      if (appStoreKeyData.apple_issuer_id.length !== 36) {
        setAppStoreKeyError((prev) => ({
          ...prev,
          apple_issuer_id: true,
        }));
        return;
      }
      if (
        typeof appStoreKeyData.private_key_file === "object" &&
        !appStoreKeyData.private_key_file.size && !appStoreKeyData.id
      ) {
        setAppStoreKeyError((prev) => ({
          ...prev,
          private_key_file: true,
        }));
        return;
      }
      const formData = new FormData();
      formData.append("apple_key_id", appStoreKeyData.apple_key_id);
      formData.append("apple_issuer_id", appStoreKeyData.apple_issuer_id);
      formData.append("studio_id", studioData.id);
      if(appStoreKeyData.private_key_file.size){
        formData.append("private_key_file", appStoreKeyData.private_key_file);
      }
      const create_api_keys_response = appStoreKeyData.id
        ? await api.put(`v1/games/apple-api-keys/${studioData.id}/${appStoreKeyData.id}`, formData)
        : await api.post(`v1/games/apple-api-keys`, formData);
      const keys_response_data = create_api_keys_response.data.data;
      if (keys_response_data) {
        setToastMessage({
          show: true,
          message: appStoreKeyData.id ? "API keys updated successfully" : "API keys created successfully",
          type: "success",
        });
        setAppStoreKeyData((prev) => ({
          ...prev,
          apple_key_id: keys_response_data.apple_key_id,
          apple_issuer_id: keys_response_data.apple_issuer_id,
          id: keys_response_data.id,
          private_key_file: {}
        }));
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

  const getAPIData = async () => {
    try {
      const apiResponse = await api.get(
        `v1/games/apple-api-keys/${studioData.id}`
      );
      setAppStoreKeyData((prev) => ({
        ...prev,
        id: apiResponse.data.data.id,
        studio_id: apiResponse.data.data.studio_id,
        apple_key_id: apiResponse.data.data.apple_key_id,
        apple_issuer_id: apiResponse.data.data.apple_issuer_id,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAPIData();
  }, []);
  return (
    <div className="w-[500px]">
      <form className="px-8 pt-6 pb-8">
        <h1 className="mb-4 text-base">App store API Keys</h1>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="apple_key_id"
          >
            Key ID<span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="apple_key_id"
            name="apple_key_id"
            type="text"
            value={appStoreKeyData.apple_key_id}
            onChange={onhandleChange}
          />
          {appStoreKeyError.apple_key_id && (
            <span className="text-[#f58174] text-[12px]">
              Name must be at least 2 characters
            </span>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="apple_issuer_id"
          >
            Issuer ID<span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="apple_issuer_id"
            name="apple_issuer_id"
            type="text"
            value={appStoreKeyData.apple_issuer_id}
            onChange={onhandleChange}
          />
          {appStoreKeyError.apple_issuer_id && (
            <span className="text-[#f58174] text-[12px]">
              Please enter a valid email address
            </span>
          )}
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="private_key_file"
          >
            Private key<span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            className="mt-1 w-full"
            name="private_key_file"
            accept=".p8"
            onChange={onImageUpload}
          />
          {appStoreKeyError.private_key_file && (
            <span className="text-[#f58174] text-[12px]">
              This Field is required
            </span>
          )}
        </div>
        <button
          className="bg-[#B9FF66] text-[#000] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mt-4 hover:bg-[#000] hover:text-[#B9FF66]"
          type="button"
          onClick={updateStudio}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default StudioAppStoreKeys;
