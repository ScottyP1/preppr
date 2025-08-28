import axios from "axios";

const BASE_URL = "http://localhost:8000/api/auth";

export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/token/`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
