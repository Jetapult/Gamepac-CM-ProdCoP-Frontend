const ImagePopup = ({ selectedImage, setSelectedImage }) => {
  return (
    <div
      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#000000cc]"
      onClick={() => setSelectedImage("")}
    >
      <div
        className="relative my-6 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5">
            <XMarkIcon
              className="w-6 h-6 text-[#d6d6d6] fixed right-2 top-2 cursor-pointer"
              onClick={() => setSelectedImage("")}
            />
          </div>
          <div className="relative max-h-[90vh] max-w-[65vw]">
            <img
              src={selectedImage}
              alt="Selected Image"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
