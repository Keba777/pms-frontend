import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { UserLogin, User, CreateUserInput } from "@/types/user";

// ----------------------------
// API Response Type
// ----------------------------
interface ApiResponse<T> {
  success: boolean;
  user: T;
  message?: string;
}

// ----------------------------
// API Functions
// ----------------------------

const loginUser = async (email: string, password: string): Promise<UserLogin> => {
  const response = await apiClient.post<ApiResponse<User & { token: string }>>("/auth/login", { email, password });
  const userWithToken = response.data.user;
  const { token, ...user } = userWithToken;
  return { user, token };
};

const registerUser = async (data: CreateUserInput): Promise<UserLogin> => {
  const response = await apiClient.post<ApiResponse<User & { token: string }>>("/auth/register", data);
  const userWithToken = response.data.user;
  const { token, ...user } = userWithToken;
  return { user, token };
};

// ----------------------------
// Auth Mutation Hooks
// ----------------------------

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data: UserLogin) => {
      toast.success("Login successful!");
      console.log("Login successful! User data:", data);
      login(data.user, data.token); // Store login info in the state
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Login failed: ${error.message}`);
        console.error("Login error:", error.message);
      } else {
        toast.error("An unknown error occurred");
        console.error("Login error:", error);
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Registration successful!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Registration failed");
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout(); // Clear the auth state
    toast.success("Logged out successfully");
  };
};
