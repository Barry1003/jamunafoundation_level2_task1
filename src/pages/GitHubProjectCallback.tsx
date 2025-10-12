import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GitHubProjectCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGitHubConnection = () => {
      // 1️⃣ Extract GitHub connection data from URL
      const githubConnected = searchParams.get("github_connected");
      const githubData = searchParams.get("github_data");
      const githubError = searchParams.get("github_error");

      // 2️⃣ Handle error case
      if (githubError) {
        console.error("❌ GitHub connection error:", githubError);
        alert(`GitHub connection failed: ${githubError}`);
        navigate("/projects");
        return;
      }

      // 3️⃣ Handle successful connection
      if (githubConnected === "true" && githubData) {
        try {
          const gitHubUserData = JSON.parse(decodeURIComponent(githubData));
          
          // Save GitHub user data to localStorage
          localStorage.setItem("github_user", JSON.stringify(gitHubUserData));
          
          console.log("✅ GitHub connected successfully!");
          console.log("📦 GitHub User:", gitHubUserData);

          // Redirect to projects page
          navigate("/projects");
        } catch (err) {
          console.error("❌ Failed to parse GitHub data:", err);
          alert("Failed to connect GitHub. Please try again.");
          navigate("/projects");
        }
      } else {
        // No valid data, redirect back
        console.warn("⚠️ No GitHub data received");
        navigate("/projects");
      }
    };

    handleGitHubConnection();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
      <div className="text-center">
        {/* GitHub Logo Animation */}
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-white animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>

        {/* Loading Text */}
        <p className="text-white text-xl font-medium mb-2">
          Connecting GitHub Account...
        </p>
        <p className="text-gray-300 text-sm">
          Please wait while we link your repositories
        </p>

        {/* Loading Bar */}
        <div className="mt-6 w-64 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-white animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default GitHubProjectCallback;