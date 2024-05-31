import { XMarkIcon } from "@heroicons/react/20/solid";

const UpdatesPopup = ({ setShowModal, showUpdatePopup }) => {
  const closePopup = () => {
    setShowModal({});
  };
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]" onClick={closePopup}>
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]" onClick={(e) => e.stopPropagation()}>
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">{showUpdatePopup.title}</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {showUpdatePopup?.short_description && <p className="text-md font-bold">{showUpdatePopup?.short_description}</p>}
                <p className="text-md min-h-[100px] overflow-y-auto" dangerouslySetInnerHTML={{__html: showUpdatePopup.description}}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPopup;
