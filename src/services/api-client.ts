import axios from "axios";
import { useAuthStore } from "@/store/authStore"; // Import the Zustand store

// Create a function to get the token from the Zustand store
const getToken = () => {
  const { token } = useAuthStore.getState();
  return token;
};

// Create your Axios instance with a base URL
const apiClient = axios.create({
  baseURL: "https://pms-backend-t25g.onrender.com/api/v1/",
  withCredentials: true,
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
