import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 });
api.interceptors.response.use(r => r, error => Promise.reject(error.response?.data?.message || error.message || 'Unable to reach the server'));
