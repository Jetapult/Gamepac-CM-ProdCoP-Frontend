import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import loadingIcon from "../../../assets/transparent-spinner.svg";
import api from "../../../api";

const CreateReplyTemplatePopup = ({
  showCreateReplyTemplatePopup,
  setShowCreateReplyTemplatePopup,
  selectedTemplate,
  setSelectedTemplate,
  studio_slug,
  setTemplates,
  setToastMessage,
}) => {
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const [replyTemplate, setReplyTemplate] = useState({
    review_type: "",
    review_reply: "",
  });
  const [error, setError] = useState({
    review_type: "",
    review_reply: "",
  });
  const [submitLoader, setSubmitLoader] = useState(false);

  const onhandleChange = (event) => {
    const { name, value } = event.target;
    setReplyTemplate((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };
  const closePopup = () => {
    setReplyTemplate({
      review_type: "",
      review_reply: "",
    });
    setShowCreateReplyTemplatePopup(!showCreateReplyTemplatePopup);
  };
  const createTemplate = async () => {
    try {
      setSubmitLoader(true);
      const requestbody = {
        review_type: replyTemplate.review_type,
        review_reply: replyTemplate.review_reply,
        template_type: 'manual',
        studio_id: studio_slug
          ? studios.filter((x) => x.slug === studio_slug)[0].id
          : userData.studio_id,
      };
      const templatesResponse = selectedTemplate.id
        ? await api.put(
            `v1/organic-ua/reply-template/${
              studio_slug
                ? studios.filter((x) => x.slug === studio_slug)[0].id
                : userData.studio_id
            }/${selectedTemplate.id}`,
            requestbody
          )
        : await api.post(`v1/organic-ua/reply-template/create`, requestbody);
      setSubmitLoader(false);
      setReplyTemplate({
        review_type: "",
        review_reply: "",
      });
      selectedTemplate.id
        ? setTemplates((prev) =>
            prev.filter((x) => {
              if (x.id === selectedTemplate.id) {
                x.review_type = templatesResponse.data.data.review_type;
                x.review_reply = templatesResponse.data.data.review_reply;
                x.template_type = templatesResponse.data.data.template_type;
              }
              return prev;
            })
          )
        : setTemplates((prev) => [templatesResponse.data.data, ...prev]);
      setShowCreateReplyTemplatePopup(!showCreateReplyTemplatePopup);
      setToastMessage({
        show: true,
        message: `Template ${
          selectedTemplate.id ? "updated" : "created"
        } successfully`,
        type: "success",
      });
      setSelectedTemplate({});
    } catch (err) {
      console.log(err);
      if (err.response.data.message || err.response.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message || err.response.message,
          type: "error",
        });
      }
      setSubmitLoader(false);
    }
  };

  useEffect(() => {
    if (selectedTemplate.id || selectedTemplate.type === "save-as-template") {
      setReplyTemplate({
        review_reply: selectedTemplate.review_reply,
        review_type: selectedTemplate.review_type,
      });
    }
  }, [selectedTemplate.id]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">
              {selectedTemplate.id ? "Edit" : "Add"} Reply Template
            </h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-8 py-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Review Type
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="review_type"
                name="review_type"
                type="text"
                value={replyTemplate.review_type}
                onChange={onhandleChange}
              />
              {error.review_type && (
                <span className="text-[#f58174] text-[12px]">
                  {error.review_type}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 flex"
                htmlFor="review_reply"
              >
                Reply
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="review_reply"
                name="review_reply"
                type="text"
                rows={4}
                value={replyTemplate.review_reply}
                onChange={onhandleChange}
              />
              <p className="flex items-start font-bold text-[13px]">
                <InformationCircleIcon className="inline w-10 h-4 mr-1 text-gray-400" />
                {`Note: To dynamically include the reviewer's username in your reply template, use the placeholder "user". This placeholder will be automatically replaced with the actual username when the template is used.`}
              </p>
              {error.review_reply && (
                <span className="text-[#f58174] text-[12px]">
                  {error.review_reply}
                </span>
              )}
            </div>
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#000] text-[#B9FF66] font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <>
                {replyTemplate.review_reply && replyTemplate.review_type ? (
                  <button
                    className="bg-[#B9FF66] text-[#000] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={createTemplate}
                  >
                    {selectedTemplate?.id ? "Save" : "Add"}
                  </button>
                ) : (
                  <button
                    className="bg-[#B9FF66] cursor-not-allowed text-[#000] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    {selectedTemplate?.id ? "Save" : "Add"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReplyTemplatePopup;
