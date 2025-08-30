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

// attaches token on each request, if 401 calls refresh
api.interceptors.request.use(async (config) => {
  if (config.url?.includes("auth/token/refresh/")) return config;

  let token = getAccess();

  if (!token && getRefresh()) {
    try {
      const { data } = await api.post("auth/token/refresh/", {
        refresh: getRefresh(),
      });
      setTokens(data.access, getRefresh());
      token = data.access;
    } catch {
      clearTokens();
    }
  }

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config || {};
//     if (error.response?.status === 401 && !original._retry && getRefresh()) {
//       original._retry = true;
//       try {
//         const { data } = await api.post("auth/token/refresh/", {
//           refresh: getRefresh(),
//         });
//         setTokens(data.access, getRefresh());
//         original.headers = {
//           ...(original.headers || {}),
//           Authorization: `Bearer ${data.access}`,
//         };
//         return api(original);
//       } catch {
//         clearTokens();
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export async function apiLogin(credentials) {
  try {
    const { data } = await api.post("auth/token/", credentials);
    return data;
  } catch (e) {
    throw e.response?.data;
  }
}

export async function apiRegister(form) {
  try {
    const { data } = await api.post("auth/register/", form);
    return data;
  } catch (e) {
    throw e.response?.data;
  }
}

export async function apiRefresh(refresh = getRefresh()) {
  const { data } = await api.post("auth/token/refresh/", { refresh });
  return data;
}
export async function apiGetUser() {
  const { data } = await api.get("me/user/");
  return data;
}

export async function apiUpdateUser() {
  const { data } = await api.put("me/user/");
  return data;
}
