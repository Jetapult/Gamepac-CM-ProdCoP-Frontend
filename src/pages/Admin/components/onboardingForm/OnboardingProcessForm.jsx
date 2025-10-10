import { useEffect, useState, useRef } from "react";
import api from "../../../../api";

const OnboardingProcessForm = ({ setToastMessage }) => {
  const [externalStudios, setExternalStudios] = useState([]);
  const [formData, setFormData] = useState({
    studio_id: "",
    recorded_video: null,
    transcript_file: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for file inputs to manually clear them
  const videoInputRef = useRef(null);
  const transcriptInputRef = useRef(null);

  const getExternalStudios = async () => {
    try {
      const response = await api.get(`/v1/game-studios/external-studios`);
      console.log(response);
      setExternalStudios(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getExternalStudios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    // Clear error when user starts typing/selecting
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studio_id) {
      newErrors.studio_id = "Please select a studio";
    }
    if (!formData.recorded_video) {
      newErrors.recorded_video = "Please upload a recorded video";
    }
    if (!formData.transcript_file) {
      newErrors.transcript_file = "Please upload a transcript file";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('studio_id', formData.studio_id);
      submitData.append('recorded_video', formData.recorded_video);
      submitData.append('transcript', formData.transcript_file);
      
      const response = await api.post('/v1/game-studios/external-studio/onboarding', submitData);
      if (response.status === 200) {
        setToastMessage({
          message: response.data.message,
          type: "success",
          show: true,
        });
        
        // Reset form state
        setFormData({
          studio_id: "",
          recorded_video: null,
          transcript_file: null,
        });
        
        // Manually clear file inputs
        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }
        if (transcriptInputRef.current) {
          transcriptInputRef.current.value = '';
        }
        
        // Refresh studios list
        getExternalStudios();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setToastMessage({
        message: error.response?.data?.message || "An error occurred while submitting the form",
        type: "error",
        show: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 my-10">
      <div className="flex items-center justify-start">
        <div className="bg-white p-8 rounded-lg font-sf-pro-display w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-black">
            Onboarding Process Form
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="studio_id" 
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Select Studio<span className="text-red-500">*</span>
              </label>
              <select 
                name="studio_id" 
                id="studio_id"
                value={formData.studio_id}
                onChange={handleInputChange}
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400 bg-white"
              >
                <option value="">Choose a studio...</option>
                {externalStudios.map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.studio_name}
                  </option>
                ))}
              </select>
              {errors.studio_id && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.studio_id}
                </span>
              )}
            </div>

            <div className="mb-6">
              <label 
                htmlFor="recorded_video" 
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Recorded Video<span className="text-red-500">*</span>
              </label>
              <input
                ref={videoInputRef}
                type="file"
                name="recorded_video"
                id="recorded_video"
                accept="video/*"
                onChange={handleInputChange}
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#B9FF66] file:text-black hover:file:bg-gray-100"
              />
              {errors.recorded_video && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.recorded_video}
                </span>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: mp4, mov, avi, mkv, webm, m4v
              </p>
            </div>

            <div className="mb-6">
              <label 
                htmlFor="transcript_file" 
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Transcript File<span className="text-red-500">*</span>
              </label>
              <input
                ref={transcriptInputRef}
                type="file"
                name="transcript_file"
                id="transcript_file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleInputChange}
                className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#B9FF66] file:text-black hover:file:bg-gray-100"
              />
              {errors.transcript_file && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.transcript_file}
                </span>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: TXT
              </p>
            </div>

            <div className="flex justify-center">
              {isLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-md cursor-not-allowed opacity-50 font-medium"
                >
                  Submitting...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-[#B9FF66] text-black py-2 px-4 rounded-md hover:bg-black hover:text-[#B9FF66] focus:outline-none focus:ring focus:border-gray-400 font-medium transition-colors duration-200"
                >
                  Submit Onboarding Materials
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProcessForm;
