import axios from "axios";
import { getAuthToken } from "./utils";

const token = getAuthToken()?.token;

const api = axios.create({
  baseURL: 'http://localhost:3000',
  // baseURL: "https://prod.gamepacai.com/",
  timeout: 600000, // Increase the timeout to 10 minutes
  headers: {
    ...token ? { 'Authorization': `Bearer ${token}` } : {}
  }
});

export default api;

const papi = axios.create({
  baseURL: 'http://localhost:8000/papi',
  // baseURL: 'https://prod.gamepacai.com/papi',
});

export { papi };
