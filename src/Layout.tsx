import { Outlet } from "react-router-dom"; 
import Header from "./components/Nav";
import Sidebar from "./components/SideBar";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#F4F6FB] text-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="sticky top-0 z-40  shadow-sm border-b border-gray-200"> 
            <Header /> 
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
