import { api, setTokens } from "@/lib/api";

export const signUp = async (userData) => {
  try {
    const response = await api.post("/register/", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post("/token/", userData);
    const { access, refresh } = response.data;

    setTokens(access, refresh);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
