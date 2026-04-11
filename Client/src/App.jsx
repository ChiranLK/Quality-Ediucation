/**
 * App.jsx
 *
 * Root of the TutorConnect SPA.
 * Auth state is now managed by AuthContext — this component
 * is purely responsible for routing between views.
 */
import "./App.css";
import { DarkModeProvider }    from "./context/DarkModeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { StudyMaterialProvider } from "./context/StudyMaterialContext.jsx";
import { SessionProvider }     from "./context/SessionContext.jsx";
import { HelpRequestProvider } from "./context/HelpRequestContext.jsx";
import { ProgressProvider }    from "./context/ProgressContext.jsx";
import { FeedbackProvider }    from "./context/FeedbackContext.jsx";
// USE EXISTING — project-wide toast library (react-hot-toast)
import { Toaster }             from "react-hot-toast";

import LoginPage        from "./pages/login.jsx";
import UserDashboard    from "./pages/userdashboard/userDashboard.jsx";
import TutorDashboard   from "./pages/tutordashboard/tutorDashboard.jsx";
import AdminDashboard   from "./pages/admindashboard/adminDashboard.jsx";
import SplashScreen     from "./pages/homepage/SplashScreen.jsx";
import HomePage         from "./pages/homepage/HomePage.jsx";
import AboutUs          from "./pages/info/AboutUs.jsx";
import PrivacyPolicy    from "./pages/info/PrivacyPolicy.jsx";
import TermsOfService   from "./pages/info/TermsOfService.jsx";
import RegisterPage     from "./pages/register.jsx";
import AuthSuccessPage  from "./pages/auth-success.jsx";
import AuthErrorPage    from "./pages/auth-error.jsx";

// ── Role → Dashboard map ───────────────────────────────────────────────────────
const DASHBOARDS = {
  user:  UserDashboard,
  tutor: TutorDashboard,
  admin: AdminDashboard,
};

// ── Inner routing component (has access to AuthContext) ───────────────────────
function AppRouter() {
  const { user, currentView, setCurrentView, login, logout, updateUser } = useAuth();

  // ── Logged-in: show role dashboard ──────────────────────────────────────────
  if (user && currentView === "dashboard") {
    const Dashboard = DASHBOARDS[user.role];
    if (Dashboard) {
      return (
        <Dashboard
          user={user}
          onLogout={logout}
          onUpdateUser={updateUser}
        />
      );
    }
  }

  // ── Not logged in: view-based routing ────────────────────────────────────────
  switch (currentView) {
    case "splash":
      return <SplashScreen onFinish={() => setCurrentView("home")} />;

    case "home":
      return (
        <HomePage
          onNavigate={(view) => setCurrentView(view)}
          onNavigateToLogin={() => setCurrentView("login")}
          onNavigateToRegister={() => setCurrentView("register")}
        />
      );

    case "login":
      return (
        <LoginPage
          onLogin={login}
          onBack={() => setCurrentView("home")}
          onNavigateToRegister={() => setCurrentView("register")}
        />
      );

    case "register":
      return (
        <RegisterPage
          onLogin={login}
          onBack={() => setCurrentView("home")}
          onNavigateToLogin={() => setCurrentView("login")}
        />
      );

    case "about":
      return <AboutUs onBack={() => setCurrentView("home")} />;

    case "privacy":
      return <PrivacyPolicy onBack={() => setCurrentView("home")} />;

    case "terms":
      return <TermsOfService onBack={() => setCurrentView("home")} />;

    case "auth-success":
      return <AuthSuccessPage onLogin={login} onBack={() => setCurrentView("home")} />;

    case "auth-error":
      return <AuthErrorPage onBack={() => setCurrentView("login")} />;

    default:
      return (
        <HomePage
          onNavigate={(view) => setCurrentView(view)}
          onNavigateToLogin={() => setCurrentView("login")}
          onNavigateToRegister={() => setCurrentView("register")}
        />
      );
  }
}

/**
 * Provider order (outermost → innermost):
 * AuthProvider → DarkModeProvider → StudyMaterialProvider
 *   → SessionProvider → HelpRequestProvider → ProgressProvider → FeedbackProvider
 *
 * Why this order?
 * - Auth must be outermost so every other provider can access user if needed.
 * - Domain providers are nested so they can be lazy-mounted per-dashboard.
 */
export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <StudyMaterialProvider>
          <SessionProvider>
            <HelpRequestProvider>
              <ProgressProvider>
                <FeedbackProvider>
                  {/* ADD THIS — single global Toaster; all react-hot-toast calls render here */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      className: 'text-base px-5 py-4 rounded-xl shadow-lg',
                    }}
                  />
                  <AppRouter />
                </FeedbackProvider>
              </ProgressProvider>
            </HelpRequestProvider>
          </SessionProvider>
        </StudyMaterialProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}
