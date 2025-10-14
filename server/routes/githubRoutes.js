import express from "express";
import passportProjects from "../config/passportProjects.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Initiate GitHub OAuth (using Passport)
// Accessible at: /api/auth/github/auth
router.get("/auth", (req, res, next) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=missing_auth_token`);
  }
  
  // Store token in session
  req.session.mainAuthToken = token;
  
  // Use Passport to authenticate
  passportProjects.authenticate("github-projects", { 
    scope: ["repo", "user:email"],
    session: false,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`
  })(req, res, next);
});

// GitHub OAuth callback (using Passport)
// Accessible at: /api/auth/github/callback
router.get("/callback", 
  passportProjects.authenticate("github-projects", { 
    failureRedirect: `${process.env.FRONTEND_URL}/projects?github_error=authentication_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      const mainAuthToken = req.session.mainAuthToken;
      const githubData = req.user; // From Passport strategy
      
      if (!mainAuthToken) {
        throw new Error("Session expired");
      }
      
      // Verify main auth token
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.verify(mainAuthToken, process.env.JWT_SECRET || "secret123");
      
      // Update user with GitHub data
      await User.findByIdAndUpdate(decoded.id, {
        githubProjectToken: githubData.githubToken,
        githubProjectUsername: githubData.username,
        githubProjectId: githubData.githubId,
        githubProjectAvatar: githubData.avatar,
        githubProjectEmail: githubData.email,
      });
      
      console.log("✅ GitHub account connected for user:", decoded.id);
      
      // Redirect to frontend with success data
      const responseData = {
        username: githubData.username,
        name: githubData.name,
        avatar: githubData.avatar,
        email: githubData.email,
        githubId: githubData.githubId,
      };
      
      const dataParam = encodeURIComponent(JSON.stringify(responseData));
      
      res.redirect(`${process.env.FRONTEND_URL}/projects?github_connected=true&github_data=${dataParam}`);
      
    } catch (err) {
      console.error("❌ GitHub callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=${encodeURIComponent(err.message)}`);
    }
  }
);

// Get repositories (protected)
// Accessible at: /api/auth/github/repos
router.get("/repos", protect, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.githubProjectToken) {
      return res.status(400).json({ 
        error: "GitHub not connected. Please connect your GitHub account first." 
      });
    }
    
    console.log("📦 Fetching repositories for user:", user._id);
    
    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${user.githubProjectToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ GitHub API error:", errorData);
      throw new Error('Failed to fetch repos from GitHub API');
    }
    
    const repos = await response.json();
    
    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch,
    }));
    
    console.log(`✅ Fetched ${formattedRepos.length} repositories`);
    res.json(formattedRepos);
  } catch (err) {
    console.error("❌ Error fetching repositories:", err);
    res.status(500).json({ error: err.message || "Failed to fetch repositories" });
  }
});

// Disconnect GitHub (protected)
// Accessible at: /api/auth/github/disconnect
router.post("/disconnect", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      githubProjectToken: null,
      githubProjectUsername: null,
      githubProjectId: null,
      githubProjectAvatar: null,
      githubProjectEmail: null,
    });
    
    console.log("✅ GitHub disconnected for user:", req.user._id);
    res.json({ message: "GitHub disconnected successfully" });
  } catch (err) {
    console.error("❌ Error disconnecting GitHub:", err);
    res.status(500).json({ error: "Failed to disconnect GitHub" });
  }
});

export default router;