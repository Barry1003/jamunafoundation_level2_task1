import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // 1️⃣ Extract token and error from URL query parameters
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      // 2️⃣ Handle error case (if GitHub auth failed)
      if (error) {
        console.error("❌ GitHub authentication error:", error);
        alert(`GitHub authentication failed: ${error}`);
        navigate("/login");
        return;
      }

      // 3️⃣ Handle missing token
      if (!token) {
        console.error("❌ No token received from GitHub OAuth");
        alert("Authentication failed. No token received.");
        navigate("/login");
        return;
      }

      try {
        // 4️⃣ Verify the token with backend
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        // 5️⃣ Check if token is valid and user data exists
        if (response.ok && result.valid && result.user) {
          // ✅ Token is valid - Save to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("activeUser", JSON.stringify(result.user));

          console.log("✅ GitHub login successful!");
          console.log("👤 User:", result.user);

          // 6️⃣ Redirect to dashboard
          navigate("/dashboard");
        } else {
          // ❌ Token verification failed
          console.error("❌ Token verification failed:", result.message);
          alert("Authentication failed. Please try again.");
          navigate("/login");
        }
      } catch (err) {
        // ❌ Network or server error
        console.error("❌ Error verifying token:", err);
        alert("An error occurred during authentication. Please try again.");
        navigate("/login");
      }
    };

    // Execute the callback handler
    handleCallback();
  }, [searchParams, navigate]);

  // 🎨 Loading UI while processing authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-700">
      <div className="text-center">
        {/* Spinner Animation */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <p className="text-white text-xl font-medium mb-2">
          Completing GitHub sign in...
        </p>
        <p className="text-blue-100 text-sm">
          Please wait while we verify your credentials
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;