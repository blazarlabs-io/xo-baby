import { API_URL } from "@env";

// API Configuration
export const API_CONFIG = {
  // Backend API URL - uses environment variable or defaults to localhost
  BASE_URL: API_URL || "http://localhost:3000", // Default NestJS port

  // API Endpoints
  ENDPOINTS: {
    USERS: {
      CREATE: "/users/create",
      VERIFY_TOKEN: "/users/verify-token",
    },
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
    },
  },

  // Request timeout - Set to 0 to disable timeout for heavy operations
  TIMEOUT: 0, // No timeout - let backend complete its work

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default API_CONFIG;
