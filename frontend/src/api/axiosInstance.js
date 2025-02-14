import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
}
});

// Add request interceptor to add token
API.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
      if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
      }
      return Promise.reject(error);
  }
);


export default API;
