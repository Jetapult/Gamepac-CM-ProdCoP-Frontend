import {
  ChevronRight,
  XCircle,
  Loader,
  X,
  Check,
  Move,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "../../../api";
import { useEffect, useRef, useState } from "react";

const colorCode = {
  green: "#3cb300",
  red: "#cd0024",
  orange: "#ed6c0a",
  purple: "#cb00b4",
};

const StaticAdGenerator = ({ game, setToastMessage }) => {
  const [creativeApproaches, setCreativeApproaches] = useState([]);
  const [artStyles, setArtStyles] = useState([]);
  const [selectedApproach, setSelectedApproach] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [appLogo, setAppLogo] = useState(null);
  const [buttonVariations, setButtonVariations] = useState([]);
  const [selectedButtonType, setSelectedButtonType] = useState(0);
  const [platformSizes, setPlatformSizes] = useState([
    { id: 1, name: "1080x1350 (4:5)", value: "1080x1350" },
    { id: 2, name: "1200x628 (1.91:1)", value: "1200x628" },
    { id: 3, name: "1080x1080 (1:1)", value: "1080x1080" },
  ]);
  const [gameLogos, setGameLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const [showEditor, setShowEditor] = useState(false);
  const [currentEditingAd, setCurrentEditingAd] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  const [showLogo, setShowLogo] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [buttonColor, setButtonColor] = useState("green");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isLogoDropdownOpen, setIsLogoDropdownOpen] = useState(false);
  const [isButtonDropdownOpen, setIsButtonDropdownOpen] = useState(false);
  const [showCenterLine, setShowCenterLine] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 80 });
  const [isExporting, setIsExporting] = useState(false);
  const [redrawPrompt, setRedrawPrompt] = useState("");
  const [isRedrawing, setIsRedrawing] = useState(false);
  const [currentSlideIndices, setCurrentSlideIndices] = useState({});
  const [isLogoSelectionOpen, setIsLogoSelectionOpen] = useState(false);

  const logoRef = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);

  const setSlideForAd = (adId, index) => {
    setCurrentSlideIndices((prev) => ({
      ...prev,
      [adId]: index,
    }));
  };

  const getSlideForAd = (adId) => {
    return currentSlideIndices[adId] || 0;
  };
  const handleResize = async (size) => {
    try {
      let adIdToResize;
      setSelectedSize(size);

      // Determine the correct ad ID to resize based on generation_type
      switch (currentEditingAd?.generation_type) {
        case "initial":
          // For initial assets, use their own ID
          adIdToResize = currentEditingAd.id;
          break;

        case "resize":
          // For resize assets, find and use the original initial asset's ID
          const initialAssetForResize = generatedAds?.assets?.find(
            (asset) => asset.generation_type === "initial"
          );
          adIdToResize = initialAssetForResize?.id;
          break;

        case "redraw":
          // For redraw assets, use their own ID
          adIdToResize = currentEditingAd.id;
          break;

        default:
          // Fallback: Find the initial asset from the assets array
          const initialAsset = generatedAds?.assets?.find(
            (asset) => asset.generation_type === "initial"
          );
          adIdToResize = initialAsset?.id;
      }

      // Validate that we have a valid ad ID
      if (!adIdToResize) {
        console.error("No valid ad ID found for resizing");
        setToastMessage({
          show: true,
          message: "Unable to find ad to resize",
          type: "error",
        });
        return;
      }

      console.log(
        `Resizing ad with ID: ${adIdToResize}, to size: ${selectedSize.value}`
      );

      const response = await api.post("/v1/aso-assistant/static-ads/resize", {
        ad_id: adIdToResize,
        platform_size: size,
      });
      const updatedGeneratedAds = {
        ...generatedAds,
        assets: [response.data.data, ...(generatedAds.assets || [])],
      };

      setGeneratedAds(updatedGeneratedAds);
      setCurrentEditingAd(response.data.data);
    } catch (error) {
      console.error("Error resizing ad:", error);
      setToastMessage({
        show: true,
        message: "Error resizing ad. Please try again.",
        type: "error",
      });
    }
  };

  const getCreativeApproachName = (creativeApproach) => {
    const approach = creativeApproaches.find(
      (approach) => approach.value === creativeApproach
    );
    return approach ? approach.name : "Character Promo Art";
  };

  const togglePlatformDropdown = () => {
    setIsPlatformDropdownOpen(!isPlatformDropdownOpen);
  };

  const toggleLogoDropdown = () => {
    setIsLogoDropdownOpen(!isLogoDropdownOpen);
  };

  const toggleButtonDropdown = () => {
    setIsButtonDropdownOpen(!isButtonDropdownOpen);
  };

  const fetchCreativeApproaches = async () => {
    try {
      const response = await api.get(
        "/v1/aso-assistant/static-ads/creative-approaches"
      );
      setCreativeApproaches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching creative approaches:", error);
    }
  };

  const fetchArtStyles = async () => {
    try {
      const response = await api.get("/v1/aso-assistant/static-ads/art-styles");
      setArtStyles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching art styles:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectArtStyle = (style) => {
    setSelectedStyle(style);
    setIsDropdownOpen(false);
  };

  const selectCreativeApproach = (approach) => {
    setSelectedApproach(approach);
  };

  const clearSelectedApproach = () => {
    setSelectedApproach(null);
  };

  const handleLogoUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        setAppLogo(file);
      }
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("game_id", game.id);
      formData.append("studio_id", game.studio_id);
      formData.append("name", file?.name);
      const response = await api.post(
        "/v1/aso-assistant/upload-logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setGameLogos((prev) => [response.data.data, ...prev]);
      setSelectedLogo(response.data.data);
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedApproach || !selectedStyle) return;

    setIsGenerating(true);

    try {
      const requestBody = {
        game_id: game.id,
        studio_id: game.studio_id,
        prompt: "",
        style: selectedStyle.value,
        creative_approach: selectedApproach.value,
        logo_id: selectedLogo?.id,
        platform_size: selectedSize,
      };

      const response = await api.post(
        "/v1/aso-assistant/static-ads",
        requestBody
      );

      setGeneratedAds(response.data.data);
      openEditor(response.data.data?.assets[0]);
      setIsGenerating(false);
      setSelectedApproach(null);
      setSelectedStyle(null);
      setAppLogo(null);
    } catch (error) {
      console.error("Error generating static ads:", error);
      setIsGenerating(false);
    }
  };

  const openEditor = (ad) => {
    setCurrentEditingAd(ad);
    setShowEditor(true);
    setLogoPosition({ x: 20, y: 20 });
    setButtonPosition({ x: 50, y: 80 });
  };

  const closeEditor = () => {
    setShowEditor(false);
    setCurrentEditingAd(null);
  };

  const handleRedraw = async () => {
    if (!redrawPrompt || !currentEditingAd) return;

    setIsRedrawing(true);
    setSelectedSize(platformSizes[0]);
    try {
      // Determine the correct parent_ad_id based on generation_type
      let parentAdId;

      switch (currentEditingAd.generation_type) {
        case "initial":
          // For initial assets, use their own ID
          parentAdId = currentEditingAd.id;
          break;

        case "resize":
          parentAdId = currentEditingAd.parent_ad_id;
          break;
        case "redraw":
          // For resize or redraw assets, use their parent_ad_id
          parentAdId = currentEditingAd.id;
          break;

        default:
          // Fallback: Find the initial asset from the assets array
          const initialAsset = generatedAds?.assets?.find(
            (asset) => asset.generation_type === "initial"
          );
          parentAdId = initialAsset?.id;
      }

      // Validate that we have a valid parent_ad_id
      if (!parentAdId) {
        console.error("No valid parent ad ID found for redrawing");
        setToastMessage({
          show: true,
          message: "Unable to find parent ad for redrawing",
          type: "error",
        });
        setIsRedrawing(false);
        return;
      }

      console.log(
        `Redrawing with parent_ad_id: ${parentAdId}, session_id: ${generatedAds.id}, prompt: ${redrawPrompt}`
      );

      const response = await api.post("/v1/aso-assistant/static-ads/redraw", {
        session_id: generatedAds.id,
        parent_ad_id: parentAdId,
        prompt: redrawPrompt,
      });

      // Update the generatedAds state with the new data
      const updatedGeneratedAds = {
        ...generatedAds,
        assets: [response.data.data, ...(generatedAds.assets || [])],
      };

      setGeneratedAds(updatedGeneratedAds);

      // Initialize slide index for the new ad
      setCurrentSlideIndices((prev) => ({
        ...prev,
        [response.data.data.id]: 0,
      }));

      // Set the current editing ad to the newly generated one
      setCurrentEditingAd(response.data.data);

      // Clear the redraw prompt
      setRedrawPrompt("");
    } catch (error) {
      console.error("Error redrawing ad:", error);
      setToastMessage({
        show: true,
        message: "Error redrawing ad. Please try again.",
        type: "error",
      });
    } finally {
      setIsRedrawing(false);
    }
  };

  /**
   * Handles exporting the edited image with positioned elements
   * Coordinate system documentation:
   * - Editor shows a scaled preview that may have a different aspect ratio than the output
   * - Frontend uses percentage-based positioning (0-100%) with elements centered
   * - Backend needs coordinates adjusted for the actual output dimensions
   * - We calculate position accounting for aspect ratio differences
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Get the canvas dimensions for proper scaling
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      // Get target dimensions from the platform size
      const targetWidth = currentEditingAd?.platform_size?.width || 1080;
      const targetHeight = currentEditingAd?.platform_size?.height || 1350;
      const targetAspectRatio = targetWidth / targetHeight;

      // Calculate actual dimensions of elements
      const logoElement = logoRef.current?.querySelector("img");
      const buttonElement = buttonRef.current?.querySelector("img");

      const logoElementWidth = logoElement?.clientWidth || 100;
      const logoElementHeight = logoElement?.clientHeight || 50;
      const buttonElementWidth = buttonElement?.clientWidth || 200;
      const buttonElementHeight = buttonElement?.clientHeight || 60;

      // Calculate aspect ratio adjustment factor for maintaining relative positions
      // This accounts for differences between the editor canvas and output image
      const aspectRatioAdjustmentX =
        canvasAspectRatio >= targetAspectRatio
          ? 1
          : targetAspectRatio / canvasAspectRatio;
      const aspectRatioAdjustmentY =
        canvasAspectRatio <= targetAspectRatio
          ? 1
          : canvasAspectRatio / targetAspectRatio;

      console.log(
        "Canvas dimensions:",
        canvasWidth,
        "x",
        canvasHeight,
        "Aspect ratio:",
        canvasAspectRatio
      );
      console.log(
        "Target dimensions:",
        targetWidth,
        "x",
        targetHeight,
        "Aspect ratio:",
        targetAspectRatio
      );
      console.log(
        "Aspect ratio adjustments:",
        aspectRatioAdjustmentX,
        aspectRatioAdjustmentY
      );

      // Adjust positions for aspect ratio differences
      // The goal is to maintain the same relative position regardless of aspect ratio changes
      let adjustedLogoX = logoPosition.x / 100; // Normalize to 0-1
      let adjustedLogoY = logoPosition.y / 100; // Normalize to 0-1
      let adjustedButtonX = buttonPosition.x / 100; // Normalize to 0-1
      let adjustedButtonY = buttonPosition.y / 100; // Normalize to 0-1

      // Calculate the width and height relative to target dimensions
      const normalizedLogoWidth =
        (logoElementWidth / canvasWidth) * aspectRatioAdjustmentX;
      const normalizedLogoHeight =
        (logoElementHeight / canvasHeight) * aspectRatioAdjustmentY;
      const normalizedButtonWidth =
        (buttonElementWidth / canvasWidth) * aspectRatioAdjustmentX;
      const normalizedButtonHeight =
        (buttonElementHeight / canvasHeight) * aspectRatioAdjustmentY;

      console.log("Logo original position:", logoPosition.x, logoPosition.y);
      console.log("Logo adjusted position:", adjustedLogoX, adjustedLogoY);
      console.log(
        "Button original position:",
        buttonPosition.x,
        buttonPosition.y
      );
      console.log(
        "Button adjusted position:",
        adjustedButtonX,
        adjustedButtonY
      );

      // Send position data to the backend with normalized coordinates (0-1)
      await api.post(`/v1/aso-assistant/static-ads/positions`, {
        ad_id: currentEditingAd.id,
        logo_position: {
          // Normalized positions adjusted for aspect ratio
          x: adjustedLogoX,
          y: adjustedLogoY,

          // Normalized dimensions adjusted for aspect ratio
          width: normalizedLogoWidth,
          height: normalizedLogoHeight,

          // Original editor values for reference/debugging
          editor_x_percent: logoPosition.x,
          editor_y_percent: logoPosition.y,
          editor_width_px: logoElementWidth,
          editor_height_px: logoElementHeight,
        },
        button_position: {
          // Normalized positions adjusted for aspect ratio
          x: adjustedButtonX,
          y: adjustedButtonY,

          // Normalized dimensions adjusted for aspect ratio
          width: normalizedButtonWidth,
          height: normalizedButtonHeight,

          // Original editor values for reference/debugging
          editor_x_percent: buttonPosition.x,
          editor_y_percent: buttonPosition.y,
          editor_width_px: buttonElementWidth,
          editor_height_px: buttonElementHeight,
        },

        // Send editor canvas dimensions
        canvas_dimensions: {
          width: canvasWidth,
          height: canvasHeight,
          aspect_ratio: canvasAspectRatio,
        },

        // Send target platform size
        platform_size: {
          name: currentEditingAd?.platform_size?.name,
          width: targetWidth,
          height: targetHeight,
          aspect_ratio: targetAspectRatio,
        },

        // For proper interpretation in the backend
        positioning_mode: "center-based",
        aspect_ratio_adjustment: {
          x: aspectRatioAdjustmentX,
          y: aspectRatioAdjustmentY,
        },
      });

      // Then, update the button variation if needed
      if (buttonColor && selectedButtonType !== undefined) {
        const selectedVariation = buttonVariations.find(
          (v) => v.color === buttonColor
        );
        if (selectedVariation) {
          await api.post("/v1/aso-assistant/static-ads/button-variation", {
            ad_id: currentEditingAd.id,
            button_variation: {
              button_url: selectedVariation.button_url,
              color: selectedVariation.color,
            },
          });
        }
      }

      // Finally, call the export endpoint
      const response = await api.post("/v1/aso-assistant/static-ads/export", {
        ad_id: currentEditingAd.id,
      });

      // Get the exported image URL
      const exportedUrl = response.data.data.url;

      // Open the exported image in a new tab or trigger download
      window.open(exportedUrl, "_blank");

      // Update the current editing ad with the exported URL
      setCurrentEditingAd({
        ...currentEditingAd,
        edited_url: exportedUrl,
      });

      setIsExporting(false);
    } catch (error) {
      console.error("Error exporting image:", error);
      setIsExporting(false);
      setToastMessage({
        show: true,
        message: "Failed to export image. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!showEditor) return;

    const makeDraggable = (elementRef, setPosition, initialPosition) => {
      const element = elementRef.current;
      if (!element) return null;

      let active = false;
      let currentX = initialPosition.x;
      let currentY = initialPosition.y;

      const onMouseDown = (e) => {
        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();

        if (
          e.clientX < canvasRect.left ||
          e.clientX > canvasRect.right ||
          e.clientY < canvasRect.top ||
          e.clientY > canvasRect.bottom
        ) {
          return;
        }

        active = true;

        element.style.cursor = "grabbing";
        element.style.border = "2px dashed #6366f1";

        e.preventDefault();

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e) => {
        if (!active) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
        const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

        // Calculate percentages precisely
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        const elementRect = element.getBoundingClientRect();
        const elementWidth = (elementRect.width / rect.width) * 100;
        const elementHeight = (elementRect.height / rect.height) * 100;

        const paddingX = elementWidth / 2;
        const paddingY = elementHeight / 2;

        // Round to 2 decimal places for more precision
        currentX =
          Math.round(Math.max(paddingX, Math.min(100 - paddingX, x)) * 100) /
          100;
        currentY =
          Math.round(Math.max(paddingY, Math.min(100 - paddingY, y)) * 100) /
          100;

        // Apply the position
        element.style.left = currentX + "%";
        element.style.top = currentY + "%";

        if (currentX !== x || currentY !== y) {
          element.style.border = "2px dashed #ef4444";
        } else {
          element.style.border = "2px dashed #6366f1";
        }
      };

      const onMouseUp = () => {
        if (!active) return;
        active = false;

        element.style.cursor = "move";
        element.style.border = "";

        setPosition({ x: currentX, y: currentY });

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      element.addEventListener("mousedown", onMouseDown);

      return () => {
        element.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
    };

    const cleanups = [];

    if (logoRef.current && showLogo) {
      cleanups.push(makeDraggable(logoRef, setLogoPosition, logoPosition));
    }

    if (buttonRef.current && showButton) {
      cleanups.push(
        makeDraggable(buttonRef, setButtonPosition, buttonPosition)
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, [showEditor, showLogo, showButton, logoPosition, buttonPosition]);

  const fetchGeneratedAds = async () => {
    try {
      const response = await api.get(
        `/v1/aso-assistant/static-ads/${game.id}/history`
      );
      setGeneratedAds(response.data.data[0]);
      const defaultAsset = response.data.data[0]?.assets.find(
        (asset) => asset.platform_size?.name === "1080x1350 (4:5)"
      );

      if (defaultAsset) {
        openEditor(defaultAsset);
      }
      // openEditor(response.data.data[0]?.assets[0]);
    } catch (error) {
      console.error("Error fetching generated ads:", error);
    }
  };

  const fetchButtonVariations = async () => {
    try {
      const response = await api.get(
        `/v1/aso-assistant/static-ads/button-variations`
      );
      setButtonVariations(response.data.data);
    } catch (error) {
      console.error("Error fetching button variations:", error);
    }
  };

  const fetchPlatformSizes = async () => {
    try {
      const response = await api.get(
        "/v1/aso-assistant/static-ads/platform-sizes"
      );
      setPlatformSizes(response.data.data);
      setSelectedSize(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching platform sizes:", error);
    }
  };

  const fetchGameLogos = async () => {
    try {
      const response = await api.get(`/v1/aso-assistant/logos/${game.id}`);
      setGameLogos(response.data.data);
    } catch (error) {
      console.error("Error fetching game logos:", error);
    }
  };

  useEffect(() => {
    fetchCreativeApproaches();
    fetchArtStyles();
    fetchGeneratedAds();
    fetchButtonVariations();
    fetchPlatformSizes();
    fetchGameLogos();
  }, []);

  const getAspectRatio = (platformSize) => {
    if (!platformSize) return 4 / 5; // Default aspect ratio

    // If platform_size has ratio property, use it directly
    if (platformSize.ratio) {
      const [width, height] = platformSize.ratio.split(":");
      return Number(width) / Number(height);
    }

    // Otherwise calculate from width and height
    if (platformSize.width && platformSize.height) {
      return platformSize.width / platformSize.height;
    }

    // Parse from the platform size value (e.g., "1080x1350")
    if (platformSize.value) {
      const [width, height] = platformSize.value.split("x").map(Number);
      return width / height;
    }

    // Default fallback
    return 4 / 5;
  };

  return (
    <div className="w-full max-w-[800px]">
      {showEditor ? (
        <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-center w-full">
              {getCreativeApproachName(currentEditingAd?.creative_approach)}{" "}
              Image Creative
            </h1>
            <button
              onClick={closeEditor}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <div
                ref={canvasRef}
                className="relative rounded-md overflow-hidden mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  aspectRatio: getAspectRatio(currentEditingAd?.platform_size),
                }}
              >
                {showCenterLine && (
                  <div
                    className="center-line absolute h-full w-[1px] bg-blue-400 opacity-50 pointer-events-none"
                    style={{ left: "50%", zIndex: 5 }}
                  />
                )}

                {generatedAds?.assets && generatedAds.assets.length > 0 && (
                  <div className="absolute inset-0 w-full h-full">
                    {generatedAds.assets.map((ad, index) => {
                      // Step 1: Find the root asset (the initial one)
                      let rootAsset = generatedAds.assets.find(
                        (a) => a.generation_type === "initial"
                      );

                      if (!rootAsset) {
                        console.error("No initial asset found!");
                        return null;
                      }

                      // Step 2: Get all variations related to this root asset
                      // MODIFIED: Only include initial and redraw types, exclude resize
                      const allVariations = generatedAds.assets.filter(
                        (asset) => {
                          // Skip resize assets entirely
                          if (asset.generation_type === "resize") return false;

                          // Include the root asset itself
                          if (asset.id === rootAsset.id) return true;

                          // Include direct children of the root asset that are redraw type
                          if (
                            asset.parent_ad_id === rootAsset.id &&
                            asset.generation_type === "redraw"
                          )
                            return true;

                          // Include "grandchildren" redraws whose parent is a redraw of the root
                          const parent = generatedAds.assets.find(
                            (a) => a.id === asset.parent_ad_id
                          );
                          return (
                            parent &&
                            parent.parent_ad_id === rootAsset.id &&
                            asset.generation_type === "redraw"
                          );
                        }
                      );

                      // Sort variations by creation date
                      allVariations.sort(
                        (a, b) =>
                          new Date(a.created_at) - new Date(b.created_at)
                      );

                      // Make sure we only show each asset once - avoid duplicates
                      if (
                        index > 0 &&
                        generatedAds.assets[index - 1].id === ad.id
                      )
                        return null;

                      // Only show initial or redraw assets in the carousel
                      if (ad.generation_type === "resize") return null;

                      // Get current index for the carousel
                      const currentIndex = getSlideForAd(rootAsset.id) || 0;

                      // Only show the current slide in the carousel
                      if (allVariations[currentIndex]?.id !== ad.id)
                        return null;

                      return (
                        <div
                          key={ad.id}
                          className="absolute inset-0 w-full h-full"
                        >
                          {allVariations.length > 1 && (
                            <div className="flex justify-center gap-2 mb-4">
                              {allVariations.map((variation, idx) => (
                                <button
                                  key={`dot-${variation.id}`}
                                  className={`w-2 h-2 rounded-full ${
                                    currentIndex === idx
                                      ? "bg-[#b9ff66]"
                                      : "bg-gray-300 hover:bg-gray-400"
                                  }`}
                                  onClick={() =>
                                    setSlideForAd(rootAsset.id, idx)
                                  }
                                  aria-label={`View variation ${idx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                          <img
                            src={ad.image_url}
                            alt="Ad creative"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: "center center" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  {currentEditingAd?.logo_url && showLogo && (
                    <div
                      ref={logoRef}
                      className="absolute cursor-move pointer-events-auto"
                      style={{
                        left: `${logoPosition.x}%`,
                        top: `${logoPosition.y}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    >
                      <img
                        src={currentEditingAd?.logo_url}
                        alt="Game logo"
                        className="max-w-[100px] max-h-[50px] object-contain pointer-events-none"
                      />
                    </div>
                  )}

                  {showButton && (
                    <div
                      ref={buttonRef}
                      className="absolute cursor-move pointer-events-auto"
                      style={{
                        left: `${buttonPosition.x}%`,
                        top: `${buttonPosition.y}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    >
                      {buttonVariations.length > 0 && buttonColor && (
                        <img
                          src={
                            buttonVariations.find(
                              (v) => v.color === buttonColor
                            )?.button_url[selectedButtonType]
                          }
                          alt="Play button"
                          className="h-12 object-contain pointer-events-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">
                  Generate again or make changes
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Would you like to make changes?"
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    value={redrawPrompt}
                    onChange={(e) => setRedrawPrompt(e.target.value)}
                  />
                  <button
                    className="bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] hover:bg-gradient-to-br from-[#f2f2f2] to-[#d6ffa6] text-black px-4 py-2 rounded-md flex items-center gap-1"
                    onClick={handleRedraw}
                  >
                    Redraw
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">TIP:</span> for example, "add a
                  dragon", "add rain to the scene" or "make the character smile"
                </p>
              </div>
            </div>

            <div className="w-[300px]">
              <div className="mb-6">
                <h3 className="font-medium mb-2">Platform resize</h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="relative w-full">
                    <div
                      className={`bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] flex items-center justify-between p-2 border border-gray-300 rounded-md cursor-pointer ${
                        isPlatformDropdownOpen ? "rounded-b-none" : ""
                      }`}
                      onClick={togglePlatformDropdown}
                    >
                      <div className="flex items-center">
                        <span>{selectedSize.name}</span>
                      </div>
                      <ChevronRight
                        className={`transform transition-transform duration-300 ${
                          isPlatformDropdownOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {isPlatformDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-10 overflow-hidden">
                        {platformSizes.map((size) => {
                          // Find the initial asset (root asset)
                          const initialAsset = generatedAds?.assets?.find(
                            (asset) => asset.generation_type === "initial"
                          );

                          // Check if this size has already been resized
                          const isDefaultSize = size.name === "1080x1350 (4:5)"; // Identify default 4:5 size

                          const isAlreadyResized =
                            isDefaultSize ||
                            generatedAds?.assets?.some(
                              (asset) =>
                                asset.generation_type === "resize" &&
                                asset.platform_size?.name === size.name &&
                                // Either directly resized from initial asset or from a redraw of initial
                                (asset.parent_ad_id === initialAsset?.id ||
                                  generatedAds?.assets?.some(
                                    (redraw) =>
                                      redraw.generation_type === "redraw" &&
                                      redraw.id === asset.parent_ad_id &&
                                      redraw.parent_ad_id === initialAsset?.id
                                  ))
                            );

                          return (
                            <div
                              key={size.id}
                              className="px-4 py-2 hover:bg-[#f7f7f7] cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                if (isAlreadyResized) {
                                  let resizedAsset;
                                  const initialAsset =
                                    generatedAds?.assets?.find(
                                      (asset) =>
                                        asset.generation_type === "initial"
                                    );
                                  if (size.name === "1080x1350 (4:5)") {
                                    resizedAsset = generatedAds?.assets?.find(
                                      (asset) =>
                                        asset.generation_type === "initial" &&
                                        asset.platform_size?.name === size.name
                                    );
                                  } else {
                                    resizedAsset = generatedAds?.assets?.find(
                                      (asset) =>
                                        asset.generation_type === "resize" &&
                                        asset.platform_size?.name ===
                                          size.name &&
                                        asset.parent_ad_id === initialAsset.id
                                    );
                                  }
                                  setCurrentEditingAd(resizedAsset);
                                  setSelectedSize(size);
                                  setIsPlatformDropdownOpen(false);
                                } else {
                                  handleResize(size);
                                  setIsPlatformDropdownOpen(false);
                                }
                                
                              }}
                            >
                              <div className="flex items-center">
                                {isAlreadyResized && (
                                  <Check className="w-4 h-4 text-green-500 mr-2" />
                                )}
                                <span>{size.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* <button
                    className="bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] rounded-md text-black font-medium py-2 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-br from-[#f2f2f2] to-[#d6ffa6]"
                    onClick={handleResize}
                  >
                    Resize
                  </button> */}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Branding overlay</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="relative"
                      onClick={() => setShowLogo(!showLogo)}
                    >
                      <input
                        type="checkbox"
                        id="showLogo"
                        className="sr-only"
                        checked={showLogo}
                        onChange={() => setShowLogo(!showLogo)}
                      />
                      <div
                        className={`w-5 h-5 border rounded ${
                          showLogo
                            ? "bg-[#b9ff66] border-[#84cc16]"
                            : "border-gray-300"
                        }`}
                      >
                        {showLogo && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#4d7c0f] mx-auto"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <label
                      htmlFor="showLogo"
                      className="cursor-pointer"
                      onClick={() => setShowLogo(!showLogo)}
                    >
                      Logo
                    </label>
                  </div>

                  <div className="relative">
                    <div
                      className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] ${
                        isLogoDropdownOpen ? "rounded-b-none" : ""
                      }`}
                      onClick={toggleLogoDropdown}
                    >
                      {currentEditingAd?.logo_url ? (
                        <img
                          src={currentEditingAd?.logo_url}
                          alt="Logo"
                          className="h-8 object-contain"
                        />
                      ) : (
                        <span>No logo uploaded</span>
                      )}
                      <ChevronRight
                        className={`transform transition-transform duration-300 ${
                          isLogoDropdownOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <div
                      className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out w-full bg-white z-10 ${
                        isLogoDropdownOpen
                          ? "opacity-100 max-h-[300px]"
                          : "max-h-0 opacity-0 border-none"
                      }`}
                    >
                      {gameLogos.map((logo) => (
                        <div
                          key={logo.id}
                          className="cursor-pointer p-3 hover:bg-gradient-to-br from-[#d6ffa6] to-[#f2f2f2] border-b border-gray-200"
                          onClick={() => {
                            setSelectedLogo(logo);
                            setIsLogoDropdownOpen(false);
                            setCurrentEditingAd({
                              ...currentEditingAd,
                              logo_url: logo.logo_url,
                            });
                          }}
                        >
                          <img
                            src={logo.logo_url}
                            alt="Logo"
                            className="h-8 object-contain"
                          />
                        </div>
                      ))}
                      <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] rounded-md">
                        <span className="text-blue-600 font-medium">
                          Upload new logo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleLogoUpload(e);
                            setIsLogoSelectionOpen(false);
                          }}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="relative"
                        onClick={() => setShowButton(!showButton)}
                      >
                        <input
                          type="checkbox"
                          id="showButton"
                          className="sr-only"
                          checked={showButton}
                          onChange={() => setShowButton(!showButton)}
                        />
                        <div
                          className={`w-5 h-5 border rounded ${
                            showButton
                              ? "bg-[#b9ff66] border-[#84cc16]"
                              : "border-gray-300"
                          }`}
                        >
                          {showButton && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-[#4d7c0f] mx-auto"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <label
                        htmlFor="showButton"
                        className="cursor-pointer"
                        onClick={() => setShowButton(!showButton)}
                      >
                        Button
                      </label>
                    </div>
                    <span className="flex">
                      {["green", "red", "orange", "purple"].map((color) => (
                        <span
                          key={color}
                          className={`bg-[${colorCode[color]}] w-4 h-4 block outline outline-[#a75f9b66] rounded mr-2 last:mr-0 cursor-pointer`}
                          onClick={() => setButtonColor(color)}
                        ></span>
                      ))}
                    </span>
                  </div>

                  {showButton && (
                    <div className="relative">
                      <div
                        className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] ${
                          isButtonDropdownOpen ? "rounded-b-none" : ""
                        }`}
                        onClick={toggleButtonDropdown}
                      >
                        <div></div>
                        <div className="flex items-center justify-center">
                          {buttonVariations.length > 0 && buttonColor && (
                            <img
                              src={
                                buttonVariations.find(
                                  (v) => v.color === buttonColor
                                )?.button_url[selectedButtonType]
                              }
                              alt="Selected button"
                              className="h-8 object-contain"
                            />
                          )}
                        </div>
                        <ChevronRight
                          className={`transform transition-transform duration-300 ${
                            isButtonDropdownOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      <div
                        className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out absolute w-full bg-white z-10 ${
                          isButtonDropdownOpen
                            ? "opacity-100 max-h-[500px]"
                            : "max-h-0 opacity-0 border-none"
                        }`}
                      >
                        <div className="">
                          <div className="">
                            {buttonVariations
                              .find((v) => v.color === buttonColor)
                              ?.button_url.map((buttonUrl, index) => (
                                <div
                                  key={index}
                                  className={`p-2 border-b cursor-pointer hover:bg-gradient-to-br from-[#d6ffa6] to-[#f2f2f2] ${
                                    selectedButtonType === index
                                      ? "bg-gradient-to-br from-[#d6ffa6] to-[#f2f2f2]"
                                      : "border-gray-300"
                                  }`}
                                  onClick={() => {
                                    setSelectedButtonType(index);
                                    setIsButtonDropdownOpen(false);
                                  }}
                                >
                                  <img
                                    src={buttonUrl}
                                    alt={`Button type ${index + 1}`}
                                    className="h-10 object-contain mx-auto"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting || !currentEditingAd}
                className="border border-gray-300 w-full rounded-md hover:bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2] text-black font-medium py-2 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin h-4 w-4" />
                    <span>EXPORTING...</span>
                  </div>
                ) : (
                  "Export Image"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
          <h1 className="text-xl font-bold mb-6">
            Generate stunning UA static image creatives
          </h1>

          <div className="border-t border-gray-200 pt-6">
            <div className="mb-8">
              {selectedApproach ? (
                <div className="relative bg-gradient-to-br from-[#a3ff37] to-[#f2f2f2] rounded-md p-4 w-1/3">
                  <button
                    className="absolute top-2 right-2 text-indigo-900 hover:text-indigo-700"
                    onClick={clearSelectedApproach}
                    aria-label="Clear selection"
                  >
                    <X size={20} />
                  </button>
                  <div className="text-center text-lg font-medium mb-3">
                    {selectedApproach.name}
                  </div>
                  <div className="flex justify-center">
                    <div className="h-[210px] flex items-center justify-center bg-white rounded-md overflow-hidden">
                      <img
                        src={selectedApproach.example}
                        alt={selectedApproach.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    Pick a creative approach
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {creativeApproaches.map((approach) => (
                      <div
                        key={approach.id}
                        className="border border-gray-200 rounded-md p-2 py-4 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => selectCreativeApproach(approach)}
                      >
                        <div className="text-center mb-2">{approach.name}</div>
                        <div className="h-[210px] flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                          <img
                            src={approach.example}
                            alt={approach.name}
                            className="max-h-full max-w-full rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mb-6 relative">
              <h2 className="text-lg font-semibold mb-4">
                Select an art style
              </h2>

              {selectedStyle?.id ? (
                <div
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
                    <span>{selectedStyle?.name || "Select an art style"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      {selectedStyle?.examples?.map((example, index) => (
                        <div className="w-1/3" key={index}>
                          <img
                            src={example}
                            alt={example}
                            className="w-[65px] h-[65px] object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStyle(null);
                      }}
                    >
                      <XCircle size={20} />
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer ${
                    isDropdownOpen ? "rounded-b-none" : ""
                  }`}
                  onClick={toggleDropdown}
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-3"></div>
                    <span>Select an art style</span>
                  </div>
                  <ChevronRight
                    className={`transform transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-90" : ""
                    }`}
                  />
                </div>
              )}

              <div
                className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out ${
                  isDropdownOpen
                    ? "opacity-100 max-h-[500px]"
                    : "max-h-0 opacity-0 border-none"
                }`}
              >
                <div className="p-2 bg-white">
                  {artStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`p-2 cursor-pointer rounded-b-none hover:bg-gray-100 border-b last:border-b-0 border-gray-300 flex items-center justify-between ${
                        selectedStyle?.id === style.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => selectArtStyle(style)}
                    >
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gradient-to-br from-[#b9ff66] to-[#84cc16] rounded-md mr-2"></div>
                        <span>{style.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {style.examples?.map((example, index) => (
                          <div className="w-1/3" key={index}>
                            <img
                              src={example}
                              alt={example}
                              className="w-[65px] h-[65px] object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Select an app logo</h2>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div
                    className={`flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer ${
                      isLogoSelectionOpen ? "rounded-b-none" : ""
                    }`}
                    onClick={() => setIsLogoSelectionOpen(!isLogoSelectionOpen)}
                  >
                    <div className="flex items-center">
                      {selectedLogo?.id ? (
                        <img
                          src={selectedLogo?.logo_url}
                          alt="Selected Logo"
                          className="w-10 h-10 rounded-md object-contain"
                        />
                      ) : (
                        <span>{appLogo ? appLogo.name : "Choose Logo"}</span>
                      )}
                    </div>
                    <ChevronRight
                      className={`transform transition-transform duration-300 ${
                        isLogoSelectionOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  <div
                    className={`border-x border-b border-gray-300 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out absolute w-full bg-white z-10 ${
                      isLogoSelectionOpen
                        ? "opacity-100 max-h-[300px]"
                        : "max-h-0 opacity-0 border-none"
                    }`}
                  >
                    {gameLogos.length > 0 ? (
                      gameLogos.map((logo) => (
                        <div
                          key={logo.id}
                          className="cursor-pointer p-3 hover:bg-gradient-to-br from-[#d6ffa6] to-[#f2f2f2] border-b border-gray-200"
                          onClick={() => {
                            setSelectedLogo(logo);
                            setIsLogoSelectionOpen(false);
                          }}
                        >
                          <img
                            src={logo.logo_url}
                            alt="Logo"
                            className="h-8 object-contain"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 italic text-center border-b border-gray-200">
                        No logos available
                      </div>
                    )}

                    <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gradient-to-br from-[#b9ff66] to-[#f2f2f2]">
                      <span className="text-blue-600 font-medium">
                        Upload new logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleLogoUpload(e);
                          setIsLogoSelectionOpen(false);
                        }}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mt-8">
              <button
                className="bg-gradient-to-r from-[#b9ff66] to-[#84cc16] hover:from-[#84cc16] hover:to-[#4d7c0f] text-black font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={
                  (!selectedApproach && !selectedStyle && !selectedLogo?.id) ||
                  isGenerating
                }
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin h-4 w-4" />
                    <span>GENERATING...</span>
                  </div>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {generatedAds.length > 0 && (
        <div className="mt-8 space-y-4">
          {generatedAds.id && (
            <div
              key={generatedAds.id}
              className="border border-gray-200 rounded-md p-6 bg-white"
            >
              <h2 className="text-lg font-semibold mb-4">
                {generatedAds?.assets[0]?.creative_approach} -{" "}
                {generatedAds?.assets[0]?.style}
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {generatedAds.assets.map((ad) => (
                  <div
                    key={ad.id}
                    className="border border-gray-200 rounded-md p-2"
                  >
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md overflow-hidden mb-2">
                      <img
                        src={ad.image_url}
                        alt={`Static ad ${ad.id}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex justify-between mt-2">
                      <button
                        className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                        onClick={() => {}}
                      >
                        <span>Generate variations</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default StaticAdGenerator;
