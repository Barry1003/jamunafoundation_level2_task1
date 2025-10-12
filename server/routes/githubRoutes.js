// routes/githubRoutes.js (FIXED)

import express from "express";
import passportProjects from "../config/passportProjects.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Initiate GitHub OAuth (using Passport)
router.get("/auth", (req, res, next) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=missing_auth_token`);
  }
  
  // Store token in session
  req.session.mainAuthToken = token;
  
  // Use Passport to authenticate
  // Make sure callbackURL points to YOUR BACKEND, not frontend
  passportProjects.authenticate("github-projects", { 
    scope: ["repo", "user:email"],
    session: false,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/github/callback`
  })(req, res, next);
});

// GitHub OAuth callback (using Passport)
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
      
      // Redirect to frontend with success data
      const responseData = {
        username: githubData.username,
        name: githubData.name,
        avatar: githubData.avatar,
        email: githubData.email,
        githubId: githubData.githubId,
      };
      
      const dataParam = encodeURIComponent(JSON.stringify(responseData));
      
      // ✅ FIXED: Redirect to /projects (not /projects/github/callback)
      res.redirect(`${process.env.FRONTEND_URL}/projects?github_connected=true&github_data=${dataParam}`);
      
    } catch (err) {
      console.error("GitHub callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=${err.message}`);
    }
  }
);

// Get repositories (protected)
router.get("/repos", protect, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.githubProjectToken) {
      return res.status(400).json({ 
        error: "GitHub not connected" 
      });
    }
    
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
      throw new Error('Failed to fetch repos from GitHub');
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
    
    res.json(formattedRepos);
  } catch (err) {
    console.error("Error fetching repositories:", err);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// Disconnect GitHub (protected)
router.post("/disconnect", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      githubProjectToken: null,
      githubProjectUsername: null,
      githubProjectId: null,
      githubProjectAvatar: null,
      githubProjectEmail: null,
    });
    
    res.json({ message: "GitHub disconnected successfully" });
  } catch (err) {
    console.error("Error disconnecting GitHub:", err);
    res.status(500).json({ error: "Failed to disconnect GitHub" });
  }
});

export default router;