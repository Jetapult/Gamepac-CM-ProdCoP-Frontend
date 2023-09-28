import axios from 'axios';

const api = axios.create({
 baseURL: 'https://api.gamepacai.com/',
 timeout: 600000, // Increase the timeout to 10 minutes

});

export default api;