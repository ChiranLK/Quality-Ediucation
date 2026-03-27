import { useState } from "react";
import { motion } from "framer-motion";
import customFetch from "../utils/customfetch";
import { Eye, EyeOff, Mail, Lock, BookOpen, ArrowRight } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await customFetch.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      if (formData.remember) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (onLogin) onLogin(data);
    } catch (err) {
      setError(err?.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-bg min-h-screen flex dark:bg-gray-950 relative">
      {/* Dark mode toggle — top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>
      {/* Left decorative panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="brand-panel hidden lg:flex flex-col justify-between w-[45%] px-14 py-16 text-white"
      >
        {/* pseudo-element circles handled by brand-panel CSS */}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wide">TutorConnect</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-6">
            Welcome back,<br />keep learning.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            Connect with expert tutors, track your progress, and unlock your full learning potential.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {["Personalized tutoring sessions", "Real-time progress tracking", "Study materials on demand"].map((text) => (
            <div key={text} className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-4 py-3 rounded-xl text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="glass-card dark:bg-gray-900 dark:border dark:border-gray-800 w-full max-w-md px-8 py-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">TutorConnect</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Sign in</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-indigo-600 font-medium hover:underline">
              Create one free
            </a>
          </p>

          {/* Google SSO button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl text-sm transition-colors shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-600 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-gray-300 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
                  {formData.remember && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
                      <path d="M1.5 5.5L4.5 8.5L10.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Remember me for 30 days</span>
            </label>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center -mt-1 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms</a> and{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
