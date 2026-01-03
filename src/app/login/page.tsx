"use client";

import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useLogin, useForgotPassword } from "@/hooks/useAuth";
import { LoginCredential } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Public folder image paths
const images: string[] = [
  "/images/IMG-1.jpg",
  "/images/IMG-2.jpg",
  "/images/IMG-3.jpg",
];

interface ForgotPasswordForm {
  email: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginCredential>();

  const forgotForm = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const loginMutation = useLogin();
  const forgotMutation = useForgotPassword();

  const onSubmit: SubmitHandler<LoginCredential> = (data) => {
    if (loginMutation.isPending) return;
    loginMutation.mutate(data);
  };

  const onForgotSubmit: SubmitHandler<ForgotPasswordForm> = (data) => {
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        reset(); // Reset form
        setIsForgotModalOpen(false);
      },
    });
  };

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIdx((prev) => (prev + 1) % images.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {" "}
      {/* Removed gray bg for clean look */}
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
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white text-gray-900">
          {" "}
          {/* Modern card with no border */}
          <CardHeader className="space-y-4 text-center pb-0">
            <div className="mb-6 text-cyan-800">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Welcome to Raycon
              </h2>
              <h2 className="text-3xl sm:text-4xl font-bold">Construction</h2>
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", { required: "Email is required" })}
                  className="h-12 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 transition-all"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="h-12 pr-12 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 h-full w-12 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-cyan-600 text-white font-semibold shadow-lg hover:bg-cyan-700 transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Sign In"}
              </Button>
            </form>

            {/* Forgot Password Button */}
            <div className="text-center pt-4">
              <Dialog
                open={isForgotModalOpen}
                onOpenChange={setIsForgotModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-cyan-600 hover:text-cyan-700 underline-offset-2 transition-colors"
                  >
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Reset Password
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="forgot-email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Enter your email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email address"
                        {...forgotForm.register("email", {
                          required: "Email is required",
                        })}
                        className="h-12 rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-cyan-500"
                      />
                      {forgotForm.formState.errors.email && (
                        <p className="text-red-600 text-sm">
                          {forgotForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl flex-1"
                        onClick={() => {
                          setIsForgotModalOpen(false);
                          forgotForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-12 rounded-xl bg-cyan-600 text-white flex-1 shadow-lg"
                        disabled={forgotMutation.isPending}
                      >
                        {forgotMutation.isPending
                          ? "Sending..."
                          : "Send Reset Link"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
