import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:3000',
 baseUrl: 'https://api.gamepacai.com/',
});

export default api;