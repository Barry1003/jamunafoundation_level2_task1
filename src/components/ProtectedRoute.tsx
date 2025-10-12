import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { verifyToken } from "../services/auth";

interface ProtectedRouteProp {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProp) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await verifyToken();
      setIsValid(valid);
    };
    checkAuth();
  }, []);

  // 🔧 Don't protect the callback route
  if (location.pathname === "/auth/callback") {
    return children;
  }

  if (isValid === null) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  if (!isValid) {
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;