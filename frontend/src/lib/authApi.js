import axios from "axios";

const BASE_URL = "http://localhost:8000/api/";

export const api = axios.create({ baseURL: BASE_URL, withCredentials: false });

export const getAccess = () => localStorage.getItem("access");
export const getRefresh = () => localStorage.getItem("refresh");
export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};
export const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

const REFRESH_PATH = "auth/token/refresh/";

// ------- REQUEST: attach token (don’t refresh here) -------
api.interceptors.request.use((config) => {
  // Don’t attach Authorization to the refresh call itself
  if (!config.url?.includes(REFRESH_PATH)) {
    const token = getAccess();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

// ------- RESPONSE: on 401, refresh once and retry -------
let isRefreshing = false;
let pendingQueue = [];

/**
 * Resolves queued requests after refresh finishes.
 */
function processQueue(error, newToken = null) {
  pendingQueue.forEach(({ resolve, reject, original }) => {
    if (error) {
      reject(error);
      return;
    }
    // replay original request with new token
    original.headers = {
      ...(original.headers || {}),
      Authorization: `Bearer ${newToken}`,
    };
    resolve(api(original));
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    // If unauthorized and we have a refresh token, try to refresh
    if (status === 401 && !original._retry && getRefresh()) {
      // mark so we don’t loop
      original._retry = true;

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, original });
        });
      }

      // Start a new refresh
      isRefreshing = true;
      try {
        const { data } = await api.post(REFRESH_PATH, {
          refresh: getRefresh(),
        });
        const newAccess = data.access;
        setTokens(newAccess, getRefresh());
        isRefreshing = false;

        // Resume queued requests
        processQueue(null, newAccess);

        // Retry the original request
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        clearTokens();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// --------- API helpers ----------
export async function apiLogin(credentials) {
  const { data } = await api.post("auth/token/", credentials);
  setTokens(data.access, data.refresh);
  return data;
}

export async function apiRegister(form) {
  const { data } = await api.post("auth/register/", form);
  return data;
}

export async function apiRefresh(refresh = getRefresh()) {
  const { data } = await api.post(REFRESH_PATH, { refresh });
  return data;
}

export async function apiGetUser() {
  const { data } = await api.get("me/user/");
  return data;
}

export async function apiUpdateUser(payload) {
  const { data } = await api.put("me/user/", payload);
  return data;
}

export async function apiBecome_seller() {
  const { data } = await api.patch("me/become_seller/");
  return data;
}
