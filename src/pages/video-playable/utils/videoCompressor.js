import api from "../../../api";

export const CompressVideo = async (file) => {
  try{
    const formData = new FormData();
    formData.append("video", file);
    const compressedVideo = await api.post("v1/video-compression", formData);
    return compressedVideo.data;
  } catch (error) {
    console.error("Error compressing video:", error);
    throw error;
  }
};
