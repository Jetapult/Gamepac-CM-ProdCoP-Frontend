import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../api";
import CreateReplyTemplatePopup from "./CreateReplyTemplatePopup";
import ToastMessage from "../../../components/ToastMessage";
import ConfirmationPopup from "../../../components/ConfirmationPopup";
import NoData from "../../../components/NoData";

const Templates = ({ studio_slug, templates, setTemplates }) => {
  const [showCreateReplyTemplatePopup, setShowCreateReplyTemplatePopup] =
    useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const deleteTemplate = async () => {
    try {
      const templatesResponse = await api.delete(
        `/v1/organic-ua/reply-template/delete/${
          studio_slug
            ? studios.filter((x) => x.slug === studio_slug)[0].id
            : userData.studio_id
        }/${selectedTemplate.id}`
      );
      setTemplates((prev) =>
        prev.filter((x) => {
          if (x.id === selectedTemplate.id) {
            return x.id !== selectedTemplate.id;
          }
          return prev;
        })
      );
      setToastMessage({
        show: true,
        message: `Template deleted successfully`,
        type: "success",
      });
      setSelectedTemplate({});
      setShowConfirmationPopup(!showConfirmationPopup);
    } catch (err) {
      console.log(err);
      if (err.response.data.message || err.response.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message || err.response.message,
          type: "error",
        });
      }
    }
  };
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl mb-4">Reply Templates</h1>
        <button
          className="bg-[#1174fc] text-white font-bold uppercase text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          type="button"
          onClick={() => {
            setSelectedTemplate({});
            setShowCreateReplyTemplatePopup(!showCreateReplyTemplatePopup);
          }}
        >
          {"Add"}
        </button>
      </div>

      {templates.length === 0 ? (
        <NoData
          type="templates"
          next={() => setShowCreateReplyTemplatePopup(!showCreateReplyTemplatePopup)}
        />
      ) : (
        templates.map((template) => (
          <div
            className="bg-white rounded p-4 mb-4 border-[0.5px] border-[#ccc]"
            key={template.id}
          >
            <h5 className="capitalize font-bold mb-2 bg-gray-400 inline-block px-4 rounded text-white">
              {template.review_type}
            </h5>
            <p>{template.review_reply}</p>
            <div className="flex justify-end">
              <button
                className="mr-4 border border-[#ccc] rounded py-1 px-3 mr-2 text-sm"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowCreateReplyTemplatePopup(
                    !showCreateReplyTemplatePopup
                  );
                }}
              >
                Edit
              </button>
              <button
                className="border border-[#be261f] text-[#f44337] rounded py-1 px-3 mr-2 text-sm"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowConfirmationPopup(!showConfirmationPopup);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
      {showCreateReplyTemplatePopup && (
        <CreateReplyTemplatePopup
          showCreateReplyTemplatePopup={showCreateReplyTemplatePopup}
          setShowCreateReplyTemplatePopup={setShowCreateReplyTemplatePopup}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          studio_slug={studio_slug}
          setTemplates={setTemplates}
          setToastMessage={setToastMessage}
        />
      )}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
      {showConfirmationPopup && (
        <ConfirmationPopup
          heading="Delete Template"
          subHeading="Are you sure you want to delete this template? once the template is deleted it cannot be retrieved."
          onCancel={() => setShowConfirmationPopup(!showConfirmationPopup)}
          onConfirm={deleteTemplate}
        />
      )}
    </div>
  );
};

export default Templates;
