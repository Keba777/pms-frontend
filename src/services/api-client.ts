import axios, { AxiosHeaders } from "axios";
import jwt from "jsonwebtoken";
import { useAuthStore } from "@/store/authStore";

const isServer = typeof window === "undefined";

// Build-time token generation (only safe on server side)
const generateBuildToken = () => {
  const payload = { id: "cf570fbe-e65c-457c-9875-7855e51ce4da" }; 
  const secret = "hdfjhDH6bsh&sdhj23K*hjsdhs$%^dfhj348Hghs7GH";    
  const token = jwt.sign(payload, secret, { expiresIn: "30d" });
  return token;
};

const getClientToken = () => {
  const { token } = useAuthStore.getState();
  return token;
};

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
  // baseURL: "https://api.nilepms.com/api/v1/",
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = isServer ? generateBuildToken() : getClientToken();

    if (config.url && !config.url.includes("/auth/") && token) {
      // Ensure headers is an AxiosHeaders instance (type-safe) then set Authorization
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        // create a new AxiosHeaders from whatever headers exist (safe cast)
        config.headers = new AxiosHeaders({
          ...(config.headers as Record<string, unknown>),
          Authorization: `Bearer ${token}`,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
