import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

// Define proper TypeScript interfaces
interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  // Add other registration fields as needed
}


export const registerUser = async (data: RegisterData): Promise<boolean> => {
  try {
    const res = await axios.post<AuthResponse>(`${BASE_URL}/register`, data);
    const { token, user } = res.data;

    // Store token and user info in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("activeUser", JSON.stringify(user));

    return true;
  } catch (error: unknown) { 
    if (axios.isAxiosError(error)) {
      console.error("Register Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return false;
  }
};

export const loginUser = async (data: LoginData): Promise<boolean> => {
  try {
    const res = await axios.post<AuthResponse>(`${BASE_URL}/login`, data);
    const { token, user } = res.data;

    // Store token and user info in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("activeUser", JSON.stringify(user));

    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Login Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return false;
  }
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const res = await axios.post(
      `${BASE_URL}/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status === 200;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};