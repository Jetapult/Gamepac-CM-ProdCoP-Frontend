import api from "../api";

export const fetchAllgames = async (studio_slug) => {
  try {
    const gamesresponse = await api.get(
      `/v1/games/platform/${studio_slug}`
    );
    return gamesresponse.data.data;
  } catch (err) {
    console.log(err);
  }
};
