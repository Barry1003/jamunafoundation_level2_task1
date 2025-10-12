// controllers/githubController.js

import User from "../models/User.js";
import fetch from "node-fetch"; // Make sure to: npm install node-fetch@2

// Initiate GitHub OAuth for PROJECT integration
export const initiateGitHubAuth = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=missing_auth_token`);
  }

  // Store token in session
  req.session.mainAuthToken = token;

  // Redirect to GitHub OAuth
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user:email`;
  res.redirect(githubAuthUrl);
};

// GitHub OAuth Callback for PROJECT integration
export const githubCallback = async (req, res) => {
  const { code } = req.query;
  const mainAuthToken = req.session.mainAuthToken;

  if (!mainAuthToken) {
    return res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=session_expired`);
  }

  try {
    // 1. Exchange code for GitHub access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const githubToken = tokenData.access_token;

    if (!githubToken) {
      throw new Error("Failed to get GitHub token");
    }

    // 2. Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const githubUser = await userResponse.json();

    // 3. Verify main auth token and get user ID
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.verify(mainAuthToken, process.env.JWT_SECRET || "secret123");
    const userId = decoded.id;

    // 4. Update user with GitHub project integration data
    await User.findByIdAndUpdate(userId, {
      githubProjectToken: githubToken,
      githubProjectUsername: githubUser.login,
      githubProjectId: githubUser.id,
      githubProjectAvatar: githubUser.avatar_url,
      githubProjectEmail: githubUser.email,
    });

    // 5. Create response data
    const githubData = {
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      email: githubUser.email,
      githubId: githubUser.id,
    };

    // 6. Redirect to frontend with GitHub data
    const dataParam = encodeURIComponent(JSON.stringify(githubData));
    res.redirect(
      `${process.env.FRONTEND_URL}/projects/github/callback?github_connected=true&github_data=${dataParam}`
    );
  } catch (err) {
    console.error("GitHub OAuth Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/projects?github_error=${err.message}`);
  }
};

// Fetch user's GitHub repositories
export const getRepositories = async (req, res) => {
  try {
    const user = req.user;

    if (!user.githubProjectToken) {
      return res.status(400).json({ 
        error: "GitHub not connected. Please connect your GitHub account first." 
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
      throw new Error("Failed to fetch repositories from GitHub");
    }

    const repos = await response.json();

    // Format the response
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
};

// Disconnect GitHub
export const disconnectGitHub = async (req, res) => {
  try {
    const user = req.user;

    await User.findByIdAndUpdate(user._id, {
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
};