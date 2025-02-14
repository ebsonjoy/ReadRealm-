import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: import.meta.env.VITE_API_LOCAL_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
}
});

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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
      if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/user-login'
      }
      return Promise.reject(error);
  }
);


export default API;
