import axios from "axios";
//const apiUrl = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI URL
});

// Attach JWT token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default API;
