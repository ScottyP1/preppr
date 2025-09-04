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

// ------- RESPONSE: on 401 -------
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
export async function apiLogin(form) {
  try {
    const { data } = await api.post("auth/token/", form);
    setTokens(data.access, data.refresh);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function apiRegister(form) {
  try {
    const { data } = await api.post("auth/register/", form);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function apiRefresh(refresh = getRefresh()) {
  const { data } = await api.post(REFRESH_PATH, { refresh });
  return data;
}

export async function apiGetUser() {
  const { data } = await api.get("me/user/");
  return data;
}

export async function apiGetSeller() {
  const { data } = await api.get("me/seller_profile/");
  return data;
}

export async function apiGetBuyer() {
  const { data } = await api.get("me/buyer_profile/");
  return data;
}

export async function apiBecome_seller() {
  try {
    const { data } = await api.post("me/become_seller/");
    return data;
  } catch (e) {
    console.error(
      "become_seller failed:",
      e?.response?.status,
      e?.response?.data || e
    );
    throw e?.response?.data || e;
  }
}

export async function apiUpdateAccount(payload) {
  const { data } = await api.patch("me/user/", payload);
  return data;
}

export async function apiUpdateBuyer(payload) {
  const { data } = await api.patch("me/buyer_profile/", payload);
  return data;
}

export async function apiUpdateSeller(payload) {
  const { data } = await api.patch("me/seller_profile/", payload);
  return data;
}

export async function apiGetAllStalls() {
  const { data } = await api.get("stalls/");
  return data;
}

export async function apiCreateMeal({
  description,
  price,
  tags = [],
  image,
  location,
  product,
}) {
  const fd = new FormData();
  fd.append("description", description);
  fd.append("price", price);
  fd.append("location", location || "N/A");
  fd.append("product", product);

  tags.forEach((t) => fd.append("tags", t));

  if (image) fd.append("image", image);

  const { data } = await api.post("stalls/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
