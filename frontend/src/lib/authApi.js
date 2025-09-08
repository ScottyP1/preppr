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

export async function apiGetAllStalls(params) {
  const { data } = await api.get("stalls/", { params });
  return data;
}
export async function apiGetAStall(id) {
  const { data } = await api.get(`stalls/${id}`);
  return data;
}

// Filter stalls using backend proximity + tags endpoint
// params: { zip, category, radius } where radius is in miles
export async function apiFilterStalls({ zip, category, radius }) {
  // Backend supports tags via `category` and zip via `zip`. `radius` is currently a hint.
  const params = {};
  if (zip) params.zip = zip;
  if (category) params.category = category;
  if (radius) params.radius = radius; // Not enforced server-side yet
  const { data } = await api.get("stalls/", { params });
  return data;
}

export async function apiCreateMeal({
  product,
  description,
  price,
  price_level,
  location,
  image,
  tags = [],
  allergens = [],
  calories,
  fat_g,
  carbs_g,
  protein_g,
  includes,
  options,
}) {
  const fd = new FormData();
  fd.append("product", product);
  fd.append("description", description);
  fd.append("location", location || "N/A");

  const cents = Math.round(parseFloat(price || "0") * 100);
  fd.append("price_cents", String(cents));

  if (price_level != null) fd.append("price_level", String(price_level));
  if (image) fd.append("image", image);

  tags.forEach((t) => fd.append("tag_names", t));
  allergens.forEach((a) => fd.append("allergen_names", a));

  if (calories != null) fd.append("calories", String(Math.max(0, parseInt(calories || 0))));
  if (fat_g != null) fd.append("fat_g", String(Math.max(0, parseFloat(fat_g || 0))));
  if (carbs_g != null) fd.append("carbs_g", String(Math.max(0, parseFloat(carbs_g || 0))));
  if (protein_g != null) fd.append("protein_g", String(Math.max(0, parseFloat(protein_g || 0))));

  if (Array.isArray(includes)) fd.append("includes", JSON.stringify(includes));
  if (Array.isArray(options)) fd.append("options", JSON.stringify(options));

  const { data } = await api.post("stalls/", fd);
  return data;
}

export async function apiDeleteMeal(id) {
  const { data } = await api.delete(`/stalls/${id}/`);
  return data;
}
