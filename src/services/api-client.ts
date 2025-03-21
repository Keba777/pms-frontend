import axios from "axios";
import { useAuthStore } from "@/store/authStore"; // Import the Zustand store

// Create a function to get the token from the Zustand store
const getToken = () => {
  const { token } = useAuthStore.getState();
  return token;
};

// Create your Axios instance with a base URL
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from the Zustand store
    const token = getToken();

    // Check if the request URL does NOT include "/auth/"
    if (config.url && !config.url.includes("/auth/") && token) {
      // Set the Authorization header
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
