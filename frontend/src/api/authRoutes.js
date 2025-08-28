import axios from "axios";

const BASE_URL = "http://localhost:8000/api/auth";

export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error during signup:", error.message);
  }
};

export const login = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/token/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error during signup:", error.message);
  }
};
