import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CheckCircle } from "@solar-icons/react";
import api from "../../../../api";
import StepBasics from "./StepBasics";
import StepStoreLinks from "./StepStoreLinks";
import StepStakeholders from "./StepStakeholders";

const STEPS = [
  { id: 1, title: "Add basics" },
  { id: 2, title: "App Store & Play Store links" },
  { id: 3, title: "Add stakeholders", subtitle: "(Optional)" },
];

const AddGamePopup = ({
  setShowModal,
  setToastMessage,
  selectedGame,
  setSelectedGame,
  studio_id,
  setGames,
}) => {
  // Start at step 3 when editing, step 1 when adding new
  const [currentStep, setCurrentStep] = useState(selectedGame?.id ? 3 : 1);
  // Mark all steps as completed when editing
  const [completedSteps, setCompletedSteps] = useState(selectedGame?.id ? [1, 2] : []);
  const [submitLoader, setSubmitLoader] = useState(false);

  // Form data
  const [gameData, setGameData] = useState({
    game_name: "",
    short_names: "",
    game_type: "",
    playstore_link: "",
    appstore_link: "",
    app_id: "",
    package_name: "",
    studio_id: studio_id?.toString(),
    generateweeklyreport: "none",
    auto_reply_enabled: "none",
  });

  // Stakeholders
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [productManager, setProductManager] = useState(null);
  const [producer, setProducer] = useState(null);
  const [leadEngineer, setLeadEngineer] = useState(null);

  // Errors
  const [errors, setErrors] = useState({});

  // Load existing game data for edit mode
  useEffect(() => {
    if (selectedGame?.id) {
      setGameData({
        game_name: selectedGame.game_name || "",
        short_names: selectedGame.short_names || "",
        game_type: selectedGame.game_type || "",
        playstore_link: selectedGame.playstore_link || "",
        appstore_link: selectedGame.appstore_link || "",
        app_id: selectedGame.app_id || "",
        package_name: selectedGame.package_name || "",
        studio_id: studio_id?.toString(),
        generateweeklyreport: selectedGame.generateweeklyreport || "none",
        auto_reply_enabled: selectedGame.auto_reply_enabled || "none"
      });
      setProductManager(
        selectedGame.product_manager
          ? {
              label: selectedGame.product_manager_name,
              value: selectedGame.product_manager,
            }
          : null
      );
      setProducer(
        selectedGame.producer
          ? { label: selectedGame.producer_name, value: selectedGame.producer }
          : null
      );
      setLeadEngineer(
        selectedGame.lead_engineer
          ? {
              label: selectedGame.lead_engineer_name,
              value: selectedGame.lead_engineer,
            }
          : null
      );
      // Set to step 3 and mark previous steps as completed for edit mode
      setCurrentStep(3);
      setCompletedSteps([1, 2]);
    }
  }, [selectedGame, studio_id]);

  // Fetch users for stakeholder dropdowns
  const getListOfUsers = async () => {
    try {
      const usersResponse = await api.get(
        `v1/users/studio/${studio_id}/users?current_page=${currentPage}&limit=20`
      );
      const usersData = usersResponse.data.data;
      const usersList = usersData.map((x) => ({ label: x.name, value: x.id }));
      currentPage === 1
        ? setUsers(usersList)
        : setUsers((prev) => [...prev, ...usersList]);
      setTotalUsers(usersResponse.data.totalUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    getListOfUsers();
  }, [currentPage]);

  const handleInputChange = (name, value) => {
    setGameData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!gameData.game_name || gameData.game_name.length < 2) {
      newErrors.game_name = "Game name must be at least 2 characters";
    }
    if (!gameData.game_type || gameData.game_type.length < 2) {
      newErrors.game_type = "Game type must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!gameData.playstore_link && !gameData.appstore_link) {
      newErrors.links = "Either Play Store or App Store link is required";
    }

    if (gameData.playstore_link) {
      if (!gameData.package_name) {
        newErrors.package_name = "Package name is required with Play Store link";
      } else if (!gameData.playstore_link.includes(gameData.package_name)) {
        newErrors.playstore_link = "Package name must be part of Play Store link";
      }
    }

    if (gameData.appstore_link) {
      if (!gameData.app_id) {
        newErrors.app_id = "App ID is required with App Store link";
      } else if (!gameData.appstore_link.includes(gameData.app_id)) {
        newErrors.appstore_link = "App ID must be part of App Store link";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = () => {
    const step1Valid = validateStep1();
    if (!step1Valid) return false;

    const step2Valid = validateStep2();
    return step2Valid;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCompletedSteps((prev) => [...new Set([...prev, 1])]);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCompletedSteps((prev) => [...new Set([...prev, 2])]);
        setCurrentStep(3);
      }
    }
  };

  const handleStepClick = (stepId) => {
    // Allow clicking on any step if editing, or completed steps + current + next available
    if (selectedGame?.id || stepId <= currentStep || completedSteps.includes(stepId - 1) || stepId === 1) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    if (!validateAllSteps()) {
      return;
    }

    try {
      setSubmitLoader(true);
      const requestBody = {
        ...gameData,
        product_manager: productManager?.value,
        producer: producer?.value,
        lead_engineer: leadEngineer?.value,
      };

      const response = selectedGame?.id
        ? await api.put(`/v1/games/${studio_id}/${selectedGame.id}`, requestBody)
        : await api.post("v1/games", requestBody);

      setToastMessage({
        show: true,
        message: selectedGame?.id
          ? `${gameData.game_name} updated successfully`
          : `${gameData.game_name} added successfully`,
        type: "success",
      });

      if (response.status === 201 || response.status === 200) {
        const newGameData = {
          ...gameData,
          id: selectedGame?.id || response.data.data.id,
          product_manager_name: productManager?.label,
          producer_name: producer?.label,
          lead_engineer_name: leadEngineer?.label,
          play_store_icon: response.data.data?.play_store_icon,
          app_store_icon: response.data.data?.app_store_icon,
        };

        if (selectedGame?.id) {
          setGames((prev) =>
            prev.map((game) =>
              game.id === selectedGame.id ? newGameData : game
            )
          );
        } else {
          setGames((prev) => [...prev, newGameData]);
        }
        closePopup();
      }
    } catch (err) {
      console.error("Failed to save game:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Failed to save game",
        type: "error",
      });
    } finally {
      setSubmitLoader(false);
    }
  };

  const closePopup = () => {
    setShowModal(false);
    setSelectedGame?.(null);
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !gameData.game_name || !gameData.game_type;
    }
    if (currentStep === 2) {
      return !gameData.playstore_link && !gameData.appstore_link;
    }
    return false;
  };

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto max-w-4xl w-[910px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5">
            <h3 className="text-lg font-semibold text-[#141414]">
              {selectedGame?.id ? "Edit Game" : "Add Game"}
            </h3>
            <button
              className="p-1 text-[#6d6d6d] hover:text-[#141414]"
              onClick={closePopup}
            >
              <X size={24} color="#6d6d6d" strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex min-h-[400px] mb-2">
            {/* Stepper Sidebar */}
            <div className="w-[220px] p-6 border-r border-[#E7EAEE]">
              <div className="flex flex-col">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex">
                    {/* Step indicator and line */}
                    <div className="flex flex-col items-center mr-4">
                      <button
                        onClick={() => handleStepClick(step.id)}
                        className={`my-2 text-white rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                          completedSteps.includes(step.id)
                            ? "bg-white"
                            : currentStep === step.id
                            ? "bg-[#1F6744] w-7 h-7"
                            : "bg-[#00000038] w-7 h-7"
                        }`}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle weight="Bold" size={32} color="#2c895c" />
                        ) : (
                          step.id
                        )}
                      </button>
                      {index < STEPS.length - 1 && (
                        <div className="w-[1px] h-16 bg-[#bdbdbd]" />
                      )}
                    </div>
                    {/* Step title */}
                    <div className="pt-1">
                      <span
                        className={`text-sm font-medium cursor-pointer ${
                          currentStep === step.id || completedSteps.includes(step.id)
                            ? "text-[#141414]"
                            : "text-[#6d6d6d]"
                        }`}
                        onClick={() => handleStepClick(step.id)}
                      >
                        {step.title}
                      </span>
                      {step.subtitle && (
                        <span className="text-xs text-[#B0B0B0] block">
                          {step.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
              {currentStep === 1 && (
                <StepBasics
                  gameData={gameData}
                  errors={errors}
                  onInputChange={handleInputChange}
                />
              )}
              {currentStep === 2 && (
                <StepStoreLinks
                  gameData={gameData}
                  errors={errors}
                  onInputChange={handleInputChange}
                />
              )}
              {currentStep === 3 && (
                <StepStakeholders
                  gameData={gameData}
                  errors={errors}
                  users={users}
                  productManager={productManager}
                  producer={producer}
                  leadEngineer={leadEngineer}
                  setProductManager={setProductManager}
                  setProducer={setProducer}
                  setLeadEngineer={setLeadEngineer}
                  onInputChange={handleInputChange}
                  onLoadMore={() => {
                    if (users.length < totalUsers) {
                      setCurrentPage((prev) => prev + 1);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E7EAEE]">
            <button
              className="px-8 py-2 rounded-lg text-base font-medium border border-[#E7EAEE] text-[#141414] hover:bg-[#F6F6F6] transition-colors"
              onClick={closePopup}
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                className={`px-8 py-2 rounded-lg text-base font-medium transition-colors ${
                  isNextDisabled()
                    ? "bg-[#E7EAEE] text-[#B0B0B0] cursor-not-allowed"
                    : "bg-[#1F6744] text-white hover:bg-[#1a5a3a]"
                }`}
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                Next
              </button>
            ) : (
              <button
                className={`px-8 py-2 rounded-lg text-base font-medium transition-colors ${
                  submitLoader
                    ? "bg-[#E7EAEE] text-[#B0B0B0] cursor-not-allowed"
                    : "bg-[#1F6744] text-white hover:bg-[#1a5a3a]"
                }`}
                onClick={handleSubmit}
                disabled={submitLoader}
              >
                {submitLoader ? "Saving..." : selectedGame?.id ? "Save" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGamePopup;
