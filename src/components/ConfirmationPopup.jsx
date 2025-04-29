import { XMarkIcon } from "@heroicons/react/20/solid";

const ConfirmationPopup = ({ heading, subHeading, onCancel, onConfirm }) => {
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-transparent backdrop-blur-[0.5px]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold whitespace-pre-line">{heading}</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onCancel}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <p>{subHeading}</p>
          </div>
          <div className="flex justify-end gap-4 border-t border-solid border-blueGray-200 p-4">
            <button
              className="bg-[#f3f3f3] text-[#000] px-4 py-2 rounded-md"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="bg-[#B9FF66] text-[#000] px-4 py-2 rounded-md hover:bg-[#000] hover:text-[#B9FF66]"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
