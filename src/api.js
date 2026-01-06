import axios from "axios";
import { getAuthToken } from "./utils";

const token = getAuthToken()?.token;

const api = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: "https://prod.gamepacai.com/",
  timeout: 600000, // Increase the timeout to 10 minutes
  headers: {
    ...token ? { 'Authorization': `Bearer ${token}` } : {}
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

const papi = axios.create({
  // baseURL: 'http://localhost:8000/papi',
  baseURL: 'https://prod.gamepacai.com/papi',
});

export { papi };
