import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate =  useNavigate()

  const handleDashboard = () => {
    navigate("/dashboard");
  };
  return (
    <div className="relative min-h-screen text-black flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/bg-17.png')] bg-cover bg-center" />

      {/* Optional soft overlay (very light, just for contrast) */}
      <div className="absolute inset-0 bg-white/40  " />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-8 p-6">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-8xl md:text-9xl font-extrabold mb-4 drop-shadow-md">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 drop-shadow-sm">
            Page Not Found
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-md">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>

          <button
            onClick={handleDashboard}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Floating light blur accents */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/30 blur-[120px] rounded-full" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/30 blur-[150px] rounded-full" />
    </div>
  );
}
