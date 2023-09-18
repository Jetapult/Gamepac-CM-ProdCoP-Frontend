import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
//  baseURL: 'http://13.127.234.28:3000',
});

export default api;