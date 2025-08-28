import axios from "axios";

const BASE_URL = "http://localhost:8000/api/auth";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

const getAccess = () => localStorage.getItem("access");
const getRefresh = () => localStorage.getItem("refresh");

export const setTokens = (access, refresh) => {
  if (access) {
    localStorage.setItem("access", access);
  }
  if (refresh) {
    localStorage.setItem("refresh", refresh);
  }
};

export const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
