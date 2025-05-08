"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { LoginCredential } from "@/types/user";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredential>();

  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const onSubmit = (data: LoginCredential) => {
    if (loginMutation.isPending) return; // Prevent submitting while the mutation is loading
    loginMutation.mutate(data); // Trigger the login mutation
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="font-bold mb-6">Sign into your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium text-xs mb-1">EMAIL</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-xs mb-1">PASSWORD</label>
            <div className="flex items-center border rounded-md p-2">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className="w-full focus:outline-none"
              />
              <input
                type="checkbox"
                className="ml-2"
                onChange={() => setShowPassword(!showPassword)}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-700 text-white p-2 rounded-md hover:bg-cyan-800"
            disabled={loginMutation.isPending} // Disable button during mutation
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
