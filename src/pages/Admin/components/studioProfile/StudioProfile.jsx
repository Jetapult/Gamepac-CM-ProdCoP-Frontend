import { useEffect, useState } from "react";
import api from "../../../../api";

const StudioProfile = ({ studioData, setToastMessage, setSelectedTab }) => {
  const [formData, setFormData] = useState({
    studio_id: "",
    team_size_total: "",
    no_of_artists: "",
    no_of_devs: "",
    no_of_designers: "",
    no_of_pm: "",
    location: "",
    current_games: "",
    timeline_goals: "",
    art_capabilities: [],
    preferred_engine: "",
    engine_proficiency: "",
    backend_proficiency: false,
    genres_worked_on: [],
    future_genres: [],
    future_monetization: "",
    analytics_tools: [],
    analytics_use_case: "",
    ua_platforms: [],
    ua_channels: [],
    ua_budget_range: "",
    paid_acquisition_phase: "",
    additional_notes: "",
    studio_context: "",
    art_2d_ui_score: "",
    art_3d_score: "",
    ua_score: "",
    ads_proficiency_score: "",
    iap_score: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const artCapabilitiesOptions = ["2D", "3D", "Concept Art", "UI/UX", "Animation", "VFX", "Pixel Art", "Motion Graphics"];
  const commonGenreOptions = ["Casual", "Puzzle", "Runner", "Slots", "RPG", "Strategy", "Action", "Adventure", "Simulation", "Sports", "Idle", "Match-3", "Battle Royale", "Auto-battler", "Hypercasual"];
  const commonEngineOptions = ["Unity", "Unreal Engine", "Godot", "GameMaker Studio", "Construct 3", "Defold", "Custom Engine", "Web Technologies", "Flutter", "Cocos2d", "RPG Maker"];
  const commonMonetizationOptions = ["Ads", "IAP", "Hybrid", "Premium", "Subscription", "Battle Pass", "Freemium", "Pay-to-Win"];
  const commonAnalyticsOptions = ["Google Analytics", "Firebase", "GameAnalytics", "Unity Analytics", "Amplitude", "Mixpanel", "Flurry", "Custom Solution"];
  const commonUaPlatformOptions = ["Meta", "Google", "TikTok", "Snapchat", "Unity Ads", "ironSource", "AppLovin", "Chartboost", "Vungle"];
  const budgetRangeOptions = ["Negligible (experimental)", "$1K-$10K", "$10K-$50K", "$50K-$100K", "$100K+", "$500K+", "$1M+"];

  const [customEntries, setCustomEntries] = useState({
    genres_worked_on: "",
    future_genres: "", 
    art_capabilities: "",
    analytics_tools: "",
    ua_platforms: "",
    ua_channels: ""
  });

  const [publishedGameLinks, setPublishedGameLinks] = useState([]);
  const [newGameLink, setNewGameLink] = useState("");

  const parseArrayField = (field) => {
    if (!field) return [];
    
    if (Array.isArray(field)) {
      const cleanedArray = [];
      for (const item of field) {
        if (typeof item === 'string') {
          if (item.startsWith('[') && !item.endsWith(']')) {
            continue;
          } else if (item.startsWith('"') && item.endsWith('"')) {
            cleanedArray.push(item.slice(1, -1));
          } else if (!item.startsWith('[') && !item.startsWith('"')) {
            cleanedArray.push(item);
          }
        } else {
          cleanedArray.push(item);
        }
      }
      return cleanedArray;
    }
    
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [field];
      }
    }
    
    return [];
  };

  const fetchOnboardingData = async () => {
    try {
      const response = await api.get(`/v1/game-studios/external-studio/onboarding/${studioData?.id}`);
      if (response.data.data) {
      const data = response.data.data;
        setFormData({
          studio_id: data.studio_id || "",
          team_size_total: data.team_size_total || "",
          no_of_artists: data.no_of_artists || "",
          no_of_devs: data.no_of_devs || "",
          no_of_designers: data.no_of_designers || "",
          no_of_pm: data.no_of_pm || "",
          location: data.location || "",
          current_games: data.current_games || "",
          timeline_goals: data.timeline_goals || "",
          art_capabilities: parseArrayField(data.art_capabilities),
          preferred_engine: data.preferred_engine || "",
          engine_proficiency: data.engine_proficiency || "",
          backend_proficiency: data.backend_proficiency || false,
          genres_worked_on: parseArrayField(data.genres_worked_on),
          published_titles: "", // We'll handle this separately with publishedTitles state
          future_genres: parseArrayField(data.future_genres),
          future_monetization: data.future_monetization || "",
          analytics_tools: parseArrayField(data.analytics_tools),
          analytics_use_case: data.analytics_use_case || "",
          ua_platforms: parseArrayField(data.ua_platforms),
          ua_channels: parseArrayField(data.ua_channels),
          ua_budget_range: data.ua_budget_range || "",
          paid_acquisition_phase: data.paid_acquisition_phase || "",
          additional_notes: data.additional_notes || "",
          studio_context: data.studio_context || "",
          art_2d_ui_score: data.art_2d_ui_score || "",
          art_3d_score: data.art_3d_score || "",
          ua_score: data.ua_score || "",
          ads_proficiency_score: data.ads_proficiency_score || "",
          iap_score: data.iap_score || ""
        });
        
        if (data.published_titles) {
          try {
            if (Array.isArray(data.published_titles) && typeof data.published_titles[0] === 'string') {
              setPublishedGameLinks(data.published_titles);
            } 
            else if (Array.isArray(data.published_titles)) {
              const links = data.published_titles.map(title => 
                title.store_link || title.link || title.url || title.title || ""
              ).filter(link => link.trim() !== "");
              setPublishedGameLinks(links);
            }
            else if (typeof data.published_titles === 'string') {
              setPublishedGameLinks([data.published_titles]);
            }
          } catch (error) {
            console.error("Error parsing published titles:", error);
            setPublishedGameLinks([]);
          }
        } else {
          setPublishedGameLinks([]);
        }
      }
    } catch (err) {
      console.error("Error fetching onboarding data:", err);
    }
  };

  useEffect(() => {
    if (studioData?.id) {
      fetchOnboardingData();
    }
  }, [studioData?.id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle array fields (checkboxes)
  const handleArrayChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  // Handle custom entry input changes
  const handleCustomEntryChange = (fieldName, value) => {
    setCustomEntries(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Add custom entry to array
  const addCustomEntry = (fieldName) => {
    const customValue = customEntries[fieldName].trim();
    if (customValue && !formData[fieldName].includes(customValue)) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], customValue]
      }));
      setCustomEntries(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  // Remove item from array
  const removeArrayItem = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(item => item !== value)
    }));
  };

  // Published game links management
  const addGameLink = () => {
    const trimmedLink = newGameLink.trim();
    if (trimmedLink && !publishedGameLinks.includes(trimmedLink)) {
      setPublishedGameLinks(prev => [...prev, trimmedLink]);
      setNewGameLink("");
    }
  };

  const removeGameLink = (index) => {
    setPublishedGameLinks(prev => prev.filter((_, i) => i !== index));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.team_size_total) newErrors.team_size_total = "Team size is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.preferred_engine) newErrors.preferred_engine = "Preferred engine is required";
    
    // Validate score fields (0-10)
    const scoreFields = ['engine_proficiency', 'art_2d_ui_score', 'art_3d_score', 'ua_score', 'ads_proficiency_score', 'iap_score'];
    scoreFields.forEach(field => {
      if (formData[field] && (formData[field] < 0 || formData[field] > 10)) {
        newErrors[field] = "Score must be between 0 and 10";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        studio_id: studioData.id,
        published_titles: publishedGameLinks.length > 0 ? publishedGameLinks : null,
        // Ensure array fields are properly formatted
        art_capabilities: Array.isArray(formData.art_capabilities) ? formData.art_capabilities : [],
        genres_worked_on: Array.isArray(formData.genres_worked_on) ? formData.genres_worked_on : [],
        future_genres: Array.isArray(formData.future_genres) ? formData.future_genres : [],
        analytics_tools: Array.isArray(formData.analytics_tools) ? formData.analytics_tools : [],
        ua_platforms: Array.isArray(formData.ua_platforms) ? formData.ua_platforms : [],
        ua_channels: Array.isArray(formData.ua_channels) ? formData.ua_channels : [],
        // Parse numeric fields
        engine_proficiency: formData.engine_proficiency ? parseInt(formData.engine_proficiency) : null,
        art_2d_ui_score: formData.art_2d_ui_score ? parseInt(formData.art_2d_ui_score) : null,
        art_3d_score: formData.art_3d_score ? parseInt(formData.art_3d_score) : null,
        ua_score: formData.ua_score ? parseInt(formData.ua_score) : null,
        ads_proficiency_score: formData.ads_proficiency_score ? parseInt(formData.ads_proficiency_score) : null,
        iap_score: formData.iap_score ? parseInt(formData.iap_score) : null,
        team_size_total: parseInt(formData.team_size_total),
        no_of_artists: formData.no_of_artists ? parseInt(formData.no_of_artists) : null,
        no_of_devs: formData.no_of_devs ? parseInt(formData.no_of_devs) : null,
        no_of_designers: formData.no_of_designers ? parseInt(formData.no_of_designers) : null,
        no_of_pm: formData.no_of_pm ? parseInt(formData.no_of_pm) : null,
      };

      console.log('Submitting cleaned data:', JSON.stringify(submitData, null, 2));

      const response = await api.put(`/v1/game-studios/external-studio/onboarding/${studioData.id}`, submitData);

      if (response.status === 200) {
        setToastMessage({
          show: true,
          message: "Studio profile updated successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Error updating profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl h-[calc(100vh-165px)] overflow-auto">
      <form className="px-8 pt-6 pb-8">
        <h1 className="mb-6 text-xl font-bold">Studio Profile</h1>
        
        {/* Team Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Team Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="team_size_total">
                Total Team Size<span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="team_size_total"
                name="team_size_total"
                type="number"
                min="1"
                value={formData.team_size_total}
                onChange={handleInputChange}
              />
              {errors.team_size_total && (
                <span className="text-[#f58174] text-[12px]">{errors.team_size_total}</span>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location<span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
              />
              {errors.location && (
                <span className="text-[#f58174] text-[12px]">{errors.location}</span>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="no_of_artists">
                Number of Artists
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="no_of_artists"
                name="no_of_artists"
                type="number"
                min="0"
                value={formData.no_of_artists}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="no_of_devs">
                Number of Developers
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="no_of_devs"
                name="no_of_devs"
                type="number"
                min="0"
                value={formData.no_of_devs}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="no_of_designers">
                Number of Designers
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="no_of_designers"
                name="no_of_designers"
                type="number"
                min="0"
                value={formData.no_of_designers}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="no_of_pm">
                Number of Project Managers
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="no_of_pm"
                name="no_of_pm"
                type="number"
                min="0"
                value={formData.no_of_pm}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Technical Capabilities Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Technical Capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferred_engine">
                Preferred Engine<span className="text-red-500">*</span>
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                id="preferred_engine"
                name="preferred_engine"
                value={commonEngineOptions.includes(formData.preferred_engine) ? formData.preferred_engine : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") {
                    handleInputChange(e);
                  }
                }}
              >
                <option value="">Select Engine</option>
                {commonEngineOptions.map(engine => (
                  <option key={engine} value={engine}>{engine}</option>
                ))}
                <option value="custom">Other (specify below)</option>
              </select>
              
              {(!commonEngineOptions.includes(formData.preferred_engine) || formData.preferred_engine === "") && (
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                  placeholder="Enter your preferred engine"
                  value={commonEngineOptions.includes(formData.preferred_engine) ? "" : formData.preferred_engine}
                  onChange={(e) => handleInputChange({target: {name: 'preferred_engine', value: e.target.value}})}
                />
              )}
              {errors.preferred_engine && (
                <span className="text-[#f58174] text-[12px]">{errors.preferred_engine}</span>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="engine_proficiency">
                Engine Proficiency (0-10)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="engine_proficiency"
                name="engine_proficiency"
                type="number"
                min="0"
                max="10"
                value={formData.engine_proficiency}
                onChange={handleInputChange}
              />
              {errors.engine_proficiency && (
                <span className="text-[#f58174] text-[12px]">{errors.engine_proficiency}</span>
              )}
        </div>
          
          <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="art_2d_ui_score">
                2D Art & UI Score (0-10)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="art_2d_ui_score"
                name="art_2d_ui_score"
                type="number"
                min="0"
                max="10"
                value={formData.art_2d_ui_score}
              onChange={handleInputChange}
            />
              {errors.art_2d_ui_score && (
                <span className="text-[#f58174] text-[12px]">{errors.art_2d_ui_score}</span>
              )}
          </div>

          <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="art_3d_score">
                3D Art Score (0-10)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="art_3d_score"
                name="art_3d_score"
                type="number"
                min="0"
                max="10"
                value={formData.art_3d_score}
              onChange={handleInputChange}
            />
              {errors.art_3d_score && (
                <span className="text-[#f58174] text-[12px]">{errors.art_3d_score}</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Art Capabilities
            </label>
            
            {/* Selected Art Capabilities Display */}
            {formData.art_capabilities.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.art_capabilities.map(capability => (
                  <span key={capability} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    {capability}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('art_capabilities', capability)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
              </span>
                ))}
              </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {artCapabilitiesOptions.map(capability => (
                <label key={capability} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.art_capabilities.includes(capability)}
                    onChange={() => handleArrayChange('art_capabilities', capability)}
                  />
                  {capability}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom art capability..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.art_capabilities}
                onChange={(e) => handleCustomEntryChange('art_capabilities', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('art_capabilities');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('art_capabilities')}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="backend_proficiency"
                className="mr-2"
                checked={formData.backend_proficiency}
                onChange={handleInputChange}
              />
              <span className="text-gray-700 text-sm font-bold">Backend Proficiency</span>
            </label>
          </div>
        </div>

        {/* Game Development Experience */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Game Development Experience</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Genres Worked On
            </label>
            
            {/* Selected Genres Display */}
            {formData.genres_worked_on.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.genres_worked_on.map(genre => (
                  <span key={genre} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('genres_worked_on', genre)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
        </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonGenreOptions.map(genre => (
                <label key={genre} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.genres_worked_on.includes(genre)}
                    onChange={() => handleArrayChange('genres_worked_on', genre)}
                  />
                  {genre}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom genre..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.genres_worked_on}
                onChange={(e) => handleCustomEntryChange('genres_worked_on', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('genres_worked_on');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('genres_worked_on')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Future Genres
            </label>
            
            {/* Selected Future Genres Display */}
            {formData.future_genres.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.future_genres.map(genre => (
                  <span key={genre} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('future_genres', genre)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonGenreOptions.map(genre => (
                <label key={genre} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.future_genres.includes(genre)}
                    onChange={() => handleArrayChange('future_genres', genre)}
                  />
                  {genre}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom future genre..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.future_genres}
                onChange={(e) => handleCustomEntryChange('future_genres', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('future_genres');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('future_genres')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="future_monetization">
                Future Monetization Strategy
            </label>
            <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                id="future_monetization"
              name="future_monetization"
                value={commonMonetizationOptions.includes(formData.future_monetization) ? formData.future_monetization : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") {
                    handleInputChange(e);
                  }
                }}
              >
                <option value="">Select Strategy</option>
                {commonMonetizationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
                <option value="custom">Other (specify below)</option>
            </select>
              
              {(!commonMonetizationOptions.includes(formData.future_monetization) || formData.future_monetization === "") && (
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Enter your monetization strategy"
                  value={commonMonetizationOptions.includes(formData.future_monetization) ? "" : formData.future_monetization}
                  onChange={(e) => handleInputChange({target: {name: 'future_monetization', value: e.target.value}})}
                />
              )}
          </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ads_proficiency_score">
                Ads Monetization Score (0-10)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ads_proficiency_score"
                name="ads_proficiency_score"
                type="number"
                min="0"
                max="10"
                value={formData.ads_proficiency_score}
                onChange={handleInputChange}
              />
              {errors.ads_proficiency_score && (
                <span className="text-[#f58174] text-[12px]">{errors.ads_proficiency_score}</span>
              )}
        </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="iap_score">
                IAP Monetization Score (0-10)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="iap_score"
                name="iap_score"
                type="number"
                min="0"
                max="10"
                value={formData.iap_score}
                onChange={handleInputChange}
              />
              {errors.iap_score && (
                <span className="text-[#f58174] text-[12px]">{errors.iap_score}</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="current_games">
              What kind of projects are you working on right now?
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="current_games"
              name="current_games"
              rows="3"
              placeholder="Describe your current projects, their genre, stage of development, etc."
              value={formData.current_games}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Published Titles
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Do you have any published titles? Share the links to your games (App Store, Google Play, Steam, etc.)
            </p>
            
            {/* Current Published Game Links */}
            {publishedGameLinks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Published Games:</h4>
                <div className="space-y-2">
                  {publishedGameLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all"
                        >
                          {link}
                        </a>
                        {!isValidUrl(link) && (
                          <span className="text-red-500 text-xs ml-2">(Invalid URL)</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGameLink(index)}
                        className="text-red-500 hover:text-red-700 font-bold px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Game Link */}
            <div className="flex gap-2">
              <input
                type="url"
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://play.google.com/store/apps/details?id=... or https://apps.apple.com/app/..."
                value={newGameLink}
                onChange={(e) => setNewGameLink(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGameLink();
                  }
                }}
              />
              <button
                type="button"
                onClick={addGameLink}
                disabled={!newGameLink.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Link
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Examples: App Store links, Google Play links, Steam pages, itch.io pages, web game URLs, etc.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeline_goals">
              What's your expected timeline to complete your current project?
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="timeline_goals"
              name="timeline_goals"
              rows="3"
              placeholder="e.g., 'We expect to launch our MVP by December 2025' or 'Currently in alpha, targeting beta release in Q2 2026'"
              value={formData.timeline_goals}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Analytics & UA Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Analytics & User Acquisition</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Analytics Tools
            </label>
            
            {/* Selected Analytics Tools Display */}
            {formData.analytics_tools.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.analytics_tools.map(tool => (
                  <span key={tool} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('analytics_tools', tool)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonAnalyticsOptions.map(tool => (
                <label key={tool} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.analytics_tools.includes(tool)}
                    onChange={() => handleArrayChange('analytics_tools', tool)}
                  />
                  {tool}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom analytics tool..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.analytics_tools}
                onChange={(e) => handleCustomEntryChange('analytics_tools', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('analytics_tools');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('analytics_tools')}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="analytics_use_case">
              How do you usually approach analytics and data integration? Any examples of insights/metrics you acted on from your data?
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="analytics_use_case"
              name="analytics_use_case"
              rows="4"
              placeholder="e.g., 'We focus on D1 retention and build stability using Firebase. When we saw retention drop from level 3, we simplified the tutorial and retention improved by 15%'"
              value={formData.analytics_use_case}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Have you run user acquisition campaigns before? Which platforms have you used?
            </label>
            <p className="text-sm text-gray-600 mb-3">
              (e.g., AppLovin, Adjust, ironSource, etc.)
            </p>
            
            {/* Selected UA Platforms Display */}
            {formData.ua_platforms.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.ua_platforms.map(platform => (
                  <span key={platform} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {platform}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('ua_platforms', platform)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
        </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonUaPlatformOptions.map(platform => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.ua_platforms.includes(platform)}
                    onChange={() => handleArrayChange('ua_platforms', platform)}
                  />
                  {platform}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom UA platform..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.ua_platforms}
                onChange={(e) => handleCustomEntryChange('ua_platforms', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('ua_platforms');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('ua_platforms')}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Which channels have you used for user acquisition?
            </label>
            <p className="text-sm text-gray-600 mb-3">
              (e.g., Meta/Facebook, YouTube, TikTok, Google Ads, etc.)
            </p>
            
            {/* Selected UA Channels Display */}
            {formData.ua_channels.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.ua_channels.map(channel => (
                  <span key={channel} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    {channel}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('ua_channels', channel)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Common Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonUaPlatformOptions.map(channel => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.ua_channels.includes(channel)}
                    onChange={() => handleArrayChange('ua_channels', channel)}
                  />
                  {channel}
                </label>
              ))}
            </div>
            
            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom UA channel..."
                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customEntries.ua_channels}
                onChange={(e) => handleCustomEntryChange('ua_channels', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomEntry('ua_channels');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addCustomEntry('ua_channels')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ua_budget_range">
                UA Budget Range
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ua_budget_range"
                name="ua_budget_range"
                value={formData.ua_budget_range}
                onChange={handleInputChange}
              >
                <option value="">Select Budget Range</option>
                {budgetRangeOptions.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ua_score">
                UA Capability Score (0-10)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ua_score"
                name="ua_score"
                type="number"
                min="0"
                max="10"
                value={formData.ua_score}
                onChange={handleInputChange}
              />
              {errors.ua_score && (
                <span className="text-[#f58174] text-[12px]">{errors.ua_score}</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paid_acquisition_phase">
                Paid Acquisition Phase
              </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="paid_acquisition_phase"
                name="paid_acquisition_phase"
              type="text"
                value={formData.paid_acquisition_phase}
                onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studio_context">
              Studio Context
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="studio_context"
              name="studio_context"
              rows="4"
              value={formData.studio_context}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="additional_notes">
              Is there anything else about your team or games that we should know?
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="additional_notes"
              name="additional_notes"
              rows="4"
              placeholder="Any additional information about your team's experience, unique capabilities, past achievements, special circumstances, etc."
              value={formData.additional_notes}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-start">
          {isLoading ? (
        <button
          type="button"
              disabled
              className="bg-gray-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow cursor-not-allowed opacity-50"
        >
              Updating...
        </button>
          ) : (
            <button
              className="bg-[#B9FF66] text-[#000] font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:bg-[#000] hover:text-[#B9FF66]"
              type="button"
              onClick={handleSubmit}
            >
              Save Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudioProfile;
