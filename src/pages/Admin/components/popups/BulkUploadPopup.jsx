import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import api from "../../../../api";
import loadingIcon from "../../../../assets/transparent-spinner.svg";
import { Link } from "react-router-dom";

const BulkUploadPopup = ({ setShowModal, studio_id, getUsersBystudioSlug }) => {
  const [file, setFile] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);
  const [fileUploadResponse, setFileUploadResponse] = useState(false);
  const [errors, setErrors] = useState("");

  const onBulkUploadUsers = async () => {
    try {
      if (!file?.size) {
        return;
      }
      setSubmitLoader(true);
      const formData = new FormData();
      formData.append("data", file);
      const response = await api.post(
        `/v1/users/bulk-upload/${studio_id}`,
        formData
      );
      setFileUploadResponse(response.data.data);
      setSubmitLoader(false);
      if (response.data.data.userAddedCount) {
        getUsersBystudioSlug(1);
      }
    } catch (err) {
      setSubmitLoader(false);
      setErrors(err.response.data.message);
    }
  };

  const closePopup = () => {
    setShowModal(false);
  };
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Bulk upload</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-800"
            >
              CSV File<span className="text-red-500">*</span>
            </label>
            <Link to="/sample-bulk-upload.csv" className="text-[#0000EE] text-sm decoration-1 underline" target="_blank" download>sample csv file</Link>
            <input
              id="file"
              type="file"
              className="mt-1 w-full"
              accept=".csv"
              onChange={(e) => {
                setErrors("");
                setFile(e.target.files[0]);
              }}
            />
            {fileUploadResponse?.userAddedCount ||
            fileUploadResponse?.duplicateEmails ? (
              <p>
                successfully added users - {fileUploadResponse?.userAddedCount}
              </p>
            ) : (
              <></>
            )}
            {fileUploadResponse?.duplicateEmails?.length ? (
              <p className="text-[#e80707] text-[12px] break-all">
                {fileUploadResponse?.duplicateEmails?.map((error, index) => (
                  <span className="pr-1" key={index}>
                    {error}
                    {fileUploadResponse?.duplicateEmails.length - 1 === index
                      ? ""
                      : ","}
                  </span>
                ))}
                these emails are already exists in our Directory
              </p>
            ) : (
              <></>
            )}
            {fileUploadResponse?.invalidEmails?.length ? (
              <p className="text-[#e80707] text-[12px] break-all">
                Invalid email formats - {fileUploadResponse?.invalidEmails?.map((error, index) => (
                  <span className="pr-1" key={index}>
                    {error}
                    {fileUploadResponse?.invalidEmails.length - 1 === index
                      ? ""
                      : ","}
                  </span>
                ))}
              </p>
            ) : (
              <></>
            )}
            {errors && <p className="text-[#e80707] text-[12px]">{errors}</p>}
            {submitLoader ? (
              <button
                className="bg-[#000] text-white font-bold uppercase mt-3 text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 cursor-not-allowed"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <button
                className="bg-[#B9FF66] text-[#000] px-4 py-2 rounded-md mr-3 mt-3 hover:bg-[#000] hover:text-[#B9FF66]"
                onClick={onBulkUploadUsers}
              >
                Upload CSV
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BulkUploadPopup;
