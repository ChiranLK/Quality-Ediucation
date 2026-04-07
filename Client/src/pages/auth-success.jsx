import { useEffect } from "react";
import { CheckCircle, Loader } from "lucide-react";

export default function AuthSuccessPage() {
  useEffect(() => {
    const handleAuthSuccess = async () => {
      // Just show the success message for a moment, then redirect to home
      // App.jsx will detect the logged-in user and show the dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    };

    handleAuthSuccess();
  }, []);

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center relative transition-colors duration-500">
      <div className="glass-card w-full max-w-md px-8 py-12 dark:ring-2 dark:ring-indigo-600/50 text-center animate-in fade-in zoom-in duration-600">
        <div className="flex justify-center mb-6 animate-in zoom-in duration-500 delay-300">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
          Authentication Successful!
        </h2>

        <p className="text-gray-600 dark:text-slate-400 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-600">
          Redirecting you to your dashboard...
        </p>

        <div className="flex justify-center animate-spin">
          <Loader className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
