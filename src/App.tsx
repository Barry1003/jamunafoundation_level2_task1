import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Preloader from "./components/PreLoader";
import LoginPage from "./Auth/Resgistration";
import AuthCallback from "./pages/AuthCallback"; // GitHub OAuth Login
import GitHubProjectCallback from "./pages/GitHubProjectCallback"; // 🆕 NEW - GitHub Project Integration
import NotFoundPage from "./pages/404Page";
import ProtectedRoute from "./components/ProtectedRoute";
import JobSearch from "./pages/Job";
import Applications from "./pages/Applications"; 
import SettingsPage from "./pages/Settings";
import ProjectTracker from "./pages/Project";
import Profile from "./pages/Profile";
import Support from "./pages/support";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "job",
        element: <JobSearch />,
      },
      {
        path: "applications",
        element: <Applications />,
      },
      {
        path: "projects",
        element: <ProjectTracker />, // 🆕 Add projects route
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "Profile",
        element: <Profile />,
      },
      {
        path: "support",
        element: <Support />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // 🔧 GitHub OAuth Login Callback (for authentication)
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  // 🆕 GitHub Project Integration Callback (for linking repos)
  {
    path: "/projects/github/callback",
    element: <GitHubProjectCallback />,
  },
]);

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return <RouterProvider router={router} />;
};

export default App;