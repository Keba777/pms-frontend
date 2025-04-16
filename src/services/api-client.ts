// import axios from "axios";
// import { useAuthStore } from "@/store/authStore"; // Import the Zustand store

// // Create a function to get the token from the Zustand store
// const getToken = () => {
//   const { token } = useAuthStore.getState();
//   return token;
// };

// // Create your Axios instance with a base URL
// const apiClient = axios.create({
//   baseURL: "https://pms-backend-t25g.onrender.com/api/v1/",
//   withCredentials: true,
// });

// // Add a request interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     // Get the token from the Zustand store
//     const token = getToken();

//     // Check if the request URL does NOT include "/auth/"
//     if (config.url && !config.url.includes("/auth/") && token) {
//       // Set the Authorization header
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`,
//       };
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default apiClient;




import axios from "axios";
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
  baseURL: "https://pms-backend-t25g.onrender.com/api/v1/",
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = isServer ? generateBuildToken() : getClientToken();

    if (config.url && !config.url.includes("/auth/") && token) {
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
