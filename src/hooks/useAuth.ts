// hooks/auth-hooks.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/services/api-client"; 
import { useAuthStore } from "@/store/authStore"; 
import { toast } from "react-toastify";
import { RegisterUserData, UserLogin } from "@/types/user";

// ----------------------------
// API Response Type
// ----------------------------

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ----------------------------
// API Functions
// ----------------------------

// Function to handle user login
const loginUser = async (email: string, password: string): Promise<UserLogin> => {
  const response = await apiClient.post<ApiResponse<UserLogin>>("/auth/login", { email, password });
  return response.data.data; // Assuming 'data' contains 'user' and 'token'
};

// Function to handle user registration
const registerUser = async (email: string, password: string, firstName: string, lastName: string): Promise<UserLogin> => {
  const response = await apiClient.post<ApiResponse<UserLogin>>("/auth/register", { email, password, firstName, lastName });
  return response.data.data; // Assuming 'data' contains 'user' and 'token'
};

// ----------------------------
// Auth Mutation Hooks
// ----------------------------

// Hook for user login
export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginUser(email, password),
    onSuccess: (data: UserLogin) => {
      toast.success("Login successful!");
      login(data.user, data.token); // Save user data and token to the store
    },
    onError: () => {
      toast.error("Login failed");
    },
  });
};

// Hook for user registration
export const useRegister = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: ({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }) => registerUser(email, password, firstName, lastName),
    onSuccess: (data: RegisterUserData) => {
      toast.success("Registration successful!");
      login(data.user, data.token); // Save user data and token to the store
    },
    onError: () => {
      toast.error("Registration failed");
    },
  });
};

// Hook for logging out
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout(); // Clear the auth state
    toast.success("Logged out successfully");
  };
};
