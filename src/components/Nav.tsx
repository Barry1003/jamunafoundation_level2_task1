import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, LogOut, MessageCircle, Search, Sun } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email?: string; // 🔧 Make optional (GitHub users might not have email)
  username: string;
  firstName?: string;
  avatar?: string; // 🆕 NEW - GitHub avatar support
  authProvider: "local" | "github"; // 🆕 NEW - Auth provider
}

const API_URL = "http://localhost:5000/api/auth";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("activeUser");
      setUser(null);
      navigate("/login");
    };

    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        if (data?.valid && data.user) {
          const userData = data.user;
          const firstName = userData.fullName?.split(" ")[0] || "User";
          setUser({ ...userData, firstName });
          localStorage.setItem("activeUser", JSON.stringify(userData));
        } else {
          // Invalid token or no user found
          handleLogout();
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        handleLogout();
      }
    };

    verifyUser();
    // only run once when component mounts
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-white text-gray-700 px-6 py-3 flex items-center justify-between shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Center - Search bar */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right - Icons + Profile + Logout */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Sun className="w-5 h-5 text-gray-600" />
        </button>

        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MessageCircle className="w-5 h-5 text-gray-600" />
        </button>

        {/* 🆕 User Profile - Shows GitHub avatar or initials */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
          {user?.avatar ? (
            // ✅ Show GitHub avatar if available
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-9 h-9 rounded-full object-cover shadow-sm border-2 border-gray-200"
            />
          ) : (
            // ✅ Show initials for local users
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm">
              {user?.firstName ? user.firstName[0].toUpperCase() : "?"}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName || "Guest"}
            </p>
            <p className="text-xs text-gray-500">
              @{user?.username || "no-username"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:from-blue-500 hover:to-indigo-500 hover:scale-105 transition-transform duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;