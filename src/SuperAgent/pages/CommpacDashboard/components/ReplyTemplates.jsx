import React, { useState } from "react";
import { TrashBinTrash, Pen2 } from "@solar-icons/react";
import { Plus } from "lucide-react";
import AddReplyTemplateModal from "./AddReplyTemplateModal";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import ToastMessage from "../../../../components/ToastMessage";
import api from "../../../../api";

// Transform API template to component format
const transformTemplate = (template) => ({
  id: template.id,
  category: template.review_type || "",
  text: template.review_reply || "",
  mentions: template.mentions || 0,
  // Keep original data for API calls
  _original: template,
});

const ReplyTemplates = ({
  templates = [],
  setTemplates,
  ContextStudioData,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedTemplateForDelete, setSelectedTemplateForDelete] =
    useState(null);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleAddClick = () => {
    setEditingTemplate(null);
    setShowAddModal(true);
  };

  const handleEditClick = (template) => {
    // Convert component format back to API format for editing
    setEditingTemplate({
      id: template._original?.id || template.id,
      category: template.category,
      text: template.text,
      review_type: template._original?.review_type || template.category,
      review_reply: template._original?.review_reply || template.text,
    });
    setShowAddModal(true);
  };

  const handleSave = async (templateData) => {
    try {
      const requestBody = {
        review_type: templateData.category,
        review_reply: templateData.text,
        template_type: "manual",
        studio_id: ContextStudioData?.id,
      };

      let response;
      if (templateData.id) {
        // Update existing template
        response = await api.put(
          `v1/organic-ua/reply-template/${ContextStudioData?.id}/${templateData.id}`,
          requestBody
        );
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateData.id
              ? {
                  ...t,
                  review_type: response.data.data.review_type,
                  review_reply: response.data.data.review_reply,
                }
              : t
          )
        );
      } else {
        // Create new template
        response = await api.post(
          `v1/organic-ua/reply-template/create`,
          requestBody
        );
        setTemplates((prev) => [response.data.data, ...prev]);
      }

      setToastMessage({
        show: true,
        title: `Template ${templateData.id ? "updated" : "created"}`,
        subtitle: `Template ${templateData.id ? "updated" : "created"} successfully`,
        type: "success",
      });
      setShowAddModal(false);
      setEditingTemplate(null);
    } catch (err) {
      console.log(err);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          err.response?.data?.message ||
          err.response?.message ||
          "Failed to save template",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplateForDelete(template);
    setShowConfirmationPopup(true);
  };

  const deleteTemplate = async () => {
    if (!selectedTemplateForDelete) return;

    try {
      await api.delete(
        `/v1/organic-ua/reply-template/delete/${ContextStudioData?.id}/${selectedTemplateForDelete._original?.id || selectedTemplateForDelete.id}`
      );
      setTemplates((prev) =>
        prev.filter(
          (t) =>
            t.id !==
            (selectedTemplateForDelete._original?.id ||
              selectedTemplateForDelete.id)
        )
      );
      setToastMessage({
        show: true,
        title: "Template deleted",
        subtitle: "Template deleted successfully",
        type: "success",
      });
      setSelectedTemplateForDelete(null);
      setShowConfirmationPopup(false);
    } catch (err) {
      console.log(err);
      setToastMessage({
        show: true,
        title: "Error",
        subtitle:
          err.response?.data?.message ||
          err.response?.message ||
          "Failed to delete template",
        type: "error",
      });
    }
  };

  // Transform templates for display
  const displayTemplates = templates.map(transformTemplate);

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Templates List Container */}
      <div className="bg-white border border-[#e7eaee] rounded-[10px] p-4 h-[calc(100vh-190px)] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {displayTemplates.length === 0 ? (
            <div className="text-center py-8 text-[#b0b0b0] font-urbanist text-sm">
              No templates found. Click "Add Reply Template" to create one.
            </div>
          ) : (
            displayTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-[#e7eaee] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-urbanist font-semibold text-sm text-[#141414] mb-2">
                    {template.category}
                  </h3>
                  <p className="font-urbanist text-sm text-[#6d6d6d] leading-[21px]">
                    "{template.text}"
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditClick(template)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7eaee] rounded-lg hover:bg-[#f6f7f8] transition-colors"
                  >
                    <Pen2 size={16} weight="Linear" color="#6d6d6d" />
                    <span className="font-urbanist text-xs text-[#141414]">
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(template)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1F6744] border border-[#1F6744] rounded-lg hover:bg-[#1a5637] transition-colors"
                  >
                    <TrashBinTrash size={16} weight="Linear" color="#ffffff" />
                    <span className="font-urbanist text-xs text-white">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Add Reply Template Button */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-3 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus size={20} color="#ffffff" />
          Add Reply Template
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AddReplyTemplateModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
      />

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <ConfirmationPopup
          heading="Delete Template"
          subHeading="Are you sure you want to delete this template? Once the template is deleted it cannot be retrieved."
          onCancel={() => {
            setShowConfirmationPopup(false);
            setSelectedTemplateForDelete(null);
          }}
          onConfirm={deleteTemplate}
        />
      )}

      {/* Toast Message */}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={(value) => {
            if (typeof value === "boolean") {
              setToastMessage({ show: false, message: "", type: "success" });
            } else {
              setToastMessage(value);
            }
          }}
        />
      )}
    </div>
  );
};

export default ReplyTemplates;

