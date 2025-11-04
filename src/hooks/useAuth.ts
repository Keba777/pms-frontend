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

interface SimpleResponse {
  success: boolean;
  message: string;
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

const changePassword = async (data: { oldPassword: string; newPassword: string }): Promise<SimpleResponse> => {
  const response = await apiClient.patch<SimpleResponse>("/auth/change-password", data);
  return response.data;
};

const forgotPassword = async (email: string): Promise<SimpleResponse> => {
  const response = await apiClient.post<SimpleResponse>("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token: string, password: string): Promise<UserLogin> => {
  const response = await apiClient.put<ApiResponse<User & { token: string }>>(`/auth/reset-password/${token}`, { password });
  const userWithToken = response.data.user;
  const { token: resetToken, ...user } = userWithToken;
  return { user, token: resetToken };
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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || "Password changed successfully!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Password change failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) =>
      forgotPassword(email),
    onSuccess: (response) => {
      toast.success(response.message || "Reset email sent!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Forgot password failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
    },
  });
};

export const useResetPassword = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
    onSuccess: (data: UserLogin) => {
      toast.success("Password reset successful!");
      login(data.user, data.token); // Auto-login after reset
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Reset password failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
    },
  });
};