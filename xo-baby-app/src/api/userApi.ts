import api from "./axios";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "parent" | "medical" | "admin";
}

export const createUser = async (data: CreateUserData) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const getUserRole = async (uid: string, token: string) => {
  console.log("🔍 API - Getting user role for UID:", uid);
  console.log(
    "🔍 API - Token (first 20 chars):",
    token.substring(0, 20) + "..."
  );

  try {
    const response = await api.get(`/users/user-role/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ API - Role response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API - Error getting user role:", error);
    throw error;
  }
};

// Test function to check user role without authentication
export const testGetUserRole = async (uid: string) => {
  console.log("🔍 API - Testing user role for UID:", uid);

  try {
    const response = await api.get(`/users/test-role/${uid}`);
    console.log("✅ API - Test role response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API - Error testing user role:", error);
    throw error;
  }
};
