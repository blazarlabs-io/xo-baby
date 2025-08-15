// API Configuration
export const API_CONFIG = {
  // Backend API URL - adjust this to match your backend
  BASE_URL: "http://localhost:3000", // Default NestJS port

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

  // Request timeout
  TIMEOUT: 10000, // 10 seconds

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default API_CONFIG;
