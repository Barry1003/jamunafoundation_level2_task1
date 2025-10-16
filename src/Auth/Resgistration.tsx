import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

const URL = "/api/auth";

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ mode: "onBlur" });

  // ✅ REGISTER USER
  const registerUser = async (data: FormData): Promise<boolean> => {
    try {
      const response = await fetch(`${URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.message || "Registration failed");
        return false;
      }

      // ✅ Save token and user (UPDATED - backend returns { user, token })
      localStorage.setItem("token", result.token);
      localStorage.setItem("activeUser", JSON.stringify(result.user));

      setFormError("");
      navigate("/dashboard");
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      setFormError("Something went wrong during registration");
      return false;
    }
  };

  // ✅ LOGIN USER
  const loginUser = async (data: FormData): Promise<boolean> => {
    try {
      const response = await fetch(`${URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.message || "Invalid credentials");
        return false;
      }

      // ✅ Save token and user (UPDATED - backend returns { user, token })
      localStorage.setItem("token", result.token);
      localStorage.setItem("activeUser", JSON.stringify(result.user));

      setFormError("");
      navigate("/dashboard");
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setFormError("Something went wrong during login");
      return false;
    }
  };

  // 🆕 HANDLE GITHUB LOGIN
  const handleGithubLogin = () => {
    // Redirect to backend GitHub OAuth route
    window.location.href = `${URL}/github`;
  };

  // ✅ VERIFY TOKEN (Runs once on mount)
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${URL}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.valid) {
          console.log("✅ Token valid. Staying logged in.");
          navigate("/dashboard");
        } else {
          console.warn("❌ Invalid token. Logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("activeUser");
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("activeUser");
      }
    };

    verifyUser();
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
    const success = isLogin ? await loginUser(data) : await registerUser(data);
    if (success) reset();
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
        <div className="absolute top-1 left-1">
          <div className="flex items-center space-x-2 text-white">
            <img src="/logo.png" alt="logo" className="w-[15%] h-[15%]" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-80 bg-opacity-10 rounded-2xl border-opacity-30 flex items-center justify-center">
            <img src="./_login.png" alt="login-illustration" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Get more things done with
            </h1>
            <h2 className="text-4xl font-bold text-white mb-6">
              Login platform.
            </h2>
            <p className="text-blue-100 text-lg">
              Access to the most powerful tool in the entire design and web
              industry.
            </p>
          </div>

          {/* TOGGLE LOGIN/REGISTER */}
          <div className="flex mb-8 bg-white bg-opacity-10 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-black hover:bg-white hover:bg-opacity-10"
              }`}
            >
              Register
            </button>
          </div>

          {/* 🆕 GITHUB LOGIN BUTTON */}
          <button
            onClick={handleGithubLogin}
            type="button"
            className="w-full mb-6 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-md"
          >
            <Github className="w-5 h-5" />
            <span>Sign in with GitHub</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-white border-opacity-30"></div>
            <span className="px-4 text-white text-sm">or</span>
            <div className="flex-1 border-t border-white border-opacity-30"></div>
          </div>

          {/* ERROR MESSAGE */}
          {formError && (
            <div className="mb-4 text-center">
              <p className="text-red-500 text-sm font-medium">{formError}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 placeholder-gray-500 text-gray-800"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="abc@gmail.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 placeholder-gray-500 text-gray-800"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white bg-opacity-90 placeholder-gray-500 text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white bg-opacity-90 placeholder-gray-500 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-white text-blue-600 font-medium py-3 px-8 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>

              {isLogin && (
                <button type="button" className="text-white text-sm underline">
                  Forget password?
                </button>
              )}
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-blue-100">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white underline font-medium"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;