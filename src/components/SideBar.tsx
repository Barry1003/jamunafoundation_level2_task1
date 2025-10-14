import {
  LayoutDashboard,
  Briefcase, 
  Headphones,
  PenTool,
  BarChart2,
  UserRound,
  Settings,
  // ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  const menu = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
    { title: "Jobs", icon: <Briefcase className="w-5 h-5" />, path: "/job" },
    { title: "Support", icon: <Headphones className="w-5 h-5" />, path: "/support" },
  ];

  const others = [
    { title: "Applications", icon: <PenTool className="w-5 h-5" />, path: "/applications" },
    { title: "Projects", icon: <BarChart2 className="w-5 h-5" />, path: "/projects" },
    { title: "Profile", icon: <UserRound className="w-5 h-5" />, path: "/Profile" },
    { title: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];

  return (
    <aside className="bg-gradient-to-b from-[#101828] to-[#1E293B] text-gray-300 w-64 h-screen flex flex-col justify-between shadow-xl sticky top-0">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <img
            src="/logo.png"
            alt="EmployX"
            className="w-8 h-8"
          />
          <h1 className="text-xl  font-edu font-extrabold text-white">EmployX</h1>
        </div>

        {/* Main Menu */}
        <nav className="mt-6 px-4 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              onClick={() => setActive(item.title)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                active === item.title
                  ? "bg-blue-600 text-white"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              {/* <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  active === item.title ? "rotate-90" : ""
                }`}
              /> */}
            </Link>
          ))}
        </nav>

        {/* Components Section */}
        <div className="mt-8 px-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wide uppercase">
            Others
          </p>

          <div className="space-y-1">
            {others.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                onClick={() => setActive(item.title)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                  active === item.title
                    ? "bg-blue-600 text-white"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                {/* <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active === item.title ? "rotate-90" : ""
                  }`}
                /> */}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-5 border-t border-white/10">
        © 2025 EmployX
      </footer>
    </aside>
  );
};

export default Sidebar;
