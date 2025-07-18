

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Shield,
  Github,
  Chrome,
} from "lucide-react";
import Image from "next/image";

// Hardcoded credentials
const validCredentials = {
  username: "admin@gmail.com",
  password: "password123",
};

const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

    if (isSignIn) {
      // Check credentials
      if (
        formData.email === validCredentials.username &&
        formData.password === validCredentials.password
      ) {
        document.cookie = `auth=true; path=/`;
        router.push("/"); // Navigate to home
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } else {
      // Sign Up logic (no real user creation)
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      alert("Account created successfully. You can now sign in.");
      setIsSignIn(true);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
      });
    }

    setIsLoading(false);
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <h1 className="text-3xl font-bold">Geo Spatial RAG</h1>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                isSignIn
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !isSignIn
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isSignIn && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-12 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {!isSignIn && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
            )}

            {isSignIn && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-gray-500 hover:text-black">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </div>
              ) : isSignIn ? (
                "Sign In to Dashboard"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialAuth("google")}
              className="flex items-center justify-center py-3 px-4 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition"
            >
              <Chrome className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">Google</span>
            </button>
            <button
              onClick={() => handleSocialAuth("github")}
              className="flex items-center justify-center py-3 px-4 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition"
            >
              <Github className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">GitHub</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <button className="text-gray-700 underline hover:text-black">Terms</button>{" "}
              and{" "}
              <button className="text-gray-700 underline hover:text-black">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center">
          <div className="bg-gray-200 rounded-full px-4 py-2 border border-gray-300">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2 text-gray-600" />
              <span>256-bit SSL secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
