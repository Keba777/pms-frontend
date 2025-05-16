"use client";

import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "@/hooks/useAuth";
import { LoginCredential } from "@/types/user";

// Public folder image paths
const images: string[] = [
  "/images/IMG-1.jpg",
  "/images/IMG-2.jpg",
  "/images/IMG-3.jpg",
];

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredential>();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const loginMutation = useLogin();

  const onSubmit: SubmitHandler<LoginCredential> = (data) => {
    if (loginMutation.isPending) return;
    loginMutation.mutate(data);
  };

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIdx((prev) => (prev + 1) % images.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Image Carousel Section */}
      <div className="hidden md:flex flex-1 relative overflow-hidden min-h-screen">
        <AnimatePresence>
          {images.map((src, idx) =>
            idx === currentIdx ? (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={src}
                  alt={`carousel-${idx}`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={idx === 0}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div>
          <div className="mb-6 text-cyan-800">
            <h2 className="text-4xl font-bold">Welcome to Raycon</h2>
            <h2 className="text-4xl font-bold">Construction</h2>
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
              Sign in to your account
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
